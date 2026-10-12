-- MarketAtlas initial schema (Postgres / Supabase)
create extension if not exists pg_trgm;

create table categories (
  id text primary key,
  name text not null,
  description text,
  sort_order int default 0
);

create table repositories (
  id uuid primary key default gen_random_uuid(),
  github_id bigint unique not null,
  owner text not null,
  name text not null,
  full_name text generated always as (owner || '/' || name) stored,
  description text,
  html_url text not null,
  homepage text,
  language text,
  license_spdx text,
  stars int not null default 0,
  forks int not null default 0,
  open_issues int not null default 0,
  topics text[] default '{}',
  default_branch text,
  created_at_github timestamptz,
  pushed_at_github timestamptz,
  updated_at_github timestamptz,
  category_id text references categories(id),
  project_type text check (project_type in ('repository','skill','mcp-server')),
  verification_status text default 'unverified' check (verification_status in ('unverified','verified','failed')),
  discovered_at timestamptz default now(),
  last_synced_at timestamptz default now(),
  source_url text,
  unique(owner, name)
);
create index idx_repos_fullname_trgm on repositories using gin (full_name gin_trgm_ops);
create index idx_repos_stars on repositories (stars desc);
create index idx_repos_pushed on repositories (pushed_at_github desc);
create index idx_repos_category on repositories (category_id);
create index idx_repos_language on repositories (language);

create table repository_snapshots (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid references repositories(id) on delete cascade,
  stars int not null,
  forks int not null,
  open_issues int not null,
  captured_at timestamptz default now(),
  unique(repository_id, captured_at)
);
create index idx_snapshots_repo_time on repository_snapshots (repository_id, captured_at desc);

create table skills (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid references repositories(id) on delete cascade unique,
  skill_name text not null,
  skill_path text not null, -- verified path to SKILL.md
  supported_agents text[] default '{}',
  install_command text, -- only if verified from docs
  readme_preview text,
  last_verified_at timestamptz default now()
);

create table mcp_servers (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid references repositories(id) on delete cascade unique,
  transport text, -- stdio | sse | streamable-http | unknown
  auth_requirements text,
  tools jsonb default '[]',
  publisher_status text check (publisher_status in ('official','community','experimental')),
  trading_permission_warning boolean default false,
  install_docs text
);

create table sync_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  started_at timestamptz default now(),
  finished_at timestamptz,
  status text check (status in ('running','success','failed')),
  stats jsonb default '{}',
  error text
);

-- Seed categories
insert into categories (id, name, description, sort_order) values
('us-equity','US Equity Research','US stock research & valuation',1),
('crypto','Crypto & Blockchain','Crypto research & on-chain analytics',2),
('quant','Quantitative Trading','Quant strategies & execution',3),
('backtest','Backtesting','Backtesting frameworks',4),
('portfolio','Portfolio Optimization','Portfolio construction & risk',5),
('findata','Financial Data','Data APIs & engineering',6),
('ai-agents','AI Finance Agents','AI agents for finance',7),
('sentiment','Market Sentiment','News & sentiment analysis',8),
('ta','Technical Analysis','Indicators & charting',9),
('risk','Risk Management','Risk models & limits',10),
('derivatives','Options & Derivatives','Options pricing & derivatives',11)
on conflict (id) do nothing;
