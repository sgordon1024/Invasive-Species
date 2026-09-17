-- AR bar notes for the Menagerie iOS app (ios/Menagerie).
-- Notes are ephemeral: readable for 24 hours, then invisible to clients
-- (row-level security below), then hard-deleted by the purge function.

create table if not exists public.ar_notes (
  id uuid primary key default gen_random_uuid(),
  specimen_id text not null check (char_length(specimen_id) <= 64),
  author_name text check (char_length(author_name) <= 40),
  body text not null check (char_length(body) between 1 and 280),
  device_id uuid not null,
  flag_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ar_notes_specimen_created_idx
  on public.ar_notes (specimen_id, created_at desc);

alter table public.ar_notes enable row level security;

-- Read: only live notes (younger than 24h) that haven't been flagged off the wall.
create policy ar_notes_read_live on public.ar_notes
  for select to anon, authenticated
  using (created_at > now() - interval '24 hours' and flag_count < 3);

-- Write: anyone in the bar can pin a note; the trigger below rate-limits per device.
create policy ar_notes_insert on public.ar_notes
  for insert to anon, authenticated
  with check (true);

-- No update/delete policies on purpose: notes can't be edited and fade on their own.

-- Rate limit: a device gets 5 notes per hour.
create or replace function public.ar_notes_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.ar_notes
      where device_id = new.device_id
        and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Easy there — this device has pinned plenty of notes this hour.';
  end if;
  return new;
end $$;

drop trigger if exists ar_notes_rate_limit on public.ar_notes;
create trigger ar_notes_rate_limit before insert on public.ar_notes
  for each row execute function public.ar_notes_rate_limit();

-- Flagging: three flags hides a note. Gives the app the report path that
-- App Store guideline 1.2 requires for user-generated content.
create or replace function public.report_ar_note(note_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.ar_notes set flag_count = flag_count + 1 where id = note_id;
$$;

grant execute on function public.report_ar_note(uuid) to anon, authenticated;

-- Housekeeping: hard-delete anything older than 48h. RLS already hides notes
-- at 24h, so this just keeps the table small. If pg_cron is enabled, schedule it:
--   select cron.schedule('purge-ar-notes', '17 * * * *',
--     $cron$select public.purge_expired_ar_notes()$cron$);
create or replace function public.purge_expired_ar_notes() returns void
language sql security definer set search_path = public as $$
  delete from public.ar_notes where created_at < now() - interval '48 hours';
$$;
