"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
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

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

// Tipos
type Lead = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  seguradora?: string;
  origem?: string;
  agente?: string;
  status: Status;
  ordem: number;
};

type Status = "novo" | "contato" | "proposta" | "fechado";

const COLUNAS: Record<Status, string> = {
  novo: "Novo",
  contato: "Em Contato",
  proposta: "Proposta Enviada",
  fechado: "Fechado",
};

const COR_FUNDO_COLUNA: Record<Status, string> = {
  novo: "bg-blue-50",
  contato: "bg-yellow-50",
  proposta: "bg-purple-50",
  fechado: "bg-green-50",
};

const COR_BORDA_COLUNA: Record<Status, string> = {
  novo: "border-blue-300",
  contato: "border-yellow-300",
  proposta: "border-purple-300",
  fechado: "border-green-300",
};

const COR_CARD: Record<Status, string> = {
  novo: "border-blue-400",
  contato: "border-yellow-400",
  proposta: "border-purple-400",
  fechado: "border-green-400",
};

export default function LeadsKanban() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("ordem", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      setLeads(
        snap.docs.map((d) => {
          const data = d.data() as Lead;
          return { ...data, id: d.id };
        })
      );
    });

    return unsub;
  }, []);

  const leadsFiltrados = leads.filter((l) => {
    const termo = busca.toLowerCase();
    return (
      l.nome?.toLowerCase().includes(termo) ||
      l.telefone?.includes(termo) ||
      l.email?.toLowerCase().includes(termo)
    );
  });

  const colunas: Record<Status, Lead[]> = {
    novo: leadsFiltrados.filter((l) => l.status === "novo"),
    contato: leadsFiltrados.filter((l) => l.status === "contato"),
    proposta: leadsFiltrados.filter((l) => l.status === "proposta"),
    fechado: leadsFiltrados.filter((l) => l.status === "fechado"),
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const statusOrigem = source.droppableId as Status;
    const statusDestino = destination.droppableId as Status;

    // MUDOU DE COLUNA
    if (statusOrigem !== statusDestino) {
      const novaOrdem = colunas[statusDestino].length;

      await updateDoc(doc(db, "leads", draggableId), {
        status: statusDestino,
        ordem: novaOrdem,
      });

      return;
    }

    // REORDENAR NA MESMA
    const novaLista = [...colunas[statusOrigem]];
    const [removido] = novaLista.splice(source.index, 1);
    novaLista.splice(destination.index, 0, removido);

    novaLista.forEach(async (lead, index) => {
      await updateDoc(doc(db, "leads", lead.id), { ordem: index });
    });
  };

  const criarLead = async (status: Status) => {
    await addDoc(collection(db, "leads"), {
      nome: "Novo Lead",
      telefone: "",
      email: "",
      seguradora: "",
      origem: "",
      agente: "",
      status,
      ordem: colunas[status].length,
      criadoEm: serverTimestamp(),
    });
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Leads — Pipeline</h1>

      <input
        type="text"
        placeholder="Buscar lead..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="mb-6 w-full border p-3 rounded shadow"
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(COLUNAS).map((col) => {
            const coluna = col as Status;

            return (
              <Droppable droppableId={coluna} key={coluna}>
                {(provided) => (
                  <div
                    className={`
                      ${COR_FUNDO_COLUNA[coluna]}
                      ${COR_BORDA_COLUNA[coluna]}
                      border-2 rounded-lg p-3 min-h-[650px] shadow
                    `}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-gray-800">
                        {COLUNAS[coluna]} ({colunas[coluna].length})
                      </h2>

                      <button
                        onClick={() => criarLead(coluna)}
                        className="bg-black text-white px-2 py-1 rounded text-sm"
                      >
                        + Novo
                      </button>
                    </div>

                    {colunas[coluna].map((lead, index) => (
                      <Draggable
                        draggableId={lead.id}
                        index={index}
                        key={lead.id}
                      >
                        {(prov) => (
                          <Link href={`/leads/${lead.id}`}>
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`
                                bg-white border 
                                ${COR_CARD[coluna]}
                                shadow p-4 rounded mb-3 cursor-pointer
                                hover:bg-gray-50 transition
                              `}
                            >
                              <p className="font-bold text-sm">{lead.nome}</p>

                              <p className="text-xs text-gray-600 mb-2">
                                {lead.telefone || "Sem telefone"}
                              </p>

                              <div className="text-xs text-gray-700 space-y-1">
                                <p>
                                  <strong>Seguradora:</strong>{" "}
                                  {lead.seguradora || "—"}
                                </p>
                                <p>
                                  <strong>Origem:</strong>{" "}
                                  {lead.origem || "—"}
                                </p>
                                <p>
                                  <strong>Agente:</strong>{" "}
                                  {lead.agente || "—"}
                                </p>
                              </div>
                            </div>
                          </Link>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </Layout>
  );
}
