-- Security hardening flagged by Supabase advisors after the auth/reviews work.

-- Pin search_path on the new rating trigger function.
alter function public.update_business_rating() set search_path = public;

-- handle_new_user is a trigger only; it must not be callable as an RPC.
-- Triggers still fire regardless of EXECUTE grants.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
