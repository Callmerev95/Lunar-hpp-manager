-- 0002_revoke_set_updated_at.sql
-- set_updated_at hanya untuk trigger internal, revoke execute agar tak bisa dipanggil via RPC.
revoke all on function public.set_updated_at() from public;
revoke all on function public.set_updated_at() from anon;
revoke all on function public.set_updated_at() from authenticated;