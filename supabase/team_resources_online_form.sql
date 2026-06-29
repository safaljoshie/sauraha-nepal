-- Per-file Google Form link on team_resources (Online Form button on each file card)
-- Run in Supabase SQL Editor

alter table team_resources
add column if not exists online_form_url text;
