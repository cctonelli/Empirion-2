
# 🚀 Empirion – Business Intelligence Arena (v12.9.1-Gold)

**Forge Your Empire with AI-Driven Strategic Insight.**

O Empirion é a plataforma definitiva de simulação empresarial multiplayer, projetada para converter complexidade em vantagem competitiva. No build **v12.9.1 GOLD**, o sistema integra normas **CPC 26**, inteligência generativa **Gemini 3 Pro** e o avançado monitor de **Efeito Tesoura**.

---

## 📉 1. O Termômetro Financeiro: Efeito Tesoura

Baseado na metodologia clássica de gestão de capital de giro, o Empirion monitora em tempo real o descompasso entre a operação e o caixa.

### Estrutura de Capital:
*   **CGL (Capital de Giro Líquido):** Ativo Circulante – Passivo Circulante.
*   **NCG (Necessidade de Capital de Giro):** Clientes + Estoques – Fornecedores.
*   **Tesouraria (T = CGL – NCG):** O saldo real de liquidez imediata. 
*   **TSF (Termômetro da Situação Financeira):** Indicador de desequilíbrio estrutural.
*   **O Alerta "Tesoura":** Ocorre quando a NCG cresce acima do CGL, forçando a empresa a buscar empréstimos caros.

---

## 📊 2. Indicadores Financeiros (Fórmulas Oficiais)

### Liquidez
*   **Liquidez Corrente:** Ativo Circulante / Passivo Circulante
*   **Liquidez Seca:** (Ativo Circulante – Estoques) / Passivo Circulante

### Rentabilidade
*   **Margem Líquida:** Lucro Líquido / Receita Líquida
*   **ROE (Return on Equity):** Lucro Líquido / Patrimônio Líquido
*   **ROA (Return on Assets):** Lucro Líquido / Ativo Total

### Eficiência Operacional
*   **PMR (Recebimento):** (Contas a Receber / Receita Líquida) × 360
*   **PMP (Pagamento):** (Fornecedores / CPV) × 360
*   **PME (Estocagem):** (Estoques / CPV) × 360

---

## 📋 3. Exemplos Calculados – Período 0 (Inicial)
Use estes dados para validar sua estratégia inicial:

*   **Liquidez Corrente:** 3.290.340 / 4.121.493 ≈ **0,80**
*   **Margem Bruta:** 1.044.555 / 3.322.735 ≈ **31,4%**
*   **NCG:** 1.823.735 + 1.466.605 – 717.605 = **2.572.735**
*   **Saldo de Tesouraria (T):** **-3.403.888** (Tesoura aberta!)

---

## 🔒 4. Políticas de Segurança (RLS – Supabase)

O acesso aos dados é protegido via Row Level Security. Exemplo de implementação:

```sql
-- Equipe acessa apenas seu próprio Business Plan
CREATE POLICY "Equipe acessa seu business plan"
ON public.business_plans
AS PERMISSIVE
FOR ALL
TO authenticated
USING (team_id IN (
  SELECT tm.team_id
  FROM team_members tm
  WHERE tm.user_id = auth.uid()
));
```

---

## 🛠️ Especificações Técnicas
*   **Frontend:** React 19 + Framer Motion + ApexCharts.
*   **Backend:** Supabase (PostgreSQL + Realtime).
*   **AI Engine:** Gemini 3 Pro (Raciocínio) & Gemini 3 Flash (Turnover Bots).

---
*Empirion v12.9.1 Gold – Onde a estratégia encontra o valor real de mercado.*
