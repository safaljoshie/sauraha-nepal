-- Google Form link for Team Resources "Online Form" button (admin-controlled)
-- Run in Supabase SQL Editor

insert into site_settings (key, value)
values ('team_resources_online_form_url', '')
on conflict (key) do nothing;
