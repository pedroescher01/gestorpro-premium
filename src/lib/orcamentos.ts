import { supabase } from './supabase';
import { Orcamento, OrcamentoItem } from './types';
import { criarProducao } from './producao';

// Criar orçamento
export async function createOrcamento(orcamento: Omit<Orcamento, 'id'>) {
  const { data, error } = await supabase
    .from('orcamentos')
    .insert([orcamento])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Buscar todos os orçamentos
export async function getOrcamentos(): Promise<Orcamento[]> {
  const { data, error } = await supabase
    .from('orcamentos')
    .select('*')
    .order('data_criacao', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Buscar orçamento por ID
export async function getOrcamentoById(id: string): Promise<Orcamento | null> {
  const { data, error } = await supabase
    .from('orcamentos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Atualizar orçamento
export async function updateOrcamento(id: string, orcamento: Partial<Orcamento>) {
  const { data, error } = await supabase
    .from('orcamentos')
    .update(orcamento)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Deletar orçamento
export async function deleteOrcamento(id: string) {
  const { error } = await supabase
    .from('orcamentos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Criar item de orçamento
export async function createOrcamentoItem(item: Omit<OrcamentoItem, 'id'>) {
  // Converter 'insumo' para 'materia_prima' para corresponder ao constraint do banco
  const itemParaBanco = {
    ...item,
    tipo: item.tipo === 'insumo' ? 'materia_prima' : item.tipo
  };
  
  const { data, error } = await supabase
    .from('orcamento_itens')
    .insert([itemParaBanco])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Buscar itens de um orçamento
export async function getOrcamentoItens(orcamentoId: string): Promise<OrcamentoItem[]> {
  const { data, error } = await supabase
    .from('orcamento_itens')
    .select('*')
    .eq('orcamento_id', orcamentoId);

  if (error) throw error;
  return data || [];
}

// Deletar item de orçamento
export async function deleteOrcamentoItem(id: string) {
  const { error } = await supabase
    .from('orcamento_itens')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Aprovar orçamento e criar produção automaticamente
export async function aprovarOrcamento(orcamentoId: string) {
  console.log('🔄 Aprovando orçamento:', orcamentoId);
  
  // 1. Verificar se o orçamento já está aprovado (evitar duplicação)
  const { data: orcamentoAtual, error: orcamentoAtualError } = await supabase
    .from('orcamentos')
    .select('status')
    .eq('id', orcamentoId)
    .single();
  
  if (orcamentoAtualError) throw orcamentoAtualError;
  
  if (orcamentoAtual.status === 'aprovado') {
    console.log('⚠️ Orçamento já foi aprovado anteriormente');
    return { orcamento: orcamentoAtual, producao: null };
  }
  
  // 2. Atualizar status do orçamento para aprovado
  const { data: orcamento, error: orcamentoError } = await supabase
    .from('orcamentos')
    .update({ status: 'aprovado' })
    .eq('id', orcamentoId)
    .select()
    .single();

  if (orcamentoError) {
    console.error('❌ Erro ao aprovar orçamento:', orcamentoError);
    throw orcamentoError;
  }

  console.log('✅ Orçamento aprovado com sucesso');

  // 3. Criar produção automaticamente com status "preparacao"
  try {
    console.log('🏭 Criando produção automaticamente...');
    const producao = await criarProducao(orcamentoId);
    console.log('✅ Produção criada automaticamente:', producao.id);
    
    return { orcamento, producao };
  } catch (error) {
    console.error('❌ Erro ao criar produção:', error);
    // Não lançar erro aqui para não bloquear a aprovação do orçamento
    return { orcamento, producao: null };
  }
}
