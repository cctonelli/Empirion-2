import * as XLSX from 'xlsx';
import { TableData } from './spreadsheet-mappers';

/**
 * Função para baixar um arquivo gerado no navegador do usuário
 */
const downloadFile = (content: string, contentType: string, filename: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Força a formatação de valores para texto amigável ao CSV brasileiro (ponto-e-vírgula)
 */
const formatCSVValue = (val: string | number): string => {
  if (val === undefined || val === null) return '';
  if (typeof val === 'number') {
    // Para CSV brasileiro, o separador decimal do Excel é a vírgula.
    // Mas para manter compatibilidade, enviamos o número formatado ou texto.
    return val.toString().replace('.', ',');
  }
  // Escapa aspas duplas se houverem
  const str = val.toString().replace(/"/g, '""');
  // Se contiver ponto-e-vírgula ou quebras de linha, envolve em aspas duplas
  if (str.includes(';') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`;
  }
  return str;
};

/**
 * Força a formatação de valores para texto amigável ao TSV (Google Sheets Copy Paste)
 */
const formatTSVValue = (val: string | number): string => {
  if (val === undefined || val === null) return '';
  if (typeof val === 'number') {
    return val.toString().replace('.', ',');
  }
  const str = val.toString().replace(/"/g, '""');
  if (str.includes('\t') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`;
  }
  return str;
};

/**
 * Exporta os dados de uma tabela para formato CSV
 * Adiciona o BOM (Byte Order Mark) UTF-8 para garantir acentuação correta no Excel brasileiro.
 */
export const exportToCSV = (table: TableData, separator: ';' | ',' = ';') => {
  // BOM UTF-8 obrigatorio para Excel ler acentuação correta
  let csvContent = '\uFEFF';
  
  // Título do Relatório
  csvContent += `"${table.title.replace(/"/g, '""')}"\n\n`;
  
  // Cabeçalhos
  csvContent += table.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(separator) + '\n';
  
  // Linhas
  table.rows.forEach((row) => {
    const rowString = row.map(val => formatCSVValue(val)).join(separator);
    csvContent += rowString + '\n';
  });
  
  const sanitizedTitle = table.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadFile(csvContent, 'text/csv;charset=utf-8;', `${sanitizedTitle}.csv`);
};

/**
 * Copia os dados da tabela no formato TSV para o Clipboard, permitindo Ctrl+V instantâneo no Google Sheets
 */
export const copyToClipboardTSV = async (table: TableData): Promise<boolean> => {
  try {
    let tsvContent = '';
    
    // Título do Relatório
    tsvContent += `${table.title}\n\n`;
    
    // Cabeçalhos
    tsvContent += table.headers.join('\t') + '\n';
    
    // Linhas
    table.rows.forEach((row) => {
      const rowString = row.map(val => formatTSVValue(val)).join('\t');
      tsvContent += rowString + '\n';
    });
    
    await navigator.clipboard.writeText(tsvContent);
    return true;
  } catch (err) {
    console.error('Falha ao copiar para o clipboard:', err);
    return false;
  }
};

/**
 * Gera um arquivo binário XLSX (.xlsx) oficial compatível com Excel e Google Sheets.
 * Permite múltiplas abas (Worksheets) sem alertas de segurança ou arquivos corrompidos ao abrir.
 */
export const exportToExcelXLSX = (tables: TableData[], filename = 'matriz_financeira_completa.xlsx') => {
  const wb = XLSX.utils.book_new();

  tables.forEach((table) => {
    // Sanitiza o nome da aba (máximo 30 caracteres, sem []?*:\/)
    const tabName = table.title
      .replace(/[\[\]\?\*:\\\/]/g, '')
      .split(' - ')[0]
      .substring(0, 30) || 'Planilha';

    const ws_rows: any[][] = [];
    
    // Título do Relatório
    ws_rows.push([table.title.toUpperCase()]);
    // Linha de espaçamento
    ws_rows.push([]);
    // Cabeçalhos
    ws_rows.push(table.headers);

    // Linhas de dados
    table.rows.forEach((row) => {
      const isSubSection = row.length === 1;
      if (isSubSection) {
        ws_rows.push([row[0].toString().toUpperCase()]);
      } else {
        ws_rows.push(row);
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_rows);

    // Configura merges das duas primeiras linhas para o título mesclar
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: table.headers.length - 1 } }
    ];

    // Colunas de largura customizada
    const cols = [{ wch: 45 }];
    for (let c = 1; c < table.headers.length; c++) {
      cols.push({ wch: 18 });
    }
    ws['!cols'] = cols;

    // Função auxiliar para codificar referências do Excel (ex: r:0, c:0 -> A1)
    const getCellRef = (r: number, c: number) => XLSX.utils.encode_cell({ r, c });

    // Pula o título (linhas 0 e 1) e o cabeçalho (linha 2)
    // Os dados começam na linha 3
    let currentRowIdx = 3;
    table.rows.forEach((row) => {
      const isSubSection = row.length === 1;
      if (isSubSection) {
        // Se for uma subseção fiduciária, mescla as colunas
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({
          s: { r: currentRowIdx, c: 0 },
          e: { r: currentRowIdx, c: table.headers.length - 1 }
        });
        currentRowIdx++;
        return;
      }

      row.forEach((cellVal, cellIdx) => {
        const cellRef = getCellRef(currentRowIdx, cellIdx);
        const cell = ws[cellRef];

        if (cell && typeof cellVal === 'number') {
          cell.v = cellVal;
          cell.t = 'n';

          if (cellIdx > 0) {
            const rowLabel = row[0].toString();
            // Verifica se é % ou se é do Comando Estratégico e deve ser tratado como %
            const isPct = table.title.toLowerCase().includes('comando estratégico') && 
                          (rowLabel.includes('%') || (rowLabel.includes('DuPont') && !rowLabel.includes('Giro') && !rowLabel.includes('Alavancagem')));
            
            const isGeneralNum = table.title.toLowerCase().includes('comando estratégico') && 
                                (rowLabel.includes('Qtd') || rowLabel.includes('Físico') || rowLabel.includes('Carbono') || rowLabel.includes('dias') || rowLabel.includes('x'));

            if (isPct) {
              cell.v = cellVal / 100; // Converte para escala de decimal para o percentual do Excel (ex: 0.15 = 15%)
              cell.z = '0.00%';
            } else if (isGeneralNum) {
              cell.z = '#,##0'; // Inteiro sem decimais para quantidades físicas/indicadores discretos
            } else {
              // Valores contábeis em formato de Moeda Mestre amigável
              cell.z = '"$"#,##0.00;[Red]\("$"#,##0.00\);"-"';
            }
          }
        }
      });

      currentRowIdx++;
    });

    XLSX.utils.book_append_sheet(wb, ws, tabName);
  });

  // Salva o arquivo final binário com extensão legítima .xlsx
  XLSX.writeFile(wb, filename);
};
