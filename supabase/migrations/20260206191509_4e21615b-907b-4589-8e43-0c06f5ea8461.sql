
-- Rate limiting table for tracking API requests
CREATE TABLE public.rate_limit_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  function_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_rate_limit_lookup ON public.rate_limit_entries (identifier, function_name, created_at DESC);

-- Auto-cleanup helper
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_entries()
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  DELETE FROM public.rate_limit_entries WHERE created_at < now() - interval '2 hours';
$$;

-- Atomic rate limit check: returns TRUE if allowed, FALSE if rate limited
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_function_name TEXT,
  p_max_requests INT,
  p_window_seconds INT DEFAULT 3600
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_count INT;
BEGIN
  -- Count requests in window
  SELECT COUNT(*) INTO request_count
  FROM public.rate_limit_entries
  WHERE identifier = p_identifier
    AND function_name = p_function_name
    AND created_at > now() - (p_window_seconds || ' seconds')::interval;

  IF request_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;

  -- Record this request
  INSERT INTO public.rate_limit_entries (identifier, function_name)
  VALUES (p_identifier, p_function_name);

  -- Probabilistic cleanup of old entries (1% of requests)
  IF random() < 0.01 THEN
    PERFORM public.cleanup_rate_limit_entries();
  END IF;

  RETURN TRUE;
END;
$$;

-- Enable RLS but add no policies = blocks direct client access
ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;
