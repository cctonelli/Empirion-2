# 🏛️ Diretrizes Arquiteturais do EMPIRION (Clean Architecture & i18n Robust)

Este documento centraliza as diretrizes técnicas de arquitetura de software, infraestrutura de dados e boas práticas de engenharia estabelecidas pela equipe multidisciplinar do projeto EMPIRION.

---

## 🚀 1. Visão Geral da Arquitetura
O EMPIRION é um simulador empresarial multinacional de alta escala focado em prover experiências fidedignas de tomada de decisão executiva. Para suportar esse escopo complexo sem gargalos de manutenção (DX excelente) e com alta escalabilidade, adota-se:

- **Frontend:** React 18+ com Vite, estruturado em componentes funcionais e hooks reativos puros.
- **Estilização:** Tailwind CSS (Utility-First) estrito, integrado via `@import "tailwindcss";` no arquivo global de estilo.
- **Visualização de Dados:** Recharts e D3 de alta performance para relatórios dinâmicos.
- **Banco de Dados & Persistência:** PostgreSQL (Supabase) integrado de forma segura com migrações versionadas, triggers e políticas RLS (Row Level Security).
- **Internacionalização (i18n):** Mecanismo assíncrono baseado em sub-namespaces isolados e carregamento sob demanda para escalabilidade horizontal global.

---

## 🌐 2. Engenharia de Internacionalização (i18n Global)
Para garantir que o EMPIRION possa ser expandido de forma ilimitada para dezenas de novos idiomas (Inglês, Espanhol, Mandarim, Francês, etc.) sem perda de desempenho de renderização ou acúmulo de arquivos estáticos gigantes no bundle principal do Javascript, adota-se o padrão **i18next com HTTP Backend assíncrono**.

### Estrutura de Diretórios de Tradução:
As traduções são estritamente apartadas do código fonte e organizadas por **idioma** e **namespace de contexto (função de negócio)** na pasta `/public/locales/`:

```bash
/public/locales/
  ├── pt/               # Português do Brasil (Core Base)
  │    ├── common.json        # Termos globais, cabeçalhos e botões genéricos
  │    ├── auth.json          # Autenticação, login, onboarding
  │    ├── dashboard.json     # KPIs gerais, gráficos e grids mestre
  │    ├── decisions.json     # Telas de decisão (Supply, HR, Factory, Marketing, etc.)
  │    └── branches.json      # Configurações de filiais e expansão geográfica
  ├── en/               # Inglês (Global Standard)
  │    ├── common.json
  │    ├── auth.json
  │    └── ...
  └── es/               # Espanhol (LatAm & Europa)
       ├── common.json
       ├── auth.json
       └── ...
```

### Vantagens Técnicas e Arquiteturais do Modelo:
1. **Redução de Payload (Lazy Loading):** Os dicionários de tradução de cada tela (ex: decisões da fábrica) só são baixados pela aplicação quando a respectiva tela é renderizada pelo usuário, poupando dados móveis e tempo de inicialização.
2. **Separação de Preocupações (Separation of Concerns):** Tradutores e redatores de conteúdo trabalham diretamente nas pastas de arquivos JSON, sem tocar no código TypeScript do projeto, mitigando riscos de introdução de bugs no compilador.
3. **Escalabilidade Ilimitada:** Inserir um novo idioma no futuro resume-se a criar uma nova pasta física (ex: `/public/locales/fr/`) com os respectivos arquivos de namespaces. O arquivo `/i18n.ts` detectará a nova linguagem automaticamente e atualizará o seletor.

### Utilização correta no Código (React Component):
```tsx
import { useTranslation } from 'react-i18next';

export function FactoryStep() {
  // Chamada informando o namespace correspondente para lazy loading
  const { t } = useTranslation('decisions');

  return (
    <div>
      <h3>{t('factory.title', 'Produção & Fábrica')}</h3>
      <p>{t('factory.description')}</p>
    </div>
  );
}
```

---

## 💰 3. Acoplamento Fiduciário Multimonedas
Para apoiar a expansão internacional simulada, a moeda das praças não é amarrada estritamente ao idioma ativo na interface. 
- Um usuário jogando em **Português (pt-BR)** pode criar e gerenciar uma praça configurada em **USD** ou **MXN**.
- O sistema de moedas dinâmicas herda e formata os dados monetários diretamente das propriedades do objeto comercial da região ativa (`region.currency`).

---

## ⚙️ 4. Regras Contábeis, Fiscais e de Simulação
Toda alteração de fórmulas contábeis deve estar em total conformidade com as normas internacionais (IFRS/CPC), auditada pelo **Contador Sênior** e codificada com tipagem estrita para resguardar a integridade financeira dos balanços e relatórios de DRE.

- **DRE e Balanço Patrimonial:** Sempre gerados a partir do histórico consolidado da rodada.
- **Auditoria de Tráfego:** Proibido o uso de `SELECT *` e obrigatório o uso de campos de auditoria em qualquer tabela ou consulta.
