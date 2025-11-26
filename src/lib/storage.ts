// Helper para integração com Supabase
import { supabase } from './supabase';
import { Cliente, Produto, Venda, VendaItem, Servico, Insumo, Fornecedor, Financeiro } from './types';

// Helper para obter o user_id do usuário autenticado
const getUserId = async (): Promise<string> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
  }
  return user.id;
};

// ============= CONTROLE DE PRIMEIRO ACESSO =============
export const isFirstAccess = async (): Promise<boolean> => {
  try {
    const userId = await getUserId();
    
    // Verifica se existe a flag de primeiro acesso no user_metadata
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.user_metadata?.completed_funnel) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar primeiro acesso:', error);
    return false;
  }
};

export const markFunnelAsCompleted = async () => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: { completed_funnel: true }
    });
    
    if (error) {
      console.error('Erro ao marcar funil como completo:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao marcar funil como completo:', error);
    throw error;
  }
};

// ============= CLIENTES =============
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
    
    return data.map(c => ({
      id: c.id,
      nome: c.nome,
      email: c.email,
      telefone: c.telefone || '',
      cpf_cnpj: c.cpf_cnpj || '',
      endereco: c.endereco || '',
      cidade: c.cidade || '',
      estado: c.estado || '',
      data_cadastro: c.data_cadastro,
      status: c.status as 'ativo' | 'inativo'
    }));
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
};

export const addCliente = async (cliente: Omit<Cliente, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('clientes')
    .insert([{
      user_id: userId,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      cpf_cnpj: cliente.cpf_cnpj,
      endereco: cliente.endereco,
      cidade: cliente.cidade,
      estado: cliente.estado,
      status: cliente.status
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar cliente:', error);
    throw error;
  }
  
  return data;
};

export const updateCliente = async (id: string, clienteAtualizado: Partial<Cliente>) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('clientes')
    .update(clienteAtualizado)
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
};

export const deleteCliente = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao deletar cliente:', error);
    throw error;
  }
};

// ============= PRODUTOS =============
export const getProdutos = async (): Promise<Produto[]> => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
    
    return data.map(p => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao || '',
      preco: parseFloat(p.preco),
      estoque: p.estoque,
      categoria: p.categoria || '',
      fornecedor: p.fornecedor || '',
      codigo_barras: p.codigo_barras || '',
      data_cadastro: p.data_cadastro,
      status: p.status as 'ativo' | 'inativo'
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};

export const addProduto = async (produto: Omit<Produto, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('produtos')
    .insert([{
      user_id: userId,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      estoque: produto.estoque,
      categoria: produto.categoria,
      fornecedor: produto.fornecedor,
      codigo_barras: produto.codigo_barras,
      status: produto.status
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar produto:', error);
    throw error;
  }
  
  return data;
};

export const updateProduto = async (id: string, produtoAtualizado: Partial<Produto>) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('produtos')
    .update(produtoAtualizado)
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
};

export const deleteProduto = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
};

// ============= SERVIÇOS =============
export const getServicos = async (): Promise<Servico[]> => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }
    
    return data.map(s => ({
      id: s.id,
      nome: s.nome,
      descricao: s.descricao || '',
      preco: parseFloat(s.preco),
      duracao: s.duracao || 0,
      categoria: s.categoria || '',
      status: s.status as 'ativo' | 'inativo'
    }));
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return [];
  }
};

export const addServico = async (servico: Omit<Servico, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('servicos')
    .insert([{ ...servico, user_id: userId }])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar serviço:', error);
    throw error;
  }
  
  return data;
};

export const updateServico = async (id: string, servicoAtualizado: Partial<Servico>) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('servicos')
    .update(servicoAtualizado)
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao atualizar serviço:', error);
    throw error;
  }
};

export const deleteServico = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('servicos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao deletar serviço:', error);
    throw error;
  }
};

// ============= INSUMOS =============
export const getInsumos = async (): Promise<Insumo[]> => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('insumos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar insumos:', error);
      throw error;
    }
    
    return data.map(i => ({
      id: i.id,
      nome: i.nome,
      descricao: i.descricao || '',
      quantidade: parseFloat(i.quantidade),
      unidade: i.unidade || '',
      preco_unitario: parseFloat(i.preco_unitario || 0),
      fornecedor: i.fornecedor || '',
      data_validade: i.data_validade || '',
      status: i.status as 'ativo' | 'inativo'
    }));
  } catch (error) {
    console.error('Erro ao buscar insumos:', error);
    return [];
  }
};

export const addInsumo = async (insumo: Omit<Insumo, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('insumos')
    .insert([{ 
      ...insumo, 
      user_id: userId,
      data_validade: insumo.data_validade || null // Enviar null se vazio
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar insumo:', error);
    throw error;
  }
  
  return data;
};

export const updateInsumo = async (id: string, insumoAtualizado: Partial<Insumo>) => {
  const userId = await getUserId();
  
  // Tratar data_validade vazia como null
  const dadosAtualizados = {
    ...insumoAtualizado,
    data_validade: insumoAtualizado.data_validade || null
  };
  
  const { error } = await supabase
    .from('insumos')
    .update(dadosAtualizados)
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao atualizar insumo:', error);
    throw error;
  }
};

export const deleteInsumo = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('insumos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao deletar insumo:', error);
    throw error;
  }
};

// ============= FORNECEDORES =============
export const getFornecedores = async (): Promise<Fornecedor[]> => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar fornecedores:', error);
      throw error;
    }
    
    return data.map(f => ({
      id: f.id,
      nome: f.nome,
      cnpj: f.cnpj || '',
      email: f.email || '',
      telefone: f.telefone || '',
      endereco: f.endereco || '',
      cidade: f.cidade || '',
      estado: f.estado || '',
      status: f.status as 'ativo' | 'inativo'
    }));
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    return [];
  }
};

export const addFornecedor = async (fornecedor: Omit<Fornecedor, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('fornecedores')
    .insert([{ ...fornecedor, user_id: userId }])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar fornecedor:', error);
    throw error;
  }
  
  return data;
};

export const updateFornecedor = async (id: string, fornecedorAtualizado: Partial<Fornecedor>) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('fornecedores')
    .update(fornecedorAtualizado)
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    throw error;
  }
};

export const deleteFornecedor = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('fornecedores')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao deletar fornecedor:', error);
    throw error;
  }
};

// ============= VENDAS =============
export const getVendas = async (): Promise<Venda[]> => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('vendas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar vendas:', error);
      throw error;
    }
    
    return data.map(v => ({
      id: v.id,
      cliente_id: v.cliente_id,
      total: parseFloat(v.total),
      data: v.data,
      status: v.status as 'pendente' | 'concluida' | 'cancelada',
      forma_pagamento: v.forma_pagamento || ''
    }));
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return [];
  }
};

export const addVenda = async (venda: Omit<Venda, 'id'>, itens: Array<{produto_id: string, quantidade: number, preco_unitario: number}>) => {
  const userId = await getUserId();
  
  // Inserir a venda
  const { data: vendaData, error: vendaError } = await supabase
    .from('vendas')
    .insert([{ ...venda, user_id: userId }])
    .select()
    .single();
  
  if (vendaError) {
    console.error('Erro ao adicionar venda:', vendaError);
    throw vendaError;
  }
  
  // Inserir os itens da venda
  if (itens.length > 0) {
    const itensComVendaId = itens.map(item => ({
      venda_id: vendaData.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco: item.preco_unitario,
      subtotal: item.quantidade * item.preco_unitario
    }));
    
    const { error: itensError } = await supabase
      .from('vendas_itens')
      .insert(itensComVendaId);
    
    if (itensError) {
      console.error('Erro ao adicionar itens da venda:', itensError);
      throw itensError;
    }
    
    // Atualizar estoque dos produtos APENAS se a venda for concluída
    if (venda.status === 'concluida') {
      for (const item of itens) {
        const { data: produto, error: produtoError } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', item.produto_id)
          .eq('user_id', userId)
          .single();
        
        if (!produtoError && produto) {
          const novoEstoque = produto.estoque - item.quantidade;
          await supabase
            .from('produtos')
            .update({ estoque: novoEstoque })
            .eq('id', item.produto_id)
            .eq('user_id', userId);
        }
      }
    }
  }
  
  // Adicionar receita no financeiro APENAS se a venda estiver concluída
  if (venda.status === 'concluida') {
    // Buscar nome do cliente para descrição completa
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('nome')
      .eq('id', venda.cliente_id)
      .single();
    
    const nomeCliente = clienteData?.nome || 'Cliente não identificado';
    
    // Buscar nomes dos produtos vendidos
    const produtosNomes: string[] = [];
    for (const item of itens) {
      const { data: produtoData } = await supabase
        .from('produtos')
        .select('nome')
        .eq('id', item.produto_id)
        .single();
      
      if (produtoData) {
        produtosNomes.push(`${produtoData.nome} (${item.quantidade}x)`);
      }
    }
    
    const descricaoProdutos = produtosNomes.length > 0 
      ? produtosNomes.join(', ') 
      : 'Produtos não especificados';
    
    const { error: financeiroError } = await supabase
      .from('financeiro')
      .insert([{
        user_id: userId,
        tipo: 'receita',
        descricao: `Venda para ${nomeCliente} - ${descricaoProdutos} - Pagamento: ${venda.forma_pagamento}`,
        valor: venda.total,
        categoria: 'Vendas',
        data: venda.data,
        status: 'pago',
        venda_id: vendaData.id
      }]);
    
    if (financeiroError) {
      console.error('Erro ao adicionar receita no financeiro:', financeiroError);
      // Não lançar erro aqui para não bloquear a venda
    }
  }
  
  return vendaData;
};

export const updateVenda = async (
  id: string, 
  vendaAtualizada: Partial<Venda>, 
  itens?: Array<{produto_id: string, quantidade: number, preco_unitario: number}>
) => {
  const userId = await getUserId();
  
  // Buscar o status atual da venda ANTES de atualizar
  const { data: vendaAtual, error: vendaAtualError } = await supabase
    .from('vendas')
    .select('status, total, cliente_id, data, forma_pagamento')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  
  if (vendaAtualError) {
    console.error('Erro ao buscar venda atual:', vendaAtualError);
    throw vendaAtualError;
  }
  
  const statusAnterior = vendaAtual?.status;
  const novoStatus = vendaAtualizada.status || statusAnterior;
  
  // Buscar os itens da venda para controle de estoque
  const { data: itensAtuais, error: itensError } = await supabase
    .from('vendas_itens')
    .select('produto_id, quantidade')
    .eq('venda_id', id);
  
  if (itensError) {
    console.error('Erro ao buscar itens da venda:', itensError);
    throw itensError;
  }
  
  // ============= CONTROLE AUTOMÁTICO DE ESTOQUE =============
  
  // Se foram fornecidos novos itens, fazer controle de estoque baseado nos itens
  if (itens && itens.length > 0) {
    console.log('🔄 Atualizando itens da venda - Controle de estoque baseado nos itens');
    
    // PASSO 1: Devolver ao estoque as quantidades antigas (APENAS se a venda estava concluída)
    if (statusAnterior === 'concluida' && itensAtuais) {
      for (const itemAtual of itensAtuais) {
        const { data: produto, error: produtoError } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', itemAtual.produto_id)
          .eq('user_id', userId)
          .single();
        
        if (!produtoError && produto) {
          const novoEstoque = produto.estoque + itemAtual.quantidade;
          await supabase
            .from('produtos')
            .update({ estoque: novoEstoque })
            .eq('id', itemAtual.produto_id)
            .eq('user_id', userId);
          console.log(`✅ Devolvido ao estoque: ${itemAtual.produto_id} +${itemAtual.quantidade} (estoque: ${novoEstoque})`);
        }
      }
    }
    
    // PASSO 2: Deletar os itens antigos
    await supabase
      .from('vendas_itens')
      .delete()
      .eq('venda_id', id);
    
    // PASSO 3: Inserir os novos itens
    const novosItens = itens.map(item => ({
      venda_id: id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco: item.preco_unitario,
      subtotal: item.quantidade * item.preco_unitario
    }));
    
    const { error: novosItensError } = await supabase
      .from('vendas_itens')
      .insert(novosItens);
    
    if (novosItensError) {
      console.error('Erro ao atualizar itens da venda:', novosItensError);
      throw novosItensError;
    }
    
    // PASSO 4: Subtrair do estoque as novas quantidades (APENAS se a venda for concluída)
    if (novoStatus === 'concluida') {
      for (const item of itens) {
        const { data: produto, error: produtoError } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', item.produto_id)
          .eq('user_id', userId)
          .single();
        
        if (!produtoError && produto) {
          const novoEstoque = produto.estoque - item.quantidade;
          await supabase
            .from('produtos')
            .update({ estoque: novoEstoque })
            .eq('id', item.produto_id)
            .eq('user_id', userId);
          console.log(`✅ Removido do estoque: ${item.produto_id} -${item.quantidade} (estoque: ${novoEstoque})`);
        }
      }
    }
  } 
  // Se NÃO foram fornecidos novos itens, fazer controle baseado APENAS na mudança de status
  else if (statusAnterior !== novoStatus) {
    console.log('🔄 Mudança de status detectada - Controle de estoque baseado no status');
    
    // CASO 1: Venda "Concluída" mudou para "Pendente" ou "Cancelada" → DEVOLVER produtos ao estoque
    if (statusAnterior === 'concluida' && (novoStatus === 'pendente' || novoStatus === 'cancelada')) {
      console.log('🔄 Devolvendo produtos ao estoque (Concluída → Pendente/Cancelada)');
      if (itensAtuais) {
        for (const item of itensAtuais) {
          const { data: produto, error: produtoError } = await supabase
            .from('produtos')
            .select('estoque')
            .eq('id', item.produto_id)
            .eq('user_id', userId)
            .single();
          
          if (!produtoError && produto) {
            const novoEstoque = produto.estoque + item.quantidade;
            await supabase
              .from('produtos')
              .update({ estoque: novoEstoque })
              .eq('id', item.produto_id)
              .eq('user_id', userId);
            console.log(`✅ Produto ${item.produto_id}: +${item.quantidade} unidades (estoque: ${novoEstoque})`);
          }
        }
      }
    }
    
    // CASO 2: Venda "Pendente" ou "Cancelada" mudou para "Concluída" → REMOVER produtos do estoque
    if ((statusAnterior === 'pendente' || statusAnterior === 'cancelada') && novoStatus === 'concluida') {
      console.log('🔄 Removendo produtos do estoque (Pendente/Cancelada → Concluída)');
      if (itensAtuais) {
        for (const item of itensAtuais) {
          const { data: produto, error: produtoError } = await supabase
            .from('produtos')
            .select('estoque')
            .eq('id', item.produto_id)
            .eq('user_id', userId)
            .single();
          
          if (!produtoError && produto) {
            const novoEstoque = produto.estoque - item.quantidade;
            await supabase
              .from('produtos')
              .update({ estoque: novoEstoque })
              .eq('id', item.produto_id)
              .eq('user_id', userId);
            console.log(`✅ Produto ${item.produto_id}: -${item.quantidade} unidades (estoque: ${novoEstoque})`);
          }
        }
      }
    }
  }
  
  // Atualizar a venda
  const { error } = await supabase
    .from('vendas')
    .update(vendaAtualizada)
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao atualizar venda:', error);
    throw error;
  }
  
  // ============= GERENCIAR RECEITA NO FINANCEIRO BASEADO NA MUDANÇA DE STATUS =============
  
  // Verificar se existe receita vinculada a esta venda
  const { data: receitaExistente } = await supabase
    .from('financeiro')
    .select('id')
    .eq('venda_id', id)
    .eq('user_id', userId)
    .single();
  
  // Caso 1: Venda estava concluída e mudou para pendente/cancelada → REMOVER receita
  if (statusAnterior === 'concluida' && (novoStatus === 'pendente' || novoStatus === 'cancelada')) {
    if (receitaExistente) {
      await supabase
        .from('financeiro')
        .delete()
        .eq('venda_id', id)
        .eq('user_id', userId);
      console.log('💰 Receita removida do financeiro');
    }
  }
  
  // Caso 2: Venda mudou para concluída e não tinha receita → ADICIONAR receita
  if (novoStatus === 'concluida' && statusAnterior !== 'concluida') {
    if (!receitaExistente) {
      // Buscar dados atualizados da venda
      const { data: vendaAtualizada } = await supabase
        .from('vendas')
        .select('total, cliente_id, data, forma_pagamento')
        .eq('id', id)
        .single();
      
      if (vendaAtualizada) {
        // Buscar nome do cliente
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('nome')
          .eq('id', vendaAtualizada.cliente_id)
          .single();
        
        const nomeCliente = clienteData?.nome || 'Cliente não identificado';
        
        // Buscar itens da venda para descrição
        const { data: itensVenda } = await supabase
          .from('vendas_itens')
          .select('produto_id, quantidade')
          .eq('venda_id', id);
        
        const produtosNomes: string[] = [];
        if (itensVenda) {
          for (const item of itensVenda) {
            const { data: produtoData } = await supabase
              .from('produtos')
              .select('nome')
              .eq('id', item.produto_id)
              .single();
            
            if (produtoData) {
              produtosNomes.push(`${produtoData.nome} (${item.quantidade}x)`);
            }
          }
        }
        
        const descricaoProdutos = produtosNomes.length > 0 
          ? produtosNomes.join(', ') 
          : 'Produtos não especificados';
        
        await supabase
          .from('financeiro')
          .insert([{
            user_id: userId,
            tipo: 'receita',
            descricao: `Venda para ${nomeCliente} - ${descricaoProdutos} - Pagamento: ${vendaAtualizada.forma_pagamento}`,
            valor: vendaAtualizada.total,
            categoria: 'Vendas',
            data: vendaAtualizada.data,
            status: 'pago',
            venda_id: id
          }]);
        console.log('💰 Receita adicionada ao financeiro');
      }
    }
  }
};

export const deleteVenda = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('vendas')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao deletar venda:', error);
    throw error;
  }
};

// Buscar itens de uma venda específica
export const getVendaItens = async (vendaId: string): Promise<VendaItem[]> => {
  try {
    const { data, error } = await supabase
      .from('vendas_itens')
      .select('*')
      .eq('venda_id', vendaId);
    
    if (error) {
      console.error('Erro ao buscar itens da venda:', error);
      throw error;
    }
    
    return data.map(item => ({
      id: item.id,
      venda_id: item.venda_id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: parseFloat(item.preco),
      subtotal: parseFloat(item.subtotal)
    }));
  } catch (error) {
    console.error('Erro ao buscar itens da venda:', error);
    return [];
  }
};

// ============= FINANCEIRO =============
export const getFinanceiro = async (): Promise<Financeiro[]> => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar financeiro:', error);
      throw error;
    }
    
    return data.map(f => ({
      id: f.id,
      tipo: f.tipo as 'receita' | 'despesa',
      descricao: f.descricao,
      valor: parseFloat(f.valor),
      categoria: f.categoria || '',
      data: f.data,
      status: f.status as 'pendente' | 'pago' | 'cancelado',
      venda_id: f.venda_id
    }));
  } catch (error) {
    console.error('Erro ao buscar financeiro:', error);
    return [];
  }
};

export const addFinanceiro = async (financeiro: Omit<Financeiro, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('financeiro')
    .insert([{ ...financeiro, user_id: userId }])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar movimentação financeira:', error);
    throw error;
  }
  
  return data;
};

export const updateFinanceiro = async (id: string, financeiroAtualizado: Partial<Financeiro>) => {
  const userId = await getUserId();
  
  // IMPORTANTE: Edições no financeiro NÃO devem afetar o estoque
  // O estoque é controlado APENAS pela aba "Vendas"
  
  const { error } = await supabase
    .from('financeiro')
    .update(financeiroAtualizado)
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao atualizar movimentação financeira:', error);
    throw error;
  }
};

export const deleteFinanceiro = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('financeiro')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Erro ao deletar movimentação financeira:', error);
    throw error;
  }
};
