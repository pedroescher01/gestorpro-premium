'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin, Edit, Trash2 } from 'lucide-react';
import { getClientes, addCliente, deleteCliente } from '@/lib/storage';
import { Cliente } from '@/lib/types';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = () => {
    const clientesCarregados = getClientes();
    setClientes(clientesCarregados);
  };

  const handleAddCliente = () => {
    if (!novoCliente.nome || !novoCliente.email) {
      alert('Nome e email são obrigatórios');
      return;
    }

    const cliente: Cliente = {
      id: Date.now().toString(),
      nome: novoCliente.nome,
      email: novoCliente.email,
      telefone: novoCliente.telefone,
      endereco: novoCliente.endereco,
      dataCadastro: new Date().toISOString(),
    };

    addCliente(cliente);
    carregarClientes();
    setShowModal(false);
    setNovoCliente({ nome: '', email: '', telefone: '', endereco: '' });
  };

  const handleDeleteCliente = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteCliente(id);
      carregarClientes();
    }
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-inter font-bold text-white mb-2">
            Clientes
          </h1>
          <p className="text-gray-400 font-inter">
            Gerencie seus clientes cadastrados
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#00E5FF] text-black px-6 py-3 rounded-lg font-inter font-semibold hover:bg-[#00E5FF]/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar clientes por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg pl-12 pr-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
        />
      </div>

      {/* Clientes Grid */}
      {clientesFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-inter font-bold text-white mb-2">
            Nenhum cliente cadastrado
          </h3>
          <p className="text-gray-400 font-inter mb-6">
            Comece adicionando seu primeiro cliente
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#00E5FF] text-black px-6 py-3 rounded-lg font-inter font-semibold hover:bg-[#00E5FF]/90 transition-all"
          >
            <Plus className="w-5 h-5" />
            Adicionar Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#00E5FF]/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#00E5FF]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-inter font-bold text-white">{cliente.nome}</h3>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCliente(cliente.id)}
                  className="text-red-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-inter">{cliente.email}</span>
                </div>
                {cliente.telefone && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-inter">{cliente.telefone}</span>
                  </div>
                )}
                {cliente.endereco && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-inter">{cliente.endereco}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#00E5FF]/10">
                <p className="text-xs text-gray-500 font-inter">
                  Cadastrado em {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-inter font-bold text-white mb-6">Novo Cliente</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Nome *</label>
                <input
                  type="text"
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Digite o nome"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Email *</label>
                <input
                  type="email"
                  value={novoCliente.email}
                  onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Digite o email"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={novoCliente.telefone}
                  onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Digite o telefone"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Endereço</label>
                <input
                  type="text"
                  value={novoCliente.endereco}
                  onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Digite o endereço"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg font-inter font-semibold hover:bg-gray-600 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCliente}
                className="flex-1 bg-[#00E5FF] text-black px-4 py-3 rounded-lg font-inter font-semibold hover:bg-[#00E5FF]/90 transition-all"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
