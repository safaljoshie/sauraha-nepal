-- Run in Supabase SQL Editor
create table business_listings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  business_name text not null,
  category text not null,
  description text,
  price_range text,
  opening_hours text,
  owner_name text not null,
  email text not null,
  phone text,
  whatsapp text,
  website text,
  facebook text,
  address text,
  google_maps_link text,
  photo_links text,
  plan text default 'basic',
  status text default 'pending',
  agreed_to_terms boolean default false
);
