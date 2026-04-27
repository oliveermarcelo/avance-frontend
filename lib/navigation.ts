import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Award,
  User,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: "Aluno",
    items: [
      { label: "Início", href: "/inicio", icon: LayoutDashboard },
      { label: "Meus Cursos", href: "/meus-cursos", icon: GraduationCap },
      { label: "Mentorias", href: "/mentorias", icon: Users },
      { label: "Certificados", href: "/certificados", icon: Award },
    ],
  },
  {
    label: "Conta",
    items: [
      { label: "Perfil", href: "/perfil", icon: User },
      { label: "Ajuda", href: "/ajuda", icon: HelpCircle },
    ],
  },
];