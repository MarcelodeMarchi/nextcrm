"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function LeadDetalhes() {
  const { id } = useParams();
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "leads", id as string);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        router.push("/leads");
        return;
      }
      setLead({ id, ...snap.data() });
    };

    load();
  }, [id, router]);

  if (!lead)
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">{lead.nome}</h1>

      <div className="bg-white shadow rounded-lg p-6 border max-w-xl space-y-4">

        <p><strong>Telefone:</strong> {lead.telefone || "—"}</p>
        <p><strong>Email:</strong> {lead.email || "—"}</p>
        <p><strong>Seguradora:</strong> {lead.seguradora || "—"}</p>
        <p><strong>Origem:</strong> {lead.origem || "—"}</p>
        <p><strong>Agente:</strong> {lead.agente || "—"}</p>

        {/* BOTÃO WHATSAPP */}
        <div>
          <WhatsAppButton
            phone={lead.telefone}
            message={`Olá ${lead.nome}, tudo bem?`}
          />
        </div>

        <button
          onClick={() => router.push(`/leads/${id}/editar`)}
          className="bg-black text-white px-4 py-2 rounded-md mt-4"
        >
          Editar
        </button>
      </div>
    </Layout>
  );
}
