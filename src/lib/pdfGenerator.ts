import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Orcamento } from './types';

export interface DadosEmpresa {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  logo?: string;
}

export const gerarPDFOrcamento = async (
  orcamento: Orcamento,
  itens: any[],
  dadosEmpresa: DadosEmpresa,
  clienteNome: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  console.log('📄 Gerando PDF do orçamento:', orcamento.numero);
  console.log('📦 Itens recebidos:', itens);
  console.log('📊 Quantidade de itens:', itens?.length || 0);

  // Cabeçalho da Empresa - PRETO E BRANCO
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(dadosEmpresa.nome, pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CNPJ: ${dadosEmpresa.cnpj}`, pageWidth / 2, 22, { align: 'center' });
  doc.text(`${dadosEmpresa.endereco}`, pageWidth / 2, 27, { align: 'center' });
  doc.text(`Tel: ${dadosEmpresa.telefone} | Email: ${dadosEmpresa.email}`, pageWidth / 2, 32, { align: 'center' });

  yPosition = 50;

  // Título do Orçamento
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ORÇAMENTO', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;

  // Informações do Orçamento
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const infoBox = [
    [`Número: ${orcamento.numero}`, `Data: ${formatDateBR(orcamento.data_criacao)}`],
    [`Cliente: ${clienteNome}`, `Validade: ${formatDateBR(orcamento.data_validade)}`],
    [`Prazo de Entrega: ${formatDateBR(orcamento.prazo_entrega)}`, `Status: ${getStatusLabel(orcamento.status)}`]
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: infoBox,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: pageWidth / 2 - 15 },
      1: { cellWidth: pageWidth / 2 - 15 }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Descrição
  if (orcamento.descricao) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Descrição:', 14, yPosition);
    yPosition += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const descricaoLines = doc.splitTextToSize(orcamento.descricao, pageWidth - 28);
    doc.text(descricaoLines, 14, yPosition);
    yPosition += descricaoLines.length * 5 + 5;
  }

  // Tabela de Itens - PRETO E BRANCO COM ALTO CONTRASTE
  console.log('📋 Processando itens para tabela...');
  
  // Verificar se há itens
  if (!itens || itens.length === 0) {
    console.warn('⚠️ AVISO: Nenhum item encontrado para o orçamento');
    doc.setFontSize(10);
    doc.setTextColor(200, 0, 0);
    doc.text('⚠️ Nenhum item adicionado a este orçamento', 14, yPosition);
    yPosition += 10;
  } else {
    console.log('✅ Itens encontrados! Gerando tabela...');
    
    const tableData = itens.map((item, index) => {
      console.log(`📦 Item ${index + 1}:`, {
        nome: item.item_nome,
        tipo: item.tipo,
        quantidade: item.quantidade,
        preco: item.preco_unitario,
        subtotal: item.subtotal
      });
      
      return [
        item.item_nome || 'Item sem nome',
        item.tipo === 'materia_prima' ? 'Insumo' : (item.tipo ? item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1) : 'N/A'),
        (item.quantidade || 0).toString().replace('.', ','),
        formatCurrency(item.preco_unitario || 0),
        formatCurrency(item.subtotal || 0)
      ];
    });

    console.log('📊 Dados da tabela preparados:', tableData.length, 'linhas');

    autoTable(doc, {
      startY: yPosition,
      head: [['Item', 'Tipo', 'Quantidade', 'Preço Unit.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      }
    });

    console.log('✅ Tabela de itens gerada com sucesso!');
    yPosition = (doc as any).lastAutoTable.finalY + 5;
  }

  // Valor Total - PRETO E BRANCO
  doc.setFillColor(0, 0, 0);
  doc.rect(pageWidth - 80, yPosition, 66, 10, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('VALOR TOTAL:', pageWidth - 78, yPosition + 7);
  doc.text(formatCurrency(orcamento.valor_total), pageWidth - 16, yPosition + 7, { align: 'right' });
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);

  // Observações
  if (orcamento.observacoes) {
    yPosition += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 14, yPosition);
    yPosition += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const obsLines = doc.splitTextToSize(orcamento.observacoes, pageWidth - 28);
    doc.text(obsLines, 14, yPosition);
    yPosition += obsLines.length * 5;
  }

  // Rodapé
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Orçamento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  console.log('✅ PDF gerado com sucesso!');

  // Salvar PDF
  doc.save(`Orcamento_${orcamento.numero}.pdf`);
};

const formatDateBR = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    em_analise: 'Em Análise',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    expirado: 'Expirado'
  };
  return labels[status] || status;
};
