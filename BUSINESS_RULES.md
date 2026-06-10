# 📘 Regras de Negócio do Projeto (BUSINESS_RULES.md)

Este documento centraliza as definições de negócios, fórmulas, restrições e diretrizes estratégicas que modelam o motor de simulação e o cockpit do simulador empresarial. Ele serve como a fonte de verdade absoluta para o desenvolvimento, contabilidade e inteligência comercial do projeto.

---

## 📅 Controle de Governança e Versionamento

- **Projeto:** EMPIRION ORACLE
- **Versão Ativa de Regras:** v2026.117
- **Responsável pela Governança:** Project Management Professional (PMP)
- **Time Multidisciplinar Responsável:**
  - **Contador Sênior:** CPC / IFRS e validação de relatórios contábeis/financeiros.
  - **Coodenador de Inteligência de Mercado:** Análise de concorrência e estratégias de penetração regional.
  - **Engenheiro de Software Sênior:** Arquitetura limpa, segurança e integridade do motor de cálculo.
  - **Engenheiro de Banco de Dados:** Normalização, concorrência e RLS.
  - **Arquiteto de UI/UX:** Apresentação elegante e acessível com micro-interações.

| Data | Versão | Autor | Alterações / Decisões Importantes |
| :--- | :--- | :--- | :--- |
| **10/06/2026** | `v2026.117` | *PMP & Equipe* | **Criação do Documento.** Inclusão das regras de produtividade reduzida no round de aquisição de novas máquinas e detalhamento da fórmula do Market Size Dinâmico com variação conjuntural. |

---

## 1. 🏭 Parque Fabril & Produtividade na Aquisição de Novas Máquinas

A expansão de capacidade fabril através da compra ou substituição de maquinários (Alfa, Beta ou Gama) é um pilar estratégico essencial. No entanto, sua modelagem operacional simula com fidelidade o processo real de implementação industrial:

### Regra de Produtividade do Turno de Instalação (Calibração e Treinamento)

Quando uma equipe adquire novas máquinas em um round (Turno $N$):
1. **Disponibilidade Física imediata:** A máquina já consta no parque fabril e sua capacidade nominal é incluída no cálculo global de Tamanho de Mercado (Market Size).
2. **Gargalo Operacional no Turno de Setup:** No turno da aquisição (Turno $N$), a nova máquina **não opera com alta eficiência**. Ela passa por processos obrigatórios de:
   - Recebimento físico e logística interna.
   - Instalação técnica e calibração fina de hardware e automação.
   - Treinamento obrigatório de mão de obra direta (MOD) para adequação às especificidades do modelo.
3. **Preservação do Parque Existente:** O parque fabril preexistente (máquinas adquiridas em rounds anteriores à rodada atual) **não sofre impacto de produtividade** decorrente dessa calibragem, operando conforme os níveis de eficiência acumulados pela equipe (baseado no treinamento histórico, P&D e manutenção).
4. **Produtividade Plena nos Rounds Posteriores:** A partir do turno imediatamente seguinte (Turno $N+1$), com a equipe devidamente treinada e os equipamentos de setup concluídos, as novas máquinas passam a produzir à sua taxa máxima nominal (limitada apenas por fatores globais de desgaste natural e investimento em manutenção).

> ⚠️ **Alerta Estratégico:** As equipes devem estar cientes de que a decisão de comprar novas máquinas aumentará de imediato a capacidade instalada teórica e o Market Size global (TAM), mas o fluxo físico de entrada de mercadoria acabada (massa física estocada para venda imediata) no DRE/Caixa do round de compra sofrerá restrição pelo delay do setup físico do novo imobilizado.

---

## 2. 📊 Algoritmo do Market Size Dinâmico por Região (TAM)

O **Market Size Regional** (Tamanho Total de Endereçamento de Mercado) não é um valor estático e isolado de cada equipe concorrente. No modelo centralizado, ele representa o volume total real de demanda disponível para ser fatiada entre os competidores com base em fatores populacionais, pesos demográficos, excedentes de demanda programados pelo Tutor e variações macroeconômicas cíclicas do turno.

### Fórmula de Cálculo Centralizada

Para cada região do torneio, o cálculo do Market Size é estruturado a partir das seguintes variáveis:

$$\text{Tamanho do Mercado Geográfico (Market Size)} = \left[ \sum \text{Capacidade Nominal 100\% de Todas as Equipes} \right] \times \frac{\text{Peso da Região \%}}{100} \times \left(1 + \frac{\text{Variação de Demanda do Turno \%}}{100}\right)$$

#### Onde:
- **Soma das Capacidades Nominais:** A soma da capacidade produtiva das máquinas operando a 100% de todas as marcas/empresas registradas competindo no torneio.
  - *Exemplo:* Em uma arena com $4$ equipes, tendo cada empresa $12.000$ unidades de capacidade máxima de equipamentos ativa, a base agregada é de $48.000$ unidades produtivas em $100\%$.
- **Peso de Demanda de cada Região (Parametrizado pelo Tutor):** A soma geográfica dos pesos definidos no painel do Tutor tradicionalmente totaliza $120\%$, representando uma demanda de excedente natural de mercado (20% adicionais sobre a capacidade teórica agregada em condições 100% ideais de mercado).
  - *Distribuição Tradicional:* SUL ($40\%$), SUDESTE ($30\%$), CENTRO-OESTE ($25\%$), NORDESTE ($15\%$), NORTE ($10\%$) = Soma de $120\%$.
  - Sem a variação do turno, essa soma equivale a $48.000 \times 1,2 = 57.600$ unidades de Demanda Total de Mercado.
- **Variação de Demanda Conjuntural (Indicadores Gerais de Mercado):** É a variação infligida a cada turno, representando flutuações macroeconômicas (expansão, PIB, recessão ou sazonalidade definida pelo Tutor no cenário).
  - *Exemplo do Round 1:* Com a demanda variando em **$+8\%$** conjunturalmente, a demanda base de $57.600$ unidades é elevada em mais $8\%$:
    $$57.600 \times (1 + 0,08) = 60.480 \text{ unidades de Market Size Global}$$

### Rateio por Região no Round 1 (Aplicação Matemática)

Com base nos parâmetros da rodada atual e os pesos definidos pelo Tutor:
- **Tamanho Total de Mercado Agregativo (TAM):** $60.480$ unidades.
- **Distribuição Geográfica de Vendas Real:**
  - **SUL ($40\%$):** $60.480 \times 0,40 = 24.192$ unidades de Market Size Regional.
  - **SUDESTE ($30\%$):** $60.480 \times 0,30 = 18.144$ unidades de Market Size Regional.
  - **CENTRO-OESTE ($25\%$):** $60.480 \times 0,25 = 15.120$ unidades de Market Size Regional.
  - **NORDESTE ($15\%$):** $60.480 \times 0,15 = 9.072$ unidades de Market Size Regional.
  - **NORTE ($10\%$):** $60.480 \times 0,10 = 6.048$ unidades de Market Size Regional.
  - **Soma Consolidada das Demandas:** $60.480$ unidades.

### Captura Competitiva de Demanda (Market Share Concorrencial)

1. **Pontuação Competitiva da Equipe (Competitiveness Score):** Cada equipe atrai uma fatia do mercado regional com base nas suas decisões comerciais: preço ofertado da rodada, investimento em campanhas de marketing locais e prazo de recebimento estipulado aos clientes.
2. **Capacidade Máxima e Logística Física (Estoque PA):** A demanda máxima que cada equipe de fato consegue *vender* na região sofre limite superior com base na soma do estoque inicial de mercadoria (PA) e as unidades físicas produzidas no turno corrente. O motor distribui de forma proporcional ao atrativo do produto quando as equipes têm escassez física de fornecimento (Kardex-WAC do motor de simulação).

---

## 3. 🎯 Próximos Passos e Verificação de Sincronia

- [x] Unificação dos cálculos de estatísticas do Cockpit (`MarketingStep.tsx`) para usar o modelo demográfico dinâmico unindo com o peso estipulado pelo Tutor.
- [x] Unificação dos rótulos visuais para fins de usabilidade corporativa e facilidade de estudo dos alunos concorrentes.
- [ ] Monitoramento constante de novas decisões de compra no Turno 2 pelas equipes para avaliar o impacto imediato na calibragem dos novos equipamentos instalados.
