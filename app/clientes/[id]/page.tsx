"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ClientePage() {
  const { id } = useParams();
  const router = useRouter();

  const [cliente, setCliente] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [criandoApolice, setCriandoApolice] = useState(false);

  // CAMPOS DA NOVA APÓLICE
  const [nova, setNova] = useState({
    numero: "",
    tipo: "",
    seguradora: "",
    premio: "",
    inicioVigencia: "",
    fimVigencia: "",
  });

  const seguradoras = ["Pan American", "National", "Prudential", "John Hancock"];

  // CARREGAR CLIENTE
  useEffect(() => {
    const carregar = async () => {
      const ref = doc(db, "clientes", id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        router.replace("/clientes");
        return;
      }

      setCliente({ id, ...snap.data() });
    };

    carregar();
  }, [id, router]);

  // SALVAR CLIENTE
  const salvar = async () => {
    await updateDoc(doc(db, "clientes", id as string), cliente);
    alert("Cliente salvo!");
    setEditando(false);
  };

  // EXCLUIR CLIENTE
  const excluir = async () => {
    if (!confirm("Confirmar exclusão do cliente?")) return;

    await deleteDoc(doc(db, "clientes", id as string));
    alert("Cliente excluído!");
    router.push("/clientes");
  };

  // BOTÃO WHATSAPP
  const abrirWhatsApp = () => {
    const numero = cliente.telefone.replace(/\D/g, "");
    if (!numero) return alert("Cliente sem telefone válido!");

    window.open(`https://wa.me/1${numero}`, "_blank");
  };

  // CRIAR APÓLICE
  const criarApolice = async () => {
    if (
      !nova.numero ||
      !nova.tipo ||
      !nova.seguradora ||
      !nova.inicioVigencia ||
      !nova.fimVigencia
    ) {
      return alert("Preencha todos os campos obrigatórios.");
    }

    const ref = await addDoc(collection(db, "todasApolices"), {
      numero: nova.numero,
      tipo: nova.tipo,
      seguradora: nova.seguradora,
      premio: nova.premio || "",
      inicioVigencia: new Date(`${nova.inicioVigencia}T12:00:00`),
      fimVigencia: new Date(`${nova.fimVigencia}T12:00:00`),

      clienteId: cliente.id,
      clienteNome: cliente.nome,
      clienteTelefone: cliente.telefone,
      criadoEm: serverTimestamp(),
    });

    alert("Apólice criada com sucesso!");
    router.push(`/apolices/${ref.id}`);
  };

  if (!cliente) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Cliente</h1>

      <div className="bg-white border rounded shadow p-6 space-y-4 max-w-xl">

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={cliente.nome}
            onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium">Telefone</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={cliente.telefone}
            onChange={(e) =>
              setCliente({ ...cliente, telefone: e.target.value })
            }
          />

          {/* BOTÃO WHATSAPP (quadrado verde / ícone branco) */}
          <button
            onClick={abrirWhatsApp}
            className="mt-2 flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#FFF"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path d="M20.52 3.48A11.86 11.86 0 0 0 12 .02 11.94 11.94 0 0 0 .05 12.02 11.86 11.86 0 0 0 3.5 20.5L2 24l3.62-1.46a12 12 0 0 0 6.4 1.77h.01c6.62 0 12-5.38 12-12a11.9 11.9 0 0 0-3.51-8.83zM12 22a10 10 0 0 1-5.11-1.4l-.37-.22-2.15.87.82-2.23-.24-.36A10 10 0 1 1 12 22z" />
            </svg>
            WhatsApp
          </button>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="border rounded px-3 py-2 w-full"
            disabled={!editando}
            value={cliente.email || ""}
            onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
          />
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
            onClick={() => router.push("/clientes")}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Voltar
          </button>

          <button
            onClick={excluir}
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded"
          >
            Excluir
          </button>
        </div>

        {/* NOVA APÓLICE */}
        <div className="border-t pt-6">
          <button
            onClick={() => setCriandoApolice(!criandoApolice)}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            + Criar Apólice
          </button>

          {criandoApolice && (
            <div className="mt-4 space-y-3">
              
              <input
                className="border px-3 py-2 rounded w-full"
                placeholder="Número"
                value={nova.numero}
                onChange={(e) => setNova({ ...nova, numero: e.target.value })}
              />

              <input
                className="border px-3 py-2 rounded w-full"
                placeholder="Tipo"
                value={nova.tipo}
                onChange={(e) => setNova({ ...nova, tipo: e.target.value })}
              />

              <input
                list="listaSeguradoras"
                className="border px-3 py-2 rounded w-full"
                placeholder="Seguradora"
                value={nova.seguradora}
                onChange={(e) =>
                  setNova({ ...nova, seguradora: e.target.value })
                }
              />
              <datalist id="listaSeguradoras">
                {seguradoras.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>

              <input
                className="border px-3 py-2 rounded w-full"
                placeholder="Prêmio"
                value={nova.premio}
                onChange={(e) => setNova({ ...nova, premio: e.target.value })}
              />

              <label className="text-sm">Início Vigência</label>
              <input
                type="date"
                className="border px-3 py-2 rounded w-full"
                value={nova.inicioVigencia}
                onChange={(e) =>
                  setNova({ ...nova, inicioVigencia: e.target.value })
                }
              />

              <label className="text-sm">Fim Vigência</label>
              <input
                type="date"
                className="border px-3 py-2 rounded w-full"
                value={nova.fimVigencia}
                onChange={(e) =>
                  setNova({ ...nova, fimVigencia: e.target.value })
                }
              />

              <button
                onClick={criarApolice}
                className="w-full px-4 py-2 bg-green-600 text-white rounded"
              >
                Criar Apólice
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
