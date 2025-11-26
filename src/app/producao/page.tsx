'use client';

import { Factory, CheckCircle, AlertCircle, Clock, Package, User, Calendar, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProducoes, concluirProducao, deletarProducao } from '@/lib/producao';
import { getOrcamentoById, getOrcamentoItens } from '@/lib/orcamentos';
import { getClientes } from '@/lib/storage';
import { formatDateBR } from '@/lib/dateUtils';
import { Cliente, OrcamentoItem } from '@/lib/types';

interface ProducaoComDetalhes {
  id: string;
  orcamento_id: string;
  status: 'preparacao' | 'concluido' | 'cancelado';
  data_inicio: string;
  data_conclusao?: string;
  observacoes?: string;
  // Dados do orçamento
  orcamento_numero?: string;
  cliente_nome?: string;
  valor_total?: number;
  itens?: OrcamentoItem[];
}

export default function ProducaoPage() {
  const [producoes, setProducoes] = useState<ProducaoComDetalhes[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar produções
      const producoesData = await getProducoes();
      
      // Carregar clientes
      const clientesData = await getClientes();
      setClientes(clientesData);
      
      // Enriquecer produções com dados do orçamento
      const producoesEnriquecidas = await Promise.all(
        producoesData.map(async (producao) => {
          try {
            const orcamento = await getOrcamentoById(producao.orcamento_id);
            const itens = await getOrcamentoItens(producao.orcamento_id);
            
            if (orcamento) {
              const cliente = clientesData.find(c => c.id === orcamento.cliente_id);
              
              return {
                ...producao,
                orcamento_numero: orcamento.numero,
                cliente_nome: cliente?.nome || 'Cliente não encontrado',
                valor_total: orcamento.valor_total,
                itens: itens
              };
            }
            
            return {
              ...producao,
              orcamento_numero: 'Orçamento não encontrado',
              cliente_nome: 'N/A',
              valor_total: 0,
              itens: []
            };
          } catch (error) {
            console.error('Erro ao buscar dados do orçamento:', error);
            return {
              ...producao,
              orcamento_numero: 'Erro ao carregar',
              cliente_nome: 'N/A',
              valor_total: 0,
              itens: []
            };
          }
        })
      );
      
      setProducoes(producoesEnriquecidas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showAlert('error', 'Erro ao carregar produções');
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirProducao = async (producao: ProducaoComDetalhes) => {
    if (!confirm(`Deseja concluir a produção do orçamento ${producao.orcamento_numero}?\n\nIsso irá:\n✓ Descontar os produtos do estoque\n✓ Criar uma venda automaticamente\n✓ Registrar a receita no financeiro`)) {
      return;
    }

    try {
      setProcessando(producao.id);
      
      await concluirProducao(producao.id, producao.orcamento_id);
      
      showAlert('success', `Produção concluída com sucesso!\n✓ Estoque atualizado\n✓ Venda criada automaticamente\n✓ Receita registrada no financeiro`);
      
      await loadData();
    } catch (error: any) {
      console.error('Erro ao concluir produção:', error);
      showAlert('error', `Erro ao concluir produção: ${error.message || 'Tente novamente'}`);
    } finally {
      setProcessando(null);
    }
  };

  const handleCancelarProducao = async (producaoId: string) => {
    if (!confirm('Deseja cancelar esta produção?')) {
      return;
    }

    try {
      await deletarProducao(producaoId);
      showAlert('success', 'Produção cancelada com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Erro ao cancelar produção:', error);
      showAlert('error', 'Erro ao cancelar produção');
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      preparacao: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock, label: 'Em Preparação' },
      concluido: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle, label: 'Concluído' },
      cancelado: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle, label: 'Cancelado' },
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <span className={`px-3 py-1 text-xs rounded-full border flex items-center gap-1 ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto mb-4"></div>
          <p className="text-gray-400 font-inter">Carregando produções...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Alert Message */}
      {alertMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border max-w-md ${
          alertMessage.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        } animate-in slide-in-from-top`}>
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-inter font-bold text-white mb-2 flex items-center gap-3">
              <Factory className="w-8 h-8 text-[#00E5FF]" />
              Produção
            </h1>
            <p className="text-gray-400 font-inter">
              Gerencie as produções dos orçamentos aprovados
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0D0D0D] border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Em Preparação</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {producoes.filter(p => p.status === 'preparacao').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-[#0D0D0D] border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Concluídas</p>
                <p className="text-2xl font-bold text-green-500">
                  {producoes.filter(p => p.status === 'concluido').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Valor Total</p>
                <p className="text-2xl font-bold text-[#00E5FF]">
                  {producoes
                    .filter(p => p.status === 'preparacao')
                    .reduce((acc, p) => acc + (p.valor_total || 0), 0)
                    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <Factory className="w-8 h-8 text-[#00E5FF]" />
            </div>
          </div>
        </div>
      </div>

      {/* Aviso se não há produções */}
      {producoes.length === 0 && (
        <div className="bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-xl p-8 text-center">
          <Factory className="w-16 h-16 text-[#00E5FF] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma produção cadastrada</h3>
          <p className="text-gray-400">
            Quando você aprovar um orçamento, ele aparecerá automaticamente aqui para produção.
          </p>
        </div>
      )}

      {/* Lista de Produções */}
      <div className="grid grid-cols-1 gap-4">
        {producoes.map((producao) => (
          <div
            key={producao.id}
            className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">{producao.orcamento_numero}</h3>
                  {getStatusBadge(producao.status)}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <User className="w-4 h-4 text-[#00E5FF]" />
                    <span>{producao.cliente_nome}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4 text-[#00E5FF]" />
                    <span>Início: {formatDateBR(producao.data_inicio)}</span>
                  </div>
                  {producao.data_conclusao && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Concluído: {formatDateBR(producao.data_conclusao)}</span>
                    </div>
                  )}
                </div>

                {/* Itens da Produção */}
                {producao.itens && producao.itens.length > 0 && (
                  <div className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-4 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-[#00E5FF]" />
                      <p className="text-sm font-medium text-gray-300">Produtos:</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {producao.itens
                        .filter(item => item.tipo === 'produto')
                        .map((item, index) => (
                          <div key={index} className="flex justify-between text-sm p-2 bg-[#0D0D0D] rounded">
                            <span className="text-gray-300">{item.item_nome}</span>
                            <span className="text-[#00E5FF] font-medium">
                              {item.quantidade}x
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <span className="text-2xl font-bold text-[#00E5FF]">
                    {(producao.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-2">
                {producao.status === 'preparacao' && (
                  <>
                    <button
                      onClick={() => handleConcluirProducao(producao)}
                      disabled={processando === producao.id}
                      className="px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 hover:bg-green-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processando === producao.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Concluir Produção
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCancelarProducao(producao.id)}
                      className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Cancelar
                    </button>
                  </>
                )}
                {producao.status === 'concluido' && (
                  <div className="px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Produção Finalizada
                  </div>
                )}
                {producao.status === 'cancelado' && (
                  <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Produção Cancelada
                  </div>
                )}
              </div>
            </div>

            {producao.observacoes && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  <span className="font-medium">Observações:</span> {producao.observacoes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
