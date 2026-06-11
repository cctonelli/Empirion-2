# Plano Diretor de Internacionalização (i18n) - EMPIRION ORACLE
## 🌐 Estratégia de Expansão Multilíngue (Português, Inglês e Espanhol)

- **Status:** **Proposta de Planejamento (Aguardando Aprovação do PO)**
- **Versão do Plano:** `v1.0.0`
- **Data:** 11 de Junho de 2026
- **Responsável:** Project Management Professional (PMP) & Conselho Multidisciplinar

---

## 1. Resumo do Entendimento
O **EMPIRION ORACLE** está se preparando para expandir suas operações pedagógicas e simulações empresariais de grande porte para equipes e tutores de outras nacionalidades, com foco inicial nos idiomas **Inglês (EN)** e **Espanhol (ES)**, além do **Português (PT-BR)** corrente. 

Como simulador empresarial full-stack que lida com finanças corporativas integradas, regras tributárias e relatórios gerenciais avançados, a tradução não se resume a textos estáticos da interface (UI/UX). Ela exige a **localização contábil**, **tradução de dados mestres do banco de dados**, **regionalização de microcopys de marketing** e **flexibilidade na geração de relatórios de simulação** gerados pelo motor (kernel dinâmico).

Neste plano, nossa equipe multidisciplinar detalha a arquitetura técnica, as regras de negócio de transição e o impacto nos bancos de dados para garantir que a expansão ocorra de forma limpa, escalável (10x-100x), sem causar atrasos de desenvolvimento (DX impecável) e preservando a integridade das regras financeiras existentes.

---

## 2. Visão Técnica por Especialidade (Diretrizes de Equipe)

### 📊 1. Contador Sênior (Compliance CPC/IFRS/IAS)
A tradução financeira deve obedecer às diretrizes do **IASB (International Accounting Standards Board)** de forma estrita. Certas nomenclaturas contábeis e fiscais variam substancialmente entre as praças.
- **Balanço Patrimonial:**
  - **PT-BR:** Balanço Patrimonial (Ativo, Passivo, Patrimônio Líquido, Clientes, Estoques, PECLD).
  - **EN:** Balance Sheet (Assets, Liabilities, Equity, Accounts Receivable, Inventory, Allowance for Doubtful Accounts - *PECLD*).
  - **ES:** Balance General (Activo, Pasivo, Patrimonio Neto, Cuentas por Cobrar, Inventarios, Estimación para Cuentas Incobrables).
- **Demonstração do Resultado do Exercício (DRE):**
  - **PT-BR:** DRE (Receita Líquida, CPV, Lucro Bruto, Resultado Operacional, Resultado Financeiro, LAIR, Lucro Líquido).
  - **EN:** Income Statement (Net Revenue, COGS, Gross Profit, Operating Profit, Financial Result, EBT, Net Income).
  - **ES:** Estado de Resultados (Ingresos Netos, Costo de Ventas, Utilidad Bruta, Utilidad Operativa, Resultado Financiero, UAII, Utilidad Neta).
- **Demonstração de Fluxo de Caixa (DFC):**
  - **PT-BR:** Demonstração dos Fluxos de Caixa (Entradas, Saídas, Saldo Inicial, Saldo Final).
  - **EN:** Cash Flow Statement (Inflows, Outflows, Beginning Balance, Ending Balance).
  - **ES:** Estado de Flujos de Efectivo (Ingresos, Egresos, Saldo Inicial, Saldo Final).

### 🎯 2. Coordenador de Inteligência de Mercado (Marketing/Comercial)
A comunicação com participantes internacionais exige que os relatórios gerenciais e nomenclaturas de mercado façam total sentido regional.
- **Termos de Simulação:** Logística local e regional, treinamento de frotas industriais, campanhas de marketing territorializadas e margens de contribuição devem ser representados com termos universalmente aceitos pelas corporações (ex: *Freight/Logistics* em EN, *Flete/Logística* em ES).
- **Conteúdo das Gazetas e Cenários Macroeconômicos:** O tutor poderá cadastrar notícias e variáveis em múltiplos idiomas. O simulador precisa selecionar a versão correta correspondente ao idioma da equipe ou traduzir dinamicamente via Inteligência Artificial (Gemini API) se a tradução oficial não estiver cadastrada.

### 💻 3. Engenheiro de Software Sênior (Arquitetura e Escrita Limpa)
Nossa meta é uma arquitetura de internacionalização simples, sem dependências colaterais pesadas e de facílima manutenção.
- **Estratégia do Frontend (Vite/React):**
  - Adotaremos uma estrutura híbrida baseada em **Dicionários Estáticos de Tradução** com um Provedor de Contexto React leve (`useTranslation` + `I18nContext`), evitando re-renders desnecessários.
  - Para as mensagens do motor de simulação que vêm do backend ou de funções auxiliares, utilizaremos chaves de tradução padronizadas na camada visual.
- **Organização de Pastas de Recursos Estáticos:**
```bash
src/
 ├── locales/
 │    ├── pt.json        # Dicionário em Português
 │    ├── en.json        # Dicionário em Inglês
 │    └── es.json        # Dicionário em Espanhol
 └── contexts/
      └── I18nContext.tsx # Contexto para troca de idioma em tempo real
```

### 🗄️ 4. Engenheiro de Banco de Dados (PostgreSQL + Supabase)
As tabelas de cadastro do banco de dados (Ex: regras das arenas, notícias das gazetas, tabelas históricas do campeonato) precisam suportar a persistência multilíngue.
- **Abordagem de Internacionalização de Dados Dinâmicos:**
  - **Schema JSONB Dinâmico:** Em vez de duplicar tabelas inteiras ou criar colunas individuais redundantes (Ex: `name_pt`, `name_en`, `name_es`), utilizaremos colunas de formato `jsonb` no PostgreSQL estruturadas como `{ "pt": "...", "en": "...", "es": "..." }`.
  - Esta abordagem possibilita o versionamento impecável e permite consultas indexadas nativas do Postgres através de operadores GIN, mantendo alta performance.
- **Auditoria de Sessão:** O idioma preferido do usuário (`locale`) será registrado no seu perfil em `user_profiles.locale` para carregar a configuração correta de forma fiduciária assim que ele fizer login no cockpit.

### 🎨 5. Arquiteto Sênior de UI/UX (Acessibilidade e Componentização)
- **Gestão de Espaçamento e Estouro de Texto:**
  - Expressões em espanhol e alemão/inglês variam até 40% em tamanho de caracteres comparadas ao português.
  - O design system em Tailwind CSS utilizará layouts fluídos baseados em `flex-wrap`, `grid-cols-auto-fit`, larguras autoadaptáveis (`w-auto`), e truncamentos inteligentes com tooltips informativos para total conformidade com as diretrizes de visualização e legibilidade.
- **Seletor de Idioma Fluído:**
  - Criação de um seletor visual na barra superior (`Header`) de fácil acesso, apresentando bandeiras minimalistas de cada localidade e tags acessíveis de conformidade nível AA da WCAG (W3C Aria).

---

## 3. Modelo Arquitetural Recomendado (Código Proposto)

Como engenheiros e arquitetos ágeis, apresentamos abaixo o protótipo funcional para o mecanismo de internacionalização.

### A. Estrutura dos Arquivos de Dicionário (`src/locales/pt.json`)
```json
{
  "common": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "round": "Rodada",
    "loading": "Carregando..."
  },
  "financial": {
    "balance_sheet": "Balanço Patrimonial",
    "income_statement": "Demonstração do Resultado do Exercício (DRE)",
    "cash_flow": "Fluxo de Caixa",
    "pecld": "(-) PECLD (Inadimplência)",
    "interest": "Juros",
    "amortization": "Amortização"
  },
  "marketing": {
    "contribution_margin": "Margem de Contribuição",
    "logistic_cost": "Custo Logística",
    "marketing_cost": "Custo Camp. Mkt"
  }
}
```

### B. Provedor de Internacionalização React (`src/contexts/I18nContext.tsx`)
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import ptDict from '../locales/pt.json';
import enDict from '../locales/en.json';
import esDict from '../locales/es.json';

type Locale = 'pt' | 'en' | 'es';

interface I18nContextType {
  locale: Locale;
  setLocale: (lng: Locale) => void;
  t: (path: string) => string;
}

const dictionaries = {
  pt: ptDict,
  en: enDict,
  es: esDict
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialização fiduciária baseada em localStorage ou idioma do navegador
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('empirion_locale') as Locale;
    if (saved && (saved === 'pt' || saved === 'en' || saved === 'es')) {
      return saved;
    }
    const navLng = navigator.language.split('-')[0];
    if (navLng === 'es') return 'es';
    if (navLng === 'en') return 'en';
    return 'pt'; // Fallback padrão
  });

  const setLocale = (lng: Locale) => {
    setLocaleState(lng);
    localStorage.setItem('empirion_locale', lng);
    // Realiza a atualização sincronizada na sessão do Supabase se o usuário estiver logado
  };

  // Função helper recursiva tipo-segura para resolução da string traduzida
  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = dictionaries[locale];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback para português em caso de ausência de tradução local
        let fallback: any = dictionaries['pt'];
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return path; // Retorna o caminho se não achar nada
          }
        }
        return fallback;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation deve ser empregado sob um I18nProvider válido.');
  }
  return context;
};
```

### C. Estrutura de Banco de Dados Sugerida (Migrations Postgres)
Para os dados dinâmicos das rodadas e notícias da Gazeta (`trial_championships` ou `championships`), utilizaremos campos localizados do tipo `JSONB`.

```sql
-- Exemplo de modelagem fiduciária para conteúdos de suporte multilíngue
ALTER TABLE trial_championships 
ADD COLUMN IF NOT EXISTS welcome_message_i18n JSONB DEFAULT '{"pt": "Bem-vindo", "en": "Welcome", "es": "Bienvenido"}';

-- Procedure robusta de leitura de conteúdo dinâmico baseado no idioma solicitado
CREATE OR REPLACE FUNCTION get_localized_content(content_jsonb JSONB, preferred_locale TEXT) 
RETURNS TEXT AS $$
BEGIN
  -- Tenta resgatar o idioma preferido. Caso nulo, recorre ao fallback 'pt'
  IF content_jsonb ? preferred_locale THEN
    RETURN (content_jsonb->>preferred_locale);
  ELSE
    RETURN (content_jsonb->>'pt');
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## 4. Plano de Versões de Entrega (Governance Road)

| Fase / Sprint | Nome do Pacote | Escopo e Entregáveis | Versionamento Contábil |
| :--- | :--- | :--- | :--- |
| **Sprint A** | `i18n-v1-setup` | Configuração estrutural do `I18nProvider`, criação dos arquivos de dicionário JSON com as chaves para os 3 idiomas e envelopamento básico do arquivo de rotas raiz. | `v2026.127` |
| **Sprint B** | `i18n-v2-components` | Tradução de todos os cabeçalhos de tabelas financeiras (`balance_sheet`, `dre`, `cash_flow`), formulários de decisão, tomada de decisão de RH, Produção, Marketing e Legal. | `v2026.128` |
| **Sprint C** | `i18n-v3-database` | Migração no banco de dados para os dados dinâmicos parametrizados pelo Tutor (Gazetas, Cláusulas do Cronograma de Rodadas e Variáveis Ambientais). Integração do `locale` no perfil do usuário no Supabase. | `v2026.129` |
| **Sprint D** | `i18n-v4-validation` | Homologação contábil das traduções com o Contador Sênior e Auditoria de Fluxo de Interface (UI/UX) com o Arquiteto de Design em resoluções mobile e desktop. | `v2026.130` |

---

## 5. Extensão de i18n para Landing Pages, Páginas Públicas & SEO (Marketing Global)

Sim, a estrutura proposta do provedor de i18n fiduciário é **100% elegível e estensível** para atuar em toda a camada pública e de atração do **EMPIRION** (Landing Page, Features, Simulators, Blog, Contact, etc.). A centralização sob o mesmo core traz consistência absoluta e simplifica o desenvolvimento (DX fluido).

Para as páginas estáticas de tráfego, as diretrizes de expansão estruturadas pelo nosso conselho multidisciplinar compreendem:

### 🎯 A. Visão Comercial e de SEO (Coordenador de Inteligência de Mercado)
1. **SEO Localizado (Metadados Dinâmicos):** 
   - Motores de busca (como o Google) indexam melhor páginas que expõem tags de tradução e URLs lógicas.
   - Em vez de reter a localização exclusivamente sob um estado em memória (`localStorage`), as páginas de marketing devem refletir a localidade na URL (ex: `/en/simulators` ou `/es/simulators`).
   - Tags meta `<html lang="en">` e links alternativos `<link rel="alternate" hreflang="es" href="..." />` devem ser atualizados dinamicamente pelo gerenciador de cabeçalho (`react-helmet` ou similar) com base no idioma ativo.
2. **Nomes de Soluções Adaptativos:**
   - Termos comerciais precisam ser sintonizados ao jargão de negócios de cada mercado-alvo para otimizar as buscas por palavras-chave orgânicas regionais (ex: *Negocio de simulación corporativa* no mercado hispânico; *Corporate Business Game Simulator* nos EUA/Europa).

### 🎨 B. Visão UX/UI (Arquiteto de Interface)
1. **Header Unificado com Troca Abrangente:**
   - O componente do Menu Superior (`Navbar` público) consumirá o mesmo seletor visual e estado dinâmico do `I18nContext`. Se o usuário trocar o idioma na Landing Page e clicar para entrar no simulador, o cockpit do torneio herdará instantaneamente a preferência selecionada, provendo fricção zero.
2. **Escalabilidade de Textos em Cards de Atração (Bento Grid):**
   - Os grids modernos da Landing Page (features, simulators) utilizarão propriedades flexíveis do Tailwind (`auto-rows`, `min-h-[220px]`) para acomodar variações de strings mais volumosas em espanhol ou inglês, sem estourar as caixas visuais ou quebrar layouts fixos redundantes.

### 💻 C. Visão Técnica: Estratégia de Namespace Dinâmico (Engenheiro Sênior)
Para evitar que o arquivo contendo todas as traduções do painel do simulador (pesado e operacional) seja baixado pelo usuário que está apenas lendo um artigo rápido no blog, separaremos os dicionários em **Namespaces / Escopos**:

```bash
src/locales/
 ├── pt/
 │    ├── common.json     # Chaves globais (salvar, carregar, botões)
 │    ├── mockups.json    # Strings exclusivas da Landing Page e Blog
 │    └── cockpit.json    # Termos financeiros profundos (DRE, CPV, PECLD)
 ├── en/
 │    └── ...
 └── es/
      └── ...
```

O `I18nProvider` poderá carregar as seções de forma sob demanda (*lazy loading*), importando apenas os módulos requisitados por rota:

```typescript
// Exemplo fiduciário de carregamento lazy controlado por rota no Frontend
const loadNamespace = async (locale: string, namespace: string) => {
  const data = await import(`../locales/${locale}/${namespace}.json`);
  return data.default;
};
```

---

## 6. Próximos Passos Sugeridos

1. **Aprovação do Plano de Internacionalização:** O Product Owner (usuário) analisa o plano estruturado acima para deliberarmos seu início.
2. **Criação dos dicionários estáticos:** Uma vez aprovado, dividiremos as chaves de interface estática em `pt.json`, `en.json` e `es.json`.
3. **Refatoração assistida de componentes:** Substituição progressiva de strings fixas em português pelas chamadas seguras `t('key')` provindas do hook `useTranslation()`.

---
*Lembrete de Governança: Este plano foi cadastrado no DOCUMENT.md do projeto sob a governança v2026.126. Sempre consulte o arquivo de regras e versionamentos antes de iniciar atividades significativas de engenharia.*
