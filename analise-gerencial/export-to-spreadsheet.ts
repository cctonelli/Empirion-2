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
 * Gera um arquivo XML Spreadsheet 2003 (SpreadsheetML) compatível com Excel e Google Sheets.
 * Permite múltiplas planilhas (Worksheets) em um único download, perfeitamente estruturado.
 */
export const exportToExcelXML = (tables: TableData[], filename = 'matriz_financeira_completa.xls') => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>Oracle Engine Sapphire</Author>
    <LastAuthor>Oracle Engine Sapphire</LastAuthor>
    <Created>${new Date().toISOString()}</Created>
    <Version>16.00</Version>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center" ss:WrapText="1"/>
      <Borders/>
      <Font ss:FontName="Segoe UI" x:CharSet="1" x:Family="Swiss" ss:Size="10" ss:Color="#1E293B"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="ReportTitle">
      <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
      <Font ss:FontName="Segoe UI" ss:Size="14" ss:Bold="1" ss:Color="#0F172A" ss:Italic="1"/>
    </Style>
    <Style ss:ID="Header">
      <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#475569"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="SubHeader">
      <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
      <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="CellNormal">
      <Alignment ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
    <Style ss:ID="CellBold">
      <Alignment ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Currency">
      <Alignment ss:Vertical="Center" ss:Horizontal="Right"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <NumberFormat ss:Format="&quot;R$&quot;\ #,##0.00;[Red]\-&quot;R$&quot;\ #,##0.00;&quot;R$&quot;\ \-"/>
    </Style>
    <Style ss:ID="CurrencyBold">
      <Alignment ss:Vertical="Center" ss:Horizontal="Right"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="&quot;R$&quot;\ #,##0.00;[Red]\-&quot;R$&quot;\ #,##0.00;&quot;R$&quot;\ \-"/>
    </Style>
    <Style ss:ID="Percentage">
      <Alignment ss:Vertical="Center" ss:Horizontal="Right"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <NumberFormat ss:Format="0.00%"/>
    </Style>
    <Style ss:ID="NumberGeneral">
      <Alignment ss:Vertical="Center" ss:Horizontal="Right"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <NumberFormat ss:Format="#,##0.00"/>
    </Style>
  </Styles>
`;

  tables.forEach((table) => {
    // Sanitiza o nome da aba (máximo 30 caracteres, sem []?*:\/)
    const tabName = table.title
      .replace(/[\[\]\?\*:\\\/]/g, '')
      .split(' - ')[0]
      .substring(0, 30) || 'Planilha';

    // Cria a aba (Worksheet)
    xml += `  <Worksheet ss:Name="${tabName}">
    <Table ss:ExpandedColumnCount="${table.headers.length + 2}" ss:DefaultRowHeight="20">
      <Column ss:Width="260"/>
      <Column ss:Width="160"/>
      <Column ss:Width="130"/>
      <Column ss:Width="130"/>
      <Column ss:Width="130"/>
      <Column ss:Width="130"/>
      <Column ss:Width="130"/>
      
      <!-- Título de Cabeçalho do Relatório -->
      <Row ss:Height="30">
        <Cell ss:StyleID="ReportTitle" ss:MergeAcross="${table.headers.length - 1}">
          <Data ss:Type="String">${table.title.toUpperCase()}</Data>
        </Cell>
      </Row>
      <Row ss:Height="10"></Row>
      
      <!-- Cabeçalho das Colunas -->
      <Row ss:Height="24">
    `;
    
    table.headers.forEach((h) => {
      xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>\n`;
    });
    
    xml += `  </Row>\n`;

    // Linhas de dados
    table.rows.forEach((row) => {
      const isSubSection = row.length === 1;
      
      if (isSubSection) {
        xml += `  <Row ss:Height="22">
          <Cell ss:StyleID="SubHeader" ss:MergeAcross="${table.headers.length - 1}">
            <Data ss:Type="String">${row[0]}</Data>
          </Cell>
        </Row>\n`;
        return;
      }
      
      // Linha normal de dados
      const isRowBold = row[0].toString().includes('(=)') || row[0].toString().includes('TOTAL') || row[0].toString().includes('ESTOQUE FINAL') || row[0].toString().includes('CUSTO DO PRODUTO VENDIDO');
      const styleText = isRowBold ? 'CellBold' : 'CellNormal';
      
      xml += `  <Row ss:Height="20">\n`;
      
      row.forEach((cellVal, cellIdx) => {
        if (cellIdx === 0) {
          // Primeira coluna: Nome da conta / KPI
          xml += `    <Cell ss:StyleID="${styleText}"><Data ss:Type="String">${cellVal}</Data></Cell>\n`;
        } else {
          // Colunas numéricas
          if (typeof cellVal === 'number') {
            const isPct = table.title.toLowerCase().includes('comando estratégico') && 
                          (row[0].toString().includes('%') || row[0].toString().includes('DuPont') && !row[0].toString().includes('Giro') && !row[0].toString().includes('Alavancagem'));
            
            const isGeneralNum = table.title.toLowerCase().includes('comando estratégico') && 
                                (row[0].toString().includes('Qtd') || row[0].toString().includes('Físico') || row[0].toString().includes('Carbono') || row[0].toString().includes('dias') || row[0].toString().includes('x'));
            
            let customStyle = isRowBold ? 'CurrencyBold' : 'Currency';
            let dataType = 'Number';
            let finalVal = cellVal;
            
            if (isPct) {
              customStyle = 'Percentage';
              finalVal = cellVal / 100; // O Excel espera percentuais representados de 0 a 1 (0.15 = 15%)
            } else if (isGeneralNum) {
              customStyle = 'NumberGeneral';
            }
            
            xml += `    <Cell ss:StyleID="${customStyle}"><Data ss:Type="${dataType}">${finalVal}</Data></Cell>\n`;
          } else {
            // Se for "N/A" ou outro texto representativo
            xml += `    <Cell ss:StyleID="${styleText}"><Data ss:Type="String">${cellVal}</Data></Cell>\n`;
          }
        }
      });
      
      xml += `  </Row>\n`;
    });
    
    xml += `    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <Selected/>
      <ProtectObjects>False</ProtectObjects>
      <ProtectScenarios>False</ProtectScenarios>
    </WorksheetOptions>
  </Worksheet>\n`;
  });

  xml += `</Workbook>`;
  
  downloadFile(xml, 'application/vnd.ms-excel;charset=utf-8;', filename);
};
