import { supabase } from './supabase';
import { Fornecedor } from './types';

export async function getFornecedores(): Promise<Fornecedor[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'ativo')
      .order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    return [];
  }
}

export async function createFornecedor(fornecedor: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('fornecedores')
      .insert([{ ...fornecedor, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    throw error;
  }
}

export async function updateFornecedor(id: string, updates: Partial<Fornecedor>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('fornecedores')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    throw error;
  }
}

export async function deleteFornecedor(id: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('fornecedores')
      .update({ status: 'inativo' })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar fornecedor:', error);
    throw error;
  }
}
