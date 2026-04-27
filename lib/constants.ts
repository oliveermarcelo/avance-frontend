export const APP_NAME = process.env.APP_NAME || "Avance MentorMed";

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
  admin: "/admin",
} as const;