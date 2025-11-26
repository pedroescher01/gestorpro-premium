'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  ArrowUpDown,
  Calendar,
  DollarSign,
  User,
  Download,
  Send,
  FileCheck,
  Building2,
  Bell,
  BarChart3,
  Printer
} from 'lucide-react';
import { NotaFiscal, Cliente, Fornecedor, NotificacaoNFE } from '@/lib/types';
import { 
  getNotasFiscais, 
  createNotaFiscal, 
  deleteNotaFiscal, 
  emitirNotaFiscal, 
  cancelarNotaFiscal,
  exportarXML,
  exportarPDF,
  getNotificacoes,
  marcarNotificacaoLida,
  gerarRelatorioNFE
} from '@/lib/nfe';
import { getClientes } from '@/lib/storage';
import { getFornecedores } from '@/lib/fornecedores';
import { formatDateBR } from '@/lib/dateUtils';

// Interface para dados da empresa
interface DadosEmpresa {
  nome: string;
  cnpj: string;
  ie: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
}

export default function NFEPage() {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoNFE[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [viewingNota, setViewingNota] = useState<NotaFiscal | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [error, setError] = useState<string | null>(null);

  // Dados da empresa para NFE
  const [dadosEmpresa, setDadosEmpresa] = useState<DadosEmpresa>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dadosEmpresaNFE');
      return saved ? JSON.parse(saved) : {
        nome: '',
        cnpj: '',
        ie: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: ''
      };
    }
    return {
      nome: '',
      cnpj: '',
      ie: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: ''
    };
  });

  // Form state
  const [formData, setFormData] = useState({
    tipo_nota: 'saida' as 'entrada' | 'saida',
    natureza_operacao: 'Venda de mercadoria',
    
    // Emitente (empresa) - AGORA EDITÁVEL
    emitente_nome: '',
    emitente_cnpj: '',
    emitente_ie: '',
    emitente_endereco: '',
    emitente_cidade: '',
    emitente_estado: '',
    emitente_cep: '',
    
    // Destinatário
    destinatario_id: '',
    destinatario_nome: '',
    destinatario_cpf_cnpj: '',
    destinatario_razao_social: '',
    destinatario_nome_fantasia: '',
    destinatario_ie: '',
    destinatario_endereco: '',
    destinatario_numero: '',
    destinatario_complemento: '',
    destinatario_bairro: '',
    destinatario_cidade: '',
    destinatario_estado: '',
    destinatario_cep: '',
    destinatario_telefone: '',
    destinatario_email: '',
    
    valor_produtos: 0,
    valor_servicos: 0,
    valor_desconto: 0,
    valor_frete: 0,
    valor_seguro: 0,
    valor_outras_despesas: 0,
    observacoes: '',
    itens: [] as {
      descricao: string;
      quantidade: number;
      valor_unitario: number;
      valor_total: number;
      ncm: string;
      cfop: string;
      unidade: string;
    }[]
  });

  useEffect(() => {
    carregarDados();
    carregarNotificacoes();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [notasData, clientesData, fornecedoresData] = await Promise.all([
        getNotasFiscais().catch(err => {
          console.error('Erro ao buscar notas fiscais:', err);
          return [];
        }),
        getClientes().catch(err => {
          console.error('Erro ao buscar clientes:', err);
          return [];
        }),
        getFornecedores().catch(err => {
          console.error('Erro ao buscar fornecedores:', err);
          return [];
        })
      ]);

      setNotas(notasData);
      setClientes(clientesData);
      setFornecedores(fornecedoresData);

      if (clientesData.length === 0 && fornecedoresData.length === 0) {
        setError('Nenhum cliente ou fornecedor cadastrado. Cadastre-os primeiro para emitir NFEs.');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const carregarNotificacoes = async () => {
    try {
      const notifs = await getNotificacoes();
      setNotificacoes(notifs);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const handleDestinatarioChange = (id: string) => {
    const isCliente = formData.tipo_nota === 'saida';
    const destinatario = isCliente 
      ? clientes.find(c => c.id === id)
      : fornecedores.find(f => f.id === id);

    if (destinatario) {
      setFormData({
        ...formData,
        destinatario_id: id,
        destinatario_nome: destinatario.nome,
        destinatario_cpf_cnpj: 'cpf_cnpj' in destinatario ? destinatario.cpf_cnpj : destinatario.cnpj,
        destinatario_razao_social: destinatario.razao_social || '',
        destinatario_nome_fantasia: destinatario.nome_fantasia || '',
        destinatario_ie: destinatario.inscricao_estadual || '',
        destinatario_endereco: destinatario.endereco,
        destinatario_numero: destinatario.numero || '',
        destinatario_complemento: destinatario.complemento || '',
        destinatario_bairro: destinatario.bairro || '',
        destinatario_cidade: destinatario.cidade,
        destinatario_estado: destinatario.estado,
        destinatario_cep: destinatario.cep || '',
        destinatario_telefone: destinatario.telefone || '',
        destinatario_email: 'email' in destinatario ? destinatario.email : ''
      });
    }
  };

  const handleSalvarDadosEmpresa = () => {
    if (!dadosEmpresa.nome || !dadosEmpresa.cnpj || !dadosEmpresa.endereco || !dadosEmpresa.cidade || !dadosEmpresa.estado) {
      alert('Preencha todos os campos obrigatórios (Nome, CNPJ, Endereço, Cidade e Estado)');
      return;
    }

    localStorage.setItem('dadosEmpresaNFE', JSON.stringify(dadosEmpresa));
    setShowEmpresaModal(false);
    alert('Dados da empresa salvos com sucesso!');
  };

  const handleNovaNotaComDadosEmpresa = () => {
    if (!dadosEmpresa.nome || !dadosEmpresa.cnpj || !dadosEmpresa.endereco) {
      if (confirm('Os dados da empresa não estão completos. Deseja configurá-los agora?')) {
        setShowEmpresaModal(true);
      }
      return;
    }

    // Preencher dados do emitente com os dados salvos
    resetForm();
    setFormData(prev => ({
      ...prev,
      emitente_nome: dadosEmpresa.nome,
      emitente_cnpj: dadosEmpresa.cnpj,
      emitente_ie: dadosEmpresa.ie,
      emitente_endereco: dadosEmpresa.endereco,
      emitente_cidade: dadosEmpresa.cidade,
      emitente_estado: dadosEmpresa.estado,
      emitente_cep: dadosEmpresa.cep
    }));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.destinatario_id) {
        alert('Selecione um destinatário');
        return;
      }

      if (formData.itens.length === 0) {
        alert('Adicione pelo menos um item à nota fiscal');
        return;
      }

      // Validar campos obrigatórios do emitente
      if (!formData.emitente_nome || !formData.emitente_cnpj || !formData.emitente_endereco) {
        alert('Preencha todos os dados obrigatórios do emitente (sua empresa)');
        return;
      }

      // Validar campos obrigatórios do destinatário
      if (!formData.destinatario_endereco || !formData.destinatario_cidade || !formData.destinatario_estado) {
        alert('Preencha todos os dados obrigatórios do destinatário');
        return;
      }

      const valorTotal = calcularValorTotal();

      const notaData = {
        numero: `NFE-${Date.now()}`,
        serie: '1',
        tipo_nota: formData.tipo_nota,
        natureza_operacao: formData.natureza_operacao,
        
        // Emitente
        emitente_nome: formData.emitente_nome,
        emitente_cnpj: formData.emitente_cnpj,
        emitente_ie: formData.emitente_ie,
        emitente_endereco: formData.emitente_endereco,
        emitente_cidade: formData.emitente_cidade,
        emitente_estado: formData.emitente_estado,
        emitente_cep: formData.emitente_cep,
        
        // Destinatário - CORRIGIDO: usar destinatario_id para cliente_id sempre
        cliente_id: formData.destinatario_id,
        destinatario_id: formData.destinatario_id,
        destinatario_nome: formData.destinatario_nome,
        destinatario_cpf_cnpj: formData.destinatario_cpf_cnpj,
        destinatario_razao_social: formData.destinatario_razao_social,
        destinatario_nome_fantasia: formData.destinatario_nome_fantasia,
        destinatario_ie: formData.destinatario_ie,
        destinatario_endereco: formData.destinatario_endereco,
        destinatario_numero: formData.destinatario_numero,
        destinatario_complemento: formData.destinatario_complemento,
        destinatario_bairro: formData.destinatario_bairro,
        destinatario_cidade: formData.destinatario_cidade,
        destinatario_estado: formData.destinatario_estado,
        destinatario_cep: formData.destinatario_cep,
        destinatario_telefone: formData.destinatario_telefone,
        destinatario_email: formData.destinatario_email,
        
        // Valores
        valor_produtos: Number(formData.valor_produtos),
        valor_servicos: Number(formData.valor_servicos),
        valor_desconto: Number(formData.valor_desconto),
        valor_frete: Number(formData.valor_frete),
        valor_seguro: Number(formData.valor_seguro),
        valor_outras_despesas: Number(formData.valor_outras_despesas),
        valor_total: Number(valorTotal),
        
        data_emissao: new Date().toISOString().split('T')[0],
        status: 'rascunho' as const,
        observacoes: formData.observacoes,
        chave_acesso: '',
        protocolo_autorizacao: '',
        xml_nota: '',
        itens: formData.itens
      };

      await createNotaFiscal(notaData);
      await carregarDados();
      await carregarNotificacoes();
      resetForm();
      setShowModal(false);
      alert('Nota fiscal criada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar nota fiscal:', error);
      alert('Erro ao criar nota fiscal: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleEmitir = async (id: string) => {
    if (confirm('Deseja emitir esta nota fiscal? Esta ação não pode ser desfeita.')) {
      try {
        await emitirNotaFiscal(id);
        await carregarDados();
        await carregarNotificacoes();
        alert('Nota fiscal emitida com sucesso!');
      } catch (error: any) {
        console.error('Erro ao emitir nota fiscal:', error);
        alert('Erro ao emitir nota fiscal: ' + (error.message || 'Erro desconhecido'));
      }
    }
  };

  const handleCancelar = async (id: string) => {
    const motivo = prompt('Informe o motivo do cancelamento (mínimo 15 caracteres):');
    if (motivo && motivo.length >= 15) {
      try {
        await cancelarNotaFiscal(id, motivo);
        await carregarDados();
        await carregarNotificacoes();
        alert('Nota fiscal cancelada com sucesso!');
      } catch (error) {
        console.error('Erro ao cancelar nota fiscal:', error);
        alert('Erro ao cancelar nota fiscal');
      }
    } else if (motivo !== null) {
      alert('O motivo deve ter no mínimo 15 caracteres');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      try {
        await deleteNotaFiscal(id);
        await carregarDados();
      } catch (error: any) {
        console.error('Erro ao deletar nota fiscal:', error);
        alert(error.message || 'Erro ao deletar nota fiscal');
      }
    }
  };

  const handleView = (nota: NotaFiscal) => {
    setViewingNota(nota);
    setShowViewModal(true);
  };

  const handleExportarXML = (nota: NotaFiscal) => {
    if (nota.status !== 'emitida') {
      alert('Apenas notas emitidas podem ser exportadas');
      return;
    }
    exportarXML(nota);
  };

  const handleExportarPDF = (nota: NotaFiscal) => {
    if (nota.status !== 'emitida') {
      alert('Apenas notas emitidas podem ser exportadas');
      return;
    }
    exportarPDF(nota);
  };

  const resetForm = () => {
    setFormData({
      tipo_nota: 'saida',
      natureza_operacao: 'Venda de mercadoria',
      emitente_nome: '',
      emitente_cnpj: '',
      emitente_ie: '',
      emitente_endereco: '',
      emitente_cidade: '',
      emitente_estado: '',
      emitente_cep: '',
      destinatario_id: '',
      destinatario_nome: '',
      destinatario_cpf_cnpj: '',
      destinatario_razao_social: '',
      destinatario_nome_fantasia: '',
      destinatario_ie: '',
      destinatario_endereco: '',
      destinatario_numero: '',
      destinatario_complemento: '',
      destinatario_bairro: '',
      destinatario_cidade: '',
      destinatario_estado: '',
      destinatario_cep: '',
      destinatario_telefone: '',
      destinatario_email: '',
      valor_produtos: 0,
      valor_servicos: 0,
      valor_desconto: 0,
      valor_frete: 0,
      valor_seguro: 0,
      valor_outras_despesas: 0,
      observacoes: '',
      itens: []
    });
  };

  const adicionarItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, {
        descricao: '',
        quantidade: 1,
        valor_unitario: 0,
        valor_total: 0,
        ncm: '',
        cfop: formData.tipo_nota === 'saida' ? '5102' : '1102',
        unidade: 'UN'
      }]
    });
  };

  const removerItem = (index: number) => {
    setFormData({
      ...formData,
      itens: formData.itens.filter((_, i) => i !== index)
    });
  };

  const atualizarItem = (index: number, campo: string, valor: any) => {
    const novosItens = [...formData.itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    
    if (campo === 'quantidade' || campo === 'valor_unitario') {
      novosItens[index].valor_total = novosItens[index].quantidade * novosItens[index].valor_unitario;
    }
    
    setFormData({ ...formData, itens: novosItens });
  };

  const calcularValorTotal = () => {
    const valorItens = formData.itens.reduce((acc, item) => acc + item.valor_total, 0);
    return valorItens + 
           formData.valor_frete + 
           formData.valor_seguro + 
           formData.valor_outras_despesas - 
           formData.valor_desconto;
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredNotas = notas
    .filter(nota => {
      const matchSearch = nota.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nota.destinatario_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'todos' || nota.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.data_emissao).getTime();
      const dateB = new Date(b.data_emissao).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const getStatusBadge = (status: string) => {
    const badges = {
      rascunho: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: Clock, label: 'Rascunho' },
      emitida: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle, label: 'Emitida' },
      cancelada: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle, label: 'Cancelada' },
      rejeitada: { color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: AlertCircle, label: 'Rejeitada' },
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

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto mb-4"></div>
          <p className="text-gray-400 font-inter">Carregando notas fiscais...</p>
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
              <FileCheck className="w-8 h-8 text-[#00E5FF]" />
              Notas Fiscais Eletrônicas
            </h1>
            <p className="text-gray-400 font-inter">
              Sistema completo de emissão e gerenciamento de NFEs
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEmpresaModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 text-[#00E5FF] rounded-lg hover:bg-[#00E5FF]/10 transition-all duration-300 font-inter font-medium"
            >
              <Building2 className="w-5 h-5" />
              Dados da Empresa
            </button>
            <button
              onClick={() => setShowNotificacoes(true)}
              className="relative px-4 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white hover:bg-[#00E5FF]/10 transition-all"
            >
              <Bell className="w-5 h-5" />
              {notificacoesNaoLidas > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificacoesNaoLidas}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowRelatorio(true)}
              className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white hover:bg-[#00E5FF]/10 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              Relatórios
            </button>
            <button
              onClick={() => {
                if (clientes.length === 0 && fornecedores.length === 0) {
                  alert('Cadastre clientes ou fornecedores primeiro');
                  return;
                }
                handleNovaNotaComDadosEmpresa();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all duration-300 font-inter font-medium"
            >
              <Plus className="w-5 h-5" />
              Nova NFE
            </button>
          </div>
        </div>

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
          <div className="bg-[#0D0D0D] border border-gray-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-500">
                  {notas.filter(n => n.status === 'rascunho').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </div>
          <div className="bg-[#0D0D0D] border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Emitidas</p>
                <p className="text-2xl font-bold text-green-500">
                  {notas.filter(n => n.status === 'emitida').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-[#0D0D0D] border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Canceladas</p>
                <p className="text-2xl font-bold text-red-500">
                  {notas.filter(n => n.status === 'cancelada').length}
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
                  R$ {notas.filter(n => n.status === 'emitida').reduce((acc, n) => acc + n.valor_total, 0).toFixed(2)}
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
              placeholder="Buscar por número ou destinatário..."
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
              <option value="rascunho">Rascunho</option>
              <option value="emitida">Emitida</option>
              <option value="cancelada">Cancelada</option>
              <option value="rejeitada">Rejeitada</option>
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

      {/* Lista de Notas Fiscais */}
      <div className="grid grid-cols-1 gap-4">
        {filteredNotas.length === 0 ? (
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-12 text-center">
            <FileCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-inter">
              {notas.length === 0 
                ? 'Nenhuma nota fiscal cadastrada. Clique em "Nova NFE" para começar.'
                : 'Nenhuma nota fiscal encontrada com os filtros aplicados.'}
            </p>
          </div>
        ) : (
          filteredNotas.map((nota) => (
            <div
              key={nota.id}
              className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">{nota.numero}</h3>
                    {getStatusBadge(nota.status)}
                    <span className="px-3 py-1 text-xs rounded-full border bg-blue-500/10 text-blue-500 border-blue-500/20">
                      Série {nota.serie}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-4 h-4 text-[#00E5FF]" />
                      <span>{nota.destinatario_nome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4 text-[#00E5FF]" />
                      <span>{formatDateBR(nota.data_emissao)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Building2 className="w-4 h-4 text-[#00E5FF]" />
                      <span className="capitalize">{nota.tipo_nota === 'saida' ? 'Venda' : 'Compra'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <FileText className="w-4 h-4 text-[#00E5FF]" />
                      <span>{nota.natureza_operacao}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-[#00E5FF]">
                      R$ {nota.valor_total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleView(nota)}
                    className="px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  {nota.status === 'rascunho' && (
                    <button
                      onClick={() => handleEmitir(nota.id)}
                      className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 hover:bg-green-500/20 transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Emitir
                    </button>
                  )}
                  {nota.status === 'emitida' && (
                    <>
                      <button
                        onClick={() => handleExportarXML(nota)}
                        className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-500 hover:bg-blue-500/20 transition-all flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        XML
                      </button>
                      <button
                        onClick={() => handleExportarPDF(nota)}
                        className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-500 hover:bg-purple-500/20 transition-all flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        PDF
                      </button>
                      <button
                        onClick={() => handleCancelar(nota.id)}
                        className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-500 hover:bg-orange-500/20 transition-all flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancelar
                      </button>
                    </>
                  )}
                  {nota.status === 'rascunho' && (
                    <button
                      onClick={() => handleDelete(nota.id)}
                      className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Dados da Empresa */}
      {showEmpresaModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#00E5FF]" />
                Dados da Empresa
              </h2>
              <button
                onClick={() => setShowEmpresaModal(false)}
                className="text-gray-400 hover:text-white transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome/Razão Social *
                </label>
                <input
                  type="text"
                  value={dadosEmpresa.nome}
                  onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, nome: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Ex: Minha Empresa Ltda"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={dadosEmpresa.cnpj}
                    onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, cnpj: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Inscrição Estadual *
                  </label>
                  <input
                    type="text"
                    value={dadosEmpresa.ie}
                    onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, ie: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    placeholder="000.000.000.000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  value={dadosEmpresa.endereco}
                  onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, endereco: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={dadosEmpresa.cidade}
                    onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, cidade: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado (UF) *
                  </label>
                  <select
                    value={dadosEmpresa.estado}
                    onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, estado: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={dadosEmpresa.cep}
                    onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, cep: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={dadosEmpresa.telefone}
                    onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, telefone: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={dadosEmpresa.email}
                    onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, email: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    placeholder="contato@empresa.com.br"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEmpresaModal(false)}
                className="flex-1 px-6 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white hover:bg-[#00E5FF]/10 transition-all font-inter font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarDadosEmpresa}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all font-inter font-medium"
              >
                Salvar Dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova NFE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-6 w-full max-w-5xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-[#00E5FF]" />
                Nova Nota Fiscal Eletrônica
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Tipo de Nota */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Nota *
                  </label>
                  <select
                    required
                    value={formData.tipo_nota}
                    onChange={(e) => {
                      const tipo = e.target.value as 'entrada' | 'saida';
                      setFormData({ 
                        ...formData, 
                        tipo_nota: tipo,
                        natureza_operacao: tipo === 'saida' ? 'Venda de mercadoria' : 'Compra para comercialização',
                        destinatario_id: ''
                      });
                    }}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  >
                    <option value="saida">Saída (Venda)</option>
                    <option value="entrada">Entrada (Compra)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Natureza da Operação *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.natureza_operacao}
                    onChange={(e) => setFormData({ ...formData, natureza_operacao: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  />
                </div>
              </div>

              {/* EMITENTE (SUA EMPRESA) */}
              <div className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#00E5FF]" />
                  Dados do Emitente (Sua Empresa)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome/Razão Social *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emitente_nome}
                      onChange={(e) => setFormData({ ...formData, emitente_nome: e.target.value })}
                      placeholder="Ex: Minha Empresa LTDA"
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emitente_cnpj}
                      onChange={(e) => setFormData({ ...formData, emitente_cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Inscrição Estadual *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emitente_ie}
                      onChange={(e) => setFormData({ ...formData, emitente_ie: e.target.value })}
                      placeholder="000.000.000.000"
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CEP *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emitente_cep}
                      onChange={(e) => setFormData({ ...formData, emitente_cep: e.target.value })}
                      placeholder="00000-000"
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Endereço Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emitente_endereco}
                      onChange={(e) => setFormData({ ...formData, emitente_endereco: e.target.value })}
                      placeholder="Rua Exemplo, 123 - Bairro"
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emitente_cidade}
                      onChange={(e) => setFormData({ ...formData, emitente_cidade: e.target.value })}
                      placeholder="São Paulo"
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estado (UF) *
                    </label>
                    <select
                      required
                      value={formData.emitente_estado}
                      onChange={(e) => setFormData({ ...formData, emitente_estado: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    >
                      <option value="">Selecione...</option>
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Destinatário */}
              <div className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">
                  {formData.tipo_nota === 'saida' ? 'Cliente (Destinatário)' : 'Fornecedor (Remetente)'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Selecione {formData.tipo_nota === 'saida' ? 'o Cliente' : 'o Fornecedor'} *
                    </label>
                    <select
                      required
                      value={formData.destinatario_id}
                      onChange={(e) => handleDestinatarioChange(e.target.value)}
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    >
                      <option value="">Selecione...</option>
                      {formData.tipo_nota === 'saida' 
                        ? clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)
                        : fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)
                      }
                    </select>
                  </div>

                  {formData.destinatario_id && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nome/Razão Social</label>
                        <input
                          type="text"
                          value={formData.destinatario_nome}
                          readOnly
                          className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-gray-400 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">CPF/CNPJ</label>
                        <input
                          type="text"
                          value={formData.destinatario_cpf_cnpj}
                          readOnly
                          className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-gray-400 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-1">Endereço Completo</label>
                        <input
                          type="text"
                          value={`${formData.destinatario_endereco}, ${formData.destinatario_numero} - ${formData.destinatario_bairro}, ${formData.destinatario_cidade}/${formData.destinatario_estado}`}
                          readOnly
                          className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-gray-400 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Itens */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Itens da Nota Fiscal</h3>
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
                  {formData.itens.map((item, index) => (
                    <div key={index} className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Descrição *</label>
                          <input
                            type="text"
                            required
                            value={item.descricao}
                            onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">NCM</label>
                          <input
                            type="text"
                            value={item.ncm}
                            onChange={(e) => atualizarItem(index, 'ncm', e.target.value)}
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">CFOP *</label>
                          <input
                            type="text"
                            required
                            value={item.cfop}
                            onChange={(e) => atualizarItem(index, 'cfop', e.target.value)}
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Qtd *</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                            value={item.quantidade}
                            onChange={(e) => atualizarItem(index, 'quantidade', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Valor Unit. *</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={item.valor_unitario}
                            onChange={(e) => atualizarItem(index, 'valor_unitario', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#00E5FF]/10">
                        <div className="text-sm">
                          <span className="text-gray-400">Valor Total: </span>
                          <span className="text-[#00E5FF] font-bold">R$ {item.valor_total.toFixed(2)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerItem(index)}
                          className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-500 hover:bg-red-500/20 transition-all text-sm flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Valores Adicionais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Frete</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor_frete}
                    onChange={(e) => setFormData({ ...formData, valor_frete: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Seguro</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor_seguro}
                    onChange={(e) => setFormData({ ...formData, valor_seguro: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Outras Despesas</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor_outras_despesas}
                    onChange={(e) => setFormData({ ...formData, valor_outras_despesas: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Desconto</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor_desconto}
                    onChange={(e) => setFormData({ ...formData, valor_desconto: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all resize-none"
                />
              </div>

              {/* Valor Total */}
              {formData.itens.length > 0 && (
                <div className="p-4 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">Valor Total da Nota:</span>
                    <span className="text-3xl font-bold text-[#00E5FF]">
                      R$ {calcularValorTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#0D0D0D] pb-4">
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
                  Criar Nota Fiscal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar NFE */}
      {showViewModal && viewingNota && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-[#00E5FF]" />
                Detalhes da Nota Fiscal
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
                  <h3 className="text-xl font-bold text-white">{viewingNota.numero}</h3>
                  {getStatusBadge(viewingNota.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Emitente</p>
                    <p className="text-white font-medium">{viewingNota.emitente_nome}</p>
                    <p className="text-gray-400 text-xs">CNPJ: {viewingNota.emitente_cnpj}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Destinatário</p>
                    <p className="text-white font-medium">{viewingNota.destinatario_nome}</p>
                    <p className="text-gray-400 text-xs">CPF/CNPJ: {viewingNota.destinatario_cpf_cnpj}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Data de Emissão</p>
                    <p className="text-white font-medium">{formatDateBR(viewingNota.data_emissao)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Tipo</p>
                    <p className="text-white font-medium capitalize">{viewingNota.tipo_nota === 'saida' ? 'Venda' : 'Compra'}</p>
                  </div>
                  {viewingNota.chave_acesso && (
                    <div className="md:col-span-2">
                      <p className="text-gray-400">Chave de Acesso</p>
                      <p className="text-white font-medium font-mono text-xs">{viewingNota.chave_acesso}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Itens */}
              {viewingNota.itens && viewingNota.itens.length > 0 && (
                <div className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-white mb-4">Itens da Nota</h4>
                  <div className="space-y-3">
                    {viewingNota.itens.map((item, index) => (
                      <div key={index} className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-medium">{item.descricao}</p>
                            <p className="text-gray-400 text-xs">NCM: {item.ncm || 'N/A'} | CFOP: {item.cfop}</p>
                          </div>
                          <span className="text-[#00E5FF] font-bold">R$ {item.valor_total.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-400">
                          <span>Qtd: {item.quantidade}</span>
                          <span>Valor Unit.: R$ {item.valor_unitario.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Valores */}
              <div className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-6">
                <h4 className="text-lg font-bold text-white mb-4">Valores</h4>
                <div className="space-y-2 text-sm">
                  {viewingNota.valor_frete > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Frete:</span>
                      <span className="text-white">R$ {viewingNota.valor_frete.toFixed(2)}</span>
                    </div>
                  )}
                  {viewingNota.valor_seguro > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Seguro:</span>
                      <span className="text-white">R$ {viewingNota.valor_seguro.toFixed(2)}</span>
                    </div>
                  )}
                  {viewingNota.valor_desconto > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Desconto:</span>
                      <span className="text-red-500">- R$ {viewingNota.valor_desconto.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-[#00E5FF]/10">
                    <span className="text-white font-bold text-lg">Total:</span>
                    <span className="text-[#00E5FF] font-bold text-lg">R$ {viewingNota.valor_total.toFixed(2)}</span>
                  </div>
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

      {/* Modal Notificações */}
      {showNotificacoes && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bell className="w-6 h-6 text-[#00E5FF]" />
                Notificações
              </h2>
              <button
                onClick={() => setShowNotificacoes(false)}
                className="text-gray-400 hover:text-white transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {notificacoes.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhuma notificação</p>
              ) : (
                notificacoes.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border ${
                      notif.lida 
                        ? 'bg-[#1A1A1A] border-[#00E5FF]/10' 
                        : 'bg-[#00E5FF]/5 border-[#00E5FF]/20'
                    }`}
                    onClick={() => marcarNotificacaoLida(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      {notif.tipo === 'sucesso' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                      {notif.tipo === 'erro' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                      {notif.tipo === 'pendente' && <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-white font-medium">{notif.titulo}</p>
                        <p className="text-gray-400 text-sm">{notif.mensagem}</p>
                        <p className="text-gray-500 text-xs mt-1">{formatDateBR(notif.data)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
