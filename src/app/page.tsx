'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Users, Package, TrendingUp, ShoppingCart, AlertCircle } from 'lucide-react';
import StatCard from '@/components/custom/StatCard';
import { getClientes, getProdutos, getVendas, resetAllData } from '@/lib/storage';
import { MetricasDashboard } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [metricas, setMetricas] = useState<MetricasDashboard>({
    totalVendas: 0,
    totalClientes: 0,
    totalProdutos: 0,
    receitaMensal: 0,
    vendasMes: 0,
    crescimentoVendas: 0,
    crescimentoReceita: 0,
  });

  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState<any[]>([]);

  useEffect(() => {
    // Resetar dados ao carregar (app zerado)
    resetAllData();

    // Carregar métricas (todas zeradas)
    const clientes = getClientes();
    const produtos = getProdutos();
    const vendas = getVendas();

    const receitaTotal = vendas.reduce((acc, venda) => acc + venda.total, 0);
    
    setMetricas({
      totalVendas: vendas.length,
      totalClientes: clientes.length,
      totalProdutos: produtos.length,
      receitaMensal: receitaTotal,
      vendasMes: vendas.length,
      crescimentoVendas: 0,
      crescimentoReceita: 0,
    });

    // Produtos com baixo estoque (menos de 10 unidades)
    const baixoEstoque = produtos.filter(p => p.estoque < 10);
    setProdutosBaixoEstoque(baixoEstoque);
  }, []);

  // Dados para gráfico de vendas mensais (zerados)
  const dadosVendasMensais = [
    { mes: 'Jan', vendas: 0, receita: 0 },
    { mes: 'Fev', vendas: 0, receita: 0 },
    { mes: 'Mar', vendas: 0, receita: 0 },
    { mes: 'Abr', vendas: 0, receita: 0 },
    { mes: 'Mai', vendas: 0, receita: 0 },
    { mes: 'Jun', vendas: 0, receita: 0 },
  ];

  // Dados para gráfico de produtos mais vendidos (zerados)
  const produtosMaisVendidos: { nome: string; vendas: number }[] = [];

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-inter font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-400 font-inter">
          Visão geral do seu negócio em tempo real
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Receita Mensal"
          value={`R$ ${metricas.receitaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend={{ value: metricas.crescimentoReceita, isPositive: true }}
        />
        <StatCard
          title="Total de Clientes"
          value={metricas.totalClientes}
          icon={Users}
          subtitle="Clientes ativos"
        />
        <StatCard
          title="Produtos Cadastrados"
          value={metricas.totalProdutos}
          icon={Package}
          subtitle="Em estoque"
        />
        <StatCard
          title="Vendas no Mês"
          value={metricas.vendasMes}
          icon={ShoppingCart}
          trend={{ value: metricas.crescimentoVendas, isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Vendas Mensais */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="text-xl font-inter font-bold text-white">Vendas Mensais</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosVendasMensais}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="mes" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #00E5FF',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="vendas"
                stroke="#00E5FF"
                strokeWidth={3}
                dot={{ fill: '#00E5FF', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Produtos Mais Vendidos */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="text-xl font-inter font-bold text-white">Produtos Mais Vendidos</h2>
          </div>
          {produtosMaisVendidos.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p className="font-inter">Nenhum dado disponível ainda</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={produtosMaisVendidos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="nome" stroke="#666" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #00E5FF',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="vendas" fill="#00E5FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Alertas de Estoque Baixo */}
      {produtosBaixoEstoque.length > 0 && (
        <div className="bg-[#0D0D0D] border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-inter font-bold text-white">Alertas de Estoque</h2>
          </div>
          <div className="space-y-3">
            {produtosBaixoEstoque.map((produto) => (
              <div
                key={produto.id}
                className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg"
              >
                <div>
                  <p className="text-white font-inter font-medium">{produto.nome}</p>
                  <p className="text-sm text-gray-400">Categoria: {produto.categoria}</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-500 font-bold">{produto.estoque} unidades</p>
                  <p className="text-xs text-gray-400">Estoque baixo</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
