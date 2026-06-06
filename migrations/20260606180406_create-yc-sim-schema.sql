create table if not exists startups (
  id text primary key,
  company_name text not null,
  description text not null,
  target_customer text,
  problem text,
  solution text,
  why_now text,
  traction text,
  business_model text,
  competitors text,
  product_url text,
  repo_url text,
  founder_voice_sample text,
  created_at timestamptz not null default now()
);

create table if not exists pitch_sessions (
  id text primary key,
  startup_id text not null references startups(id) on delete cascade,
  status text not null,
  generated_pitch text,
  one_liner text,
  positioning text,
  readiness_score integer,
  score_breakdown jsonb,
  rewritten_pitch text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists investor_questions (
  id text primary key,
  session_id text not null references pitch_sessions(id) on delete cascade,
  investor_type text not null,
  question text not null,
  answer text,
  feedback text,
  score integer,
  stronger_answer text,
  created_at timestamptz not null default now()
);

create table if not exists launch_assets (
  id text primary key,
  session_id text not null references pitch_sessions(id) on delete cascade,
  asset_type text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists avatars (
  id text primary key,
  session_id text not null references pitch_sessions(id) on delete cascade,
  role text not null,
  provider_avatar_id text,
  display_name text not null,
  persona text not null,
  created_at timestamptz not null default now()
);

create index if not exists pitch_sessions_startup_id_idx on pitch_sessions(startup_id);
create index if not exists investor_questions_session_id_idx on investor_questions(session_id);
create index if not exists launch_assets_session_id_idx on launch_assets(session_id);
create index if not exists avatars_session_id_idx on avatars(session_id);
