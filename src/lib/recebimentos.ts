import { supabase } from './supabase';
import { addFinanceiro } from './storage';

export interface Recebimento {
  id: string;
  produto_id: string;
  fornecedor: string;
  quantidade_recebida: number;
  valor_total: number;
  status: 'pendente' | 'recebido';
  data_recebimento: string;
  orcamento_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecebimentoComProduto extends Recebimento {
  produto_nome: string;
  produto_codigo?: string;
}

// Buscar todos os recebimentos
export async function getRecebimentos(): Promise<RecebimentoComProduto[]> {
  try {
    const { data: recebimentos, error: recebimentosError } = await supabase
      .from('recebimentos')
      .select('*')
      .order('data_recebimento', { ascending: false });

    if (recebimentosError) throw recebimentosError;

    if (!recebimentos || recebimentos.length === 0) return [];

    // Buscar informações dos produtos
    const produtosIds = recebimentos.map(r => r.produto_id);
    const { data: produtos, error: produtosError } = await supabase
      .from('produtos')
      .select('id, nome, codigo_barras')
      .in('id', produtosIds);

    if (produtosError) throw produtosError;

    // Combinar dados
    return recebimentos.map(recebimento => {
      const produto = produtos?.find(p => p.id === recebimento.produto_id);
      return {
        ...recebimento,
        valor_total: recebimento.valor_total || 0,
        produto_nome: produto?.nome || 'Produto não encontrado',
        produto_codigo: produto?.codigo_barras
      };
    });
  } catch (error) {
    console.error('Erro ao buscar recebimentos:', error);
    throw error;
  }
}

// Criar novo recebimento
export async function criarRecebimento(
  produto_id: string,
  fornecedor: string,
  quantidade_recebida: number,
  valor_total: number,
  orcamento_id?: string
): Promise<Recebimento> {
  try {
    // Validar que produto_id não é vazio
    if (!produto_id || produto_id.trim() === '') {
      throw new Error('Produto deve ser selecionado');
    }

    // Validar que fornecedor não é vazio
    if (!fornecedor || fornecedor.trim() === '') {
      throw new Error('Fornecedor é obrigatório');
    }

    // Validar quantidade
    if (quantidade_recebida <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    // Validar valor
    if (valor_total <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    const { data, error } = await supabase
      .from('recebimentos')
      .insert({
        produto_id,
        fornecedor,
        quantidade_recebida,
        valor_total,
        status: 'pendente',
        orcamento_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar recebimento:', error);
    throw error;
  }
}

// Confirmar recebimento, atualizar estoque e registrar despesa
export async function confirmarRecebimento(recebimento_id: string): Promise<void> {
  try {
    console.log('📦 Confirmando recebimento:', recebimento_id);

    // Buscar recebimento
    const { data: recebimento, error: recebimentoError } = await supabase
      .from('recebimentos')
      .select('*')
      .eq('id', recebimento_id)
      .single();

    if (recebimentoError) throw recebimentoError;

    // Verificar se já foi confirmado
    if (recebimento.status === 'recebido') {
      console.log('⚠️ Recebimento já foi confirmado anteriormente');
      return;
    }

    // Buscar produto atual
    const { data: produto, error: produtoError } = await supabase
      .from('produtos')
      .select('estoque, nome')
      .eq('id', recebimento.produto_id)
      .single();

    if (produtoError) throw produtoError;

    // Calcular nova quantidade
    const novaQuantidade = (produto.estoque || 0) + recebimento.quantidade_recebida;
    const dataRecebimento = new Date().toISOString();

    // Atualizar produto (estoque)
    const { error: updateProdutoError } = await supabase
      .from('produtos')
      .update({
        estoque: novaQuantidade,
        updated_at: dataRecebimento
      })
      .eq('id', recebimento.produto_id);

    if (updateProdutoError) throw updateProdutoError;

    // Atualizar status do recebimento
    const { error: updateRecebimentoError } = await supabase
      .from('recebimentos')
      .update({
        status: 'recebido',
        data_recebimento: dataRecebimento,
        updated_at: dataRecebimento
      })
      .eq('id', recebimento_id);

    if (updateRecebimentoError) throw updateRecebimentoError;

    // Registrar despesa no financeiro
    const valorTotal = recebimento.valor_total || 0;
    if (valorTotal > 0) {
      await addFinanceiro({
        tipo: 'despesa',
        descricao: `Recebimento de ${produto.nome} - Fornecedor: ${recebimento.fornecedor} (${recebimento.quantidade_recebida} un)`,
        valor: valorTotal,
        categoria: 'Compras',
        data: dataRecebimento,
        status: 'pago'
      });
      console.log(`💰 Despesa registrada no financeiro: R$ ${valorTotal.toFixed(2)}`);
    }

    console.log(`✅ Recebimento confirmado! Estoque atualizado: ${produto.estoque} → ${novaQuantidade}`);
  } catch (error) {
    console.error('❌ Erro ao confirmar recebimento:', error);
    throw error;
  }
}

// Cancelar recebimento
export async function cancelarRecebimento(recebimento_id: string): Promise<void> {
  try {
    // Buscar recebimento
    const { data: recebimento, error: recebimentoError } = await supabase
      .from('recebimentos')
      .select('*')
      .eq('id', recebimento_id)
      .single();

    if (recebimentoError) throw recebimentoError;

    // Verificar se já foi confirmado
    if (recebimento.status === 'recebido') {
      throw new Error('Não é possível cancelar um recebimento já confirmado');
    }

    // Atualizar status para cancelado (ou deletar)
    const { error: updateError } = await supabase
      .from('recebimentos')
      .update({
        status: 'pendente', // Mantém como pendente mas poderia ter um status 'cancelado'
        updated_at: new Date().toISOString()
      })
      .eq('id', recebimento_id);

    if (updateError) throw updateError;

    console.log('✅ Recebimento cancelado');
  } catch (error) {
    console.error('❌ Erro ao cancelar recebimento:', error);
    throw error;
  }
}
