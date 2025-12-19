-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  type TEXT CHECK (type IN ('government', 'company', 'individual')) DEFAULT 'company',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  position TEXT,
  salary DECIMAL(12, 2) DEFAULT 0,
  start_date DATE,
  status TEXT CHECK (status IN ('active', 'inactive', 'on_leave')) DEFAULT 'active',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update profiles to reference employees
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_employee 
FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold')) DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12, 2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('income', 'expense', 'withdrawal', 'deposit')) NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('completed', 'pending', 'cancelled')) DEFAULT 'completed',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treasury accounts table
CREATE TABLE public.treasury_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  percentage DECIMAL(5, 2) DEFAULT 0,
  balance DECIMAL(12, 2) DEFAULT 0,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create salary payments table to track paid salaries
CREATE TABLE public.salary_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(employee_id, month)
);

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has any role
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  )
$$;

-- RLS Policies for departments
CREATE POLICY "Authenticated users can view departments" ON public.departments
  FOR SELECT USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins and supervisors can manage departments" ON public.departments
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));

-- RLS Policies for clients
CREATE POLICY "Authenticated users can view clients" ON public.clients
  FOR SELECT USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins and supervisors can manage clients" ON public.clients
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));

-- RLS Policies for employees
CREATE POLICY "Authenticated users can view employees" ON public.employees
  FOR SELECT USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can manage employees" ON public.employees
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for projects
CREATE POLICY "Authenticated users can view projects" ON public.projects
  FOR SELECT USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins and supervisors can manage projects" ON public.projects
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));

-- RLS Policies for transactions
CREATE POLICY "Authenticated users can view transactions" ON public.transactions
  FOR SELECT USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins and accountants can manage transactions" ON public.transactions
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'accountant'));

-- RLS Policies for treasury_accounts
CREATE POLICY "Authenticated users can view treasury accounts" ON public.treasury_accounts
  FOR SELECT USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can manage treasury accounts" ON public.treasury_accounts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for salary_payments
CREATE POLICY "Authenticated users can view salary payments" ON public.salary_payments
  FOR SELECT USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins and accountants can manage salary payments" ON public.salary_payments
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'accountant'));

-- Create updated_at triggers for all tables
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treasury_accounts_updated_at BEFORE UPDATE ON public.treasury_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_employees_department ON public.employees(department_id);
CREATE INDEX idx_projects_client ON public.projects(client_id);
CREATE INDEX idx_projects_department ON public.projects(department_id);
CREATE INDEX idx_transactions_project ON public.transactions(project_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_salary_payments_employee ON public.salary_payments(employee_id);
CREATE INDEX idx_salary_payments_month ON public.salary_payments(month);