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

import * as XLSX from "xlsx";

// PDF EXPORT
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [busca, setBusca] = useState("");
  const [colunaMobileAberta, setColunaMobileAberta] =
    useState<Status | null>(null);

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
    const t = busca.toLowerCase();
    return (
      l.nome?.toLowerCase().includes(t) ||
      l.telefone?.includes(t) ||
      l.email?.toLowerCase().includes(t)
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

    if (origem !== destino) {
      await updateDoc(doc(db, "leads", draggableId), {
        status: destino,
        ordem: colunas[destino].length,
      });
      return;
    }

    const novaLista = [...colunas[origem]];
    const [removido] = novaLista.splice(source.index, 1);
    novaLista.splice(destination.index, 0, removido);

    novaLista.forEach(async (lead, index) => {
      await updateDoc(doc(db, "leads", lead.id), { ordem: index });
    });
  };

  const criarLead = async (status: Status) => {
    const ref = await addDoc(collection(db, "leads"), {
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

    window.location.href = `/leads/${ref.id}`;
  };

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  // =========================================
  // 🔥 EXPORTAR PARA EXCEL
  // =========================================
  const exportarExcel = () => {
    const dados = leadsFiltrados.map((l) => ({
      Nome: l.nome,
      Telefone: l.telefone,
      Email: l.email,
      Seguradora: l.seguradora || "-",
      Origem: l.origem || "-",
      Agente: l.agente || "-",
      Status: COLUNAS[l.status],
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Leads");

    XLSX.writeFile(wb, "leads.xlsx");
  };

  // =========================================
  // 🔥 EXPORTAR PARA PDF
  // =========================================
  const exportarPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("Relatório de Leads", 14, 15);

    autoTable(pdf, {
      startY: 25,
      head: [["Nome", "Telefone", "Email", "Seguradora", "Status"]],
      body: leadsFiltrados.map((l) => [
        l.nome,
        l.telefone || "-",
        l.email || "-",
        l.seguradora || "-",
        COLUNAS[l.status],
      ]),
    });

    pdf.save("leads.pdf");
  };

  // =========================================
  // 📱 MOBILE — TELA INICIAL
  // =========================================
  if (isMobile && !colunaMobileAberta) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-4">Leads</h1>

        <input
          type="text"
          placeholder="Buscar lead..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="mb-6 w-full border p-3 rounded shadow"
        />

        {/* BOTÕES EXPORTAÇÃO */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={exportarExcel}
            className="flex-1 bg-green-600 text-white rounded py-2 font-semibold"
          >
            Excel
          </button>
          <button
            onClick={exportarPDF}
            className="flex-1 bg-red-600 text-white rounded py-2 font-semibold"
          >
            PDF
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {Object.keys(COLUNAS).map((c) => {
            const col = c as Status;
            return (
              <button
                key={col}
                onClick={() => setColunaMobileAberta(col)}
                className="w-full py-5 rounded-xl shadow text-white font-bold text-lg"
                style={{
                  background:
                    col === "novo"
                      ? "#2563eb"
                      : col === "contato"
                      ? "#ca8a04"
                      : col === "proposta"
                      ? "#7c3aed"
                      : "#16a34a",
                }}
              >
                {COLUNAS[col]} ({colunas[col].length})
              </button>
            );
          })}
        </div>

        {/* BOTÃO FLUTUANTE */}
        <button
          onClick={() => criarLead("novo")}
          className="fixed bottom-6 right-6 bg-black text-white rounded-full px-5 py-4 shadow-xl text-lg font-bold"
        >
          + Lead
        </button>
      </Layout>
    );
  }

  // =========================================
  // 📱 MOBILE — COLUNA ABERTA
  // =========================================
  if (isMobile && colunaMobileAberta) {
    const col = colunaMobileAberta;

    return (
      <Layout>
        <button
          onClick={() => setColunaMobileAberta(null)}
          className="mb-4 px-4 py-2 bg-gray-200 rounded font-semibold"
        >
          ← Voltar
        </button>

        <div className="flex gap-3 mb-4">
          <button
            onClick={exportarExcel}
            className="flex-1 bg-green-600 text-white rounded py-2 font-semibold"
          >
            Excel
          </button>
          <button
            onClick={exportarPDF}
            className="flex-1 bg-red-600 text-white rounded py-2 font-semibold"
          >
            PDF
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">
          {COLUNAS[col]} ({colunas[col].length})
        </h2>

        <div className="space-y-3">
          {colunas[col].map((lead) => (
            <div
              key={lead.id}
              onClick={() =>
                (window.location.href = `/leads/${lead.id}`)
              }
              className="bg-white border rounded-lg p-4 shadow"
            >
              <p className="font-bold">{lead.nome}</p>
              <p className="text-xs text-gray-600">{lead.telefone}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => criarLead(col)}
          className="fixed bottom-6 right-6 bg-black text-white rounded-full px-5 py-4 shadow-xl text-lg font-bold"
        >
          + Lead
        </button>
      </Layout>
    );
  }

  // =========================================
  // 💻 DESKTOP — Layout original + botões exportação
  // =========================================
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Leads — Pipeline</h1>

      <div className="flex gap-3 mb-4">
        <button
          onClick={exportarExcel}
          className="bg-green-600 text-white rounded px-4 py-2 text-sm font-semibold"
        >
          Exportar Excel
        </button>
        <button
          onClick={exportarPDF}
          className="bg-red-600 text-white rounded px-4 py-2 text-sm font-semibold"
        >
          Exportar PDF
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar lead..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="mb-6 w-full border p3 rounded shadow"
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(COLUNAS).map((c) => {
            const col = c as Status;
            return (
              <Droppable droppableId={col} key={col}>
                {(provided) => (
                  <div
                    className={`${CORES_COLUNA[col]} rounded-lg p-4 min-h-[600px] border shadow`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold">
                        {COLUNAS[col]} ({colunas[col].length})
                      </h2>

                      <button
                        onClick={() => criarLead(col)}
                        className="bg-black text-white px-3 py-1 rounded text-sm"
                      >
                        + Novo
                      </button>
                    </div>

                    {colunas[col].map((lead, index) => (
                      <Draggable
                        key={lead.id}
                        draggableId={lead.id}
                        index={index}
                      >
                        {(prov) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            onClick={() =>
                              (window.location.href = `/leads/${lead.id}`)
                            }
                            className={`bg-white border ${CORES_CARD[col]} shadow p-3 rounded mb-3 cursor-pointer`}
                          >
                            <p className="font-bold">{lead.nome}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {lead.telefone || "Sem telefone"}
                            </p>
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
