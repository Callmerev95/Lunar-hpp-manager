"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AuthError = {
  field?: "email" | "password";
  message: string;
};

export async function loginAction(
  formData: FormData,
): Promise<AuthError | undefined> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "Email dan password wajib diisi." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { field: "email", message: "Email atau password salah." };
    }
    return { message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function registerAction(
  formData: FormData,
): Promise<AuthError | undefined> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "Email dan password wajib diisi." };
  }
  if (password.length < 6) {
    return { field: "password", message: "Password minimal 6 karakter." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login` },
  });

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/login?registered=1");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}