'use client';

import { BarChart3, TrendingUp, TrendingDown, Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getClientes, getProdutos, getVendas, getFinanceiro } from '@/lib/storage';

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalClientes: 0,
    totalProdutos: 0,
    totalVendas: 0,
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    produtosBaixoEstoque: 0,
    vendasPendentes: 0
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [clientes, produtos, vendas, financeiro] = await Promise.all([
        getClientes(),
        getProdutos(),
        getVendas(),
        getFinanceiro()
      ]);

      const totalReceitas = financeiro
        .filter(item => item.tipo === 'receita' && item.status === 'pago')
        .reduce((acc, item) => acc + item.valor, 0);

      const totalDespesas = financeiro
        .filter(item => item.tipo === 'despesa' && item.status === 'pago')
        .reduce((acc, item) => acc + item.valor, 0);

      const totalVendas = vendas.reduce((acc, venda) => acc + venda.total, 0);

      setMetrics({
        totalClientes: clientes.length,
        totalProdutos: produtos.length,
        totalVendas: vendas.length,
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        produtosBaixoEstoque: produtos.filter(p => p.estoque <= 10).length,
        vendasPendentes: vendas.filter(v => v.status === 'pendente').length
      });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
    setLoading(false);
  };

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
            <BarChart3 className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-inter">Relatórios</h1>
        </div>
        <p className="text-gray-400 text-sm">Análises e relatórios do sistema</p>
      </div>

      {/* Métricas Principais */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-[#00E5FF]" />
              <span className="text-gray-400 text-sm">Total de Clientes</span>
            </div>
            <p className="text-3xl font-bold text-[#00E5FF]">{metrics.totalClientes}</p>
          </div>

          <div className="bg-[#1A1A1A] border border-blue-500/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400 text-sm">Total de Produtos</span>
            </div>
            <p className="text-3xl font-bold text-blue-500">{metrics.totalProdutos}</p>
          </div>

          <div className="bg-[#1A1A1A] border border-purple-500/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-5 h-5 text-purple-500" />
              <span className="text-gray-400 text-sm">Total de Vendas</span>
            </div>
            <p className="text-3xl font-bold text-purple-500">{metrics.totalVendas}</p>
          </div>

          <div className="bg-[#1A1A1A] border border-green-500/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-gray-400 text-sm">Saldo Total</span>
            </div>
            <p className={`text-3xl font-bold ${metrics.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              R$ {metrics.saldo.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Métricas Financeiras */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1A1A1A] border border-green-500/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-gray-400 text-sm">Total de Receitas</span>
            </div>
            <p className="text-2xl font-bold text-green-500">R$ {metrics.totalReceitas.toFixed(2)}</p>
          </div>

          <div className="bg-[#1A1A1A] border border-red-500/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-gray-400 text-sm">Total de Despesas</span>
            </div>
            <p className="text-2xl font-bold text-red-500">R$ {metrics.totalDespesas.toFixed(2)}</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-[#00E5FF]" />
              <span className="text-gray-400 text-sm">Lucro/Prejuízo</span>
            </div>
            <p className={`text-2xl font-bold ${metrics.saldo >= 0 ? 'text-[#00E5FF]' : 'text-red-500'}`}>
              R$ {metrics.saldo.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Alertas e Avisos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Alertas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1A1A1A] border border-yellow-500/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-400 text-sm">Produtos com Estoque Baixo</span>
            </div>
            <p className="text-3xl font-bold text-yellow-500">{metrics.produtosBaixoEstoque}</p>
            <p className="text-xs text-gray-500 mt-2">Produtos com 10 unidades ou menos</p>
          </div>

          <div className="bg-[#1A1A1A] border border-orange-500/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              <span className="text-gray-400 text-sm">Vendas Pendentes</span>
            </div>
            <p className="text-3xl font-bold text-orange-500">{metrics.vendasPendentes}</p>
            <p className="text-xs text-gray-500 mt-2">Vendas aguardando conclusão</p>
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="bg-[#1A1A1A] border border-[#00E5FF]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Resumo do Sistema</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Clientes Cadastrados</span>
            <span className="text-white font-bold">{metrics.totalClientes}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Produtos Cadastrados</span>
            <span className="text-white font-bold">{metrics.totalProdutos}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Vendas Realizadas</span>
            <span className="text-white font-bold">{metrics.totalVendas}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Receitas Totais</span>
            <span className="text-green-500 font-bold">R$ {metrics.totalReceitas.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Despesas Totais</span>
            <span className="text-red-500 font-bold">R$ {metrics.totalDespesas.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400 font-bold">Saldo Final</span>
            <span className={`text-xl font-bold ${metrics.saldo >= 0 ? 'text-[#00E5FF]' : 'text-red-500'}`}>
              R$ {metrics.saldo.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
