create or replace function public.claim_tag(raw_token text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare target_id uuid; claimed_code text;
begin
  if auth.uid() is null then raise exception 'You must be signed in'; end if;
  select c.tag_id into target_id from public.tag_claims c
  join public.tags t on t.id = c.tag_id
  where c.token_hash = pg_catalog.encode(extensions.digest(raw_token, 'sha256'), 'hex')
    and c.used_at is null and t.owner_id is null
  for update;
  if target_id is null then raise exception 'Activation code is invalid or already used'; end if;
  update public.tags set owner_id = auth.uid(), status = 'active', claimed_at = now(), updated_at = now()
  where id = target_id returning public_code into claimed_code;
  update public.tag_claims set used_at = now() where tag_id = target_id;
  return claimed_code;
end;
$$;

grant execute on function public.claim_tag(text) to authenticated;
