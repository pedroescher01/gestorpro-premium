// Types para GestorPro
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  dataCadastro: string;
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
  codigoBarras: string;
  dataCadastro: string;
  status: 'ativo' | 'inativo';
}

export interface Venda {
  id: string;
  clienteId: string;
  produtos: { produtoId: string; quantidade: number; preco: number }[];
  total: number;
  data: string;
  status: 'pendente' | 'concluida' | 'cancelada';
  formaPagamento: string;
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
