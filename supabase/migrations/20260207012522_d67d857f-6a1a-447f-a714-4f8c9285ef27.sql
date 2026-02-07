
-- Add notification_preferences JSONB column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"scoreUpdates": true, "disputeStatus": true, "fundingOpportunities": true, "actionReminders": true}'::jsonb;
