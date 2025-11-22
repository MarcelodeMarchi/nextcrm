"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";

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
    <div className="flex h-screen bg-gray-900 text-white">

      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col border-r border-gray-800">

        {/* LOGO E TÍTULO */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="bg-white rounded-lg p-2">
            <Image
              src="/logo-next.png"
              alt="Next Financial Consulting"
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-lg font-bold">Next CRM</div>
            <div className="text-[11px] text-gray-300 uppercase tracking-wide">
              Consultoria & Seguros de Vida
            </div>
          </div>
        </div>

        {/* MENU */}
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

        {/* BOTÃO SAIR */}
        <button
          onClick={handleLogout}
          className="m-4 mt-auto px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600"
        >
          Sair
        </button>

      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
