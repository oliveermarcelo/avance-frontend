import {
  LayoutDashboard,
  BookOpen,
  Tags,
  Users,
  GraduationCap,
  CreditCard,
  Star,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  label?: string;
  items: AdminNavItem[];
}

export const adminNavSections: AdminNavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Conteudo",
    items: [
      { label: "Cursos", href: "/admin/cursos", icon: BookOpen },
      { label: "Categorias", href: "/admin/categorias", icon: Tags },
    ],
  },
  {
    label: "Pessoas",
    items: [
      { label: "Usuarios", href: "/admin/usuarios", icon: Users },
      { label: "Matriculas", href: "/admin/matriculas", icon: GraduationCap },
    ],
  },
  {
    label: "Comercial",
    items: [
      { label: "Pagamentos", href: "/admin/pagamentos", icon: CreditCard },
      { label: "Avaliacoes", href: "/admin/avaliacoes", icon: Star },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Configuracoes", href: "/admin/configuracoes/pagamento", icon: Settings },
    ],
  },
];