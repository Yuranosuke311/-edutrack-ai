import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "./supabase";

export async function requireAuth(req: NextRequest) {
  const supabase = createSupabaseServerClient(() => {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const entries = cookieHeader.split(";").map((c) => c.trim().split("="));
    return Object.fromEntries(entries.filter(([k]) => k));
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const error = new Error("UNAUTHORIZED");
    // @ts-expect-error custom
    error.code = "UNAUTHORIZED";
    throw error;
  }

  return user;
}
