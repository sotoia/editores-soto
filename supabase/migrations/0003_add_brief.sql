-- 0003_add_brief.sql
-- Add brief column so candidates choose which angle they edit
-- (elgato = Elgato Prompter product video, autocont = AUTOCONT storytelling)

alter table public.applications
  add column brief text not null
  default 'elgato'
  check (brief in ('elgato', 'autocont'));

-- Optional: drop default once the form is forcing the value.
-- For now we keep it so legacy clients never insert NULL.
