-- Create business_entities table to track LLC formation progress
CREATE TABLE public.business_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT,
  entity_type TEXT DEFAULT 'llc',
  ein TEXT,
  state_of_formation TEXT,
  formation_date DATE,
  business_address TEXT,
  business_phone TEXT,
  bank_account_opened BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_steps table to track individual formation steps
CREATE TABLE public.business_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID REFERENCES public.business_entities(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_title TEXT NOT NULL,
  step_description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit_report_uploads table to track uploaded PDFs
CREATE TABLE public.credit_report_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  bureau TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  extracted_score INTEGER,
  tradelines_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.business_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_report_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_entities
CREATE POLICY "Users can view own business entities"
  ON public.business_entities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business entities"
  ON public.business_entities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business entities"
  ON public.business_entities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business entities"
  ON public.business_entities FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for business_steps
CREATE POLICY "Users can view own business steps"
  ON public.business_steps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business steps"
  ON public.business_steps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business steps"
  ON public.business_steps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business steps"
  ON public.business_steps FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for credit_report_uploads
CREATE POLICY "Users can view own credit report uploads"
  ON public.credit_report_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit report uploads"
  ON public.credit_report_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit report uploads"
  ON public.credit_report_uploads FOR UPDATE
  USING (auth.uid() = user_id);

-- Create storage bucket for credit report PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('credit-reports', 'credit-reports', false);

-- Storage RLS policies
CREATE POLICY "Users can upload own credit reports"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'credit-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own credit reports"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'credit-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own credit reports"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'credit-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Triggers for updated_at
CREATE TRIGGER update_business_entities_updated_at
  BEFORE UPDATE ON public.business_entities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_steps_updated_at
  BEFORE UPDATE ON public.business_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();