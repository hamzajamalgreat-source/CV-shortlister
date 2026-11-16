import { createClient } from "@supabase/supabase-js";

let supabaseUrl: string = "";
let supabaseAnonKey: string = "";

try {
  supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
} catch {
  supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
}

export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder");

export function createServerClient(token?: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  const client = createClient(supabaseUrl, serviceRoleKey);

  if (token) {
    (client.auth as any).setSession({
      access_token: token,
      refresh_token: "",
    });
  }

  return client;
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}
