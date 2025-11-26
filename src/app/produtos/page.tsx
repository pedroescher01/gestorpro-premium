'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Search, DollarSign, Layers, Edit, Trash2, ArrowUpDown, Barcode, User, Tag, Calendar } from 'lucide-react';
import { getProdutos, addProduto, updateProduto, deleteProduto } from '@/lib/storage';
import { Produto } from '@/lib/types';

type SortOrder = 'asc' | 'desc';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    categoria: '',
    fornecedor: '',
    codigo_barras: '',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const produtosCarregados = await getProdutos();
      setProdutos(produtosCarregados);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.preco || !formData.estoque) {
      alert('Nome, preço e estoque são obrigatórios');
      return;
    }

    try {
      const produtoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        estoque: parseInt(formData.estoque),
        categoria: formData.categoria || 'Geral',
        fornecedor: formData.fornecedor || '',
        codigo_barras: formData.codigo_barras || '',
        status: formData.status
      };

      if (editingProduto) {
        await updateProduto(editingProduto.id, produtoData);
      } else {
        await addProduto({
          ...produtoData,
          data_cadastro: new Date().toISOString()
        });
      }

      await carregarProdutos();
      setShowModal(false);
      setEditingProduto(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Tente novamente.');
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: produto.preco.toString(),
      estoque: produto.estoque.toString(),
      categoria: produto.categoria || '',
      fornecedor: produto.fornecedor || '',
      codigo_barras: produto.codigo_barras || '',
      status: produto.status
    });
    setShowModal(true);
  };

  const handleDeleteProduto = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduto(id);
        await carregarProdutos();
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
        alert('Erro ao deletar produto. Tente novamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco: '',
      estoque: '',
      categoria: '',
      fornecedor: '',
      codigo_barras: '',
      status: 'ativo'
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const produtosFiltrados = produtos
    .filter(produto =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00E5FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-inter">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-inter font-bold text-white mb-2">
            Produtos
          </h1>
          <p className="text-gray-400 font-inter">
            Gerencie seu inventário de produtos
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduto(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-[#00E5FF] text-black px-6 py-3 rounded-lg font-inter font-semibold hover:bg-[#00E5FF]/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar produtos por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-lg pl-12 pr-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
          />
        </div>
        <button
          onClick={toggleSortOrder}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#00E5FF]/20 text-white rounded-lg font-medium hover:bg-[#00E5FF]/10 transition-all"
        >
          <ArrowUpDown className="w-5 h-5" />
          <span>A-Z {sortOrder === 'asc' ? '↓' : '↑'}</span>
        </button>
      </div>

      {/* Produtos Grid */}
      {produtosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-inter font-bold text-white mb-2">
            Nenhum produto cadastrado
          </h3>
          <p className="text-gray-400 font-inter mb-6">
            Comece adicionando seu primeiro produto
          </p>
          <button
            onClick={() => {
              setEditingProduto(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#00E5FF] text-black px-6 py-3 rounded-lg font-inter font-semibold hover:bg-[#00E5FF]/90 transition-all"
          >
            <Plus className="w-5 h-5" />
            Adicionar Produto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0D0D0D] border border-[#00E5FF]/20 rounded-xl p-6 hover:border-[#00E5FF]/50 hover:shadow-lg hover:shadow-[#00E5FF]/10 transition-all duration-300"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#00E5FF]/20 to-[#00E5FF]/5 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-7 h-7 text-[#00E5FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-inter font-bold text-white mb-1 truncate">{produto.nome}</h3>
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span className="text-xs text-[#00E5FF] font-inter font-medium">{produto.categoria}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleEdit(produto)}
                    className="text-[#00E5FF] hover:text-[#00E5FF]/80 hover:bg-[#00E5FF]/10 p-2 rounded-lg transition-all"
                    title="Editar produto"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduto(produto.id)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Descrição */}
              {produto.descricao && (
                <div className="mb-4 p-3 bg-[#0D0D0D]/50 rounded-lg border border-[#00E5FF]/5">
                  <p className="text-sm text-gray-300 font-inter leading-relaxed line-clamp-3">
                    {produto.descricao}
                  </p>
                </div>
              )}

              {/* Informações Principais */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-[#00E5FF]/5 rounded-lg border border-[#00E5FF]/10">
                  <div className="flex items-center gap-2 text-gray-400">
                    <DollarSign className="w-5 h-5 text-[#00E5FF]" />
                    <span className="text-sm font-inter font-medium">Preço Unitário</span>
                  </div>
                  <span className="text-[#00E5FF] font-inter font-bold text-lg">
                    R$ {produto.preco.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0D0D0D]/50 rounded-lg border border-[#00E5FF]/10">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Layers className="w-5 h-5 text-white" />
                    <span className="text-sm font-inter font-medium">Estoque Disponível</span>
                  </div>
                  <span className={`font-inter font-bold text-lg ${produto.estoque < 10 ? 'text-orange-500' : 'text-white'}`}>
                    {produto.estoque} un.
                  </span>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="space-y-2 pt-4 border-t border-[#00E5FF]/10">
                {produto.fornecedor && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <User className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-xs font-inter">Fornecedor:</span>
                    <span className="text-xs font-inter text-white font-medium">{produto.fornecedor}</span>
                  </div>
                )}
                
                {produto.codigo_barras && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Barcode className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-xs font-inter">Código:</span>
                    <span className="text-xs font-inter text-white font-mono">{produto.codigo_barras}</span>
                  </div>
                )}

                {produto.data_cadastro && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-xs font-inter">Cadastrado em:</span>
                    <span className="text-xs font-inter text-white">
                      {new Date(produto.data_cadastro).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>

              {/* Alertas */}
              {produto.estoque < 10 && (
                <div className="mt-4 pt-4 border-t border-orange-500/20">
                  <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <span className="text-orange-500 text-lg">⚠️</span>
                    <p className="text-xs text-orange-500 font-inter font-medium">Estoque baixo - Reabastecer em breve</p>
                  </div>
                </div>
              )}

              {produto.status === 'inativo' && (
                <div className="mt-4 pt-4 border-t border-red-500/20">
                  <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <span className="text-red-500 text-lg">🔴</span>
                    <p className="text-xs text-red-500 font-inter font-medium">Produto Inativo</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] border border-[#00E5FF]/20 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-inter font-bold text-white mb-6">
              {editingProduto ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Digite o nome do produto"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Descrição Completa</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all resize-none"
                  placeholder="Descreva detalhadamente o produto: características, especificações técnicas, materiais, dimensões, funcionalidades, diferenciais, etc."
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Preço *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Estoque *</label>
                <input
                  type="number"
                  required
                  value={formData.estoque}
                  onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Categoria</label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Ex: Eletrônicos, Alimentos, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Fornecedor</label>
                <input
                  type="text"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Código de Barras</label>
                <input
                  type="text"
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                  placeholder="Código de barras"
                />
              </div>

              <div>
                <label className="block text-sm font-inter text-gray-400 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ativo' | 'inativo' })}
                  className="w-full bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg px-4 py-3 text-white font-inter focus:outline-none focus:border-[#00E5FF] transition-all"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduto(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg font-inter font-semibold hover:bg-gray-600 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#00E5FF] text-black px-4 py-3 rounded-lg font-inter font-semibold hover:bg-[#00E5FF]/90 transition-all"
                >
                  {editingProduto ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
