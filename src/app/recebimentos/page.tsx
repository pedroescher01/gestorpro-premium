'use client';

import { Package, Search, Plus, Check, X, Calendar, User, Box, DollarSign, Truck, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRecebimentos, criarRecebimento, confirmarRecebimento, RecebimentoComProduto } from '@/lib/recebimentos';
import { getProdutos } from '@/lib/storage';
import { Produto } from '@/lib/types';

export default function RecebimentosPage() {
  const [recebimentos, setRecebimentos] = useState<RecebimentoComProduto[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'pendente' | 'recebido'>('todos');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    produto_id: '',
    fornecedor: '',
    quantidade_recebida: 1,
    valor_total: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recebimentosData, produtosData] = await Promise.all([
        getRecebimentos(),
        getProdutos()
      ]);
      setRecebimentos(recebimentosData);
      setProdutos(produtosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações no frontend
    if (!formData.produto_id || formData.produto_id.trim() === '') {
      alert('Por favor, selecione um produto');
      return;
    }

    if (!formData.fornecedor || formData.fornecedor.trim() === '') {
      alert('Por favor, informe o fornecedor');
      return;
    }

    if (formData.quantidade_recebida <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }

    if (formData.valor_total <= 0) {
      alert('Valor deve ser maior que zero');
      return;
    }

    try {
      await criarRecebimento(
        formData.produto_id,
        formData.fornecedor,
        formData.quantidade_recebida,
        formData.valor_total
      );
      setShowModal(false);
      setFormData({ produto_id: '', fornecedor: '', quantidade_recebida: 1, valor_total: 0 });
      loadData();
    } catch (error) {
      console.error('Erro ao criar recebimento:', error);
      alert('Erro ao criar recebimento: ' + (error as Error).message);
    }
  };

  const handleConfirmar = async (id: string) => {
    if (!confirm('Confirmar recebimento? O estoque será atualizado e o valor será registrado como despesa automaticamente.')) return;
    try {
      await confirmarRecebimento(id);
      loadData();
    } catch (error) {
      console.error('Erro ao confirmar recebimento:', error);
      alert('Erro ao confirmar recebimento: ' + (error as Error).message);
    }
  };

  const filteredRecebimentos = recebimentos.filter(recebimento => {
    const matchesSearch = recebimento.produto_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recebimento.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'todos') return matchesSearch;
    return matchesSearch && recebimento.status === filter;
  });

  const totalRecebimentos = recebimentos.length;
  const pendentes = recebimentos.filter(r => r.status === 'pendente').length;
  const recebidos = recebimentos.filter(r => r.status === 'recebido').length;
  const valorTotalPendente = recebimentos
    .filter(r => r.status === 'pendente')
    .reduce((acc, r) => acc + (r.valor_total || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20">
            <Package className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-inter">Recebimentos</h1>
        </div>
        <p className="text-gray-400 text-sm">Controle de recebimento de produtos e despesas</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Box className="w-5 h-5 text-[#00E5FF]" />
            <span className="text-gray-400 text-sm">Total de Recebimentos</span>
          </div>
          <p className="text-2xl font-bold text-[#00E5FF]">{totalRecebimentos}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-yellow-500" />
            <span className="text-gray-400 text-sm">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-yellow-500">{pendentes}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-gray-400 text-sm">Recebidos</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{recebidos}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            <span className="text-gray-400 text-sm">Valor Pendente</span>
          </div>
          <p className="text-2xl font-bold text-red-500">
            R$ {valorTotalPendente.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar recebimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Recebimento</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'todos'
                ? 'bg-[#00E5FF] text-white'
                : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#00E5FF]/10'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('pendente')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pendente'
                ? 'bg-yellow-500 text-white'
                : 'bg-[#1A1A1A] text-gray-400 hover:bg-yellow-500/10'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('recebido')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'recebido'
                ? 'bg-green-500 text-white'
                : 'bg-[#1A1A1A] text-gray-400 hover:bg-green-500/10'
            }`}
          >
            Recebidos
          </button>
        </div>
      </div>

      {/* Lista de Recebimentos */}
      {filteredRecebimentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-[#00E5FF]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum recebimento encontrado</h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            {searchTerm ? 'Tente buscar com outros termos' : 'Crie seu primeiro recebimento'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecebimentos.map((recebimento) => (
            <div
              key={recebimento.id}
              className={`bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border rounded-xl p-6 hover:shadow-lg transition-all ${
                recebimento.status === 'pendente' 
                  ? 'border-yellow-500/20 hover:border-yellow-500/40 hover:shadow-yellow-500/10' 
                  : 'border-green-500/20 hover:border-green-500/40 hover:shadow-green-500/10'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg border ${
                      recebimento.status === 'pendente'
                        ? 'bg-yellow-500/10 border-yellow-500/20'
                        : 'bg-green-500/10 border-green-500/20'
                    }`}>
                      <Package className={`w-4 h-4 ${
                        recebimento.status === 'pendente' ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{recebimento.produto_nome}</h3>
                  </div>
                  {recebimento.produto_codigo && (
                    <p className="text-xs text-gray-500 mb-2">Cód: {recebimento.produto_codigo}</p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    recebimento.status === 'pendente'
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      : 'bg-green-500/10 text-green-500 border border-green-500/20'
                  }`}
                >
                  {recebimento.status === 'pendente' ? 'Pendente' : 'Recebido'}
                </span>
              </div>

              {/* Fornecedor */}
              <div className="bg-[#0D0D0D]/50 border border-[#00E5FF]/10 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-[#00E5FF]" />
                  <span className="text-xs text-gray-400">Fornecedor</span>
                </div>
                <p className="text-sm text-white font-medium">{recebimento.fornecedor}</p>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0D0D0D]/50 border border-[#00E5FF]/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Box className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-xs text-gray-400">Quantidade</span>
                  </div>
                  <p className="text-lg font-bold text-[#00E5FF]">
                    {recebimento.quantidade_recebida} un
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-gray-400">Valor</span>
                  </div>
                  <p className="text-lg font-bold text-red-500">
                    R$ {(recebimento.valor_total || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Data */}
              <div className="bg-[#0D0D0D]/50 border border-[#00E5FF]/10 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#00E5FF]" />
                  <span className="text-xs text-gray-400">Data do Recebimento</span>
                </div>
                <p className="text-sm text-white font-medium">
                  {new Date(recebimento.data_recebimento).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {recebimento.status === 'pendente' && (
                <button
                  onClick={() => handleConfirmar(recebimento.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/20 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Recebimento</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Novo Recebimento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Novo Recebimento</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Produto *
                </label>
                <select
                  value={formData.produto_id}
                  onChange={(e) => setFormData({ ...formData, produto_id: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} {produto.codigo_barras ? `(${produto.codigo_barras})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Fornecedor *
                </label>
                <input
                  type="text"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantidade_recebida}
                  onChange={(e) => setFormData({ ...formData, quantidade_recebida: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Valor Total (R$) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.valor_total}
                  onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-500 text-sm">
                    Ao confirmar o recebimento, o valor será automaticamente registrado como despesa no financeiro.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-[#0D0D0D] border border-gray-700 text-gray-400 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
