-- Create debts table for managing receivables and payables
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('receivable', 'payable')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('client', 'employee', 'supplier', 'other')),
  entity_id UUID,
  entity_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
  project_id UUID REFERENCES public.projects(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins and accountants can manage debts"
  ON public.debts
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant'));

CREATE POLICY "Authenticated users can view debts"
  ON public.debts
  FOR SELECT
  USING (has_any_role(auth.uid()));

-- Create debt payments table for tracking partial payments
CREATE TABLE public.debt_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  transaction_id UUID REFERENCES public.transactions(id),
  paid_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins and accountants can manage debt payments"
  ON public.debt_payments
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant'));

CREATE POLICY "Authenticated users can view debt payments"
  ON public.debt_payments
  FOR SELECT
  USING (has_any_role(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();