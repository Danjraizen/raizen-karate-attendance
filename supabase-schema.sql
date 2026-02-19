-- Raizen Karate Attendance System - Supabase schema
-- Run this in the Supabase SQL editor for your project.

-- DOJOS
create table public.dojos (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- INSTRUCTORS (links to auth.users via auth_user_id)
create table public.instructors (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  primary_dojo_id uuid not null references public.dojos(id) on delete restrict,
  name text not null,
  phone text,
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- BATCHES
create table public.batches (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid not null references public.dojos(id) on delete cascade,
  name text not null,
  days_of_week text not null, -- e.g. "Mon,Wed,Fri"
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- BATCH INSTRUCTORS (which instructor handles which batch)
create table public.batch_instructors (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches(id) on delete cascade,
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  unique (batch_id, instructor_id)
);

-- STUDENTS
create table public.students (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid not null references public.dojos(id) on delete cascade,
  first_name text not null,
  last_name text,
  date_of_birth date,
  contact_phone text,
  guardian_name text,
  join_date date not null default current_date,
  left_date date,
  status text not null default 'active', -- active | left | trial
  current_belt text not null default 'White',
  notes text,
  created_at timestamptz not null default now()
);

-- BATCH ENROLLMENTS (student-batch relationships over time)
create table public.batch_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  start_date date not null default current_date,
  end_date date,
  is_primary boolean not null default true,
  created_at timestamptz not null default now()
);

-- ATTENDANCE
create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  date date not null,
  status text not null default 'present', -- present | absent | excused
  marked_by_instructor_id uuid not null references public.instructors(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (student_id, batch_id, date)
);

-- BELT EXAM WINDOWS
create table public.belt_exam_windows (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid not null references public.dojos(id) on delete cascade,
  name text not null,
  belt_level text not null,
  start_date date not null,
  end_date date not null,
  min_attendance_percent numeric not null default 80,
  created_at timestamptz not null default now()
);

-- Simple view for attendance summaries per student within a date range
create view public.student_attendance_summary as
select
  s.id as student_id,
  s.first_name,
  s.last_name,
  s.current_belt,
  count(ar.*) filter (where ar.status = 'present') as sessions_present,
  count(ar.*) as sessions_total,
  case
    when count(ar.*) = 0 then 0
    else round(100.0 * count(ar.*) filter (where ar.status = 'present') / count(ar.*), 1)
  end as attendance_percent
from public.students s
left join public.attendance_records ar
  on ar.student_id = s.id
group by s.id, s.first_name, s.last_name, s.current_belt;

-- Row Level Security
alter table public.dojos enable row level security;
alter table public.instructors enable row level security;
alter table public.batches enable row level security;
alter table public.batch_instructors enable row level security;
alter table public.students enable row level security;
alter table public.batch_enrollments enable row level security;
alter table public.attendance_records enable row level security;
alter table public.belt_exam_windows enable row level security;

-- Helper: get current instructor row
create or replace function public.current_instructor()
returns public.instructors
language sql
security definer
set search_path = public
as $$
  select i.*
  from public.instructors i
  where i.auth_user_id = auth.uid()
  limit 1;
$$;

-- Policies

-- Instructors table: each instructor can see only their own row.
create policy "instructors_select_own"
on public.instructors
for select
using (auth.uid() = auth_user_id);

-- Dojos: instructor can see only their primary dojo.
create policy "dojos_select_primary"
on public.dojos
for select
using (id = (select primary_dojo_id from public.instructors where auth_user_id = auth.uid()));

-- Batches: visible if in instructor's primary dojo.
create policy "batches_select_primary_dojo"
on public.batches
for select
using (
  dojo_id = (select primary_dojo_id from public.instructors where auth_user_id = auth.uid())
);

-- Batch instructors: instructors can see assignments within their dojo
create policy "batch_instructors_select_primary_dojo"
on public.batch_instructors
for select
using (
  batch_id in (
    select id from public.batches
    where dojo_id = (select primary_dojo_id from public.instructors where auth_user_id = auth.uid())
  )
);

-- Students: visible if in instructor's primary dojo.
create policy "students_select_primary_dojo"
on public.students
for select
using (
  dojo_id = (select primary_dojo_id from public.instructors where auth_user_id = auth.uid())
);

-- Batch enrollments: visible if batch in instructor's primary dojo.
create policy "enrollments_select_primary_dojo"
on public.batch_enrollments
for select
using (
  batch_id in (
    select id from public.batches
    where dojo_id = (select primary_dojo_id from public.instructors where auth_user_id = auth.uid())
  )
);

-- Attendance: select/insert/update within instructor's primary dojo.
create policy "attendance_select_primary_dojo"
on public.attendance_records
for select
using (
  batch_id in (
    select bi.batch_id
    from public.batch_instructors bi
    join public.instructors i on i.id = bi.instructor_id
    where i.auth_user_id = auth.uid()
  )
);

create policy "attendance_insert_primary_dojo"
on public.attendance_records
for insert
with check (
  batch_id in (
    select bi.batch_id
    from public.batch_instructors bi
    join public.instructors i on i.id = bi.instructor_id
    where i.auth_user_id = auth.uid()
  )
);

create policy "attendance_update_primary_dojo"
on public.attendance_records
for update
using (
  batch_id in (
    select bi.batch_id
    from public.batch_instructors bi
    join public.instructors i on i.id = bi.instructor_id
    where i.auth_user_id = auth.uid()
  )
);

-- Belt exam windows: visible within primary dojo.
create policy "belt_exams_select_primary_dojo"
on public.belt_exam_windows
for select
using (
  dojo_id = (select primary_dojo_id from public.instructors where auth_user_id = auth.uid())
);

