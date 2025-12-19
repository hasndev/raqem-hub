-- Create project_assignments table for assigning employees to projects
CREATE TABLE public.project_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'developer',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  hours_allocated NUMERIC DEFAULT 0,
  is_lead BOOLEAN DEFAULT false,
  UNIQUE(project_id, employee_id)
);

-- Create project_tasks table for task tracking
CREATE TABLE public.project_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.employees(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  estimated_hours NUMERIC DEFAULT 0,
  actual_hours NUMERIC DEFAULT 0,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create project_milestones table
CREATE TABLE public.project_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_time_logs table for time tracking
CREATE TABLE public.project_time_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.project_tasks(id) ON DELETE SET NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  hours NUMERIC NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add additional columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Enable RLS on all new tables
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_time_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_assignments
CREATE POLICY "Authenticated users can view assignments" ON public.project_assignments
FOR SELECT USING (has_any_role(auth.uid()));

CREATE POLICY "Admins and supervisors can manage assignments" ON public.project_assignments
FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- RLS policies for project_tasks
CREATE POLICY "Authenticated users can view tasks" ON public.project_tasks
FOR SELECT USING (has_any_role(auth.uid()));

CREATE POLICY "Admins and supervisors can manage tasks" ON public.project_tasks
FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- RLS policies for project_milestones
CREATE POLICY "Authenticated users can view milestones" ON public.project_milestones
FOR SELECT USING (has_any_role(auth.uid()));

CREATE POLICY "Admins and supervisors can manage milestones" ON public.project_milestones
FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- RLS policies for project_time_logs
CREATE POLICY "Authenticated users can view time logs" ON public.project_time_logs
FOR SELECT USING (has_any_role(auth.uid()));

CREATE POLICY "Admins and supervisors can manage time logs" ON public.project_time_logs
FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- Trigger for updating tasks timestamp
CREATE TRIGGER update_project_tasks_updated_at
BEFORE UPDATE ON public.project_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();