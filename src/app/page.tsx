'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Users, Package, TrendingUp, ShoppingCart, AlertCircle, Calendar, TrendingDown } from 'lucide-react';
import StatCard from '@/components/custom/StatCard';
import { getClientes, getProdutos, getVendas, getFinanceiro } from '@/lib/storage';
import { MetricasDashboard, Venda, Produto, Financeiro } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatDateBR } from '@/lib/dateUtils';

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

  const [vendasDia, setVendasDia] = useState<Venda[]>([]);
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState<Produto[]>([]);
  const [dadosVendasMensais, setDadosVendasMensais] = useState<any[]>([]);
  const [indicadoresFinanceiros, setIndicadoresFinanceiros] = useState({
    receitasDia: 0,
    despesasDia: 0,
    saldoDia: 0,
    receitasMes: 0,
    despesasMes: 0,
    saldoMes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do Supabase
      const [clientes, produtos, vendas, financeiro] = await Promise.all([
        getClientes(),
        getProdutos(),
        getVendas(),
        getFinanceiro()
      ]);

      // Data de hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataHoje = hoje.toISOString().split('T')[0];

      // Filtrar vendas do dia
      const vendasHoje = vendas.filter(v => v.data === dataHoje);
      setVendasDia(vendasHoje);

      // Calcular receita total e do mês
      const receitaTotal = vendas
        .filter(v => v.status === 'concluida')
        .reduce((acc, venda) => acc + venda.total, 0);
      
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      const vendasMesAtual = vendas.filter(v => {
        const dataVenda = new Date(v.data);
        return dataVenda.getMonth() === mesAtual && 
               dataVenda.getFullYear() === anoAtual &&
               v.status === 'concluida';
      });
      
      setMetricas({
        totalVendas: vendas.length,
        totalClientes: clientes.length,
        totalProdutos: produtos.length,
        receitaMensal: receitaTotal,
        vendasMes: vendasMesAtual.length,
        crescimentoVendas: 0,
        crescimentoReceita: 0,
      });

      // Produtos com baixo estoque (menos de 10 unidades)
      const baixoEstoque = produtos.filter(p => p.estoque < 10 && p.status === 'ativo');
      setProdutosBaixoEstoque(baixoEstoque);

      // Calcular indicadores financeiros
      const receitasHoje = financeiro.filter(f => 
        f.tipo === 'receita' && 
        f.status === 'pago' && 
        f.data === dataHoje
      ).reduce((acc, f) => acc + f.valor, 0);

      const despesasHoje = financeiro.filter(f => 
        f.tipo === 'despesa' && 
        f.status === 'pago' && 
        f.data === dataHoje
      ).reduce((acc, f) => acc + f.valor, 0);

      const receitasMesAtual = financeiro.filter(f => {
        const dataF = new Date(f.data);
        return f.tipo === 'receita' && 
               f.status === 'pago' && 
               dataF.getMonth() === mesAtual && 
               dataF.getFullYear() === anoAtual;
      }).reduce((acc, f) => acc + f.valor, 0);

      const despesasMesAtual = financeiro.filter(f => {
        const dataF = new Date(f.data);
        return f.tipo === 'despesa' && 
               f.status === 'pago' && 
               dataF.getMonth() === mesAtual && 
               dataF.getFullYear() === anoAtual;
      }).reduce((acc, f) => acc + f.valor, 0);

      setIndicadoresFinanceiros({
        receitasDia: receitasHoje,
        despesasDia: despesasHoje,
        saldoDia: receitasHoje - despesasHoje,
        receitasMes: receitasMesAtual,
        despesasMes: despesasMesAtual,
        saldoMes: receitasMesAtual - despesasMesAtual
      });

      // Calcular vendas mensais dos últimos 6 meses
      const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const vendasPorMes: { [key: string]: { vendas: number; receita: number } } = {};

      // Inicializar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        vendasPorMes[mesAno] = { vendas: 0, receita: 0 };
      }

      // Agrupar vendas por mês
      vendas.forEach(venda => {
        if (venda.status !== 'concluida') return;
        const dataVenda = new Date(venda.data);
        const mesAno = `${dataVenda.getFullYear()}-${String(dataVenda.getMonth() + 1).padStart(2, '0')}`;
        
        if (vendasPorMes[mesAno]) {
          vendasPorMes[mesAno].vendas += 1;
          vendasPorMes[mesAno].receita += venda.total;
        }
      });

      // Converter para array para o gráfico
      const dadosGrafico = Object.keys(vendasPorMes)
        .sort()
        .map(mesAno => {
          const [ano, mes] = mesAno.split('-');
          const mesIndex = parseInt(mes) - 1;
          return {
            mes: mesesNomes[mesIndex],
            vendas: vendasPorMes[mesAno].vendas,
            receita: vendasPorMes[mesAno].receita
          };
        });

      setDadosVendasMensais(dadosGrafico);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto mb-4"></div>
          <p className="text-gray-400 font-inter">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-inter font-bold text-white mb-2">
          Dashboard Personalizado
        </h1>
        <p className="text-gray-400 font-inter">
          Visão geral do seu negócio em tempo real - {formatDateBR(new Date().toISOString().split('T')[0])}
        </p>
      </div>

      {/* Stats Grid - Métricas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Receita Mensal"
          value={`R$ ${metricas.receitaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend={{ value: metricas.crescimentoReceita || 0, isPositive: true }}
        />
        <StatCard
          title="Total de Clientes"
          value={metricas.totalClientes.toString()}
          icon={Users}
          subtitle="Clientes ativos"
        />
        <StatCard
          title="Produtos Cadastrados"
          value={metricas.totalProdutos.toString()}
          icon={Package}
          subtitle="Em estoque"
        />
        <StatCard
          title="Vendas no Mês"
          value={metricas.vendasMes.toString()}
          icon={ShoppingCart}
          trend={{ value: metricas.crescimentoVendas || 0, isPositive: true }}
        />
      </div>

      {/* Indicadores Financeiros do Dia e Mês */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Indicadores do Dia */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="text-xl font-inter font-bold text-white">Indicadores do Dia</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-gray-300">Receitas</span>
              </div>
              <span className="text-xl font-bold text-green-500">
                R$ {indicadoresFinanceiros.receitasDia.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <span className="text-gray-300">Despesas</span>
              </div>
              <span className="text-xl font-bold text-red-500">
                R$ {indicadoresFinanceiros.despesasDia.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[#00E5FF]" />
                <span className="text-gray-300">Saldo do Dia</span>
              </div>
              <span className={`text-xl font-bold ${indicadoresFinanceiros.saldoDia >= 0 ? 'text-[#00E5FF]' : 'text-red-500'}`}>
                R$ {indicadoresFinanceiros.saldoDia.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Indicadores do Mês */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="text-xl font-inter font-bold text-white">Indicadores do Mês</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-gray-300">Receitas</span>
              </div>
              <span className="text-xl font-bold text-green-500">
                R$ {indicadoresFinanceiros.receitasMes.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <span className="text-gray-300">Despesas</span>
              </div>
              <span className="text-xl font-bold text-red-500">
                R$ {indicadoresFinanceiros.despesasMes.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[#00E5FF]" />
                <span className="text-gray-300">Saldo do Mês</span>
              </div>
              <span className={`text-xl font-bold ${indicadoresFinanceiros.saldoMes >= 0 ? 'text-[#00E5FF]' : 'text-red-500'}`}>
                R$ {indicadoresFinanceiros.saldoMes.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vendas do Dia */}
      <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all mb-8">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="w-5 h-5 text-[#00E5FF]" />
          <h2 className="text-xl font-inter font-bold text-white">Vendas do Dia</h2>
          <span className="ml-auto text-sm text-gray-400">
            {vendasDia.length} {vendasDia.length === 1 ? 'venda' : 'vendas'}
          </span>
        </div>
        {vendasDia.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-gray-500">
            <p className="font-inter">Nenhuma venda registrada hoje</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vendasDia.map((venda) => (
              <div
                key={venda.id}
                className="flex items-center justify-between p-4 bg-[#1A1A1A] border border-[#00E5FF]/10 rounded-lg hover:border-[#00E5FF]/30 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      venda.status === 'concluida' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      venda.status === 'pendente' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {venda.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{venda.forma_pagamento}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-[#00E5FF]">R$ {venda.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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

        {/* Gráfico de Receita Mensal */}
        <div className="bg-[#0D0D0D] border border-[#00E5FF]/10 rounded-xl p-6 hover:border-[#00E5FF]/30 transition-all">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="text-xl font-inter font-bold text-white">Receita Mensal</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosVendasMensais}>
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
              <Bar dataKey="receita" fill="#00E5FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertas de Estoque Baixo */}
      {produtosBaixoEstoque.length > 0 && (
        <div className="bg-[#0D0D0D] border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-inter font-bold text-white">Alertas de Estoque</h2>
            <span className="ml-auto text-sm text-orange-500">
              {produtosBaixoEstoque.length} {produtosBaixoEstoque.length === 1 ? 'produto' : 'produtos'} com estoque baixo
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {produtosBaixoEstoque.map((produto) => (
              <div
                key={produto.id}
                className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg hover:border-orange-500/40 transition-all"
              >
                <div>
                  <p className="text-white font-inter font-medium">{produto.nome}</p>
                  <p className="text-sm text-gray-400">Categoria: {produto.categoria}</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-500 font-bold text-lg">{produto.estoque}</p>
                  <p className="text-xs text-gray-400">unidades</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
