-- Enable realtime for score_history, disputes, and tradelines
ALTER PUBLICATION supabase_realtime ADD TABLE public.score_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.disputes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tradelines;