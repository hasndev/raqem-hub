-- Create project payment schedules table
CREATE TABLE public.project_payment_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  percentage NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  transaction_id UUID REFERENCES public.transactions(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_payment_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins and supervisors can manage payment schedules"
ON public.project_payment_schedules
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

CREATE POLICY "Authenticated users can view payment schedules"
ON public.project_payment_schedules
FOR SELECT
USING (has_any_role(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_project_payment_schedules_updated_at
BEFORE UPDATE ON public.project_payment_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();