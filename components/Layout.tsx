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
    <div className="min-h-screen flex bg-gray-100">

      {/* MENU LATERAL */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">

        {/* LOGO */}
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <Image
            src="/logo-next.png"
            alt="Next Financial Consulting"
            width={50}
            height={50}
            className="rounded"
            priority
          />

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
                    : "text-gray-300 hover:bg-gray-800"
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
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
