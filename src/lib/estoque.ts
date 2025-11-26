import { supabase } from './supabase';

export interface Estoque {
  id: string;
  produto_id: string;
  quantidade_disponivel: number;
  custo_medio: number;
  ultima_movimentacao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EstoqueMovimentacao {
  id: string;
  produto_id: string;
  quantidade: number;
  tipo: 'entrada' | 'saida' | 'ajuste';
  origem: 'compra' | 'producao' | 'venda' | 'ajuste_manual' | 'reposicao';
  motivo?: string;
  producao_id?: string;
  venda_id?: string;
  custo_unitario?: number;
  data_hora: string;
  user_id: string;
  created_at?: string;
}

export interface EstoqueComProduto extends Estoque {
  produto_nome: string;
  produto_codigo?: string;
}

// Buscar todos os estoques com informações do produto
export async function getEstoques(): Promise<EstoqueComProduto[]> {
  try {
    const { data: estoques, error: estoqueError } = await supabase
      .from('estoque')
      .select('*')
      .order('updated_at', { ascending: false });

    if (estoqueError) throw estoqueError;

    if (!estoques || estoques.length === 0) return [];

    // Buscar informações dos produtos
    const produtosIds = estoques.map(e => e.produto_id);
    const { data: produtos, error: produtosError } = await supabase
      .from('produtos')
      .select('id, nome, codigo')
      .in('id', produtosIds);

    if (produtosError) throw produtosError;

    // Combinar dados
    return estoques.map(estoque => {
      const produto = produtos?.find(p => p.id === estoque.produto_id);
      return {
        ...estoque,
        produto_nome: produto?.nome || 'Produto não encontrado',
        produto_codigo: produto?.codigo
      };
    });
  } catch (error) {
    console.error('Erro ao buscar estoques:', error);
    throw error;
  }
}

// Buscar estoque de um produto específico
export async function getEstoquePorProduto(produto_id: string): Promise<Estoque | null> {
  try {
    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .eq('produto_id', produto_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar estoque do produto:', error);
    return null;
  }
}

// Buscar movimentações de estoque
export async function getMovimentacoes(produto_id?: string): Promise<EstoqueMovimentacao[]> {
  try {
    let query = supabase
      .from('estoque_movimentacoes')
      .select('*')
      .order('data_hora', { ascending: false });

    if (produto_id) {
      query = query.eq('produto_id', produto_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    throw error;
  }
}

// Registrar movimentação de estoque
export async function registrarMovimentacao(
  produto_id: string,
  quantidade: number,
  tipo: 'entrada' | 'saida' | 'ajuste',
  origem: 'compra' | 'producao' | 'venda' | 'ajuste_manual' | 'reposicao',
  motivo?: string,
  producao_id?: string,
  venda_id?: string,
  custo_unitario?: number
): Promise<EstoqueMovimentacao> {
  try {
    console.log(`📦 Registrando movimentação: ${tipo} de ${quantidade} unidades do produto ${produto_id}`);

    // Obter user_id
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Registrar movimentação
    const { data: movimentacao, error: movError } = await supabase
      .from('estoque_movimentacoes')
      .insert({
        produto_id,
        quantidade,
        tipo,
        origem,
        motivo,
        producao_id,
        venda_id,
        custo_unitario,
        user_id: user.id,
        data_hora: new Date().toISOString()
      })
      .select()
      .single();

    if (movError) throw movError;

    // Atualizar estoque
    await atualizarEstoque(produto_id, quantidade, tipo, custo_unitario);

    console.log('✅ Movimentação registrada com sucesso');
    return movimentacao;
  } catch (error) {
    console.error('❌ Erro ao registrar movimentação:', error);
    throw error;
  }
}

// Atualizar estoque após movimentação
async function atualizarEstoque(
  produto_id: string,
  quantidade: number,
  tipo: 'entrada' | 'saida' | 'ajuste',
  custo_unitario?: number
) {
  try {
    // Buscar estoque atual
    let estoque = await getEstoquePorProduto(produto_id);

    // Se não existe, criar
    if (!estoque) {
      const { data, error } = await supabase
        .from('estoque')
        .insert({
          produto_id,
          quantidade_disponivel: 0,
          custo_medio: 0,
          ultima_movimentacao: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      estoque = data;
    }

    // Calcular nova quantidade
    let novaQuantidade = estoque.quantidade_disponivel;
    if (tipo === 'entrada') {
      novaQuantidade += quantidade;
    } else if (tipo === 'saida') {
      novaQuantidade -= quantidade;
    } else if (tipo === 'ajuste') {
      novaQuantidade = quantidade; // Ajuste define quantidade absoluta
    }

    // Calcular novo custo médio (apenas para entradas)
    let novoCustoMedio = estoque.custo_medio;
    if (tipo === 'entrada' && custo_unitario) {
      const valorTotalAnterior = estoque.quantidade_disponivel * estoque.custo_medio;
      const valorNovaEntrada = quantidade * custo_unitario;
      novoCustoMedio = (valorTotalAnterior + valorNovaEntrada) / novaQuantidade;
    }

    // Atualizar estoque
    const { error: updateError } = await supabase
      .from('estoque')
      .update({
        quantidade_disponivel: novaQuantidade,
        custo_medio: novoCustoMedio,
        ultima_movimentacao: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('produto_id', produto_id);

    if (updateError) throw updateError;

    console.log(`✅ Estoque atualizado: ${estoque.quantidade_disponivel} → ${novaQuantidade}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar estoque:', error);
    throw error;
  }
}

// Registrar saída de estoque por produção
export async function registrarSaidaProducao(
  producao_id: string,
  orcamento_id: string
): Promise<void> {
  try {
    console.log('📦 Registrando saída de estoque para produção:', producao_id);

    // Buscar itens do orçamento (apenas produtos)
    const { data: itens, error: itensError } = await supabase
      .from('orcamento_itens')
      .select('*')
      .eq('orcamento_id', orcamento_id)
      .eq('tipo', 'produto');

    if (itensError) throw itensError;

    if (!itens || itens.length === 0) {
      console.log('⚠️ Nenhum produto para descontar do estoque');
      return;
    }

    // Registrar saída para cada produto
    for (const item of itens) {
      await registrarMovimentacao(
        item.item_id,
        item.quantidade,
        'saida',
        'producao',
        `Produção concluída - Orçamento ${orcamento_id}`,
        producao_id,
        undefined,
        item.preco_unitario
      );
    }

    console.log('✅ Saída de estoque registrada para todos os produtos');
  } catch (error) {
    console.error('❌ Erro ao registrar saída de estoque:', error);
    throw error;
  }
}

// Lançamento manual de entrada (compra/reposição)
export async function lancarEntradaManual(
  produto_id: string,
  quantidade: number,
  custo_unitario: number,
  motivo: string
): Promise<EstoqueMovimentacao> {
  try {
    return await registrarMovimentacao(
      produto_id,
      quantidade,
      'entrada',
      'reposicao',
      motivo,
      undefined,
      undefined,
      custo_unitario
    );
  } catch (error) {
    console.error('Erro ao lançar entrada manual:', error);
    throw error;
  }
}

// Ajuste de estoque
export async function ajustarEstoque(
  produto_id: string,
  quantidade_nova: number,
  motivo: string
): Promise<EstoqueMovimentacao> {
  try {
    return await registrarMovimentacao(
      produto_id,
      quantidade_nova,
      'ajuste',
      'ajuste_manual',
      motivo
    );
  } catch (error) {
    console.error('Erro ao ajustar estoque:', error);
    throw error;
  }
}
