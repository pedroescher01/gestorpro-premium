// Types para GestorPro
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf_cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  data_cadastro: string;
  status: 'ativo' | 'inativo';
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoria: string;
  fornecedor: string;
  codigo_barras: string;
  data_cadastro: string;
  status: 'ativo' | 'inativo';
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  categoria: string;
  status: 'ativo' | 'inativo';
}

export interface Insumo {
  id: string;
  nome: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
  fornecedor: string;
  data_validade: string;
  status: 'ativo' | 'inativo';
}

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  status: 'ativo' | 'inativo';
}

export interface Venda {
  id: string;
  cliente_id: string;
  total: number;
  data: string;
  status: 'pendente' | 'concluida' | 'cancelada';
  forma_pagamento: string;
}

export interface VendaItem {
  id: string;
  venda_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Financeiro {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  status: 'pendente' | 'pago' | 'cancelado';
  venda_id?: string;
}

export interface MetricasDashboard {
  totalVendas: number;
  totalClientes: number;
  totalProdutos: number;
  receitaMensal: number;
  vendasMes: number;
  crescimentoVendas: number;
  crescimentoReceita: number;
}

export interface Orcamento {
  id: string;
  numero: string;
  cliente_id: string;
  cliente_nome?: string;
  descricao: string;
  valor_total: number;
  data_criacao: string;
  data_validade: string;
  status: 'em_analise' | 'aprovado' | 'rejeitado' | 'expirado';
  observacoes: string;
  tipo: 'produto' | 'servico' | 'misto';
  requer_mao_obra: boolean;
  prazo_entrega: string;
}

export interface OrcamentoItem {
  id: string;
  orcamento_id: string;
  tipo: 'produto' | 'servico';
  item_id: string;
  item_nome: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}
