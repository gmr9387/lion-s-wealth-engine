
-- Create table for storing Plaid linked accounts
CREATE TABLE public.plaid_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution_name TEXT,
  institution_id TEXT,
  access_token TEXT NOT NULL,
  item_id TEXT NOT NULL,
  account_id TEXT,
  account_name TEXT,
  account_type TEXT,
  account_subtype TEXT,
  account_mask TEXT,
  owner_name TEXT,
  owner_email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plaid_connections ENABLE ROW LEVEL SECURITY;

-- Users can only view their own connections
CREATE POLICY "Users can view own plaid connections"
  ON public.plaid_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own connections
CREATE POLICY "Users can insert own plaid connections"
  ON public.plaid_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own connections
CREATE POLICY "Users can update own plaid connections"
  ON public.plaid_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete own plaid connections"
  ON public.plaid_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_plaid_connections_updated_at
  BEFORE UPDATE ON public.plaid_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
