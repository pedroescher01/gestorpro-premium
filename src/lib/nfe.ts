import { supabase } from './supabase';
import { NotaFiscal, NotificacaoNFE, RelatorioNFE } from './types';

// Funções de CRUD para Notas Fiscais
export async function getNotasFiscais(): Promise<NotaFiscal[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('notas_fiscais')
      .select('*')
      .eq('user_id', user.id)
      .order('data_emissao', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    throw error;
  }
}

export async function createNotaFiscal(nota: Omit<NotaFiscal, 'id'>): Promise<NotaFiscal> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Validações
    if (!nota.destinatario_nome || !nota.destinatario_cpf_cnpj) {
      throw new Error('Dados do destinatário são obrigatórios');
    }

    if (!nota.itens || nota.itens.length === 0) {
      throw new Error('A nota fiscal deve conter pelo menos um item');
    }

    const { data, error } = await supabase
      .from('notas_fiscais')
      .insert([{
        ...nota,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Criar notificação
    await criarNotificacao({
      tipo: 'sucesso',
      titulo: 'NFE Criada',
      mensagem: `Nota fiscal ${nota.numero} criada com sucesso`,
      nota_fiscal_id: data.id
    });

    return data;
  } catch (error) {
    console.error('Erro ao criar nota fiscal:', error);
    throw error;
  }
}

export async function updateNotaFiscal(id: string, updates: Partial<NotaFiscal>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('notas_fiscais')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar nota fiscal:', error);
    throw error;
  }
}

export async function deleteNotaFiscal(id: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se a nota pode ser excluída (apenas rascunhos)
    const { data: nota } = await supabase
      .from('notas_fiscais')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (nota?.status !== 'rascunho') {
      throw new Error('Apenas notas em rascunho podem ser excluídas');
    }

    const { error } = await supabase
      .from('notas_fiscais')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar nota fiscal:', error);
    throw error;
  }
}

export async function emitirNotaFiscal(id: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Buscar nota para validação
    const { data: nota } = await supabase
      .from('notas_fiscais')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!nota) throw new Error('Nota fiscal não encontrada');
    if (nota.status !== 'rascunho') throw new Error('Apenas notas em rascunho podem ser emitidas');

    // Validações completas
    validarNotaFiscal(nota);

    // Gerar chave de acesso (44 dígitos)
    const chaveAcesso = gerarChaveAcesso(nota);
    const protocoloAutorizacao = `${Date.now()}`;
    const xmlNota = gerarXMLNota(nota, chaveAcesso);

    const { error } = await supabase
      .from('notas_fiscais')
      .update({
        status: 'emitida',
        chave_acesso: chaveAcesso,
        protocolo_autorizacao: protocoloAutorizacao,
        xml_nota: xmlNota,
        data_saida: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    // Criar notificação
    await criarNotificacao({
      tipo: 'sucesso',
      titulo: 'NFE Emitida',
      mensagem: `Nota fiscal ${nota.numero} emitida com sucesso`,
      nota_fiscal_id: id
    });
  } catch (error) {
    console.error('Erro ao emitir nota fiscal:', error);
    
    // Criar notificação de erro
    await criarNotificacao({
      tipo: 'erro',
      titulo: 'Erro ao Emitir NFE',
      mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
      nota_fiscal_id: id
    });
    
    throw error;
  }
}

export async function cancelarNotaFiscal(id: string, motivo: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    if (!motivo || motivo.length < 15) {
      throw new Error('O motivo do cancelamento deve ter no mínimo 15 caracteres');
    }

    // Buscar nota para validação
    const { data: nota } = await supabase
      .from('notas_fiscais')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!nota) throw new Error('Nota fiscal não encontrada');
    if (nota.status !== 'emitida') throw new Error('Apenas notas emitidas podem ser canceladas');

    const { error } = await supabase
      .from('notas_fiscais')
      .update({
        status: 'cancelada',
        motivo_cancelamento: motivo,
        data_cancelamento: new Date().toISOString(),
        observacoes: `${nota.observacoes}\n\nCANCELADA - Motivo: ${motivo}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    // Criar notificação
    await criarNotificacao({
      tipo: 'erro',
      titulo: 'NFE Cancelada',
      mensagem: `Nota fiscal ${nota.numero} foi cancelada`,
      nota_fiscal_id: id
    });
  } catch (error) {
    console.error('Erro ao cancelar nota fiscal:', error);
    throw error;
  }
}

// Funções auxiliares
function validarNotaFiscal(nota: any): void {
  const erros: string[] = [];

  // Validar emitente
  if (!nota.emitente_nome) erros.push('Nome do emitente é obrigatório');
  if (!nota.emitente_cnpj) erros.push('CNPJ do emitente é obrigatório');

  // Validar destinatário
  if (!nota.destinatario_nome) erros.push('Nome do destinatário é obrigatório');
  if (!nota.destinatario_cpf_cnpj) erros.push('CPF/CNPJ do destinatário é obrigatório');
  if (!nota.destinatario_endereco) erros.push('Endereço do destinatário é obrigatório');
  if (!nota.destinatario_cidade) erros.push('Cidade do destinatário é obrigatória');
  if (!nota.destinatario_estado) erros.push('Estado do destinatário é obrigatório');

  // Validar itens
  if (!nota.itens || nota.itens.length === 0) {
    erros.push('A nota deve conter pelo menos um item');
  } else {
    nota.itens.forEach((item: any, index: number) => {
      if (!item.descricao) erros.push(`Item ${index + 1}: Descrição é obrigatória`);
      if (!item.quantidade || item.quantidade <= 0) erros.push(`Item ${index + 1}: Quantidade inválida`);
      if (!item.valor_unitario || item.valor_unitario <= 0) erros.push(`Item ${index + 1}: Valor unitário inválido`);
      if (!item.cfop) erros.push(`Item ${index + 1}: CFOP é obrigatório`);
    });
  }

  // Validar valores
  if (nota.valor_total <= 0) erros.push('Valor total deve ser maior que zero');

  if (erros.length > 0) {
    throw new Error(`Erros de validação:\n${erros.join('\n')}`);
  }
}

function gerarChaveAcesso(nota: any): string {
  // Simulação de geração de chave de acesso (44 dígitos)
  // Em produção, seguir especificação da SEFAZ
  const uf = '35'; // São Paulo (exemplo)
  const aamm = new Date().toISOString().slice(2, 7).replace('-', '');
  const cnpj = nota.emitente_cnpj.replace(/\D/g, '').padStart(14, '0');
  const mod = '55'; // Modelo 55 (NFe)
  const serie = nota.serie.padStart(3, '0');
  const numero = nota.numero.replace(/\D/g, '').padStart(9, '0');
  const tpEmis = '1'; // Normal
  const codigo = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  
  const chave = uf + aamm + cnpj + mod + serie + numero + tpEmis + codigo;
  
  // Calcular dígito verificador (simplificado)
  const dv = calcularDV(chave);
  
  return chave + dv;
}

function calcularDV(chave: string): string {
  // Algoritmo módulo 11 simplificado
  let soma = 0;
  let peso = 2;
  
  for (let i = chave.length - 1; i >= 0; i--) {
    soma += parseInt(chave[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  
  const resto = soma % 11;
  const dv = resto < 2 ? 0 : 11 - resto;
  
  return dv.toString();
}

function gerarXMLNota(nota: any, chaveAcesso: string): string {
  // Gerar XML simplificado (em produção, usar biblioteca específica)
  return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${chaveAcesso}">
      <ide>
        <cUF>35</cUF>
        <cNF>${chaveAcesso.slice(-9, -1)}</cNF>
        <natOp>${nota.natureza_operacao}</natOp>
        <mod>55</mod>
        <serie>${nota.serie}</serie>
        <nNF>${nota.numero.replace(/\D/g, '')}</nNF>
        <dhEmi>${new Date().toISOString()}</dhEmi>
        <tpNF>${nota.tipo_nota === 'saida' ? '1' : '0'}</tpNF>
      </ide>
      <emit>
        <CNPJ>${nota.emitente_cnpj.replace(/\D/g, '')}</CNPJ>
        <xNome>${nota.emitente_nome}</xNome>
        <enderEmit>
          <xLgr>${nota.emitente_endereco}</xLgr>
          <xMun>${nota.emitente_cidade}</xMun>
          <UF>${nota.emitente_estado}</UF>
        </enderEmit>
      </emit>
      <dest>
        <CPF_CNPJ>${nota.destinatario_cpf_cnpj.replace(/\D/g, '')}</CPF_CNPJ>
        <xNome>${nota.destinatario_nome}</xNome>
        <enderDest>
          <xLgr>${nota.destinatario_endereco}</xLgr>
          <xMun>${nota.destinatario_cidade}</xMun>
          <UF>${nota.destinatario_estado}</UF>
        </enderDest>
      </dest>
      <total>
        <ICMSTot>
          <vNF>${nota.valor_total.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;
}

// Funções de notificação
export async function criarNotificacao(notificacao: Omit<NotificacaoNFE, 'id' | 'data' | 'lida'>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notificacoes_nfe')
      .insert([{
        ...notificacao,
        user_id: user.id,
        data: new Date().toISOString(),
        lida: false
      }]);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
}

export async function getNotificacoes(): Promise<NotificacaoNFE[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notificacoes_nfe')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
}

export async function marcarNotificacaoLida(id: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notificacoes_nfe')
      .update({ lida: true })
      .eq('id', id)
      .eq('user_id', user.id);
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
}

// Funções de relatório
export async function gerarRelatorioNFE(dataInicio: string, dataFim: string): Promise<RelatorioNFE> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data: notas, error } = await supabase
      .from('notas_fiscais')
      .select('*')
      .eq('user_id', user.id)
      .gte('data_emissao', dataInicio)
      .lte('data_emissao', dataFim);

    if (error) throw error;

    const emitidas = notas?.filter(n => n.status === 'emitida') || [];
    const canceladas = notas?.filter(n => n.status === 'cancelada') || [];

    return {
      periodo: `${dataInicio} a ${dataFim}`,
      total_emitidas: emitidas.length,
      total_canceladas: canceladas.length,
      valor_total_emitidas: emitidas.reduce((acc, n) => acc + n.valor_total, 0),
      valor_total_canceladas: canceladas.reduce((acc, n) => acc + n.valor_total, 0),
      notas_por_mes: [],
      notas_por_cliente: []
    };
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    throw error;
  }
}

// Funções de exportação
export function exportarXML(nota: NotaFiscal): void {
  const blob = new Blob([nota.xml_nota], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NFE_${nota.numero}_${nota.chave_acesso}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportarPDF(nota: NotaFiscal): void {
  // Gerar HTML para impressão
  const htmlContent = gerarHTMLNota(nota);
  
  // Abrir em nova janela para impressão
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

function gerarHTMLNota(nota: NotaFiscal): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>NFE ${nota.numero}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; background: #f0f0f0; padding: 5px; }
    .info-row { display: flex; margin-bottom: 5px; }
    .info-label { font-weight: bold; width: 150px; }
    .info-value { flex: 1; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background: #f0f0f0; }
    .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>NOTA FISCAL ELETRÔNICA</h1>
    <p>Nº ${nota.numero} - Série ${nota.serie}</p>
    <p style="font-size: 10px;">Chave de Acesso: ${nota.chave_acesso}</p>
  </div>

  <div class="section">
    <div class="section-title">EMITENTE</div>
    <div class="info-row">
      <div class="info-label">Nome/Razão Social:</div>
      <div class="info-value">${nota.emitente_nome}</div>
    </div>
    <div class="info-row">
      <div class="info-label">CNPJ:</div>
      <div class="info-value">${nota.emitente_cnpj}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Endereço:</div>
      <div class="info-value">${nota.emitente_endereco}, ${nota.emitente_cidade}/${nota.emitente_estado}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">DESTINATÁRIO</div>
    <div class="info-row">
      <div class="info-label">Nome/Razão Social:</div>
      <div class="info-value">${nota.destinatario_nome}</div>
    </div>
    <div class="info-row">
      <div class="info-label">CPF/CNPJ:</div>
      <div class="info-value">${nota.destinatario_cpf_cnpj}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Endereço:</div>
      <div class="info-value">${nota.destinatario_endereco}, ${nota.destinatario_numero} - ${nota.destinatario_bairro}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Cidade/UF:</div>
      <div class="info-value">${nota.destinatario_cidade}/${nota.destinatario_estado} - CEP: ${nota.destinatario_cep}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">DADOS DA NOTA</div>
    <div class="info-row">
      <div class="info-label">Natureza da Operação:</div>
      <div class="info-value">${nota.natureza_operacao}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Data de Emissão:</div>
      <div class="info-value">${new Date(nota.data_emissao).toLocaleDateString('pt-BR')}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Tipo:</div>
      <div class="info-value">${nota.tipo_nota === 'saida' ? 'Saída' : 'Entrada'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">ITENS DA NOTA</div>
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th>NCM</th>
          <th>CFOP</th>
          <th>Qtd</th>
          <th>Valor Unit.</th>
          <th>Valor Total</th>
        </tr>
      </thead>
      <tbody>
        ${nota.itens.map(item => `
          <tr>
            <td>${item.descricao}</td>
            <td>${item.ncm || '-'}</td>
            <td>${item.cfop}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.valor_unitario.toFixed(2)}</td>
            <td>R$ ${item.valor_total.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">VALORES</div>
    ${nota.valor_frete > 0 ? `<div class="info-row"><div class="info-label">Frete:</div><div class="info-value">R$ ${nota.valor_frete.toFixed(2)}</div></div>` : ''}
    ${nota.valor_seguro > 0 ? `<div class="info-row"><div class="info-label">Seguro:</div><div class="info-value">R$ ${nota.valor_seguro.toFixed(2)}</div></div>` : ''}
    ${nota.valor_outras_despesas > 0 ? `<div class="info-row"><div class="info-label">Outras Despesas:</div><div class="info-value">R$ ${nota.valor_outras_despesas.toFixed(2)}</div></div>` : ''}
    ${nota.valor_desconto > 0 ? `<div class="info-row"><div class="info-label">Desconto:</div><div class="info-value">R$ ${nota.valor_desconto.toFixed(2)}</div></div>` : ''}
    <div class="total">VALOR TOTAL: R$ ${nota.valor_total.toFixed(2)}</div>
  </div>

  ${nota.observacoes ? `
  <div class="section">
    <div class="section-title">OBSERVAÇÕES</div>
    <p>${nota.observacoes}</p>
  </div>
  ` : ''}

  <div style="margin-top: 40px; text-align: center; font-size: 10px;">
    <p>Documento emitido por computador</p>
    <p>Protocolo de Autorização: ${nota.protocolo_autorizacao}</p>
  </div>
</body>
</html>
  `;
}
