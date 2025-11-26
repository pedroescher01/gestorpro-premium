'use client';

import { DollarSign, Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, Calendar, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFinanceiro, addFinanceiro, updateFinanceiro, deleteFinanceiro } from '@/lib/storage';
import { Financeiro } from '@/lib/types';
import { getLocalDateString, formatDateBR } from '@/lib/dateUtils';

export default function FinanceiroPage() {
  const [financeiro, setFinanceiro] = useState<Financeiro[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFinanceiro, setEditingFinanceiro] = useState<Financeiro | null>(null);
  const [formData, setFormData] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    descricao: '',
    valor: '',
    categoria: '',
    data: getLocalDateString(),
    status: 'pendente' as 'pendente' | 'pago' | 'cancelado'
  });

  useEffect(() => {
    loadFinanceiro();
  }, []);

  const loadFinanceiro = async () => {
    setLoading(true);
    const data = await getFinanceiro();
    setFinanceiro(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFinanceiro) {
        await updateFinanceiro(editingFinanceiro.id, {
          ...formData,
          valor: parseFloat(formData.valor)
        });
      } else {
        await addFinanceiro({
          ...formData,
          valor: parseFloat(formData.valor)
        });
      }
      setShowModal(false);
      setEditingFinanceiro(null);
      resetForm();
      loadFinanceiro();
    } catch (error) {
      console.error('Erro ao salvar movimentação financeira:', error);
      alert('Erro ao salvar movimentação. Verifique os dados e tente novamente.');
    }
  };

  const handleEdit = (item: Financeiro) => {
    setEditingFinanceiro(item);
    setFormData({
      tipo: item.tipo,
      descricao: item.descricao,
      valor: item.valor.toString(),
      categoria: item.categoria,
      data: item.data,
      status: item.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
      try {
        await deleteFinanceiro(id);
        loadFinanceiro();
      } catch (error) {
        console.error('Erro ao deletar movimentação:', error);
        alert('Erro ao deletar movimentação.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'receita',
      descricao: '',
      valor: '',
      categoria: '',
      data: getLocalDateString(),
      status: 'pendente'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pendente': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelado': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const filteredFinanceiro = financeiro.filter(item =>
    item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReceitas = financeiro
    .filter(item => item.tipo === 'receita' && item.status === 'pago')
    .reduce((acc, item) => acc + item.valor, 0);

  const totalDespesas = financeiro
    .filter(item => item.tipo === 'despesa' && item.status === 'pago')
    .reduce((acc, item) => acc + item.valor, 0);

  const saldo = totalReceitas - totalDespesas;

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
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-blue-600/20 border border-[#00E5FF]/30">
            <DollarSign className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-inter">Financeiro</h1>
        </div>
        <p className="text-gray-400 text-sm">Gestão financeira e fluxo de caixa</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0D0D0D] border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center border border-green-500/30">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-gray-400 text-sm font-medium">Receitas</span>
          </div>
          <p className="text-2xl font-bold text-green-500">R$ {totalReceitas.toFixed(2)}</p>
        </div>
        <div className="bg-[#0D0D0D] border border-red-500/20 rounded-xl p-6 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-lg flex items-center justify-center border border-red-500/30">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-gray-400 text-sm font-medium">Despesas</span>
          </div>
          <p className="text-2xl font-bold text-red-500">R$ {totalDespesas.toFixed(2)}</p>
        </div>
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-6 hover:border-[#00E5FF]/40 hover:shadow-lg hover:shadow-[#00E5FF]/10 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00E5FF]/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-[#00E5FF]/30">
              <DollarSign className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <span className="text-gray-400 text-sm font-medium">Saldo</span>
          </div>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-[#00E5FF]' : 'text-red-500'}`}>
            R$ {saldo.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
          />
        </div>
        <button 
          onClick={() => {
            setEditingFinanceiro(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Transação</span>
        </button>
      </div>

      {/* Lista de Transações */}
      {filteredFinanceiro.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mb-6">
            <DollarSign className="w-10 h-10 text-[#00E5FF]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma transação registrada</h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Comece registrando sua primeira transação financeira
          </p>
          <button 
            onClick={() => {
              setEditingFinanceiro(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Registrar Primeira Transação</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFinanceiro.map((item) => (
            <div key={item.id} className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 hover:shadow-lg hover:shadow-[#00E5FF]/10 transition-all">
              {/* Header com tipo e ações */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                      item.tipo === 'receita' 
                        ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30' 
                        : 'bg-gradient-to-br from-red-500/20 to-orange-600/20 border-red-500/30'
                    }`}>
                      {item.tipo === 'receita' ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.descricao}</h3>
                  </div>
                  <span className="inline-block px-3 py-1 text-xs rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 font-medium">
                    {item.categoria}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 hover:bg-[#00E5FF]/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[#00E5FF]" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Grid de informações */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#00E5FF]/10">
                <div className={`rounded-lg p-3 border ${
                  item.tipo === 'receita'
                    ? 'bg-gradient-to-br from-green-500/5 to-emerald-600/5 border-green-500/20'
                    : 'bg-gradient-to-br from-red-500/5 to-orange-600/5 border-red-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className={`w-4 h-4 ${item.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-xs text-gray-400">Valor</span>
                  </div>
                  <span className={`text-lg font-bold ${item.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                    {item.tipo === 'receita' ? '+' : '-'} R$ {item.valor.toFixed(2)}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-[#00E5FF]/5 to-blue-600/5 border border-[#00E5FF]/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-xs text-gray-400">Data</span>
                  </div>
                  <span className="text-sm font-bold text-white">{formatDateBR(item.data)}</span>
                </div>
              </div>

              {/* Status */}
              <div className="mt-3 pt-3 border-t border-[#00E5FF]/10">
                <span className={`inline-block px-3 py-1 text-xs rounded-full border font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-md border border-[#00E5FF]/20">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingFinanceiro ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value as 'receita' | 'despesa'})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <input
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                <input
                  type="text"
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
                <input
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'pendente' | 'pago' | 'cancelado'})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFinanceiro(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all"
                >
                  {editingFinanceiro ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
