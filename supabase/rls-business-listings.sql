-- Run in Supabase SQL Editor if public anon reads return no approved listings

create policy "Public read approved listings"
on public.business_listings
for select
to anon, authenticated
using (status = 'approved');
