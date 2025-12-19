import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type NotificationType = "info" | "success" | "warning" | "error";

interface SendNotificationParams {
  userId: string;
  title: string;
  message?: string;
  type?: NotificationType;
  link?: string;
}

interface SendBulkNotificationParams {
  userIds: string[];
  title: string;
  message?: string;
  type?: NotificationType;
  link?: string;
}

export function useNotifications() {
  const { toast } = useToast();

  const sendNotification = async ({
    userId,
    title,
    message,
    type = "info",
    link,
  }: SendNotificationParams) => {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link,
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending notification:", error);
      return null;
    }

    return data;
  };

  const sendBulkNotifications = async ({
    userIds,
    title,
    message,
    type = "info",
    link,
  }: SendBulkNotificationParams) => {
    const notifications = userIds.map((userId) => ({
      user_id: userId,
      title,
      message,
      type,
      link,
    }));

    const { data, error } = await supabase
      .from("notifications")
      .insert(notifications)
      .select();

    if (error) {
      console.error("Error sending bulk notifications:", error);
      return null;
    }

    return data;
  };

  // Send notification to all users with a specific role
  const sendNotificationToRole = async ({
    role,
    title,
    message,
    type = "info",
    link,
  }: {
    role: "admin" | "supervisor" | "accountant" | "employee";
    title: string;
    message?: string;
    type?: NotificationType;
    link?: string;
  }) => {
    // Get all users with this role
    const { data: roleUsers, error: roleError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", role);

    if (roleError || !roleUsers) {
      console.error("Error fetching role users:", roleError);
      return null;
    }

    const userIds = roleUsers.map((u) => u.user_id);
    if (userIds.length === 0) return null;

    return sendBulkNotifications({ userIds, title, message, type, link });
  };

  // Send notification to all admins
  const notifyAdmins = async (
    title: string,
    message?: string,
    type: NotificationType = "info",
    link?: string
  ) => {
    return sendNotificationToRole({ role: "admin", title, message, type, link });
  };

  return {
    sendNotification,
    sendBulkNotifications,
    sendNotificationToRole,
    notifyAdmins,
  };
}
