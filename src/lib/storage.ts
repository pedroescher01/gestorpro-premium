// Helper para localStorage
import { Cliente, Produto, Venda } from './types';

const STORAGE_KEYS = {
  CLIENTES: 'gestorpro_clientes',
  PRODUTOS: 'gestorpro_produtos',
  VENDAS: 'gestorpro_vendas',
  PREFERENCIAS: 'gestorpro_preferencias',
};

// Função para resetar todos os dados
export const resetAllData = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CLIENTES);
  localStorage.removeItem(STORAGE_KEYS.PRODUTOS);
  localStorage.removeItem(STORAGE_KEYS.VENDAS);
  localStorage.removeItem(STORAGE_KEYS.PREFERENCIAS);
};

// Clientes
export const getClientes = (): Cliente[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTES);
  return data ? JSON.parse(data) : [];
};

export const saveClientes = (clientes: Cliente[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
};

export const addCliente = (cliente: Cliente) => {
  const clientes = getClientes();
  clientes.push(cliente);
  saveClientes(clientes);
};

export const updateCliente = (id: string, clienteAtualizado: Partial<Cliente>) => {
  const clientes = getClientes();
  const index = clientes.findIndex(c => c.id === id);
  if (index !== -1) {
    clientes[index] = { ...clientes[index], ...clienteAtualizado };
    saveClientes(clientes);
  }
};

export const deleteCliente = (id: string) => {
  const clientes = getClientes().filter(c => c.id !== id);
  saveClientes(clientes);
};

// Produtos
export const getProdutos = (): Produto[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PRODUTOS);
  return data ? JSON.parse(data) : [];
};

export const saveProdutos = (produtos: Produto[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(produtos));
};

export const addProduto = (produto: Produto) => {
  const produtos = getProdutos();
  produtos.push(produto);
  saveProdutos(produtos);
};

export const updateProduto = (id: string, produtoAtualizado: Partial<Produto>) => {
  const produtos = getProdutos();
  const index = produtos.findIndex(p => p.id === id);
  if (index !== -1) {
    produtos[index] = { ...produtos[index], ...produtoAtualizado };
    saveProdutos(produtos);
  }
};

export const deleteProduto = (id: string) => {
  const produtos = getProdutos().filter(p => p.id !== id);
  saveProdutos(produtos);
};

// Vendas
export const getVendas = (): Venda[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.VENDAS);
  return data ? JSON.parse(data) : [];
};

export const saveVendas = (vendas: Venda[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(vendas));
};

export const addVenda = (venda: Venda) => {
  const vendas = getVendas();
  vendas.push(venda);
  saveVendas(vendas);
};

// Dados iniciais (seed) - REMOVIDOS
export const initializeSeedData = () => {
  // Função vazia - não inicializa mais dados de exemplo
  // App começa zerado
};
