import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get payment schedules due within 3 days that haven't been notified
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data: upcomingPayments, error: paymentsError } = await supabase
      .from("project_payment_schedules")
      .select("*, projects(name)")
      .eq("status", "pending")
      .lte("due_date", threeDaysFromNow.toISOString().split("T")[0])
      .gte("due_date", today.toISOString().split("T")[0]);

    if (paymentsError) {
      throw paymentsError;
    }

    // Get all admin users to send notifications to
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "accountant"]);

    if (rolesError) {
      throw rolesError;
    }

    const adminUserIds = adminRoles?.map(r => r.user_id) || [];
    
    let notificationsCreated = 0;

    // Create notifications for each upcoming payment
    for (const payment of upcomingPayments || []) {
      const projectName = (payment as any).projects?.name || "مشروع غير معروف";
      const dueDate = new Date(payment.due_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let message = "";
      if (daysUntilDue === 0) {
        message = `دفعة "${payment.title}" للمشروع "${projectName}" مستحقة اليوم بمبلغ $${Number(payment.amount).toLocaleString()}`;
      } else if (daysUntilDue === 1) {
        message = `دفعة "${payment.title}" للمشروع "${projectName}" مستحقة غداً بمبلغ $${Number(payment.amount).toLocaleString()}`;
      } else {
        message = `دفعة "${payment.title}" للمشروع "${projectName}" مستحقة خلال ${daysUntilDue} أيام بمبلغ $${Number(payment.amount).toLocaleString()}`;
      }

      // Check if notification already exists for this payment today
      for (const userId of adminUserIds) {
        const { data: existingNotification } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", userId)
          .eq("link", `/treasury?payment=${payment.id}`)
          .gte("created_at", today.toISOString().split("T")[0])
          .single();

        if (!existingNotification) {
          const { error: insertError } = await supabase
            .from("notifications")
            .insert({
              user_id: userId,
              title: daysUntilDue === 0 ? "⚠️ دفعة مستحقة اليوم" : "📅 تذكير بدفعة قادمة",
              message,
              type: daysUntilDue === 0 ? "warning" : "info",
              link: `/treasury?payment=${payment.id}`,
            });

          if (!insertError) {
            notificationsCreated++;
          }
        }
      }
    }

    // Also check for overdue payments
    const { data: overduePayments, error: overdueError } = await supabase
      .from("project_payment_schedules")
      .select("*, projects(name)")
      .eq("status", "pending")
      .lt("due_date", today.toISOString().split("T")[0]);

    if (!overdueError && overduePayments) {
      for (const payment of overduePayments) {
        const projectName = (payment as any).projects?.name || "مشروع غير معروف";
        const message = `دفعة "${payment.title}" للمشروع "${projectName}" متأخرة! المبلغ المستحق: $${Number(payment.amount).toLocaleString()}`;

        for (const userId of adminUserIds) {
          const { data: existingNotification } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", userId)
            .eq("link", `/treasury?payment=${payment.id}`)
            .eq("type", "error")
            .gte("created_at", today.toISOString().split("T")[0])
            .single();

          if (!existingNotification) {
            const { error: insertError } = await supabase
              .from("notifications")
              .insert({
                user_id: userId,
                title: "🚨 دفعة متأخرة",
                message,
                type: "error",
                link: `/treasury?payment=${payment.id}`,
              });

            if (!insertError) {
              notificationsCreated++;
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsCreated,
        upcomingPayments: upcomingPayments?.length || 0,
        overduePayments: overduePayments?.length || 0
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: unknown) {
    console.error("Error checking payment notifications:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
