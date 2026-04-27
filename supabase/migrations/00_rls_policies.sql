-- =============================================================================
-- Multi-tenant Row Level Security
-- =============================================================================
--
-- Enforces the invariant: an authenticated user may only touch rows whose
-- "salonId" matches the "salonId" stored on their own User record.
--
-- PREREQUISITE
-- The application must create a "User" row at sign-up whose "id" column
-- equals the Supabase Auth UUID (auth.uid()::text).  The recommended
-- pattern is a Postgres trigger on auth.users that calls an INSERT into
-- public."User" with id = NEW.id::text.  If you use cuid() on new User
-- rows, replace the WHERE clause in get_my_salon_id() with a lookup on a
-- dedicated "authId uuid" column instead.
--
-- BYPASS
-- Server-side code that runs with the Supabase service_role key is
-- exempt from RLS by design; all policies here target the `authenticated`
-- role used by JWT-bearing client requests.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Helper: resolve the calling user's salonId once per query
-- -----------------------------------------------------------------------------
--
-- SECURITY DEFINER  – executes with the definer's privileges so the function
--                     can read "User" even when that table has its own RLS.
-- STABLE            – the planner may evaluate this once and cache the result
--                     for the duration of a single statement, avoiding a
--                     per-row subquery on every policy check.
-- SET search_path   – empty string forces all identifiers to be fully
--                     qualified, closing off search-path-injection attacks.
--
-- Returns NULL when auth.uid() has no matching User row; NULL compared with
-- = always yields NULL (falsy), so every policy check silently rejects the
-- request for unknown identities.

CREATE OR REPLACE FUNCTION public.get_my_salon_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT "salonId"
  FROM   public."User"
  WHERE  id = (auth.uid())::text
  LIMIT  1;
$$;


-- -----------------------------------------------------------------------------
-- Enable RLS
-- -----------------------------------------------------------------------------

ALTER TABLE public."Staff"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Service"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Appointment" ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- Staff
-- =============================================================================

CREATE POLICY "staff: tenant select"
  ON public."Staff"
  FOR SELECT
  TO authenticated
  USING (
    "salonId" = public.get_my_salon_id()
  );

CREATE POLICY "staff: tenant insert"
  ON public."Staff"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "salonId" = public.get_my_salon_id()
  );

-- USING  → which existing rows the user is allowed to target.
-- WITH CHECK → what the row must look like after the write; prevents
--              an UPDATE from re-assigning a row to a different tenant.
CREATE POLICY "staff: tenant update"
  ON public."Staff"
  FOR UPDATE
  TO authenticated
  USING (
    "salonId" = public.get_my_salon_id()
  )
  WITH CHECK (
    "salonId" = public.get_my_salon_id()
  );

CREATE POLICY "staff: tenant delete"
  ON public."Staff"
  FOR DELETE
  TO authenticated
  USING (
    "salonId" = public.get_my_salon_id()
  );


-- =============================================================================
-- Service
-- =============================================================================

CREATE POLICY "service: tenant select"
  ON public."Service"
  FOR SELECT
  TO authenticated
  USING (
    "salonId" = public.get_my_salon_id()
  );

CREATE POLICY "service: tenant insert"
  ON public."Service"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "salonId" = public.get_my_salon_id()
  );

CREATE POLICY "service: tenant update"
  ON public."Service"
  FOR UPDATE
  TO authenticated
  USING (
    "salonId" = public.get_my_salon_id()
  )
  WITH CHECK (
    "salonId" = public.get_my_salon_id()
  );

CREATE POLICY "service: tenant delete"
  ON public."Service"
  FOR DELETE
  TO authenticated
  USING (
    "salonId" = public.get_my_salon_id()
  );


-- =============================================================================
-- Appointment
-- =============================================================================

CREATE POLICY "appointment: tenant select"
  ON public."Appointment"
  FOR SELECT
  TO authenticated
  USING (
    "salonId" = public.get_my_salon_id()
  );

CREATE POLICY "appointment: tenant insert"
  ON public."Appointment"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "salonId" = public.get_my_salon_id()
  );

CREATE POLICY "appointment: tenant update"
  ON public."Appointment"
  FOR UPDATE
  TO authenticated
  USING (
    "salonId" = public.get_my_salon_id()
  )
  WITH CHECK (
    "salonId" = public.get_my_salon_id()
  );

CREATE POLICY "appointment: tenant delete"
  ON public."Appointment"
  FOR DELETE
  TO authenticated
  USING (
    "salonId" = public.get_my_salon_id()
  );
