-- New Supabase projects (with "Automatically expose new tables" disabled,
-- which we intentionally chose for security) no longer auto-grant table
-- privileges to API roles. RLS policies control *which rows* a role can
-- see/change, but the role still needs a base GRANT to touch the table at
-- all. Both are required together.

grant usage on schema public to anon, authenticated, service_role;

-- service_role: used by our server-side Edge/Worker functions (supabaseAdmin).
-- It bypasses RLS, so it needs direct grants to do its job (creating orders,
-- reading profiles for admin tasks, etc).
grant select, insert, update, delete on public.orders to service_role;
grant select, insert, update, delete on public.profiles to service_role;

-- authenticated: real logged-in users, going through RLS-filtered queries
-- (getMyOrders, getMyProfile, updateMyProfile). RLS policies already
-- restrict these to "rows belonging to the current user" — this grant just
-- allows the role to query the table at all, RLS does the rest.
grant select on public.orders to authenticated;
grant select, insert, update on public.profiles to authenticated;

-- Make sure any tables added by FUTURE migrations get sane grants
-- automatically too, instead of silently failing with 42501 again.
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
