"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

const loginSchema = z.object({
  email: z.string().email("E-mail invalido"),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres"),
});

export type LoginState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(
  prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  const redirectTo = (formData.get("redirect") as string) || "/inicio";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "E-mail ou senha incorretos" };
        default:
          return { error: "Erro ao fazer login. Tente novamente." };
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

const signupSchema = z.object({
  name: z.string().min(2, "Nome precisa de no minimo 2 caracteres").max(120),
  email: z.string().email("E-mail invalido").max(160),
  password: z.string().min(8, "Senha deve ter no minimo 8 caracteres").max(80),
  confirmPassword: z.string(),
  phone: z.string().max(40).optional().nullable().or(z.literal("")),
  crm: z.string().max(40).optional().nullable().or(z.literal("")),
  acceptTerms: z.literal("on", {
    message: "Voce precisa aceitar os termos para continuar",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas nao coincidem",
  path: ["confirmPassword"],
});

export type SignupState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function signupAction(
  prevState: SignupState | undefined,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    phone: String(formData.get("phone") ?? "").trim() || null,
    crm: String(formData.get("crm") ?? "").trim() || null,
    acceptTerms: formData.get("acceptTerms"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return {
      fieldErrors: { email: ["Esse e-mail ja esta em uso"] },
    };
  }

  const hashedPassword = await hashPassword(data.password);

  await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone || null,
      crm: data.crm || null,
      role: "STUDENT",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const redirectTo = (formData.get("redirect") as string) || "/inicio";

  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Conta criada, mas houve um erro ao fazer login automatico. Tente entrar manualmente.",
      };
    }
    throw error;
  }
}