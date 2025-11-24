'use client';

import { ShoppingCart, Plus, Search, Edit, Trash2, User, Calendar, Package, X, ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getVendas, addVenda, updateVenda, deleteVenda, getClientes, getProdutos, getVendaItens } from '@/lib/storage';
import { Venda, Cliente, Produto } from '@/lib/types';
import { getLocalDateString, formatDateBR } from '@/lib/dateUtils';

interface ItemVenda {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
}

interface VendaComItens extends Venda {
  itens?: Array<{
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
  }>;
}

type SortOrder = 'asc' | 'desc';

export default function VendasPage() {
  const [vendas, setVendas] = useState<VendaComItens[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([]);
  const [itensOriginais, setItensOriginais] = useState<ItemVenda[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [formData, setFormData] = useState({
    cliente_id: '',
    data: getLocalDateString(),
    status: 'pendente' as 'pendente' | 'concluida' | 'cancelada',
    forma_pagamento: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [vendasData, clientesData, produtosData] = await Promise.all([
      getVendas(),
      getClientes(),
      getProdutos()
    ]);
    
    // Carregar itens de cada venda
    const vendasComItens = await Promise.all(
      vendasData.map(async (venda) => {
        const itens = await getVendaItens(venda.id);
        return { ...venda, itens };
      })
    );
    
    setVendas(vendasComItens);
    setClientes(clientesData);
    setProdutos(produtosData);
    setLoading(false);
  };

  const calcularTotal = () => {
    return itensVenda.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);
  };

  const adicionarItem = () => {
    setItensVenda([...itensVenda, { produto_id: '', quantidade: 1, preco_unitario: 0 }]);
  };

  const removerItem = (index: number) => {
    setItensVenda(itensVenda.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, campo: keyof ItemVenda, valor: any) => {
    const novosItens = [...itensVenda];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    
    // Se mudou o produto, atualizar o preço automaticamente
    if (campo === 'produto_id') {
      const produto = produtos.find(p => p.id === valor);
      if (produto) {
        novosItens[index].preco_unitario = produto.preco;
      }
    }
    
    setItensVenda(novosItens);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (itensVenda.length === 0) {
      alert('Adicione pelo menos um produto à venda!');
      return;
    }

    // Validar se todos os itens têm produto selecionado
    const itemInvalido = itensVenda.find(item => !item.produto_id || item.quantidade <= 0);
    if (itemInvalido) {
      alert('Preencha todos os produtos e quantidades corretamente!');
      return;
    }

    // Validar estoque disponível
    if (formData.status !== 'cancelada') {
      for (const item of itensVenda) {
        const produto = produtos.find(p => p.id === item.produto_id);
        if (!produto) continue;
        
        // Se estiver editando, considerar a quantidade original do produto
        let estoqueDisponivel = produto.estoque;
        
        if (editingVenda) {
          // Encontrar o item original correspondente
          const itemOriginal = itensOriginais.find(io => io.produto_id === item.produto_id);
          if (itemOriginal) {
            // Adicionar a quantidade original de volta ao estoque disponível
            estoqueDisponivel += itemOriginal.quantidade;
          }
        }
        
        if (estoqueDisponivel < item.quantidade) {
          alert(`Estoque insuficiente para ${produto.nome}. Disponível: ${estoqueDisponivel}`);
          return;
        }
      }
    }

    try {
      const total = calcularTotal();
      
      if (editingVenda) {
        // Ao editar, sempre passar os itens atualizados
        await updateVenda(editingVenda.id, {
          ...formData,
          total
        }, itensVenda);
      } else {
        await addVenda({
          ...formData,
          total
        }, itensVenda);
      }
      
      setShowModal(false);
      setEditingVenda(null);
      resetForm();
      await loadData(); // Aguardar reload dos dados
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar venda. Verifique os dados e tente novamente.');
    }
  };

  const handleEdit = async (venda: VendaComItens) => {
    setEditingVenda(venda);
    setFormData({
      cliente_id: venda.cliente_id,
      data: venda.data,
      status: venda.status,
      forma_pagamento: venda.forma_pagamento
    });
    
    // Carregar os itens da venda para edição
    let itensParaEditar: ItemVenda[] = [];
    
    if (venda.itens && venda.itens.length > 0) {
      itensParaEditar = venda.itens.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario
      }));
    } else {
      // Se não houver itens carregados, buscar do banco
      const itens = await getVendaItens(venda.id);
      itensParaEditar = itens.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario
      }));
    }
    
    setItensVenda(itensParaEditar);
    setItensOriginais(JSON.parse(JSON.stringify(itensParaEditar))); // Cópia profunda
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await deleteVenda(id);
        loadData();
      } catch (error) {
        console.error('Erro ao deletar venda:', error);
        alert('Erro ao deletar venda.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      data: getLocalDateString(),
      status: 'pendente',
      forma_pagamento: ''
    });
    setItensVenda([]);
    setItensOriginais([]);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  const getProdutoNome = (produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    return produto ? produto.nome : 'Produto não encontrado';
  };

  const getDescricaoVenda = (venda: VendaComItens) => {
    if (!venda.itens || venda.itens.length === 0) {
      return 'Nenhum produto registrado';
    }
    
    return venda.itens.map(item => {
      const produtoNome = getProdutoNome(item.produto_id);
      return `${item.quantidade}x ${produtoNome}`;
    }).join(', ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pendente': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelada': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const filteredVendas = vendas
    .filter(venda => {
      const clienteNome = getClienteNome(venda.cliente_id).toLowerCase();
      return clienteNome.includes(searchTerm.toLowerCase()) ||
             venda.forma_pagamento.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.data).getTime() - new Date(b.data).getTime();
      } else {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
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
            <ShoppingCart className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-inter">Vendas</h1>
        </div>
        <p className="text-gray-400 text-sm">Gerencie todas as vendas realizadas</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar vendas..."
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
            setEditingVenda(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Venda</span>
        </button>
      </div>

      {/* Lista de Vendas */}
      {filteredVendas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mb-6">
            <ShoppingCart className="w-10 h-10 text-[#00E5FF]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma venda registrada</h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Comece registrando sua primeira venda no sistema
          </p>
          <button 
            onClick={() => {
              setEditingVenda(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00E5FF]/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Registrar Primeira Venda</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendas.map((venda) => (
            <div key={venda.id} className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg p-6 hover:border-[#00E5FF]/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <h3 className="text-lg font-bold text-white">{getClienteNome(venda.cliente_id)}</h3>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full border ${getStatusColor(venda.status)}`}>
                    {venda.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(venda)}
                    className="p-2 hover:bg-[#00E5FF]/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[#00E5FF]" />
                  </button>
                  <button
                    onClick={() => handleDelete(venda.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              {/* Descrição dos Produtos */}
              <div className="mb-4 p-3 bg-[#0D0D0D] rounded-lg border border-[#00E5FF]/10">
                <div className="flex items-start gap-2 mb-2">
                  <Package className="w-4 h-4 text-[#00E5FF] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">Produtos vendidos:</p>
                    <p className="text-sm text-white leading-relaxed">
                      {getDescricaoVenda(venda)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDateBR(venda.data)}</span>
                  </div>
                  <span className="text-xl font-bold text-[#00E5FF]">
                    R$ {venda.total.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Pagamento: {venda.forma_pagamento}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-3xl border border-[#00E5FF]/20 my-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingVenda ? 'Editar Venda' : 'Nova Venda'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cliente</label>
                  <select
                    required
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                    ))}
                  </select>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Forma de Pagamento</label>
                  <select
                    required
                    value={formData.forma_pagamento}
                    onChange={(e) => setFormData({...formData, forma_pagamento: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="">Selecione</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'pendente' | 'concluida' | 'cancelada'})}
                    className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00E5FF]/20 rounded-lg text-white focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Produtos da Venda */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#00E5FF]" />
                    <h3 className="text-lg font-bold text-white">Produtos</h3>
                  </div>
                  <button
                    type="button"
                    onClick={adicionarItem}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00E5FF]/10 text-[#00E5FF] rounded-lg hover:bg-[#00E5FF]/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Produto</span>
                  </button>
                </div>

                {itensVenda.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {itensVenda.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start bg-[#0D0D0D] p-4 rounded-lg border border-[#00E5FF]/10">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Produto</label>
                            <select
                              required
                              value={item.produto_id}
                              onChange={(e) => atualizarItem(index, 'produto_id', e.target.value)}
                              className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                            >
                              <option value="">Selecione</option>
                              {produtos.filter(p => p.status === 'ativo').map(produto => (
                                <option key={produto.id} value={produto.id}>
                                  {produto.nome} (Estoque: {produto.estoque})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Quantidade</label>
                            <input
                              type="number"
                              min="1"
                              required
                              value={item.quantidade || ''}
                              onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Preço Unit.</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              value={item.preco_unitario || ''}
                              onChange={(e) => atualizarItem(index, 'preco_unitario', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#00E5FF]/20 rounded text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            type="button"
                            onClick={() => removerItem(index)}
                            className="p-2 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                          <div className="text-sm font-bold text-[#00E5FF]">
                            R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total da Venda:</span>
                  <span className="text-2xl font-bold text-[#00E5FF]">
                    R$ {calcularTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVenda(null);
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
                  {editingVenda ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
