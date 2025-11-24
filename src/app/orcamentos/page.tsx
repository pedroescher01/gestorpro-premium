'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  ArrowUpDown,
  Calendar,
  DollarSign,
  User,
  Package,
  Briefcase,
  Factory
} from 'lucide-react';
import { Orcamento, Cliente, Produto, Servico } from '@/lib/types';
import { getOrcamentos, createOrcamento, updateOrcamento, deleteOrcamento, aprovarOrcamento, getOrcamentoItens, createOrcamentoItem, deleteOrcamentoItem } from '@/lib/orcamentos';
import { getClientes, getProdutos, getServicos } from '@/lib/storage';
import { formatDateBR } from '@/lib/dateUtils';

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [viewingOrcamento, setViewingOrcamento] = useState<Orcamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    cliente_id: '',
    descricao: '',
    data_validade: '',
    observacoes: '',
    tipo: 'produto' as 'produto' | 'servico' | 'misto',
    requer_mao_obra: false,
    prazo_entrega: '',
  });

  const [itensOrcamento, setItensOrcamento] = useState<{
    tipo: 'produto' | 'servico';
    item_id: string;
    item_nome: string;
    quantidade: number;
    preco_unitario: number;
  }[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando dados...');
      
      // Carregar dados em paralelo
      const [orcamentosData, clientesData, produtosData, servicosData] = await Promise.all([
        getOrcamentos().catch(err => {
          console.error('Erro ao buscar orçamentos:', err);
          return [];
        }),
        getClientes().catch(err => {
          console.error('Erro ao buscar clientes:', err);
          return [];
        }),
        getProdutos().catch(err => {
          console.error('Erro ao buscar produtos:', err);
          return [];
        }),
        getServicos().catch(err => {
          console.error('Erro ao buscar serviços:', err);
          return [];
        })
      ]);

      console.log('✅ Dados carregados:', {
        orcamentos: orcamentosData.length,
        clientes: clientesData.length,
        produtos: produtosData.length,
        servicos: servicosData.length
      });

      // Enriquecer orçamentos com nome do cliente
      const orcamentosEnriquecidos = orcamentosData.map(orc => ({
        ...orc,
        cliente_nome: clientesData.find(c => c.id === orc.cliente_id)?.nome || 'Cliente não encontrado'
      }));

      setOrcamentos(orcamentosEnriquecidos);
      setClientes(clientesData);
      setProdutos(produtosData);
      setServicos(servicosData);

      // Mostrar aviso se não houver dados
      if (clientesData.length === 0) {
        setError('Nenhum cliente cadastrado. Cadastre clientes na aba "Clientes" primeiro.');
      } else if (produtosData.length === 0 && servicosData.length === 0) {
        setError('Nenhum produto ou serviço cadastrado. Cadastre produtos/serviços primeiro.');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('📝 Iniciando criação de orçamento...');
      
      // Validações
      if (!formData.cliente_id) {
        alert('Selecione um cliente');
        return;
      }

      if (itensOrcamento.length === 0) {
        alert('Adicione pelo menos um item ao orçamento');
        return;
      }

      // Validar se todos os itens têm item_id selecionado
      const itemInvalido = itensOrcamento.find(item => !item.item_id);
      if (itemInvalido) {
        alert('Selecione um produto/serviço para todos os itens');
        return;
      }

      // Validar datas
      if (!formData.data_validade) {
        alert('Informe a data de validade do orçamento');
        return;
      }

      if (!formData.prazo_entrega) {
        alert('Informe o prazo de entrega');
        return;
      }

      const valorTotal = itensOrcamento.reduce((acc, item) => 
        acc + (item.quantidade * item.preco_unitario), 0
      );

      // Preparar dados do orçamento com validação de campos
      const orcamentoData = {
        cliente_id: String(formData.cliente_id), // Garantir que é string
        descricao: String(formData.descricao || ''),
        data_validade: formData.data_validade,
        observacoes: String(formData.observacoes || ''),
        tipo: formData.tipo,
        requer_mao_obra: Boolean(formData.requer_mao_obra),
        prazo_entrega: formData.prazo_entrega,
        numero: `ORC-${Date.now()}`,
        valor_total: Number(valorTotal),
        data_criacao: new Date().toISOString().split('T')[0],
        status: 'em_analise' as const,
      };

      console.log('📦 Dados do orçamento preparados:', orcamentoData);

      if (editingOrcamento) {
        await updateOrcamento(editingOrcamento.id, orcamentoData);
        console.log('✅ Orçamento atualizado com sucesso!');
      } else {
        const novoOrcamento = await createOrcamento(orcamentoData);
        console.log('✅ Orçamento criado:', novoOrcamento);
        
        // Criar itens do orçamento
        console.log('📦 Criando itens do orçamento...');
        for (const item of itensOrcamento) {
          await createOrcamentoItem({
            orcamento_id: novoOrcamento.id,
            tipo: item.tipo,
            item_id: String(item.item_id),
            item_nome: String(item.item_nome),
            quantidade: Number(item.quantidade),
            preco_unitario: Number(item.preco_unitario),
            subtotal: Number(item.quantidade * item.preco_unitario)
          });
        }
        console.log('✅ Itens criados com sucesso!');
      }

      await carregarDados();
      resetForm();
      setShowModal(false);
      alert('Orçamento salvo com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao salvar orçamento:', error);
      console.error('Detalhes completos do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        stack: error.stack
      });
      
      // Mensagem de erro mais detalhada e útil
      let mensagemErro = 'Erro ao salvar orçamento';
      
      if (error.message) {
        if (error.message.includes('violates foreign key constraint')) {
          mensagemErro = 'Erro: Cliente selecionado não existe no banco de dados. Por favor, recarregue a página e tente novamente.';
        } else if (error.message.includes('null value')) {
          mensagemErro = 'Erro: Alguns campos obrigatórios estão vazios. Verifique todos os campos e tente novamente.';
        } else if (error.message.includes('invalid input syntax')) {
          mensagemErro = 'Erro: Formato de dados inválido. Verifique as datas e valores numéricos.';
        } else {
          mensagemErro += `: ${error.message}`;
        }
      }
      
      if (error.hint) {
        mensagemErro += `\n\nDica: ${error.hint}`;
      }
      
      alert(mensagemErro);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await deleteOrcamento(id);
        await carregarDados();
      } catch (error) {
        console.error('Erro ao deletar orçamento:', error);
        alert('Erro ao deletar orçamento');
      }
    }
  };

  const handleAprovar = async (id: string) => {
    if (confirm('Deseja aprovar este orçamento e enviar para produção?')) {
      try {
        await aprovarOrcamento(id);
        await carregarDados();
        alert('Orçamento aprovado e enviado para produção!');
      } catch (error) {
        console.error('Erro ao aprovar orçamento:', error);
        alert('Erro ao aprovar orçamento');
      }
    }
  };

  const handleRejeitar = async (id: string) => {
    if (confirm('Tem certeza que deseja rejeitar este orçamento?')) {
      try {
        await updateOrcamento(id, { status: 'rejeitado' });
        await carregarDados();
      } catch (error) {
        console.error('Erro ao rejeitar orçamento:', error);
        alert('Erro ao rejeitar orçamento');
      }
    }
  };

  const handleView = async (orcamento: Orcamento) => {
    setViewingOrcamento(orcamento);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      descricao: '',
      data_validade: '',
      observacoes: '',
      tipo: 'produto',
      requer_mao_obra: false,
      prazo_entrega: '',
    });
    setItensOrcamento([]);
    setEditingOrcamento(null);
  };

  const adicionarItem = () => {
    setItensOrcamento([...itensOrcamento, {
      tipo: 'produto',
      item_id: '',
      item_nome: '',
      quantidade: 1,
      preco_unitario: 0
    }]);
  };

  const removerItem = (index: number) => {
    setItensOrcamento(itensOrcamento.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, campo: string, valor: any) => {
    const novosItens = [...itensOrcamento];
    
    if (campo === 'item_id') {
      const item = novosItens[index].tipo === 'produto' 
        ? produtos.find(p => p.id === valor)
        : servicos.find(s => s.id === valor);
      
      if (item) {
        novosItens[index] = {
          ...novosItens[index],
          item_id: valor,
          item_nome: item.nome,
          preco_unitario: item.preco
        };
      }
    } else {
      novosItens[index] = { ...novosItens[index], [campo]: valor };
    }
    
    setItensOrcamento(novosItens);
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredOrcamentos = orcamentos
    .filter(orc => {
      const matchSearch = orc.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orc.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orc.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'todos' || orc.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.data_criacao).getTime();
      const dateB = new Date(b.data_criacao).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const getStatusBadge = (status: string) => {
    const badges = {
      em_analise: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock, label: 'Em Análise' },
      aprovado: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle, label: 'Aprovado' },
      rejeitado: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle, label: 'Rejeitado' },
      expirado: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: AlertCircle, label: 'Expirado' },
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
          <p className="text-gray-400 font-inter">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-inter font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#00E5FF]" />
              Orçamentos
            </h1>
            <p className="text-gray-400 font-inter">
              Gerencie todos os orçamentos da sua empresa
            </p>
          </div>
          <button
            onClick={() => {
              if (clientes.length === 0) {
                alert('Cadastre clientes primeiro na aba "Clientes"');
                return;
              }
              if (produtos.length === 0 && servicos.length === 0) {
                alert('Cadastre produtos ou serviços primeiro');
                return;
              }
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all duration-300 font-inter font-medium"
          >
            <Plus className="w-5 h-5" />
            Novo Orçamento
          </button>
        </div>

        {/* Aviso de erro */}
        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertCircle className="w-5 h-5" />
              <p className="font-inter">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0D0D0D] border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Em Análise</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {orcamentos.filter(o => o.status === 'em_analise').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-[#0D0D0D] border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Aprovados</p>
                <p className="text-2xl font-bold text-green-500">
                  {orcamentos.filter(o => o.status === 'aprovado').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-[#0D0D0D] border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejeitados</p>
                <p className="text-2xl font-bold text-red-500">
                  {orcamentos.filter(o => o.status === 'rejeitado').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Valor Total</p>
                <p className="text-2xl font-bold text-[#00E5FF]">
                  R$ {orcamentos.reduce((acc, o) => acc + o.valor_total, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#00E5FF]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número, cliente ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
            >
              <option value="todos">Todos os Status</option>
              <option value="em_analise">Em Análise</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
              <option value="expirado">Expirado</option>
            </select>
            <button
              onClick={toggleSort}
              className="px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white hover:bg-[#00E5FF]/10 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrcamentos.length === 0 ? (
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-inter">
              {orcamentos.length === 0 
                ? 'Nenhum orçamento cadastrado. Clique em "Novo Orçamento" para começar.'
                : 'Nenhum orçamento encontrado com os filtros aplicados.'}
            </p>
          </div>
        ) : (
          filteredOrcamentos.map((orcamento) => (
            <div
              key={orcamento.id}
              className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">{orcamento.numero}</h3>
                    {getStatusBadge(orcamento.status)}
                    {orcamento.requer_mao_obra && (
                      <span className="px-3 py-1 text-xs rounded-full border bg-purple-500/10 text-purple-500 border-purple-500/20 flex items-center gap-1">
                        <Factory className="w-3 h-3" />
                        Mão de Obra
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-4 h-4 text-[#00E5FF]" />
                      <span>{orcamento.cliente_nome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4 text-[#00E5FF]" />
                      <span>{formatDateBR(orcamento.data_criacao)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <AlertCircle className="w-4 h-4 text-[#00E5FF]" />
                      <span>Validade: {formatDateBR(orcamento.data_validade)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      {orcamento.tipo === 'produto' ? <Package className="w-4 h-4 text-[#00E5FF]" /> : 
                       orcamento.tipo === 'servico' ? <Briefcase className="w-4 h-4 text-[#00E5FF]" /> :
                       <Package className="w-4 h-4 text-[#00E5FF]" />}
                      <span className="capitalize">{orcamento.tipo}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 mt-2 line-clamp-2">{orcamento.descricao}</p>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-[#00E5FF]">
                      R$ {orcamento.valor_total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleView(orcamento)}
                    className="px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  {orcamento.status === 'em_analise' && (
                    <>
                      <button
                        onClick={() => handleAprovar(orcamento.id)}
                        className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 hover:bg-green-500/20 transition-all flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleRejeitar(orcamento.id)}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeitar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(orcamento.id)}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Novo/Editar Orçamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#00E5FF]" />
                {editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cliente *
                  </label>
                  <select
                    required
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  >
                    <option value="produto">Produto</option>
                    <option value="servico">Serviço</option>
                    <option value="misto">Misto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Validade *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data_validade}
                    onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prazo de Entrega *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.prazo_entrega}
                    onChange={(e) => setFormData({ ...formData, prazo_entrega: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição *
                </label>
                <textarea
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all resize-none"
                  placeholder="Descreva o orçamento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all resize-none"
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requer_mao_obra"
                  checked={formData.requer_mao_obra}
                  onChange={(e) => setFormData({ ...formData, requer_mao_obra: e.target.checked })}
                  className="w-4 h-4 rounded border-[#00E5FF]/20 bg-[#1A1A1A] text-[#00E5FF] focus:ring-[#00E5FF]"
                />
                <label htmlFor="requer_mao_obra" className="text-sm text-gray-300">
                  Requer mão de obra (serviço com execução)
                </label>
              </div>

              {/* Itens do Orçamento */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Itens do Orçamento</h3>
                  <button
                    type="button"
                    onClick={adicionarItem}
                    className="px-4 py-2 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-lg text-[#00E5FF] hover:bg-[#00E5FF]/20 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Item
                  </button>
                </div>

                <div className="space-y-3">
                  {itensOrcamento.map((item, index) => (
                    <div key={index} className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                          <select
                            value={item.tipo}
                            onChange={(e) => atualizarItem(index, 'tipo', e.target.value)}
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                          >
                            <option value="produto">Produto</option>
                            <option value="servico">Serviço</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Item</label>
                          <select
                            value={item.item_id}
                            onChange={(e) => atualizarItem(index, 'item_id', e.target.value)}
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                          >
                            <option value="">Selecione</option>
                            {item.tipo === 'produto' 
                              ? produtos.map(p => <option key={p.id} value={p.id}>{p.nome} - R$ {p.preco.toFixed(2)}</option>)
                              : servicos.map(s => <option key={s.id} value={s.id}>{s.nome} - R$ {s.preco.toFixed(2)}</option>)
                            }
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Qtd</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">Subtotal</label>
                            <div className="px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-[#00E5FF] text-sm font-bold">
                              R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removerItem(index)}
                            className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded text-red-500 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {itensOrcamento.length > 0 && (
                  <div className="mt-4 p-4 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">Valor Total:</span>
                      <span className="text-2xl font-bold text-[#00E5FF]">
                        R$ {itensOrcamento.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white hover:bg-[#00E5FF]/10 transition-all font-inter font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all font-inter font-medium"
                >
                  {editingOrcamento ? 'Atualizar' : 'Criar Orçamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar Orçamento */}
      {showViewModal && viewingOrcamento && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#00E5FF]" />
                Detalhes do Orçamento
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-white transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Cabeçalho */}
              <div className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{viewingOrcamento.numero}</h3>
                  {getStatusBadge(viewingOrcamento.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Cliente</p>
                    <p className="text-white font-medium">{viewingOrcamento.cliente_nome}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Tipo</p>
                    <p className="text-white font-medium capitalize">{viewingOrcamento.tipo}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Data de Criação</p>
                    <p className="text-white font-medium">{formatDateBR(viewingOrcamento.data_criacao)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Validade</p>
                    <p className="text-white font-medium">{formatDateBR(viewingOrcamento.data_validade)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Prazo de Entrega</p>
                    <p className="text-white font-medium">{formatDateBR(viewingOrcamento.prazo_entrega)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Requer Mão de Obra</p>
                    <p className="text-white font-medium">{viewingOrcamento.requer_mao_obra ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-6">
                <h4 className="text-lg font-bold text-white mb-2">Descrição</h4>
                <p className="text-gray-300">{viewingOrcamento.descricao}</p>
              </div>

              {/* Observações */}
              {viewingOrcamento.observacoes && (
                <div className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-white mb-2">Observações</h4>
                  <p className="text-gray-300">{viewingOrcamento.observacoes}</p>
                </div>
              )}

              {/* Valor Total */}
              <div className="bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">Valor Total:</span>
                  <span className="text-3xl font-bold text-[#00E5FF]">
                    R$ {viewingOrcamento.valor_total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-6 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white hover:bg-[#00E5FF]/10 transition-all font-inter font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
