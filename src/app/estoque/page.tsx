'use client';

import { Warehouse, Search, Package, AlertTriangle, TrendingUp, ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProdutos } from '@/lib/storage';
import { Produto } from '@/lib/types';

type SortOrder = 'asc' | 'desc';

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'baixo' | 'medio' | 'alto'>('todos');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    setLoading(true);
    const data = await getProdutos();
    setProdutos(data);
    setLoading(false);
  };

  const getEstoqueStatus = (estoque: number) => {
    if (estoque === 0) return { label: 'Sem estoque', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    if (estoque <= 10) return { label: 'Estoque baixo', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    if (estoque <= 50) return { label: 'Estoque médio', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    return { label: 'Estoque alto', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' };
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredProdutos = produtos
    .filter(produto => {
      const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           produto.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'todos') return matchesSearch;
      if (filter === 'baixo') return matchesSearch && produto.estoque <= 10;
      if (filter === 'medio') return matchesSearch && produto.estoque > 10 && produto.estoque <= 50;
      if (filter === 'alto') return matchesSearch && produto.estoque > 50;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.nome.localeCompare(b.nome, 'pt-BR');
      } else {
        return b.nome.localeCompare(a.nome, 'pt-BR');
      }
    });

  const totalProdutos = produtos.length;
  const produtosBaixoEstoque = produtos.filter(p => p.estoque <= 10).length;
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.preco * p.estoque), 0);

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
            <Warehouse className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-inter">Estoque</h1>
        </div>
        <p className="text-gray-400 text-sm">Controle de estoque e inventário</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-[#00E5FF]" />
            <span className="text-gray-400 text-sm">Total de Produtos</span>
          </div>
          <p className="text-2xl font-bold text-[#00E5FF]">{totalProdutos}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-yellow-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="text-gray-400 text-sm">Estoque Baixo</span>
          </div>
          <p className="text-2xl font-bold text-yellow-500">{produtosBaixoEstoque}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-green-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-gray-400 text-sm">Valor Total</span>
          </div>
          <p className="text-2xl font-bold text-green-500">R$ {valorTotalEstoque.toFixed(2)}</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar itens no estoque..."
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
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'todos'
                ? 'bg-[#00E5FF] text-white'
                : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#00E5FF]/10'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('baixo')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'baixo'
                ? 'bg-yellow-500 text-white'
                : 'bg-[#1A1A1A] text-gray-400 hover:bg-yellow-500/10'
            }`}
          >
            Baixo
          </button>
          <button
            onClick={() => setFilter('medio')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'medio'
                ? 'bg-blue-500 text-white'
                : 'bg-[#1A1A1A] text-gray-400 hover:bg-blue-500/10'
            }`}
          >
            Médio
          </button>
          <button
            onClick={() => setFilter('alto')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'alto'
                ? 'bg-green-500 text-white'
                : 'bg-[#1A1A1A] text-gray-400 hover:bg-green-500/10'
            }`}
          >
            Alto
          </button>
        </div>
      </div>

      {/* Lista de Produtos */}
      {filteredProdutos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mb-6">
            <Warehouse className="w-10 h-10 text-[#00E5FF]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            {searchTerm ? 'Tente buscar com outros termos' : 'Adicione produtos na aba Produtos'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProdutos.map((produto) => {
            const status = getEstoqueStatus(produto.estoque);
            return (
              <div key={produto.id} className={`bg-[#1A1A1A] border ${status.border} rounded-lg p-6 hover:border-[#00E5FF]/40 transition-all`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{produto.nome}</h3>
                    <p className="text-sm text-gray-400 mb-2">{produto.descricao}</p>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                      {produto.categoria}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Quantidade</span>
                    <span className={`text-xl font-bold ${status.color}`}>
                      {produto.estoque} un
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Preço Unitário</span>
                    <span className="text-sm font-bold text-white">
                      R$ {produto.preco.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Valor Total</span>
                    <span className="text-lg font-bold text-[#00E5FF]">
                      R$ {(produto.preco * produto.estoque).toFixed(2)}
                    </span>
                  </div>
                  <div className={`px-3 py-2 rounded-lg ${status.bg} border ${status.border}`}>
                    <span className={`text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
