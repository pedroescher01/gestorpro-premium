import { supabase } from './supabase';
import { Orcamento, OrcamentoItem } from './types';

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
  const { data, error } = await supabase
    .from('orcamento_itens')
    .insert([item])
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

// Aprovar orçamento e enviar para produção
export async function aprovarOrcamento(orcamentoId: string) {
  // Atualizar status do orçamento
  const { data: orcamento, error: orcamentoError } = await supabase
    .from('orcamentos')
    .update({ status: 'aprovado' })
    .eq('id', orcamentoId)
    .select()
    .single();

  if (orcamentoError) throw orcamentoError;

  // Buscar itens do orçamento
  const { data: itens, error: itensError } = await supabase
    .from('orcamento_itens')
    .select('*')
    .eq('orcamento_id', orcamentoId);

  if (itensError) throw itensError;

  // Criar ordem de produção
  const { data: producao, error: producaoError } = await supabase
    .from('producao')
    .insert([{
      receita_id: null,
      quantidade: 1,
      data_inicio: new Date().toISOString().split('T')[0],
      data_prevista: orcamento.prazo_entrega,
      status: orcamento.requer_mao_obra ? 'aguardando_execucao' : 'em_producao',
      observacoes: `Orçamento ${orcamento.numero} aprovado - ${orcamento.descricao}`,
      orcamento_id: orcamentoId
    }])
    .select()
    .single();

  if (producaoError) throw producaoError;

  return { orcamento, producao };
}
