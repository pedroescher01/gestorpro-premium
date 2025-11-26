import { supabase } from './supabase';
import { getOrcamentoById, getOrcamentoItens } from './orcamentos';

export interface Producao {
  id: string;
  orcamento_id: string;
  status: 'preparacao' | 'concluido' | 'cancelado';
  data_inicio: string;
  data_conclusao?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Buscar todas as produções
export async function getProducoes() {
  try {
    const { data, error } = await supabase
      .from('producao')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar produções:', error);
    throw error;
  }
}

// Buscar produção por orçamento
export async function getProducaoPorOrcamento(orcamento_id: string) {
  try {
    const { data, error } = await supabase
      .from('producao')
      .select('*')
      .eq('orcamento_id', orcamento_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar produção:', error);
    return null;
  }
}

// Criar nova produção (quando orçamento é aprovado)
export async function criarProducao(orcamento_id: string) {
  try {
    console.log('🏭 Criando produção para orçamento:', orcamento_id);
    
    // Verificar se já existe produção para este orçamento (evitar duplicação)
    const producaoExistente = await getProducaoPorOrcamento(orcamento_id);
    if (producaoExistente) {
      console.log('⚠️ Produção já existe para este orçamento:', producaoExistente.id);
      return producaoExistente;
    }
    
    const { data, error } = await supabase
      .from('producao')
      .insert({
        orcamento_id,
        status: 'preparacao',
        data_inicio: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Produção criada com sucesso:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar produção:', error);
    throw error;
  }
}

// Atualizar status da produção
export async function atualizarStatusProducao(
  id: string, 
  status: 'preparacao' | 'concluido' | 'cancelado',
  observacoes?: string
) {
  try {
    console.log(`🔄 Atualizando status da produção ${id} para: ${status}`);
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'concluido') {
      updateData.data_conclusao = new Date().toISOString();
    }

    if (observacoes) {
      updateData.observacoes = observacoes;
    }

    const { data, error } = await supabase
      .from('producao')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Status da produção atualizado com sucesso');
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar status da produção:', error);
    throw error;
  }
}

// Concluir produção: descontar estoque e criar venda automaticamente
export async function concluirProducao(producaoId: string, orcamentoId: string) {
  try {
    console.log('🎯 Concluindo produção:', producaoId);
    
    // 1. Verificar se a produção já foi concluída (evitar duplicação)
    const { data: producaoAtual, error: producaoError } = await supabase
      .from('producao')
      .select('status')
      .eq('id', producaoId)
      .single();
    
    if (producaoError) throw producaoError;
    
    if (producaoAtual.status === 'concluido') {
      console.log('⚠️ Produção já foi concluída anteriormente');
      return { success: true, message: 'Produção já concluída' };
    }
    
    // 2. Atualizar status da produção para concluído
    await atualizarStatusProducao(producaoId, 'concluido');
    
    // 3. Descontar produtos do estoque
    console.log('📦 Descontando produtos do estoque...');
    await descontarEstoquePorProducao(orcamentoId);
    
    // 4. Criar venda automaticamente
    console.log('💰 Criando venda automaticamente...');
    const venda = await criarVendaDeProducao(orcamentoId);
    
    console.log('✅ Produção concluída com sucesso! Venda criada:', venda?.id);
    
    return { success: true, venda };
  } catch (error) {
    console.error('❌ Erro ao concluir produção:', error);
    throw error;
  }
}

// Descontar produtos do estoque quando produção for concluída
export async function descontarEstoquePorProducao(orcamento_id: string) {
  try {
    console.log('📦 Descontando estoque para orçamento:', orcamento_id);
    
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

    // Descontar cada produto do estoque
    for (const item of itens) {
      // Buscar produto atual
      const { data: produto, error: produtoError } = await supabase
        .from('produtos')
        .select('estoque')
        .eq('id', item.item_id)
        .single();

      if (produtoError) {
        console.error(`❌ Erro ao buscar produto ${item.item_id}:`, produtoError);
        continue;
      }

      // Calcular novo estoque
      const novoEstoque = produto.estoque - item.quantidade;

      // Atualizar estoque
      const { error: updateError } = await supabase
        .from('produtos')
        .update({ 
          estoque: novoEstoque,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.item_id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar estoque do produto ${item.item_id}:`, updateError);
        throw updateError;
      }

      console.log(`✅ Produto ${item.item_nome}: estoque atualizado de ${produto.estoque} para ${novoEstoque}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao descontar estoque:', error);
    throw error;
  }
}

// Criar venda automaticamente quando produção for concluída
export async function criarVendaDeProducao(orcamento_id: string) {
  try {
    console.log('💰 Criando venda para orçamento:', orcamento_id);
    
    // 1. Buscar dados do orçamento
    const orcamento = await getOrcamentoById(orcamento_id);
    if (!orcamento) {
      throw new Error('Orçamento não encontrado');
    }
    
    // 2. Verificar se já existe venda para este orçamento (evitar duplicação)
    const { data: vendaExistente, error: vendaExistenteError } = await supabase
      .from('vendas')
      .select('id')
      .eq('cliente_id', orcamento.cliente_id)
      .eq('total', orcamento.valor_total)
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Últimos 60 segundos
      .single();
    
    if (vendaExistente && !vendaExistenteError) {
      console.log('⚠️ Venda já existe para este orçamento:', vendaExistente.id);
      return vendaExistente;
    }
    
    // 3. Buscar itens do orçamento (apenas produtos)
    const { data: itensOrcamento, error: itensError } = await supabase
      .from('orcamento_itens')
      .select('*')
      .eq('orcamento_id', orcamento_id)
      .eq('tipo', 'produto');
    
    if (itensError) throw itensError;
    
    if (!itensOrcamento || itensOrcamento.length === 0) {
      console.log('⚠️ Nenhum produto no orçamento para criar venda');
      return null;
    }
    
    // 4. Obter user_id
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }
    
    // 5. Criar a venda com status "realizada" e data_venda = timestamp da conclusão
    const dataVenda = new Date().toISOString().split('T')[0];
    
    const { data: venda, error: vendaError } = await supabase
      .from('vendas')
      .insert({
        cliente_id: orcamento.cliente_id,
        total: orcamento.valor_total,
        data: dataVenda,
        status: 'concluida', // Status = realizada (concluída)
        forma_pagamento: 'A definir',
        user_id: user.id
      })
      .select()
      .single();
    
    if (vendaError) throw vendaError;
    
    console.log('✅ Venda criada:', venda.id);
    
    // 6. Criar itens da venda
    const itensVenda = itensOrcamento.map(item => ({
      venda_id: venda.id,
      produto_id: item.item_id,
      quantidade: item.quantidade,
      preco: item.preco_unitario,
      subtotal: item.quantidade * item.preco_unitario
    }));
    
    const { error: itensVendaError } = await supabase
      .from('vendas_itens')
      .insert(itensVenda);
    
    if (itensVendaError) throw itensVendaError;
    
    console.log('✅ Itens da venda criados');
    
    // 7. Criar receita no financeiro
    const { data: cliente } = await supabase
      .from('clientes')
      .select('nome')
      .eq('id', orcamento.cliente_id)
      .single();
    
    const nomeCliente = cliente?.nome || 'Cliente não identificado';
    
    // Buscar nomes dos produtos
    const produtosNomes: string[] = [];
    for (const item of itensOrcamento) {
      produtosNomes.push(`${item.item_nome} (${item.quantidade}x)`);
    }
    
    const descricaoProdutos = produtosNomes.join(', ');
    
    const { error: financeiroError } = await supabase
      .from('financeiro')
      .insert({
        user_id: user.id,
        tipo: 'receita',
        descricao: `Venda para ${nomeCliente} - ${descricaoProdutos} - Orçamento: ${orcamento.numero}`,
        valor: orcamento.valor_total,
        categoria: 'Vendas',
        data: dataVenda,
        status: 'pago',
        venda_id: venda.id
      });
    
    if (financeiroError) {
      console.error('⚠️ Erro ao criar receita no financeiro:', financeiroError);
      // Não lançar erro para não bloquear a venda
    } else {
      console.log('✅ Receita criada no financeiro');
    }
    
    return venda;
  } catch (error) {
    console.error('❌ Erro ao criar venda:', error);
    throw error;
  }
}

// Deletar produção
export async function deletarProducao(id: string) {
  try {
    const { error } = await supabase
      .from('producao')
      .update({ status: 'cancelado' })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao cancelar produção:', error);
    throw error;
  }
}
