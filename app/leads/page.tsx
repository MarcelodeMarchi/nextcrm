"use client";

import { useEffect, useState } from "react";
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
  status: string;
  ordem: number;
};

const COLUNAS: Record<string, string> = {
  novo: "Novo",
  contato: "Em Contato",
  proposta: "Proposta Enviada",
  fechado: "Fechado",
};

// Cores suaves para as colunas
const CORES_COLUNA: Record<string, string> = {
  novo: "bg-blue-50",
  contato: "bg-yellow-50",
  proposta: "bg-purple-50",
  fechado: "bg-green-50",
};

// Cores da borda do card
const CORES_CARD: Record<string, string> = {
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
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Lead),
        }))
      );
    });

    return unsub;
  }, []);

  // 🔍 Busca
  const leadsFiltrados = leads.filter((l) => {
    const termo = busca.toLowerCase();
    return (
      l.nome?.toLowerCase().includes(termo) ||
      l.telefone?.includes(termo) ||
      l.email?.toLowerCase().includes(termo)
    );
  });

  // Organizar por status
  const colunas = {
    novo: leadsFiltrados.filter((l) => l.status === "novo"),
    contato: leadsFiltrados.filter((l) => l.status === "contato"),
    proposta: leadsFiltrados.filter((l) => l.status === "proposta"),
    fechado: leadsFiltrados.filter((l) => l.status === "fechado"),
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const statusOrigem = source.droppableId;
    const statusDestino = destination.droppableId;

    // Mudou de coluna
    if (statusOrigem !== statusDestino) {
      const novaOrdem = colunas[statusDestino].length;

      await updateDoc(doc(db, "leads", draggableId), {
        status: statusDestino,
        ordem: novaOrdem,
      });

      return;
    }

    // Reordenar dentro da mesma coluna
    const novaLista = Array.from(colunas[statusOrigem]);
    const [removido] = novaLista.splice(source.index, 1);
    novaLista.splice(destination.index, 0, removido);

    novaLista.forEach(async (lead, index) => {
      await updateDoc(doc(db, "leads", lead.id), {
        ordem: index,
      });
    });
  };

  // Criar lead direto na coluna
  const criarLead = async (status: string) => {
    const docRef = await addDoc(collection(db, "leads"), {
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

    console.log("Lead criado:", docRef.id);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Leads — Pipeline</h1>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar lead por nome, telefone ou e-mail..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="mb-6 w-full border p-3 rounded shadow"
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(COLUNAS).map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  className={`${CORES_COLUNA[col]} rounded-lg p-3 min-h-[600px]`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {/* Título */}
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-gray-800">
                      {COLUNAS[col]} ({colunas[col].length})
                    </h2>

                    <button
                      onClick={() => criarLead(col)}
                      className="bg-black text-white px-2 py-1 rounded text-sm"
                    >
                      + Novo
                    </button>
                  </div>

                  {/* Cards */}
                  {colunas[col].map((lead, index) => (
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
                          className={`bg-white border ${CORES_CARD[col]} shadow p-3 rounded mb-3 cursor-pointer`}
                        >
                          {/* Nome */}
                          <p className="font-bold text-gray-900 text-sm">
                            {lead.nome}
                          </p>

                          {/* Telefone */}
                          <p className="text-xs text-gray-600 mb-2">
                            {lead.telefone || "Sem telefone"}
                          </p>

                          <div className="text-xs text-gray-700 space-y-1">

                            <p>
                              <span className="font-semibold">Seguradora:</span>{" "}
                              {lead.seguradora || "—"}
                            </p>

                            <p>
                              <span className="font-semibold">Origem:</span>{" "}
                              {lead.origem || "—"}
                            </p>

                            <p>
                              <span className="font-semibold">Agente:</span>{" "}
                              {lead.agente || "—"}
                            </p>

                          </div>
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
