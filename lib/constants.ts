export const APP_NAME = "Avance MentorMed";

export const FRAPPE_API_URL = process.env.NEXT_PUBLIC_FRAPPE_API_URL || "http://lms.localhost:8000";

export const ROUTES = {
  home: "/",
  login: "/login",
  cadastro: "/cadastro",
  recuperarSenha: "/recuperar-senha",
  inicio: "/inicio",
  meusCursos: "/meus-cursos",
  certificados: "/certificados",
  perfil: "/perfil",
  cursos: "/cursos",
  curso: (slug: string) => `/cursos/${slug}`,
} as const;

export const JWT_COOKIE_NAME = "avance_session";
export const JWT_EXPIRES_IN = "7d";