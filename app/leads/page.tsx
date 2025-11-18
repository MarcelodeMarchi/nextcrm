"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// ========================================
// 🔥 DYNAMIC IMPORTS (ONLY CLIENT)
// ========================================
const DragDropContext = dynamic(
  () => import("@hello-pangea/dnd").then((mod) => mod.DragDropContext),
  { ssr: false }
);

const Droppable = dynamic(
  () => import("@hello-pangea/dnd").then((mod) => mod.Droppable),
  { ssr: false }
);

const Draggable = dynamic(
  () => import("@hello-pangea/dnd").then((mod) => mod.Draggable),
  { ssr: false }
);

// ========================================
// 📌 COLUNAS
// ========================================
const COLUNAS = {
  novo: "Novo",
  contato: "Em Contato",
  proposta: "Proposta",
  fechado: "Fechado",
};

type StatusKey = keyof typeof COLUNAS;

const CORES_COLUNA = {
  novo: "bg-blue-100",
  contato: "bg-yellow-100",
  proposta: "bg-purple-100",
  fechado: "bg-green-100",
};

const CORES_CARD = {
  novo: "border-blue-300",
  contato: "border-yellow-300",
  proposta: "border-purple-300",
  fechado: "border-green-300",
};

export default function LeadsKanban() {
  const [leads, setLeads] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  // filtros
  const [filtroSeguradora, setFiltroSeguradora] = useState("");
  const [filtroOrigem, setFiltroOrigem] = useState("");
  const [filtroAgente, setFiltroAgente] = useState("");

  // ========================================
  // 🔄 Firestore Realtime
  // ========================================
  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("ordem", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      setLeads(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return unsub;
  }, []);

  // ========================================
  // 🔍 filtros
  // ========================================
  const leadsFiltrados = leads.filter((l) => {
    const termo = busca.toLowerCase();
    return (
      (l.nome?.toLowerCase().includes(termo) ||
        l.telefone?.includes(termo) ||
        l.email?.toLowerCase().includes(termo)) &&
      (!filtroSeguradora || l.seguradora === filtroSeguradora) &&
      (!filtroOrigem || l.origem === filtroOrigem) &&
      (!filtroAgente || l.agente === filtroAgente)
    );
  });

  // ========================================
  // 📂 AGRUPAR POR STATUS
  // ========================================
  const colunas: Record<StatusKey, any[]> = {
    novo: leadsFiltrados.filter((l) => l.status === "novo"),
    contato: leadsFiltrados.filter((l) => l.status === "contato"),
    proposta: leadsFiltrados.filter((l) => l.status === "proposta"),
    fechado: leadsFiltrados.filter((l) => l.status === "fechado"),
  };

  // ========================================
  // 🔁 DRAG & DROP
  // ========================================
  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    const statusOrigem = source.droppableId as StatusKey;
    const statusDestino = destination.droppableId as StatusKey;

    // 🔄 mudou de coluna
    if (statusOrigem !== statusDestino) {
      const novaOrdem = colunas[statusDestino].length;

      await updateDoc(doc(db, "leads", draggableId), {
        status: statusDestino,
        ordem: novaOrdem,
      });

      return;
    }

    // 🔁 reorder dentro da mesma coluna
    const novaLista = [...colunas[statusOrigem]];
    const [removido] = novaLista.splice(source.index, 1);
    novaLista.splice(destination.index, 0, removido);

    novaLista.forEach(async (lead, index) => {
      await updateDoc(doc(db, "leads", lead.id), { ordem: index });
    });
  };

  // ========================================
  // ➕ Criar lead na coluna
  // ========================================
  const criarLead = async (status: StatusKey) => {
    await addDoc(collection(db, "leads"), {
      nome: "Novo Lead",
      telefone: "",
      email: "",
      status,
      seguradora: "",
      origem: "",
      agente: "",
      ordem: colunas[status].length,
      criadoEm: serverTimestamp(),
    });
  };

  // ========================================
  // UI
  // ========================================
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Leads — Pipeline Kanban</h1>

      {/* busca */}
      <input
        type="text"
        placeholder="Buscar lead por nome, telefone..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="mb-4 w-full border p-3 rounded shadow"
      />

      {/* filtros */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <select
          className="border p-2 rounded"
          value={filtroSeguradora}
          onChange={(e) => setFiltroSeguradora(e.target.value)}
        >
          <option value="">Todas as seguradoras</option>
          <option value="Prudential">Prudential</option>
          <option value="Metlife">Metlife</option>
          <option value="AIG">AIG</option>
        </select>

        <select
          className="border p-2 rounded"
          value={filtroOrigem}
          onChange={(e) => setFiltroOrigem(e.target.value)}
        >
          <option value="">Todas as origens</option>
          <option value="Instagram">Instagram</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Indicação">Indicação</option>
        </select>

        <select
          className="border p-2 rounded"
          value={filtroAgente}
          onChange={(e) => setFiltroAgente(e.target.value)}
        >
          <option value="">Todos os agentes</option>
          <option value="Marcelo">Marcelo</option>
          <option value="Juliana">Juliana</option>
        </select>
      </div>

      {/* KANBAN */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {(Object.keys(COLUNAS) as StatusKey[]).map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided: any) => (
                <div
                  className={`${CORES_COLUNA[col]} rounded-lg p-3 min-h-[500px]`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {/* título + botão */}
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">
                      {COLUNAS[col]} ({colunas[col].length})
                    </h2>

                    <button
                      onClick={() => criarLead(col)}
                      className="bg-black text-white px-2 py-1 rounded"
                    >
                      ➕
                    </button>
                  </div>

                  {/* cards */}
                  {colunas[col].map((lead, index) => (
                    <Draggable
                      draggableId={lead.id}
                      index={index}
                      key={lead.id}
                    >
                      {(prov: any) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`bg-white border ${CORES_CARD[col]} shadow p-3 rounded mb-3 cursor-pointer`}
                        >
                          <p className="font-bold">{lead.nome}</p>
                          <p className="text-sm text-gray-600">{lead.telefone}</p>
                          <span className="text-xs text-gray-500">
                            {lead.seguradora || "Sem seguradora"}
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </Layout>
  );
}
