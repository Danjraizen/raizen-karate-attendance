-- Seed data for Vinayagapuram dojo (Raizen Karate)
-- Run AFTER you run `supabase-schema.sql`.
--
-- IMPORTANT:
-- 1) First create 4 auth users (email/password) in Supabase for instructors.
-- 2) Replace AUTH_UUID_* placeholders with the real UUID from Authentication -> Users.

-- Dojo
insert into public.dojos (name, location)
values ('Vinayagapuram', 'Vinayagapuram')
on conflict (name) do nothing;

-- Instructors (link to auth.users)
insert into public.instructors (auth_user_id, primary_dojo_id, name, email)
values
  ('4bb9412d-5eb3-43ff-9af7-b0b5e5f181e2', (select id from public.dojos where name = 'Vinayagapuram'), 'Amalesh.S', 'amalesh.raizen@gmail.com'),
  ('31a2efd6-79e3-4e91-aea4-9b611ff40146',  (select id from public.dojos where name = 'Vinayagapuram'), 'Daniel.JR',  'danjr.raizen@gmail.com'),
  ('c079a389-66cc-47d9-8093-27f4c092934c',    (select id from public.dojos where name = 'Vinayagapuram'), 'Bala Kumaran.S', 'bala.raizen@gmail.com'),
  ('2db347fa-36f5-444d-881a-37aa1df6dcb6',     (select id from public.dojos where name = 'Vinayagapuram'), 'Sam Ebinezer.S', 'samebinezer.raizen@gmail.com')
on conflict (auth_user_id) do nothing;

-- Batches
insert into public.batches (dojo_id, name, days_of_week, start_time, end_time)
select d.id, b.name, b.days_of_week, b.start_time, b.end_time
from public.dojos d
join (
  values
    ('Saturday-Sunday 4-5pm',          'Sat,Sun', '16:00'::time, '17:00'::time),
    ('Saturday-Sunday 5-6pm',          'Sat,Sun', '17:00'::time, '18:00'::time),
    ('Saturday-Sunday 6-7pm',          'Sat,Sun', '18:00'::time, '19:00'::time),
    ('Monday-Wednesday 4-5pm',         'Mon,Wed', '16:00'::time, '17:00'::time),
    ('Monday-Wednesday 5-6pm',         'Mon,Wed', '17:00'::time, '18:00'::time),
    ('Monday-Wednesday 6-7.30pm',      'Mon,Wed', '18:00'::time, '19:30'::time),
    ('Monday-Wednesday 7-8.30pm',      'Mon,Wed', '19:00'::time, '20:30'::time),
    ('Tuesday-Thursday 5-6pm',         'Tue,Thu', '17:00'::time, '18:00'::time),
    ('Tuesday-Thursday 6-7.30pm',      'Tue,Thu', '18:00'::time, '19:30'::time),
    ('Friday 5-6pm',                   'Fri',     '17:00'::time, '18:00'::time),
    ('Friday 6-7.30pm',                'Fri',     '18:00'::time, '19:30'::time)
) as b(name, days_of_week, start_time, end_time) on true
where d.name = 'Vinayagapuram';

-- Students
insert into public.students (dojo_id, first_name, status)
select d.id, s.first_name, 'active'
from public.dojos d
join (
  values
    ('Sachin'),
    ('Kevin'),
    ('Theepthi'),
    ('Pavan Sai'),
    ('Shree Vaishnavi'),
    ('Kavini'),
    ('Sashthika'),
    ('Aadhvik'),
    ('kassandra'),
    ('Keshwanth'),
    ('Advith'),
    ('Kevin Stephen'),
    ('Prithesh'),
    ('Mylesh'),
    ('Thejesh'),
    ('Ravi krishna'),
    ('Prithika'),
    ('Rakshitha')
) as s(first_name) on true
where d.name = 'Vinayagapuram'
  and not exists (
    select 1 from public.students st
    where st.dojo_id = d.id and st.first_name = s.first_name
  );

-- Student batch enrollments
-- Note: Ravi krishna is enrolled in two batches.
insert into public.batch_enrollments (student_id, batch_id, start_date, is_primary)
select
  st.id as student_id,
  bt.id as batch_id,
  current_date as start_date,
  e.is_primary
from public.dojos d
join (
  values
    ('Sachin',        'Saturday-Sunday 4-5pm', true),
    ('Kevin',         'Saturday-Sunday 4-5pm', true),
    ('Theepthi',      'Saturday-Sunday 5-6pm', true),
    ('Pavan Sai',     'Saturday-Sunday 5-6pm', true),
    ('Shree Vaishnavi','Saturday-Sunday 6-7pm', true),
    ('Kavini',        'Saturday-Sunday 6-7pm', true),
    ('Sashthika',     'Monday-Wednesday 4-5pm', true),
    ('Aadhvik',       'Monday-Wednesday 5-6pm', true),
    ('kassandra',     'Monday-Wednesday 5-6pm', true),
    ('Keshwanth',     'Monday-Wednesday 6-7.30pm', true),
    ('Advith',        'Monday-Wednesday 6-7.30pm', true),
    ('Kevin Stephen', 'Monday-Wednesday 7-8.30pm', true),
    ('Prithesh',      'Monday-Wednesday 7-8.30pm', true),
    ('Mylesh',        'Tuesday-Thursday 5-6pm', true),
    ('Thejesh',       'Tuesday-Thursday 5-6pm', true),
    ('Ravi krishna',  'Tuesday-Thursday 6-7.30pm', true),
    ('Prithika',      'Tuesday-Thursday 6-7.30pm', true),
    ('Rakshitha',     'Friday 5-6pm', true),
    ('Ravi krishna',  'Friday 6-7.30pm', false)
) as e(student_first_name, batch_name, is_primary) on true
join public.students st
  on st.dojo_id = d.id and st.first_name = e.student_first_name
join public.batches bt
  on bt.dojo_id = d.id and bt.name = e.batch_name
where d.name = 'Vinayagapuram'
  and not exists (
    select 1 from public.batch_enrollments be
    where be.student_id = st.id and be.batch_id = bt.id and be.end_date is null
  );

-- Instructor -> batch assignments
insert into public.batch_instructors (batch_id, instructor_id, is_primary)
select
  bt.id,
  ins.id,
  true
from public.dojos d
join (
  values
    ('Amalesh.S', 'Tuesday-Thursday 6-7.30pm'),
    ('Daniel.JR', 'Saturday-Sunday 4-5pm'),
    ('Daniel.JR', 'Saturday-Sunday 5-6pm'),
    ('Daniel.JR', 'Monday-Wednesday 7-8.30pm'),
    ('Bala Kumaran.S', 'Monday-Wednesday 4-5pm'),
    ('Bala Kumaran.S', 'Monday-Wednesday 5-6pm'),
    ('Bala Kumaran.S', 'Monday-Wednesday 6-7.30pm'),
    ('Bala Kumaran.S', 'Friday 5-6pm'),
    ('Bala Kumaran.S', 'Friday 6-7.30pm'),
    ('Sam Ebinezer.S', 'Saturday-Sunday 6-7pm')
) as m(instructor_name, batch_name) on true
join public.instructors ins
  on ins.primary_dojo_id = d.id and ins.name = m.instructor_name
join public.batches bt
  on bt.dojo_id = d.id and bt.name = m.batch_name
where d.name = 'Vinayagapuram'
on conflict (batch_id, instructor_id) do nothing;

