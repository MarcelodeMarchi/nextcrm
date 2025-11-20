"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default function LeadPage() {
  const { id } = useParams();
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);

  const seguradoras = ["Pan American", "National", "Prudential", "John Hancock"];
  const origens = ["Instagram", "Facebook", "WhatsApp", "Indicação", "Google Ads"];
  const agentes = ["Marcelo", "Juliana", "Equipe Next", "Não definido"];

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "leads", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/leads");
        return;
      }

      setLead({ id, ...snap.data() });
    };

    load();
  }, [id, router]);

  const mensagemWhatsApp = () => {
    if (!lead.telefone) return;

    const numero = lead.telefone.replace(/\D/g, "");

    const msg = encodeURIComponent(
      `Olá ${lead.nome}, tudo bem?\n\nAqui é da Next Consultoria.\nVi o seu interesse e estou entrando em contato para te ajudar da melhor forma.`
    );

    window.open(`https://wa.me/1${numero}?text=${msg}`, "_blank");
  };

  const salvar = async () => {
    await updateDoc(doc(db, "leads", id as string), lead);
    alert("Lead salvo!");
  };

  const excluir = async () => {
    if (!confirm("Deseja excluir este lead?")) return;

    await deleteDoc(doc(db, "leads", id as string));
    alert("Lead excluído!");
    router.push("/leads");
  };

  if (!lead) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Lead</h1>

      <div className="bg-white border rounded shadow p-6 space-y-4 max-w-xl">

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={lead.nome}
            onChange={(e) => setLead({ ...lead, nome: e.target.value })}
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium">Telefone</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={lead.telefone}
            onChange={(e) => setLead({ ...lead, telefone: e.target.value })}
          />

          {lead.telefone && (
            <button
              onClick={mensagemWhatsApp}
              className="mt-1 text-green-600 underline text-sm font-semibold"
            >
              Enviar WhatsApp automático
            </button>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={lead.email}
            onChange={(e) => setLead({ ...lead, email: e.target.value })}
          />
        </div>

        {/* Seguradora */}
        <div>
          <label className="block text-sm font-medium">Seguradora</label>
          <input
            list="listaSeg"
            className="border rounded px-3 py-2 w-full"
            value={lead.seguradora || ""}
            onChange={(e) => setLead({ ...lead, seguradora: e.target.value })}
          />
          <datalist id="listaSeg">
            {seguradoras.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        {/* Origem */}
        <div>
          <label className="block text-sm font-medium">Origem</label>
          <input
            list="listaOri"
            className="border rounded px-3 py-2 w-full"
            value={lead.origem || ""}
            onChange={(e) => setLead({ ...lead, origem: e.target.value })}
          />
          <datalist id="listaOri">
            {origens.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </div>

        {/* Agente */}
        <div>
          <label className="block text-sm font-medium">Agente</label>
          <input
            list="listaAgen"
            className="border rounded px-3 py-2 w-full"
            value={lead.agente || ""}
            onChange={(e) => setLead({ ...lead, agente: e.target.value })}
          />
          <datalist id="listaAgen">
            {agentes.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>

        {/* Botões */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={salvar}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Salvar
          </button>

          <button
            onClick={() => router.push("/leads")}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Voltar
          </button>

          <button
            onClick={excluir}
            className="px-4 py-2 bg-red-600 text-white rounded ml-auto"
          >
            Excluir
          </button>
        </div>
      </div>
    </Layout>
  );
}
