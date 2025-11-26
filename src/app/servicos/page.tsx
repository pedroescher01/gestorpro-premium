'use client';

import { Briefcase, Plus, Search, Edit, Trash2, Clock, DollarSign, Tag, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getServicos, addServico, updateServico, deleteServico } from '@/lib/storage';
import { Servico } from '@/lib/types';

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    duracao: '',
    categoria: '',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  useEffect(() => {
    loadServicos();
  }, []);

  const loadServicos = async () => {
    setLoading(true);
    const data = await getServicos();
    setServicos(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingServico) {
        await updateServico(editingServico.id, {
          ...formData,
          preco: parseFloat(formData.preco),
          duracao: parseInt(formData.duracao)
        });
      } else {
        await addServico({
          ...formData,
          preco: parseFloat(formData.preco),
          duracao: parseInt(formData.duracao)
        });
      }
      setShowModal(false);
      setEditingServico(null);
      resetForm();
      loadServicos();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      alert('Erro ao salvar serviço. Verifique os dados e tente novamente.');
    }
  };

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico);
    setFormData({
      nome: servico.nome,
      descricao: servico.descricao,
      preco: servico.preco.toString(),
      duracao: servico.duracao.toString(),
      categoria: servico.categoria,
      status: servico.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteServico(id);
        loadServicos();
      } catch (error) {
        console.error('Erro ao deletar serviço:', error);
        alert('Erro ao deletar serviço.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco: '',
      duracao: '',
      categoria: '',
      status: 'ativo'
    });
  };

  const filteredServicos = servicos.filter(servico =>
    servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Briefcase className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-inter">Serviços</h1>
        </div>
        <p className="text-gray-400 text-sm">Gerencie os serviços oferecidos</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
          />
        </div>
        <button 
          onClick={() => {
            setEditingServico(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Serviço</span>
        </button>
      </div>

      {/* Lista de Serviços */}
      {filteredServicos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mb-6">
            <Briefcase className="w-10 h-10 text-[#00E5FF]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum serviço cadastrado</h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Comece adicionando seu primeiro serviço ao sistema
          </p>
          <button 
            onClick={() => {
              setEditingServico(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Primeiro Serviço</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServicos.map((servico) => (
            <div 
              key={servico.id} 
              className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-6 hover:border-[#00E5FF]/40 hover:shadow-lg hover:shadow-[#00E5FF]/10 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20">
                      <Briefcase className="w-4 h-4 text-[#00E5FF]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{servico.nome}</h3>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="mb-3">
                    {servico.status === 'ativo' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                        <XCircle className="w-3 h-3" />
                        Inativo
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(servico)}
                    className="p-2 hover:bg-[#00E5FF]/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[#00E5FF]" />
                  </button>
                  <button
                    onClick={() => handleDelete(servico.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Descrição */}
              <div className="bg-[#0D0D0D]/50 border border-[#00E5FF]/10 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-300 line-clamp-2">{servico.descricao}</p>
              </div>

              {/* Categoria */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-[#00E5FF]" />
                  <span className="text-xs text-gray-400">Categoria</span>
                </div>
                <span className="inline-block px-3 py-1 text-sm rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                  {servico.categoria}
                </span>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0D0D0D]/50 border border-[#00E5FF]/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-xs text-gray-400">Duração</span>
                  </div>
                  <p className="text-sm text-white font-bold">{servico.duracao} min</p>
                </div>
                
                <div className="bg-gradient-to-br from-[#00E5FF]/10 to-blue-600/10 border border-[#00E5FF]/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-xs text-gray-400">Preço</span>
                  </div>
                  <p className="text-lg font-bold text-[#00E5FF]">
                    R$ {servico.preco.toFixed(2)}
                  </p>
                </div>
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
              {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
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
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duração (min)</label>
                  <input
                    type="number"
                    required
                    value={formData.duracao}
                    onChange={(e) => setFormData({...formData, duracao: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
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
                    setEditingServico(null);
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
                  {editingServico ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
