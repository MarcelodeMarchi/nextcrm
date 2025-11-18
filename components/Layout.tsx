"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type LayoutProps = {
  children: ReactNode;
};

const menuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/clientes", label: "Clientes" },
  { href: "/tarefas", label: "Tarefas" },
  { href: "/apolices", label: "Apólices" },
  { href: "/configuracao", label: "Configurações" },
];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col">
        <div className="px-6 py-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Next CRM</h1>
          <p className="text-xs text-gray-400">
            Consultoria & Seguros de Vida
          </p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  active
                    ? "bg-gray-100 text-black"
                    : "text-gray-200 hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 mt-auto px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600"
        >
          Sair
        </button>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
