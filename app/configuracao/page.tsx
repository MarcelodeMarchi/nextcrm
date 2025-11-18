"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut, sendPasswordResetEmail } from "firebase/auth";

export default function ConfiguracaoPage() {
  const [user, setUser] = useState<any>(null);
  const [tema, setTema] = useState("claro");
  const [moeda, setMoeda] = useState("USD");
  const [idioma, setIdioma] = useState("pt");

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  const resetSenha = async () => {
    if (!user?.email) return alert("Usuário inválido.");
    await sendPasswordResetEmail(auth, user.email);
    alert("E-mail enviado para redefinição de senha!");
  };

  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">Configurações</h1>

      {/* DADOS DO USUÁRIO */}
      <section className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Dados do Usuário</h2>

        <p><strong>Nome:</strong> {user?.displayName || "Sem nome"}</p>
        <p><strong>E-mail:</strong> {user?.email}</p>
        <p><strong>UID:</strong> {user?.uid}</p>

        <div className="flex gap-4 mt-4">
          <button
            onClick={resetSenha}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Alterar senha
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Sair
          </button>
        </div>
      </section>

      {/* PREFERÊNCIAS */}
      <section className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Preferências</h2>

        <div className="space-y-4">

          <div>
            <label className="font-semibold">Tema</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            >
              <option value="claro">Claro</option>
              <option value="escuro">Escuro</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Moeda padrão</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={moeda}
              onChange={(e) => setMoeda(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Idioma</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
            >
              <option value="pt">Português (Brasil)</option>
              <option value="en">Inglês (EUA)</option>
            </select>
          </div>

        </div>
      </section>

      {/* BRANDING */}
      <section className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Branding da Empresa</h2>
        <p className="text-gray-600">Em breve: trocar logo, nome, slogan, cores do CRM.</p>
      </section>

      {/* NOTIFICAÇÕES */}
      <section className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Notificações</h2>
        <p className="text-gray-600">Em breve: alertas de renovação, follow-up e vencimentos.</p>
      </section>

      {/* INTEGRAÇÕES */}
      <section className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Integrações</h2>
        <p className="text-gray-600">Em breve: WhatsApp API, Google Calendar, Zapier, etc.</p>
      </section>

      {/* SEGURANÇA */}
      <section className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Segurança</h2>
        <p className="text-gray-600">Funções avançadas serão adicionadas aqui.</p>
      </section>
    </div>
  );
}
