import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

export type TypedSupabaseClient = SupabaseClient;

export function createServerClient(
  cookieStore?: ReturnType<typeof cookies>,
  cookieOptions?: CookieOptions
) {
  return createServerComponentClient(
    {
      cookies: () => cookieStore ?? cookies()
    },
    cookieOptions
  );
}
