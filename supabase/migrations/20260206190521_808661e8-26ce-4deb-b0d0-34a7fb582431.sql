-- Add referral columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by text;

-- Create index for referral lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);