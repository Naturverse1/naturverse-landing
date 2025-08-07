
-- Run in Supabase SQL editor
create table classes (
  id uuid primary key default uuid_generate_v4(),
  name text,
  teacher_id uuid references users(id),
  created_at timestamp default now()
);

create table class_students (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id),
  student_id uuid references users(id),
  joined_at timestamp default now()
);

create table assignments (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id),
  title text,
  description text,
  module_id uuid references learning_modules(id),
  due_date date,
  created_at timestamp default now()
);

create table assignment_submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id),
  student_id uuid references users(id),
  submitted_at timestamp,
  score integer,
  status text
);
