"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/app/(auth)/actions";

interface AdminUserMenuProps {
  name: string;
  email: string;
  avatar: string | null;
  initials: string;
}

export function AdminUserMenu({ name, email, avatar, initials }: AdminUserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 border-t border-slate-200 px-5 py-4 text-left transition hover:bg-slate-50">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt={name}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-900">{name}</p>
            <p className="truncate text-[10px] text-slate-500">{email}</p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-56 mb-1 ml-2">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-slate-500">Administrador</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/perfil" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Meu perfil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <form action={logoutAction}>
          <button type="submit" className="w-full">
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}