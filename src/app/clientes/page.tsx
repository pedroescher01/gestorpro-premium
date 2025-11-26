'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin, Edit, Trash2, DollarSign, ShoppingBag, ArrowUpDown, Calendar, User } from 'lucide-react';
import { getClientes, addCliente, updateCliente, deleteCliente, getVendas } from '@/lib/storage';
import { Cliente, Venda } from '@/lib/types';

type SortOrder = 'asc' | 'desc';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [clientesCarregados, vendasCarregadas] = await Promise.all([
        getClientes(),
        getVendas()
      ]);
      setClientes(clientesCarregados);
      setVendas(vendasCarregadas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular total gasto por cliente
  const calcularTotalGasto = (clienteId: string): number => {
    const vendasDoCliente = vendas.filter(
      venda => venda.cliente_id === clienteId && venda.status === 'concluida'
    );
    return vendasDoCliente.reduce((total, venda) => total + venda.total, 0);
  };

  // Calcular número de compras por cliente
  const calcularNumeroCompras = (clienteId: string): number => {
    return vendas.filter(
      venda => venda.cliente_id === clienteId && venda.status === 'concluida'
    ).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.telefone) {
      alert('Nome Completo e Telefone são obrigatórios');
      return;
    }

    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, formData);
      } else {
        await addCliente({
          ...formData,
          data_cadastro: new Date().toISOString()
        });
      }
      
      await carregarDados();
      setShowModal(false);
      setEditingCliente(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Tente novamente.');
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone || '',
      cpf_cnpj: cliente.cpf_cnpj || '',
      endereco: cliente.endereco || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      status: cliente.status
    });
    setShowModal(true);
  };

  const handleDeleteCliente = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteCliente(id);
        await carregarDados();
      } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        alert('Erro ao deletar cliente. Tente novamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf_cnpj: '',
      endereco: '',
      cidade: '',
      estado: '',
      status: 'ativo'
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const clientesFiltrados = clientes
    .filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.nome.localeCompare(b.nome, 'pt-BR');
      } else {
        return b.nome.localeCompare(a.nome, 'pt-BR');
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00E5FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-inter">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-inter font-bold text-white mb-2">
            Clientes
          </h1>
          <p className="text-gray-400 font-inter">
            Gerencie seus clientes e acompanhe o histórico de compras
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCliente(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white px-6 py-3 rounded-lg font-inter font-semibold hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar clientes por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg pl-12 pr-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
          />
        </div>
        <button
          onClick={toggleSortOrder}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 text-white rounded-lg font-medium hover:bg-[#00E5FF]/10 transition-all"
        >
          <ArrowUpDown className="w-5 h-5" />
          <span>A-Z {sortOrder === 'asc' ? '↓' : '↑'}</span>
        </button>
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
            onClick={() => {
              setEditingCliente(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white px-6 py-3 rounded-lg font-inter font-semibold hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            Adicionar Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.map((cliente) => {
            const totalGasto = calcularTotalGasto(cliente.id);
            const numeroCompras = calcularNumeroCompras(cliente.id);

            return (
              <div
                key={cliente.id}
                className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 hover:shadow-lg hover:shadow-[#00E5FF]/10 transition-all"
              >
                {/* Header com ícone e nome */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#00E5FF]/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-[#00E5FF]/30">
                      <User className="w-7 h-7 text-[#00E5FF]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-inter font-bold text-white">{cliente.nome}</h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full border mt-1 ${
                        cliente.status === 'ativo'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }`}>
                        {cliente.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="p-2 hover:bg-[#00E5FF]/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-[#00E5FF]" />
                    </button>
                    <button
                      onClick={() => handleDeleteCliente(cliente.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Informações de contato */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-8 h-8 bg-[#00E5FF]/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-[#00E5FF]" />
                    </div>
                    <span className="text-sm font-inter">{cliente.email}</span>
                  </div>
                  {cliente.telefone && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-8 h-8 bg-[#00E5FF]/10 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-[#00E5FF]" />
                      </div>
                      <span className="text-sm font-inter">{cliente.telefone}</span>
                    </div>
                  )}
                  {cliente.endereco && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-8 h-8 bg-[#00E5FF]/10 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-[#00E5FF]" />
                      </div>
                      <span className="text-sm font-inter">{cliente.endereco}</span>
                    </div>
                  )}
                </div>

                {/* Grid de informações financeiras */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#00E5FF]/10">
                  <div className="bg-gradient-to-br from-[#00E5FF]/5 to-blue-600/5 border border-[#00E5FF]/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-[#00E5FF]" />
                      <span className="text-xs font-inter text-gray-400">Total Gasto</span>
                    </div>
                    <span className="text-lg font-inter font-bold text-[#00E5FF]">
                      R$ {totalGasto.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/5 to-emerald-600/5 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-inter text-gray-400">Compras</span>
                    </div>
                    <span className="text-lg font-inter font-bold text-green-500">
                      {numeroCompras}
                    </span>
                  </div>
                </div>

                {/* Data de cadastro */}
                <div className="mt-4 pt-4 border-t border-[#00E5FF]/10 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 font-inter">
                    Cadastrado em {new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-inter font-bold text-white mb-6">
              {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Digite o nome completo do cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Telefone *</label>
                <input
                  type="tel"
                  required
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Digite o email do cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">CPF/CNPJ</label>
                <input
                  type="text"
                  value={formData.cpf_cnpj}
                  onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Digite o CPF ou CNPJ"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Endereço Completo</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Rua, número, complemento, bairro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-inter text-gray-400 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-inter text-gray-400 mb-2">Estado</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                    className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                    placeholder="UF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ativo' | 'inativo' })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCliente(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg font-inter font-semibold hover:bg-gray-600 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white px-4 py-3 rounded-lg font-inter font-semibold hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all"
                >
                  {editingCliente ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
