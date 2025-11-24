'use client';

import { Factory, Plus, Search, Calendar, CheckCircle, AlertCircle, Trash2, ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getInsumos, updateInsumo } from '@/lib/storage';
import { Insumo } from '@/lib/types';
import { formatDateBR } from '@/lib/dateUtils';

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

interface Producao {
  id: string;
  receita_id: string;
  receita_nome: string;
  quantidade_produzida: number;
  data_producao: string;
  observacoes: string;
  insumos_descontados: ReceitaInsumo[];
}

type SortOrder = 'asc' | 'desc';

export default function ProducaoPage() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [producaoToDelete, setProducaoToDelete] = useState<Producao | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [formData, setFormData] = useState({
    receita_id: '',
    quantidade_produzida: '',
    observacoes: ''
  });
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Carregar receitas do localStorage
    const receitasStorage = localStorage.getItem('receitas');
    if (receitasStorage) {
      setReceitas(JSON.parse(receitasStorage));
    }
    
    // Carregar produções do localStorage
    const producoesStorage = localStorage.getItem('producoes');
    if (producoesStorage) {
      setProducoes(JSON.parse(producoesStorage));
    }
    
    // Carregar insumos
    const insumosData = await getInsumos();
    setInsumos(insumosData);
    
    setLoading(false);
  };

  const saveProducoes = (novasProducoes: Producao[]) => {
    localStorage.setItem('producoes', JSON.stringify(novasProducoes));
    setProducoes(novasProducoes);
  };

  const verificarEstoqueDisponivel = (receita: Receita, quantidade: number): {disponivel: boolean, faltantes: string[]} => {
    const faltantes: string[] = [];
    
    for (const insumoReceita of receita.insumos) {
      const insumo = insumos.find(i => i.id === insumoReceita.insumo_id);
      if (!insumo) {
        faltantes.push(`${insumoReceita.insumo_nome} (não encontrado)`);
        continue;
      }
      
      const quantidadeNecessaria = insumoReceita.quantidade_necessaria * quantidade;
      if (insumo.quantidade < quantidadeNecessaria) {
        faltantes.push(
          `${insumoReceita.insumo_nome} (necessário: ${quantidadeNecessaria} ${insumoReceita.unidade}, disponível: ${insumo.quantidade} ${insumoReceita.unidade})`
        );
      }
    }
    
    return {
      disponivel: faltantes.length === 0,
      faltantes
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const receita = receitas.find(r => r.id === formData.receita_id);
    if (!receita) {
      showAlert('error', 'Receita não encontrada');
      return;
    }
    
    const quantidade = parseInt(formData.quantidade_produzida);
    
    // Verificar se há estoque suficiente
    const { disponivel, faltantes } = verificarEstoqueDisponivel(receita, quantidade);
    
    if (!disponivel) {
      showAlert('error', `Estoque insuficiente:\n${faltantes.join('\n')}`);
      return;
    }
    
    try {
      // Descontar insumos do estoque
      for (const insumoReceita of receita.insumos) {
        const insumo = insumos.find(i => i.id === insumoReceita.insumo_id);
        if (insumo) {
          const quantidadeDescontar = insumoReceita.quantidade_necessaria * quantidade;
          const novaQuantidade = insumo.quantidade - quantidadeDescontar;
          
          await updateInsumo(insumo.id, {
            ...insumo,
            quantidade: novaQuantidade
          });
        }
      }
      
      // Registrar produção
      const novaProducao: Producao = {
        id: Date.now().toString(),
        receita_id: receita.id,
        receita_nome: receita.nome,
        quantidade_produzida: quantidade,
        data_producao: new Date().toISOString().split('T')[0],
        observacoes: formData.observacoes,
        insumos_descontados: receita.insumos
      };
      
      const novasProducoes = [novaProducao, ...producoes];
      saveProducoes(novasProducoes);
      
      showAlert('success', `Produção registrada com sucesso! ${quantidade} unidades de ${receita.nome} produzidas.`);
      setShowModal(false);
      resetForm();
      
      // Recarregar dados
      await loadData();
    } catch (error) {
      console.error('Erro ao registrar produção:', error);
      showAlert('error', 'Erro ao registrar produção. Tente novamente.');
    }
  };

  const handleDeleteProducao = async () => {
    if (!producaoToDelete) return;

    try {
      // Devolver insumos ao estoque
      for (const insumoDescontado of producaoToDelete.insumos_descontados) {
        const insumo = insumos.find(i => i.id === insumoDescontado.insumo_id);
        if (insumo) {
          const quantidadeDevolver = insumoDescontado.quantidade_necessaria * producaoToDelete.quantidade_produzida;
          const novaQuantidade = insumo.quantidade + quantidadeDevolver;
          
          await updateInsumo(insumo.id, {
            ...insumo,
            quantidade: novaQuantidade
          });
        }
      }

      // Remover produção da lista
      const novasProducoes = producoes.filter(p => p.id !== producaoToDelete.id);
      saveProducoes(novasProducoes);

      showAlert('success', `Produção excluída com sucesso! Insumos devolvidos ao estoque.`);
      setShowDeleteModal(false);
      setProducaoToDelete(null);

      // Recarregar dados
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir produção:', error);
      showAlert('error', 'Erro ao excluir produção. Tente novamente.');
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const resetForm = () => {
    setFormData({
      receita_id: '',
      quantidade_produzida: '',
      observacoes: ''
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredProducoes = producoes
    .filter(producao =>
      producao.receita_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producao.observacoes.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.data_producao).getTime() - new Date(b.data_producao).getTime();
      } else {
        return new Date(b.data_producao).getTime() - new Date(a.data_producao).getTime();
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
      {/* Alert Message */}
      {alertMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${
          alertMessage.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        } max-w-md animate-in slide-in-from-top`}>
          <div className="flex items-start gap-3">
            {alertMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm whitespace-pre-line">{alertMessage.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20">
            <Factory className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-inter">Produção</h1>
        </div>
        <p className="text-gray-400 text-sm">Registre a produção de receitas e desconte automaticamente os insumos</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produções..."
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
          <span>Data {sortOrder === 'desc' ? '↓' : '↑'}</span>
        </button>
        <button 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          disabled={receitas.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          <span>Registrar Produção</span>
        </button>
      </div>

      {/* Aviso se não há receitas */}
      {receitas.length === 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-500 font-medium">Nenhuma receita cadastrada</p>
              <p className="text-orange-400 text-sm mt-1">
                Você precisa cadastrar receitas antes de registrar produções. 
                <a href="/receitas" className="underline ml-1">Clique aqui para cadastrar</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Produções */}
      {filteredProducoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mb-6">
            <Factory className="w-10 h-10 text-[#00E5FF]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma produção registrada</h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Registre sua primeira produção para começar a controlar o estoque automaticamente
          </p>
          {receitas.length > 0 && (
            <button 
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Primeira Produção</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducoes.map((producao) => (
            <div key={producao.id} className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg p-6 hover:border-[#00E5FF]/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{producao.receita_nome}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateBR(producao.data_producao)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#00E5FF]">
                      {producao.quantidade_produzida} unidades
                    </div>
                    <div className="text-xs text-gray-400">produzidas</div>
                  </div>
                  <button
                    onClick={() => {
                      setProducaoToDelete(producao);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-all"
                    title="Excluir produção"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {producao.observacoes && (
                <div className="mb-4 p-3 bg-[#0D0D0D] rounded-lg">
                  <p className="text-sm text-gray-300">{producao.observacoes}</p>
                </div>
              )}
              
              <div className="border-t border-gray-700 pt-4">
                <p className="text-sm text-gray-400 mb-2">Insumos descontados:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {producao.insumos_descontados.map((insumo, index) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-[#0D0D0D] rounded">
                      <span className="text-gray-300">{insumo.insumo_nome}</span>
                      <span className="text-red-400">
                        -{(insumo.quantidade_necessaria * producao.quantidade_produzida).toFixed(2)} {insumo.unidade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Registro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-md border border-[#00E5FF]/20 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Registrar Produção</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Receita</label>
                <select
                  required
                  value={formData.receita_id}
                  onChange={(e) => setFormData({...formData, receita_id: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="">Selecione uma receita...</option>
                  {receitas.map((receita) => (
                    <option key={receita.id} value={receita.id}>
                      {receita.nome} (rende {receita.rendimento} un)
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.receita_id && (
                <div className="p-3 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Insumos necessários por unidade:</p>
                  {receitas.find(r => r.id === formData.receita_id)?.insumos.map((insumo, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-300">
                      <span>{insumo.insumo_nome}</span>
                      <span className="text-[#00E5FF]">{insumo.quantidade_necessaria} {insumo.unidade}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quantidade Produzida</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantidade_produzida}
                  onChange={(e) => setFormData({...formData, quantidade_produzida: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  placeholder="Quantas unidades foram produzidas?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Observações (opcional)</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  rows={3}
                  placeholder="Adicione observações sobre esta produção..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
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
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && producaoToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-md border border-red-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Excluir Produção</h2>
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja excluir a produção de <span className="font-bold text-[#00E5FF]">{producaoToDelete.receita_nome}</span>?
            </p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-400 mb-2">Os seguintes insumos serão devolvidos ao estoque:</p>
              <div className="space-y-1">
                {producaoToDelete.insumos_descontados.map((insumo, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-300">
                    <span>{insumo.insumo_nome}</span>
                    <span className="text-green-400">
                      +{(insumo.quantidade_necessaria * producaoToDelete.quantidade_produzida).toFixed(2)} {insumo.unidade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProducaoToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProducao}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
