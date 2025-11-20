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

const CORES_COLUNA: Record<Status, string> = {
  novo: "bg-blue-50",
  contato: "bg-yellow-50",
  proposta: "bg-purple-50",
  fechado: "bg-green-50",
};

const CORES_CARD: Record<Status, string> = {
  novo: "border-blue-300",
  contato: "border-yellow-300",
  proposta: "border-purple-300",
  fechado: "border-green-300",
};

export default function LeadsKanban() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("ordem", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      setLeads(
        snap.docs.map((d) => ({ ...d.data(), id: d.id })) as Lead[]
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

    const origem = source.droppableId as Status;
    const destino = destination.droppableId as Status;

    // Mudou de coluna
    if (origem !== destino) {
      await updateDoc(doc(db, "leads", draggableId), {
        status: destino,
        ordem: colunas[destino].length,
      });
      return;
    }

    // Reordenar dentro da mesma coluna
    const novaLista = [...colunas[origem]];
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

  const enviarWhatsApp = (telefone: string) => {
    if (!telefone) return;
    const numero = telefone.replace(/\D/g, "");
    window.open(`https://wa.me/1${numero}`, "_blank");
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
                    className={`${CORES_COLUNA[coluna]} rounded-lg p-4 min-h-[600px] border shadow`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold">
                        {COLUNAS[coluna]} ({colunas[coluna].length})
                      </h2>

                      <button
                        onClick={() => criarLead(coluna)}
                        className="bg-black text-white px-3 py-1 rounded text-sm"
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
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`bg-white border ${CORES_CARD[coluna]} shadow p-3 rounded mb-3 cursor-pointer`}
                          >
                            <Link href={`/leads/${lead.id}`}>
                              <p className="font-bold">{lead.nome}</p>
                            </Link>

                            <p className="text-xs text-gray-600 mt-1">
                              {lead.telefone || "Sem telefone"}
                            </p>

                            <button
                              onClick={() => enviarWhatsApp(lead.telefone)}
                              className="text-green-600 font-semibold text-xs mt-1 underline"
                            >
                              WhatsApp
                            </button>

                            <div className="text-xs text-gray-700 mt-2">
                              <p><strong>Seguradora:</strong> {lead.seguradora || "—"}</p>
                              <p><strong>Origem:</strong> {lead.origem || "—"}</p>
                              <p><strong>Agente:</strong> {lead.agente || "—"}</p>
                            </div>
                          </div>
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
