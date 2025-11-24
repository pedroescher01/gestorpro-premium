'use client';

import { Layers, Plus, Search, Edit, Trash2, Package, ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getInsumos, addInsumo, updateInsumo, deleteInsumo } from '@/lib/storage';
import { Insumo } from '@/lib/types';

type SortOrder = 'asc' | 'desc';

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    quantidade: '',
    unidade: '',
    preco_unitario: '',
    fornecedor: '',
    data_validade: '',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  useEffect(() => {
    loadInsumos();
  }, []);

  const loadInsumos = async () => {
    setLoading(true);
    const data = await getInsumos();
    setInsumos(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInsumo) {
        await updateInsumo(editingInsumo.id, {
          ...formData,
          quantidade: parseFloat(formData.quantidade),
          preco_unitario: parseFloat(formData.preco_unitario)
        });
      } else {
        await addInsumo({
          ...formData,
          quantidade: parseFloat(formData.quantidade),
          preco_unitario: parseFloat(formData.preco_unitario)
        });
      }
      setShowModal(false);
      setEditingInsumo(null);
      resetForm();
      loadInsumos();
    } catch (error) {
      console.error('Erro ao salvar insumo:', error);
      alert('Erro ao salvar insumo. Verifique os dados e tente novamente.');
    }
  };

  const handleEdit = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setFormData({
      nome: insumo.nome,
      descricao: insumo.descricao,
      quantidade: insumo.quantidade.toString(),
      unidade: insumo.unidade,
      preco_unitario: insumo.preco_unitario.toString(),
      fornecedor: insumo.fornecedor,
      data_validade: insumo.data_validade,
      status: insumo.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este insumo?')) {
      try {
        await deleteInsumo(id);
        loadInsumos();
      } catch (error) {
        console.error('Erro ao deletar insumo:', error);
        alert('Erro ao deletar insumo.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      quantidade: '',
      unidade: '',
      preco_unitario: '',
      fornecedor: '',
      data_validade: '',
      status: 'ativo'
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredInsumos = insumos
    .filter(insumo =>
      insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insumo.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Layers className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-inter">Insumos</h1>
        </div>
        <p className="text-gray-400 text-sm">Gerencie os insumos e matérias-primas</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar insumos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
          />
        </div>
        <button
          onClick={toggleSortOrder}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 text-white rounded-lg font-medium hover:bg-[#00E5FF]/10 transition-all"
        >
          <ArrowUpDown className="w-5 h-5" />
          <span>A-Z {sortOrder === 'asc' ? '↓' : '↑'}</span>
        </button>
        <button 
          onClick={() => {
            setEditingInsumo(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Insumo</span>
        </button>
      </div>

      {/* Lista de Insumos */}
      {filteredInsumos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mb-6">
            <Layers className="w-10 h-10 text-[#00E5FF]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum insumo cadastrado</h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Comece adicionando seu primeiro insumo ao sistema
          </p>
          <button 
            onClick={() => {
              setEditingInsumo(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Primeiro Insumo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInsumos.map((insumo) => (
            <div key={insumo.id} className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg p-6 hover:border-[#00E5FF]/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{insumo.nome}</h3>
                  <p className="text-sm text-gray-400 mb-2">{insumo.descricao}</p>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                    {insumo.fornecedor}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(insumo)}
                    className="p-2 hover:bg-[#00E5FF]/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[#00E5FF]" />
                  </button>
                  <button
                    onClick={() => handleDelete(insumo.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Package className="w-4 h-4" />
                    <span className="text-sm">{insumo.quantidade} {insumo.unidade}</span>
                  </div>
                  <span className="text-sm font-bold text-[#00E5FF]">
                    R$ {insumo.preco_unitario.toFixed(2)}/{insumo.unidade}
                  </span>
                </div>
                {insumo.data_validade && (
                  <div className="text-xs text-gray-500">
                    Validade: {new Date(insumo.data_validade).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-md border border-[#00E5FF]/20 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingInsumo ? 'Editar Insumo' : 'Novo Insumo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quantidade</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.quantidade}
                    onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Unidade</label>
                  <select
                    required
                    value={formData.unidade}
                    onChange={(e) => setFormData({...formData, unidade: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="">Selecione...</option>
                    {/* Unidades de Massa */}
                    <optgroup label="Massa">
                      <option value="mg">Miligrama (mg)</option>
                      <option value="g">Grama (g)</option>
                      <option value="kg">Quilograma (kg)</option>
                      <option value="t">Tonelada (t)</option>
                    </optgroup>
                    {/* Unidades de Volume */}
                    <optgroup label="Volume">
                      <option value="ml">Mililitro (ml)</option>
                      <option value="L">Litro (L)</option>
                      <option value="m³">Metro Cúbico (m³)</option>
                    </optgroup>
                    {/* Unidades de Comprimento */}
                    <optgroup label="Comprimento">
                      <option value="mm">Milímetro (mm)</option>
                      <option value="cm">Centímetro (cm)</option>
                      <option value="m">Metro (m)</option>
                      <option value="km">Quilômetro (km)</option>
                    </optgroup>
                    {/* Unidades de Área */}
                    <optgroup label="Área">
                      <option value="cm²">Centímetro Quadrado (cm²)</option>
                      <option value="m²">Metro Quadrado (m²)</option>
                      <option value="ha">Hectare (ha)</option>
                    </optgroup>
                    {/* Unidades Gerais */}
                    <optgroup label="Geral">
                      <option value="un">Unidade (un)</option>
                      <option value="cx">Caixa (cx)</option>
                      <option value="pct">Pacote (pct)</option>
                      <option value="dz">Dúzia (dz)</option>
                      <option value="pc">Peça (pc)</option>
                      <option value="sc">Saco (sc)</option>
                      <option value="fd">Fardo (fd)</option>
                      <option value="rl">Rolo (rl)</option>
                      <option value="gl">Galão (gl)</option>
                      <option value="tb">Tubo (tb)</option>
                      <option value="br">Barra (br)</option>
                      <option value="ch">Chapa (ch)</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.preco_unitario}
                  onChange={(e) => setFormData({...formData, preco_unitario: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fornecedor</label>
                <input
                  type="text"
                  required
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data de Validade</label>
                <input
                  type="date"
                  value={formData.data_validade}
                  onChange={(e) => setFormData({...formData, data_validade: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'ativo' | 'inativo'})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingInsumo(null);
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
                  {editingInsumo ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
