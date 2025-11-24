'use client';

import { ChefHat, Plus, Search, Edit, Trash2, Package, ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getInsumos } from '@/lib/storage';
import { Insumo } from '@/lib/types';

interface ReceitaInsumo {
  insumo_id: string;
  insumo_nome: string;
  quantidade_necessaria: number;
  unidade: string;
}

interface Receita {
  id: string;
  nome: string;
  descricao: string;
  rendimento: number;
  insumos: ReceitaInsumo[];
  created_at: string;
}

type SortOrder = 'asc' | 'desc';

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    rendimento: ''
  });
  const [insumosReceita, setInsumosReceita] = useState<ReceitaInsumo[]>([]);
  const [insumoSelecionado, setInsumoSelecionado] = useState('');
  const [quantidadeInsumo, setQuantidadeInsumo] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const insumosData = await getInsumos();
    setInsumos(insumosData);
    
    // Carregar receitas do localStorage
    const receitasStorage = localStorage.getItem('receitas');
    if (receitasStorage) {
      setReceitas(JSON.parse(receitasStorage));
    }
    
    setLoading(false);
  };

  const saveReceitas = (novasReceitas: Receita[]) => {
    localStorage.setItem('receitas', JSON.stringify(novasReceitas));
    setReceitas(novasReceitas);
  };

  const handleAddInsumo = () => {
    if (!insumoSelecionado || !quantidadeInsumo) return;
    
    const insumo = insumos.find(i => i.id === insumoSelecionado);
    if (!insumo) return;

    const novoInsumo: ReceitaInsumo = {
      insumo_id: insumo.id,
      insumo_nome: insumo.nome,
      quantidade_necessaria: parseFloat(quantidadeInsumo),
      unidade: insumo.unidade
    };

    setInsumosReceita([...insumosReceita, novoInsumo]);
    setInsumoSelecionado('');
    setQuantidadeInsumo('');
  };

  const handleRemoveInsumo = (index: number) => {
    setInsumosReceita(insumosReceita.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (insumosReceita.length === 0) {
      alert('Adicione pelo menos um insumo à receita');
      return;
    }

    try {
      const novaReceita: Receita = {
        id: editingReceita?.id || Date.now().toString(),
        nome: formData.nome,
        descricao: formData.descricao,
        rendimento: parseInt(formData.rendimento),
        insumos: insumosReceita,
        created_at: editingReceita?.created_at || new Date().toISOString()
      };

      let novasReceitas;
      if (editingReceita) {
        novasReceitas = receitas.map(r => r.id === editingReceita.id ? novaReceita : r);
      } else {
        novasReceitas = [...receitas, novaReceita];
      }

      saveReceitas(novasReceitas);
      setShowModal(false);
      setEditingReceita(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('Erro ao salvar receita. Tente novamente.');
    }
  };

  const handleEdit = (receita: Receita) => {
    setEditingReceita(receita);
    setFormData({
      nome: receita.nome,
      descricao: receita.descricao,
      rendimento: receita.rendimento.toString()
    });
    setInsumosReceita(receita.insumos);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      const novasReceitas = receitas.filter(r => r.id !== id);
      saveReceitas(novasReceitas);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      rendimento: ''
    });
    setInsumosReceita([]);
    setInsumoSelecionado('');
    setQuantidadeInsumo('');
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredReceitas = receitas
    .filter(receita =>
      receita.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receita.descricao.toLowerCase().includes(searchTerm.toLowerCase())
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
            <ChefHat className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-inter">Receitas</h1>
        </div>
        <p className="text-gray-400 text-sm">Gerencie suas receitas e composições de produtos</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar receitas..."
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
            setEditingReceita(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Receita</span>
        </button>
      </div>

      {/* Lista de Receitas */}
      {filteredReceitas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mb-6">
            <ChefHat className="w-10 h-10 text-[#00E5FF]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma receita cadastrada</h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Comece criando sua primeira receita com os insumos necessários
          </p>
          <button 
            onClick={() => {
              setEditingReceita(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Criar Primeira Receita</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReceitas.map((receita) => (
            <div key={receita.id} className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg p-6 hover:border-[#00E5FF]/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{receita.nome}</h3>
                  <p className="text-sm text-gray-400 mb-2">{receita.descricao}</p>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                    Rende: {receita.rendimento} unidades
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(receita)}
                    className="p-2 hover:bg-[#00E5FF]/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[#00E5FF]" />
                  </button>
                  <button
                    onClick={() => handleDelete(receita.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">Insumos necessários:</span>
                </div>
                {receita.insumos.map((insumo, index) => (
                  <div key={index} className="flex justify-between text-sm pl-6">
                    <span className="text-gray-300">{insumo.insumo_nome}</span>
                    <span className="text-[#00E5FF]">
                      {insumo.quantidade_necessaria} {insumo.unidade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-2xl border border-[#00E5FF]/20 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingReceita ? 'Editar Receita' : 'Nova Receita'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome da Receita</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  placeholder="Ex: Geladinho Gourmet de Pudim"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  rows={2}
                  placeholder="Descrição da receita"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rendimento (unidades)</label>
                <input
                  type="number"
                  required
                  value={formData.rendimento}
                  onChange={(e) => setFormData({...formData, rendimento: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  placeholder="Quantas unidades essa receita produz?"
                />
              </div>

              {/* Adicionar Insumos */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Insumos da Receita</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <select
                    value={insumoSelecionado}
                    onChange={(e) => setInsumoSelecionado(e.target.value)}
                    className="col-span-1 sm:col-span-2 px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="">Selecione um insumo...</option>
                    {insumos.map((insumo) => (
                      <option key={insumo.id} value={insumo.id}>
                        {insumo.nome} ({insumo.unidade})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={quantidadeInsumo}
                    onChange={(e) => setQuantidadeInsumo(e.target.value)}
                    placeholder="Quantidade"
                    className="px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddInsumo}
                  className="w-full px-4 py-2 bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] rounded-lg hover:bg-[#00E5FF]/20 transition-colors"
                >
                  Adicionar Insumo
                </button>

                {/* Lista de Insumos Adicionados */}
                {insumosReceita.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-400 mb-2">Insumos adicionados:</p>
                    {insumosReceita.map((insumo, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-lg">
                        <div>
                          <span className="text-white">{insumo.insumo_nome}</span>
                          <span className="text-[#00E5FF] ml-2">
                            {insumo.quantidade_necessaria} {insumo.unidade}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveInsumo(index)}
                          className="p-1 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingReceita(null);
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
                  {editingReceita ? 'Salvar' : 'Criar Receita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
