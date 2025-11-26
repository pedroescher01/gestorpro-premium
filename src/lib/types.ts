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
  // Dados adicionais para NFE
  razao_social?: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  cep?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
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
  chave_pix?: string; // Campo para chave PIX
  // Dados adicionais para NFE
  razao_social?: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  cep?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  observacoes?: string;
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
  tipo: 'produto' | 'servico' | 'insumo';
  item_id: string;
  item_nome: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface NotaFiscal {
  id: string;
  numero: string;
  serie: string;
  tipo_nota: 'entrada' | 'saida';
  natureza_operacao: string;
  
  // Emitente (sempre a empresa)
  emitente_nome: string;
  emitente_cnpj: string;
  emitente_ie: string;
  emitente_endereco: string;
  emitente_cidade: string;
  emitente_estado: string;
  emitente_cep: string;
  
  // Destinatário (cliente para venda, fornecedor para compra)
  destinatario_id: string;
  destinatario_nome: string;
  destinatario_cpf_cnpj: string;
  destinatario_razao_social?: string;
  destinatario_nome_fantasia?: string;
  destinatario_ie?: string;
  destinatario_endereco: string;
  destinatario_numero: string;
  destinatario_complemento?: string;
  destinatario_bairro: string;
  destinatario_cidade: string;
  destinatario_estado: string;
  destinatario_cep: string;
  destinatario_telefone?: string;
  destinatario_email?: string;
  
  // Valores
  valor_produtos: number;
  valor_servicos: number;
  valor_desconto: number;
  valor_frete: number;
  valor_seguro: number;
  valor_outras_despesas: number;
  valor_total: number;
  
  // Controle
  data_emissao: string;
  data_saida?: string;
  status: 'rascunho' | 'emitida' | 'cancelada' | 'rejeitada' | 'denegada';
  chave_acesso: string;
  protocolo_autorizacao: string;
  xml_nota: string;
  observacoes: string;
  motivo_cancelamento?: string;
  data_cancelamento?: string;
  
  // Itens
  itens: NotaFiscalItem[];
  
  // Metadados
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotaFiscalItem {
  id?: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  ncm: string;
  cfop: string;
  unidade: string;
  codigo_produto?: string;
}

export interface NotificacaoNFE {
  id: string;
  tipo: 'pendente' | 'vencimento' | 'erro' | 'sucesso';
  titulo: string;
  mensagem: string;
  nota_fiscal_id?: string;
  data: string;
  lida: boolean;
}

export interface RelatorioNFE {
  periodo: string;
  total_emitidas: number;
  total_canceladas: number;
  valor_total_emitidas: number;
  valor_total_canceladas: number;
  notas_por_mes: { mes: string; quantidade: number; valor: number }[];
  notas_por_cliente: { cliente: string; quantidade: number; valor: number }[];
}
