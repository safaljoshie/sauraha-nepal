-- SEO content brief placeholders (status = draft — do not publish until reviewed)
-- Run in Supabase SQL Editor after blog_posts table exists.

insert into blog_posts (
  title,
  slug,
  excerpt,
  content,
  tag,
  read_time,
  status,
  meta_title,
  meta_description
)
values
  (
    'How Far Is Sauraha From Kathmandu? (Bus, Car & Flight Options)',
    'how-far-is-sauraha-from-kathmandu',
    'Draft brief: cover distance, travel time, tourist bus, private car, and flight-to-Bharatpur options for reaching Sauraha from Kathmandu.',
    null,
    'Transport',
    '8 min read',
    'draft',
    'How Far Is Sauraha From Kathmandu? Distance & Transport',
    'How far is Sauraha from Kathmandu? Compare bus, car and flight options, typical travel times, and tips for reaching Chitwan National Park.'
  ),
  (
    'Sauraha Nepal Weather by Month: When to Go and What to Pack',
    'sauraha-nepal-weather-by-month',
    'Draft brief: month-by-month weather in Sauraha, monsoon vs dry season, rhino viewing windows, and packing list for jungle trips.',
    null,
    'Guide',
    '10 min read',
    'draft',
    'Sauraha Nepal Weather by Month — When to Visit',
    'Sauraha Nepal weather by month: best time to visit Chitwan, monsoon vs peak season, and what to pack for jungle safaris and village walks.'
  ),
  (
    'Is Sauraha Safe? A Practical Guide for Solo and Female Travellers',
    'is-sauraha-safe-solo-female-travellers',
    'Draft brief: practical safety tips for solo travellers and women visiting Sauraha — transport, accommodation, guides, and village etiquette.',
    null,
    'Tips',
    '7 min read',
    'draft',
    'Is Sauraha Safe for Solo & Female Travellers?',
    'Is Sauraha safe for solo female travellers? Practical advice on getting around, choosing stays, hiring guides, and staying comfortable in Chitwan.'
  ),
  (
    '2 Days in Sauraha: A Realistic Itinerary for First-Time Visitors',
    '2-days-in-sauraha-itinerary',
    'Draft brief: realistic 48-hour plan — arrival, one safari, Tharu culture, riverside time, and where to eat and stay.',
    null,
    'Guide',
    '9 min read',
    'draft',
    '2 Days in Sauraha — First-Timer Itinerary',
    'A realistic 2-day Sauraha Nepal itinerary for first-time visitors: jeep safari, canoe ride, Tharu cultural show, and village walks near Chitwan National Park.'
  ),
  (
    'Free Things to Do in Sauraha (No Safari Booking Required)',
    'free-things-to-do-in-sauraha',
    'Draft brief: village walks, Rapti River viewpoints, cycling, Tharu village visits, and low-cost cultural experiences without a park safari.',
    null,
    'Tips',
    '6 min read',
    'draft',
    'Free Things to Do in Sauraha Nepal',
    'Free things to do in Sauraha: village walks, Rapti River views, local markets and cultural spots — no jungle safari booking required.'
  )
on conflict (slug) do nothing;
