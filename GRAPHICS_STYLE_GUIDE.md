# Guia de Padronização Visual para Gráficos (React-ApexCharts)

Este documento estabelece as diretrizes de design, paleta de cores, espessuras e comportamentos de interface para todos os componentes de gráficos do sistema. O objetivo é garantir consistência visual no **Modo Escuro (Dark Mode)** e legibilidade contábil de alto nível.

---

## 1. Arquitetura de Camadas e Cores de Fundo

A interface utiliza um sistema de profundidade baseado em tons de azul-escuro purificados. A hierarquia de cores deve seguir rigorosamente a estrutura abaixo:

*   **Fundo Externo da Tela (Canvas/Body):** `#070a13` (Azul-escuro absoluto)
*   **Fundo Interno do Card Container:** `#0d1222` (Azul meia-noite - aplicado no container e na propriedade `chart.background`)
*   **Área Interna de Plotagem do Gráfico:** `#0a0e1a` (Tom intermediário sutil para efeito de profundidade)

### Configuração Base no ApexCharts:
```javascript
chart: {
  background: '#0d1222',
  foreColor: '#64748b', // Cor padrão para textos gerais (cinza fosco)
  theme: { mode: 'dark' }
}
```

---

## 2. Tipografia, Títulos e Formatação de Valores

Para evitar poluição visual, os eixos devem ser discretos, dando total protagonismo aos dados ativos.

*   **Títulos dos Cards:** Fonte semi-bold, cor `#ffffff` (Branco Puro) ou `#f8fafc`.
*   **Rótulos dos Eixos (X e Y):** Cor `#64748b` (Cinza médio fosco). Tamanho: `12px`.
*   **Apresentação de Valores (Eixo Y):** Nunca exibir números brutos sem tratamento. Use obrigatoriamente funções de sufixo ou localização.

### Implementação de Rótulos e Formatação:
```javascript
xaxis: {
  axisBorder: { show: false }, // Ocultar linha rígida da base
  axisTicks: { show: false },  // Ocultar pequenos traços acima das letras
  labels: {
    style: { colors: '#64748b', fontSize: '12px', fontWeight: 500 }
  }
},
yaxis: {
  labels: {
    style: { colors: '#64748b', fontSize: '12px' },
    formatter: (value) => {
      // Exemplo para valores monetários grandes abreviados
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
      return value;
    }
  }
}
```

### 2.1. Sufixos de Unidade e Localização de Moeda

Fica estritamente proibido incluir símbolos repetitivos de moeda (`R$`, `$`, etc.) ou de porcentagem (`%`) em cada linha individual dos rótulos dos eixos (X ou Y). A unidade de medida deve ser declarada **exclusivamente uma vez**, logo após o título do gráfico, entre parênteses e em caixa baixa.

*   **Padrão Monetário:** `Nome do Gráfico (em R$/BRL)`
*   **Padrão Percentual:** `Nome do Gráfico (em %)`
*   **Comportamento dos Eixos:** Devem exibir apenas os números puros e seus sufixos de escala (`M`, `k`), sem o prefixo monetário.


#### Exemplo de Implementação no Título do Card (HTML/React):
```jsx
// Correto: O título carrega a indicação da moeda
<h3 className="text-sm font-semibold text-white">
  Evolução do Patrimônio Líquido (em R\$)
</h3>
```

#### Correção no Objeto de Opções do ApexCharts:
```javascript
yaxis: {
  labels: {
    formatter: (val) => {
      if (val === undefined || isNaN(val)) return '';
      
      // INCORRETO: return `R$ ${(val / 1e6).toFixed(1)}M`;
      // CORRETO: Retorna apenas o número escalado, deixando o eixo limpo
      if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
      if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(0)}k`;
      return val.toLocaleString('pt-BR');
    }
  }
}
```

---

## 3. Linhas de Grade e Separadores

As grades servem estritamente como guias visuais e devem permanecer em segundo plano.

*   **Cor das Linhas de Grade/Divisores:** `#151c33` (Azul acinzentado opaco).
*   **Gráficos de Linha:** Exibir apenas linhas horizontais (`yaxis.lines.show: true`). Ocultar verticais.
*   **Gráficos de Períodos Específicos:** Ativar divisores verticais (`xaxis.lines.show: true`) apenas quando explicitamente solicitado pelo escopo de negócio.

---

## 4. Gráficos de Linhas (Stroke e Marcadores)

Para garantir o aspecto encorpado de alta fidelidade e os nós vazados característicos do projeto:

*   **Espessura da Linha (Stroke Width):** Sempre `4px` para linhas principais.
*   **Tipo de Curva:** `smooth` (Curvatura suave e orgânica).
*   **Marcadores (Nós de dados):** Tamanho `5px`, com borda vazada simulada usando a cor interna do card.

```javascript
stroke: {
  curve: 'smooth',
  width: 4
},
markers: {
  size: 5,
  colors: undefined, // ApexCharts usará automaticamente a cor da respectiva linha
  strokeColors: '#0d1222', // OBRIGATÓRIO: Mesma cor do fundo do card para efeito oco/vazado
  strokeWidth: 2.5,
  hover: { size: 7 }
}
```

---

## 5. Paleta de Cores Neon/Cyberpunk (Multi-Séries)

Utilizar sequencialmente o array de cores abaixo em gráficos que possuam mais de uma linha, barra ou fatia:

```javascript
const cyberpunkPalette = [
  '#3b82f6', // 1. Azul Cyber (Métricas Base / Liquidez Seca)
  '#10b981', // 2. Verde Esmeralda (Lucros / Crescimento / Liquidez Corrente)
  '#f97316', // 3. Laranja Orgânico (Alertas Moderados / Índices Gerais)
  '#06b6d4', // 4. Azul Turquesa (Metas / Fluxo de Caixa)
  '#ec4899', // 5. Rosa Choque Sintético (Anomalias / Prejuízos)
  '#8b5cf6', // 6. Roxo Ultravioleta (Categorias Secundárias)
  '#f59e0b', // 7. Amarelo Âmbar (Atenção / Projeções)
  '#ef4444', // 8. Vermelho Laser (Perdas Críticas / Limites Estourados)
  '#a855f7', // 9. Violeta Neon (Desdobramentos)
  '#14b8a6'  // 10. Verde Piscina/Teal (Métricas de Eficiência)
];
```

---

## 6. Padronização para Heatmaps Contábeis

Os heatmaps contábeis devem representar o estado de saúde financeira através de faixas rígidas de valores (ranges de dados), sem cantos arredondados.

*   **Formato das Células:** Cantos 100% retos (`radius: 0`).
*   **Separação das Células:** Borda de `1px` usando a cor do fundo do card (`#0d1222`) para criar espaçamento limpo.

### Escala de Calor Recomendada (Mapeamento de Cores):

| Faixa de Valor | Estado Clínico | Código Hexa |
| :--- | :--- | :--- |
| Nível Máximo | Excelente Superior | `#14532d` |
| Alto | Excelente | `#16a34a` |
| Acima da Meta | Saudável | `#22c55e` |
| Transição Positiva | Estável Superior | `#84cc16` |
| Ponto de Equilíbrio / Média | Alerta Neutro | `#eab308` |
| Tendência de Queda | Alerta Moderado | `#f97316` |
| Desvio de Rota | Alerta Avançado | `#ea580c` |
| Abaixo do Limite Seguro | Crítico | `#dc2626` |
| Prejuízo Severo / Quebra | Crítico Superior | `#7f1d1d` |

### Código de Inicialização do Heatmap:
```javascript
plotOptions: {
  heatmap: {
    radius: 0,                 // Garante cantos perfeitamente retos
    enableShades: false,       // Força o uso estrito dos hexas definidos nos ranges
    useFillColorAsStroke: false
  }
},
stroke: {
  show: true,
  width: 1,
  colors: ['#0d1222'] // Separação sutil das células usando o fundo do card
}
```

---

## 7. Arquitetura e Engenharia de Componentes (Dashboard)

Todos os gráficos de monitoramento histórico devem ser instanciados utilizando a estrutura de Grid Responsivo do Cockpit, envelopados em seus respectivos wrappers semânticos de domínio.

### Estrutura de Renderização no Layout:
```jsx
<DashboardGrid id="aluno-historico" columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Gráfico de Área Unificado */}
  <EmpirionAreaChart
    id="equity-evolution"
    title="Evolução do Patrimônio Líquido"
    categories={visibleHistory.map(h => `R-${h.round < 10 ? '0' : ''}${h.round}`)}
    series={[{ name: 'Patrimônio Líquido', data: visibleHistory.map(h => h.equity) }]}
    color="#3b82f6"
    currency={activeArena?.currency || 'BRL'}
  />

  {/* Gráfico Multi-Linhas de Liquidez */}
  <EmpirionLiquidityChart
    id="liquidity-evolution"
    visibleHistory={visibleHistory}
    height={320}
  />
</DashboardGrid>
```

---

## 8. Padrão de Formatação Dinâmica de Dados (Eixos e Escala)

Para garantir consistência visual matemática entre gráficos de Área (`EmpirionAreaChart`) e Empilhamento/Linhas (`TrendSparkline`), as strings numéricas devem ser interceptadas via funções de callback para evitar quebra de layout horizontal.

*   **Regra de Abreviatura para Milhões (M):** Valores maiores ou iguais a `1.000.000` devem remover decimais zerados redundantes (ex: transformar `5500000` em `5.5M` ou `5.50M` dependendo do nível de precisão exigido pela série).
*   **Regra de Abreviatura para Milhares (K):** Valores maiores ou iguais a `1.000` devem usar o sufixo minúsculo `k` ou maiúsculo `K` de forma padronizada.
*   **Ajuste Localizado:** Valores flutuantes abaixo dessas faixas devem ser renderizados usando a máscara `toLocaleString('pt-BR')`.

### Implementação de Tratamento de Escala (Nativa do Cockpit):
```javascript
yaxis: {
  labels: {
    style: { colors: '#64748b', fontSize: '10px' },
    formatter: (val) => {
      if (val === undefined || isNaN(val)) return '';
      if (Math.abs(val) >= 1e6) {
        return `${(val / 1e6).toFixed(2).replace(/\.00$/, '')}M`;
      }
      if (Math.abs(val) >= 1e3) {
        return `${(val / 1e3).toFixed(1).replace(/\.0$/, '')}k`;
      }
      return parseFloat(val.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    }
  }
}
```

### 8.1. Formatação de Valores Percentuais (%)

Para todos os gráficos que apresentem métricas em porcentagem (seja no Eixo Y, em tooltips, heatmaps ou gráficos de rosca/pizza), deve-se limitar a exibição a **exatamente 1 casa decimal** após a vírgula/ponto, utilizando o padrão de pontuação brasileiro (`pt-BR`).

*   **Regra de Precisão:** `toFixed(1)`
*   **Regra de Padronização Local:** Substituir o ponto decimal por vírgula (`.replace('.', ',')`).

#### Implementação no Eixo Y (Gráficos Percentuais):
```javascript
yaxis: {
  labels: {
    style: { colors: '#64748b', fontSize: '10px' },
    formatter: (val) => {
      if (val === undefined || isNaN(val)) return '';
      // Força uma casa decimal e aplica a formatação regional
      return `${val.toFixed(1).replace('.', ',')}%`;
    }
  }
}
```

#### Implementação em DataLabels (Valores direto nas Barras/Linhas):
```javascript
dataLabels: {
  enabled: true,
  formatter: (val) => {
    return `${val.toFixed(1).replace('.', ',')}%`;
  },
  style: {
    colors: ['#fff']
  }
}
```

---

## 9. Comportamento e Customização de Tooltips (Balões de Interação)

As tooltips geradas nativamente ao passar o mouse (*hover*) sobre os nós (`markers`) das séries devem respeitar a paleta de alto contraste do ecossistema, sem herdar estilos claros ou bordas padrão do sistema operacional do usuário.

*   **Tema Global da Tooltip:** Deve ser explicitamente configurada como `'dark'`. Isso força o fundo do balão flutuante para cinza grafite/preto, com textos em alta opacidade.
*   **Sincronização de Cores dos Elementos:** O marcador que aparece dentro da caixa flutuante do tooltip herda dinamicamente a cor injetada no array `colors` da respectiva série (`#3b82f6`, `#10b981`, `#f97316`), permitindo rápida correlação ao analisar índices simultâneos de liquidez (Seca, Corrente, Geral).
*   **Legendas de Contexto:** Devem ser ocultadas na visualização direta quando o componente estiver renderizado dentro do painel lateral de monitoramento (`legend: { show: false }`), mantendo as legendas ativas apenas na área central principal de consulta.

### Configuração Estrita da Tooltip:
```javascript
tooltip: {
  theme: 'dark',
  x: { show: true }, // Exibe o indicador do período ativo (ex: R-01) no cabeçalho da tooltip
  marker: { show: true } // Mantém a bolinha colorida indicando a série dentro da tooltip
},
legend: {
  show: false // Ocultação estratégica em instâncias reduzidas (como Sparklines/Sidecards)
}
```

---

## 10. Otimização de Espaço e Maximização da Área de Plotagem

Para evitar desperdício de pixels e garantir que o gráfico ocupe o maior espaço possível dentro do card (eliminando grandes vãos nas bordas superior, inferior e laterais), deve-se forçar o ajuste de margens internas do componente.

### Diretrizes de Layout:
*   **Margens Zeradas:** Reduzir o padding interno do container gráfico para o limite técnico.
*   **Recortes Laterais:** Utilizar valores ligeiramente negativos ou zerados nas propriedades de padding do ApexCharts para compensar o recuo automático dos eixos (X e Y).

### Configuração de Compactação no ApexCharts:
```javascript
const options = {
  chart: {
    type: 'line',
    // Remove margens nativas automáticas do wrapper do gráfico
    sparkline: {
      enabled: false // Manter false para preservar a leitura dos eixos X e Y
    }
  },
  grid: {
    show: true,
    borderColor: '#151c33',
    // CORREÇÃO DE ESPAÇO: Força a expansão do gráfico até as bordas internas do card
    padding: {
      top: -10,    // Remove o vão superior abaixo do título "Evolução do Patrimônio Líquido"
      bottom: 0,   // Aproxima o eixo X da borda inferior do card
      left: 10,    // Margem mínima para não cortar os textos do eixo Y (ex: 7.0M)
      right: 15    // Margem mínima para o último nó (ex: R-03) não colar na parede direita
    }
  },
  xaxis: {
    // Reduz o espaço entre o eixo horizontal e a grade interna do gráfico
    tooltip: { enabled: false } 
  }
};
```

---

*Nota 1 para o Dev: Ao aplicar paddings agressivos (como `top: -10`), certifique-se de que o elemento HTML do título do card possua uma margem inferior adequada no CSS (`margin-bottom`) para que os textos do eixo Y (como o `7.0M`) não fiquem sobrepostos visualmente ao título do painel.*

*Nota 2 para o Dev: Ao mapear métricas onde "menos é melhor" (ex: Endividamento), inverta a lógica matemática dos ranges de valores para que o menor número receba o nível verde (`#14532d`) e o maior número receba o nível vermelho (`#7f1d1d`).*