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
} from "firebase/firestore";

export default function ClientePage() {
  const { id } = useParams();
  const router = useRouter();

  const [cliente, setCliente] = useState<any>(null);
  const [editando, setEditando] = useState(false);

  // Dados do formulário de nova apólice
  const [novaApolice, setNovaApolice] = useState({
    numero: "",
    tipo: "",
    seguradora: "",
    premio: "",
    inicioVigencia: "",
    fimVigencia: "",
  });

  const seguradoras = [
    "Pan American",
    "National",
    "Prudential",
    "John Hancock",
  ];

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

  const salvar = async () => {
    await updateDoc(doc(db, "clientes", id as string), cliente);
    alert("Cliente salvo!");
    setEditando(false);
  };

  const excluir = async () => {
    if (!confirm("Confirmar exclusão do cliente?")) return;

    await deleteDoc(doc(db, "clientes", id as string));
    alert("Cliente excluído!");
    router.push("/clientes");
  };

  const abrirWhatsApp = () => {
    if (!cliente.telefone) return alert("Cliente sem telefone cadastrado!");

    const numero = cliente.telefone.replace(/\D/g, "");
    if (!numero) return;

    window.open(`https://wa.me/1${numero}`, "_blank");
  };

  const criarApolice = async () => {
    if (
      !novaApolice.numero ||
      !novaApolice.inicioVigencia ||
      !novaApolice.fimVigencia
    ) {
      return alert("Preencha pelo menos número e vigência!");
    }

    const apoliceObj = {
      ...novaApolice,
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      clienteTelefone: cliente.telefone,
      inicioVigencia: new Date(novaApolice.inicioVigencia),
      fimVigencia: new Date(novaApolice.fimVigencia),
    };

    // 1 — Salva na coleção geral
    const refNova = await addDoc(collection(db, "todasApolices"), apoliceObj);

    // 2 — Salva dentro do cliente
    await addDoc(
      collection(db, `clientes/${cliente.id}/apolices`),
      apoliceObj
    );

    alert("Apólice criada com sucesso!");

    // Redireciona para a apólice criada
    router.push(`/apolices/${refNova.id}`);
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
            onChange={(e) =>
              setCliente({ ...cliente, nome: e.target.value })
            }
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

          {/* Botão WhatsApp */}
          <button
            onClick={abrirWhatsApp}
            className="mt-2 inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded shadow"
          >
            <img
              src="/icons/whatsapp-white.svg"
              alt="WhatsApp"
              className="w-5 h-5"
            />
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
            onChange={(e) =>
              setCliente({ ...cliente, email: e.target.value })
            }
          />
        </div>

        {/* Botões */}
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
      </div>

      {/* NOVA APÓLICE */}
      <div className="bg-white border rounded shadow p-6 space-y-4 max-w-xl mt-10">
        <h2 className="text-xl font-bold">+ Nova Apólice</h2>

        <div>
          <label className="block text-sm">Número</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={novaApolice.numero}
            onChange={(e) =>
              setNovaApolice({ ...novaApolice, numero: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm">Tipo</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={novaApolice.tipo}
            onChange={(e) =>
              setNovaApolice({ ...novaApolice, tipo: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm">Seguradora</label>
          <input
            list="listaSeguradoras"
            className="border rounded px-3 py-2 w-full"
            value={novaApolice.seguradora}
            onChange={(e) =>
              setNovaApolice({
                ...novaApolice,
                seguradora: e.target.value,
              })
            }
          />
          <datalist id="listaSeguradoras">
            {seguradoras.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm">Prêmio</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={novaApolice.premio}
            onChange={(e) =>
              setNovaApolice({ ...novaApolice, premio: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm">Início Vigência</label>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={novaApolice.inicioVigencia}
            onChange={(e) =>
              setNovaApolice({
                ...novaApolice,
                inicioVigencia: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm">Fim Vigência</label>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={novaApolice.fimVigencia}
            onChange={(e) =>
              setNovaApolice({
                ...novaApolice,
                fimVigencia: e.target.value,
              })
            }
          />
        </div>

        <button
          onClick={criarApolice}
          className="w-full px-4 py-2 bg-black text-white rounded mt-3"
        >
          Criar Apólice
        </button>
      </div>
    </Layout>
  );
}
