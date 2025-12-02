-- Create enums for various statuses
CREATE TYPE public.credit_bureau AS ENUM ('experian', 'equifax', 'transunion');
CREATE TYPE public.action_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'requires_approval');
CREATE TYPE public.dispute_status AS ENUM ('draft', 'pending_review', 'submitted', 'in_progress', 'resolved', 'rejected');
CREATE TYPE public.action_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Credit reports table
CREATE TABLE public.credit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bureau credit_bureau NOT NULL,
  score INTEGER,
  report_date DATE NOT NULL,
  raw_data JSONB,
  parsed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tradelines table
CREATE TABLE public.tradelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credit_report_id UUID REFERENCES public.credit_reports(id) ON DELETE CASCADE,
  creditor_name TEXT NOT NULL,
  account_type TEXT,
  account_number_masked TEXT,
  credit_limit DECIMAL(12,2),
  current_balance DECIMAL(12,2),
  payment_status TEXT,
  is_negative BOOLEAN DEFAULT false,
  date_opened DATE,
  date_reported DATE,
  bureau credit_bureau,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Score history (for tracking progress)
CREATE TABLE public.score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bureau credit_bureau NOT NULL,
  score INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  source TEXT
);

-- Actions/tasks table
CREATE TABLE public.actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  action_type TEXT NOT NULL,
  priority action_priority DEFAULT 'medium',
  status action_status DEFAULT 'pending',
  human_required BOOLEAN DEFAULT false,
  estimated_impact INTEGER,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Disputes table
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tradeline_id UUID REFERENCES public.tradelines(id) ON DELETE SET NULL,
  bureau credit_bureau NOT NULL,
  reason TEXT NOT NULL,
  evidence JSONB,
  status dispute_status DEFAULT 'draft',
  letter_content TEXT,
  response TEXT,
  human_required BOOLEAN DEFAULT true,
  consent_id UUID,
  submitted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Funding projections
CREATE TABLE public.funding_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  target_date DATE,
  probability_pct INTEGER,
  requirements JSONB,
  assumptions JSONB,
  confidence TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Wealth plans
CREATE TABLE public.wealth_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL,
  goals JSONB,
  strategies JSONB,
  timeline_months INTEGER,
  projected_outcome JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- E-Sign consents
CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Admin approvals
CREATE TABLE public.admin_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID,
  dispute_id UUID,
  requested_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  decided_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wealth_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_approvals ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS for user_roles (only admins can modify, users can view own)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS for credit_reports
CREATE POLICY "Users can view own credit reports" ON public.credit_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credit reports" ON public.credit_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credit reports" ON public.credit_reports FOR UPDATE USING (auth.uid() = user_id);

-- RLS for tradelines
CREATE POLICY "Users can view own tradelines" ON public.tradelines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tradelines" ON public.tradelines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tradelines" ON public.tradelines FOR UPDATE USING (auth.uid() = user_id);

-- RLS for score_history
CREATE POLICY "Users can view own score history" ON public.score_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own score history" ON public.score_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS for actions
CREATE POLICY "Users can view own actions" ON public.actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own actions" ON public.actions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own actions" ON public.actions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own actions" ON public.actions FOR DELETE USING (auth.uid() = user_id);

-- RLS for disputes
CREATE POLICY "Users can view own disputes" ON public.disputes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own disputes" ON public.disputes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own disputes" ON public.disputes FOR UPDATE USING (auth.uid() = user_id);

-- RLS for funding_projections
CREATE POLICY "Users can view own projections" ON public.funding_projections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projections" ON public.funding_projections FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS for wealth_plans
CREATE POLICY "Users can view own wealth plans" ON public.wealth_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wealth plans" ON public.wealth_plans FOR ALL USING (auth.uid() = user_id);

-- RLS for consents
CREATE POLICY "Users can view own consents" ON public.consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consents" ON public.consents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS for admin_approvals
CREATE POLICY "Users can view own approval requests" ON public.admin_approvals FOR SELECT USING (auth.uid() = requested_by);
CREATE POLICY "Admins can view all approvals" ON public.admin_approvals FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can request approvals" ON public.admin_approvals FOR INSERT WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "Admins can update approvals" ON public.admin_approvals FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_credit_reports_updated_at BEFORE UPDATE ON public.credit_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON public.actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wealth_plans_updated_at BEFORE UPDATE ON public.wealth_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_credit_reports_user_id ON public.credit_reports(user_id);
CREATE INDEX idx_tradelines_user_id ON public.tradelines(user_id);
CREATE INDEX idx_tradelines_credit_report_id ON public.tradelines(credit_report_id);
CREATE INDEX idx_score_history_user_id ON public.score_history(user_id);
CREATE INDEX idx_score_history_recorded_at ON public.score_history(recorded_at);
CREATE INDEX idx_actions_user_id ON public.actions(user_id);
CREATE INDEX idx_actions_status ON public.actions(status);
CREATE INDEX idx_disputes_user_id ON public.disputes(user_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);