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
  const [editando, setEditando] = useState(false);

  // LISTAS DAS OPÇÕES
  const seguradoras = ["Pan American", "National", "Prudential", "John Hancock"];
  const origens = ["Instagram", "Facebook", "WhatsApp", "Indicação", "Google Ads"];
  const agentes = ["Marcelo", "Juliana", "Equipe Next", "Não definido"];

  useEffect(() => {
    const carregar = async () => {
      const ref = doc(db, "leads", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/leads");
        return;
      }

      setLead({ id, ...snap.data() });
    };

    carregar();
  }, [id, router]);

  const salvar = async () => {
    await updateDoc(doc(db, "leads", id as string), lead);
    alert("Lead salvo com sucesso!");
    setEditando(false);
  };

  const excluir = async () => {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;

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
            disabled={!editando}
            value={lead.nome}
            onChange={(e) => setLead({ ...lead, nome: e.target.value })}
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium">Telefone</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={lead.telefone}
            onChange={(e) => setLead({ ...lead, telefone: e.target.value })}
          />

          <button
            onClick={() => {
              const numero = lead.telefone.replace(/\D/g, "");
              window.open(`https://wa.me/1${numero}`, "_blank");
            }}
            className="mt-1 text-green-600 underline text-sm"
          >
            Abrir WhatsApp
          </button>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={lead.email}
            onChange={(e) => setLead({ ...lead, email: e.target.value })}
          />
        </div>

        {/* Seguradora (com filtro) */}
        <div>
          <label className="block text-sm font-medium">Seguradora</label>
          <input
            list="listaSeguradoras"
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={lead.seguradora || ""}
            onChange={(e) => setLead({ ...lead, seguradora: e.target.value })}
          />
          <datalist id="listaSeguradoras">
            {seguradoras.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        {/* Origem (com filtro) */}
        <div>
          <label className="block text-sm font-medium">Origem</label>
          <input
            list="listaOrigens"
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={lead.origem || ""}
            onChange={(e) => setLead({ ...lead, origem: e.target.value })}
          />
          <datalist id="listaOrigens">
            {origens.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </div>

        {/* Agente (com filtro) */}
        <div>
          <label className="block text-sm font-medium">Agente</label>
          <input
            list="listaAgentes"
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={lead.agente || ""}
            onChange={(e) => setLead({ ...lead, agente: e.target.value })}
          />
          <datalist id="listaAgentes">
            {agentes.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 mt-4">

          {!editando ? (
            <button
              onClick={() => setEditando(true)}
              className="px-4 py-2 bg-black text-white rounded"
            >
              Editar
            </button>
          ) : (
            <button
              onClick={salvar}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Salvar
            </button>
          )}

          <button
            onClick={() => router.push("/leads")}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Voltar
          </button>

          {/* Botão excluir */}
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
