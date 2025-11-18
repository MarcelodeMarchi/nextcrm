"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";

type ProtectedProps = {
  children: ReactNode;
};

export default function Protected({ children }: ProtectedProps) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Se não está carregando e não tem usuário, manda para login
    if (user === null && pathname !== "/login") {
      router.replace("/login");
    }
    // Se está logado e está no /login, manda para dashboard
    if (user && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [user, pathname, router]);

  if (user === undefined) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  // Em /login deixamos passar mesmo sem usuário
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
