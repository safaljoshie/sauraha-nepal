-- Email verification OTP codes for guide contacts and review submissions

create table if not exists email_verifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  email text not null,
  otp_code text not null,
  purpose text not null,
  reference_id text,
  verified boolean default false,
  expires_at timestamp with time zone not null,
  attempts integer default 0
);

alter table email_verifications enable row level security;

create index if not exists idx_email_verifications_lookup
on email_verifications(email, otp_code, purpose, reference_id);

create index if not exists idx_email_verifications_expires
on email_verifications(expires_at);

create index if not exists idx_email_verifications_email_created
on email_verifications(email, created_at desc);
