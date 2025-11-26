'use client';

import { useState, useEffect } from 'react';
import { 
  Factory, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { Fornecedor } from '@/lib/types';
import { 
  getFornecedores, 
  createFornecedor, 
  updateFornecedor, 
  deleteFornecedor 
} from '@/lib/fornecedores';

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    telefone: '',
    email: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    chave_pix: '',
    observacoes: '',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const carregarFornecedores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFornecedores();
      setFornecedores(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      setError('Erro ao carregar fornecedores. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      if (editingFornecedor) {
        await updateFornecedor(editingFornecedor.id, formData);
        setSuccess('Fornecedor atualizado com sucesso!');
      } else {
        await createFornecedor(formData);
        setSuccess('Fornecedor cadastrado com sucesso!');
      }
      
      await carregarFornecedores();
      resetForm();
      setShowModal(false);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Erro ao salvar fornecedor:', error);
      setError(error.message || 'Erro ao salvar fornecedor. Tente novamente.');
    }
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setFormData({
      nome: fornecedor.nome,
      razao_social: fornecedor.razao_social || '',
      nome_fantasia: fornecedor.nome_fantasia || '',
      cnpj: fornecedor.cnpj,
      inscricao_estadual: fornecedor.inscricao_estadual || '',
      telefone: fornecedor.telefone || '',
      email: fornecedor.email || '',
      endereco: fornecedor.endereco,
      numero: fornecedor.numero || '',
      complemento: fornecedor.complemento || '',
      bairro: fornecedor.bairro || '',
      cidade: fornecedor.cidade,
      estado: fornecedor.estado,
      cep: fornecedor.cep || '',
      chave_pix: fornecedor.chave_pix || '',
      observacoes: fornecedor.observacoes || '',
      status: fornecedor.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        await deleteFornecedor(id);
        setSuccess('Fornecedor excluído com sucesso!');
        await carregarFornecedores();
        setTimeout(() => setSuccess(null), 3000);
      } catch (error: any) {
        console.error('Erro ao deletar fornecedor:', error);
        setError(error.message || 'Erro ao deletar fornecedor');
      }
    }
  };

  const handleCopyPix = async (chavePix: string, fornecedorId: string) => {
    try {
      await navigator.clipboard.writeText(chavePix);
      setCopiedPix(fornecedorId);
      setTimeout(() => setCopiedPix(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar chave PIX:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      inscricao_estadual: '',
      telefone: '',
      email: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      chave_pix: '',
      observacoes: '',
      status: 'ativo'
    });
    setEditingFornecedor(null);
  };

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.cnpj.includes(searchTerm) ||
    fornecedor.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto mb-4"></div>
          <p className="text-gray-400 font-inter">Carregando fornecedores...</p>
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
              <Factory className="w-8 h-8 text-[#00E5FF]" />
              Fornecedores
            </h1>
            <p className="text-gray-400 font-inter">
              Gerencie seus fornecedores e parceiros comerciais
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all duration-300 font-inter font-medium"
          >
            <Plus className="w-5 h-5" />
            Novo Fornecedor
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <p className="font-inter">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <p className="font-inter">{success}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Fornecedores</p>
                <p className="text-2xl font-bold text-[#00E5FF]">
                  {fornecedores.length}
                </p>
              </div>
              <Factory className="w-8 h-8 text-[#00E5FF]" />
            </div>
          </div>
          <div className="bg-[#0D0D0D] border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ativos</p>
                <p className="text-2xl font-bold text-green-500">
                  {fornecedores.filter(f => f.status === 'ativo').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-[#0D0D0D] border border-gray-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Inativos</p>
                <p className="text-2xl font-bold text-gray-500">
                  {fornecedores.filter(f => f.status === 'inativo').length}
                </p>
              </div>
              <X className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, CNPJ ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-all"
          />
        </div>
      </div>

      {/* Lista de Fornecedores */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFornecedores.length === 0 ? (
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-12 text-center">
            <Factory className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-inter">
              {fornecedores.length === 0 
                ? 'Nenhum fornecedor cadastrado. Clique em "Novo Fornecedor" para começar.'
                : 'Nenhum fornecedor encontrado com os filtros aplicados.'}
            </p>
          </div>
        ) : (
          filteredFornecedores.map((fornecedor) => (
            <div
              key={fornecedor.id}
              className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">{fornecedor.nome}</h3>
                    <span className={`px-3 py-1 text-xs rounded-full border ${
                      fornecedor.status === 'ativo'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                    }`}>
                      {fornecedor.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Building2 className="w-4 h-4 text-[#00E5FF]" />
                      <span>{fornecedor.cnpj}</span>
                    </div>
                    {fornecedor.telefone && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone className="w-4 h-4 text-[#00E5FF]" />
                        <span>{fornecedor.telefone}</span>
                      </div>
                    )}
                    {fornecedor.email && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail className="w-4 h-4 text-[#00E5FF]" />
                        <span>{fornecedor.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4 text-[#00E5FF]" />
                      <span>{fornecedor.cidade}/{fornecedor.estado}</span>
                    </div>
                    {fornecedor.chave_pix && (
                      <div className="flex items-center gap-2 text-gray-400 sm:col-span-2">
                        <span className="text-[#00E5FF] font-medium">PIX:</span>
                        <span className="truncate max-w-[200px]">{fornecedor.chave_pix}</span>
                        <button
                          onClick={() => handleCopyPix(fornecedor.chave_pix!, fornecedor.id)}
                          className="ml-2 p-1 hover:bg-[#00E5FF]/10 rounded transition-all"
                          title="Copiar chave PIX"
                        >
                          {copiedPix === fornecedor.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-[#00E5FF]" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(fornecedor)}
                    className="px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(fornecedor.id)}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Novo/Editar Fornecedor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-6 w-full max-w-4xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Factory className="w-6 h-6 text-[#00E5FF]" />
                {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Dados Básicos */}
              <div className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">Dados Básicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome/Razão Social *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      value={formData.nome_fantasia}
                      onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
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
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      placeholder="00.000.000/0000-00"
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Inscrição Estadual
                    </label>
                    <input
                      type="text"
                      value={formData.inscricao_estadual}
                      onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Chave PIX
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.chave_pix}
                        onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                        placeholder="CPF, CNPJ, E-mail, Telefone ou Chave Aleatória"
                        className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all pr-12"
                      />
                      {formData.chave_pix && (
                        <button
                          type="button"
                          onClick={() => handleCopyPix(formData.chave_pix, 'form')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[#00E5FF]/10 rounded transition-all"
                          title="Copiar chave PIX"
                        >
                          {copiedPix === 'form' ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-[#00E5FF]" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Adicione a chave PIX do fornecedor para facilitar pagamentos
                    </p>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Logradouro *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={formData.complemento}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      placeholder="00000-000"
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
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estado *
                    </label>
                    <select
                      required
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
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

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF] transition-all resize-none"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#0D0D0D] pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white hover:bg-[#00E5FF]/10 transition-all font-inter font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all font-inter font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingFornecedor ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
