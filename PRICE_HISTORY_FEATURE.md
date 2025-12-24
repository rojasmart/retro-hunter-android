# Funcionalidade de Histórico de Preços

## Visão Geral

Esta funcionalidade adiciona gráficos de histórico de preços à página My Collections do app React Native, similar à versão web.

## Características Implementadas

### 1. **Indicadores de Tendência de Preços** 🎯 (NOVO)

Cada card de preço (Loose, CIB, New, Graded) agora mostra um indicador visual da tendência:

- **↑** (Verde #10b981) - Preço está **subindo** em relação ao histórico
- **↓** (Vermelho #ef4444) - Preço está **descendo** em relação ao histórico
- **→** (Cinza #9ca3af) - Preço está **estável** (variação < 0.2%)

**Como funciona:**

- Compara o preço atual com o último preço histórico diferente
- Ignora variações menores que 0.2% (consideradas neutras)
- Atualiza automaticamente ao carregar a coleção
- Indicador aparece ao lado do label do preço

### 2. **Componente PriceHistoryChart**

- Localização: `/components/PriceHistoryChart.tsx`
- Biblioteca utilizada: `react-native-chart-kit` (compatível com React Native)
- Exibe um gráfico de linhas horizontal com até 4 linhas de preço:
  - **Loose Price** (Azul - #0ea5e9)
  - **CIB Price** (Roxo - #8b5cf6)
  - **New Price** (Verde - #10b981)
  - **Graded Price** (Âmbar - #f59e0b)

### 3. **Fetch Automático de Preços Diários**

Quando o usuário acessa `MyCollectionsPage`:

1. A função `fetchAndUpdateDailyPrices()` é executada automaticamente
2. Para cada jogo com `priceChartingId`, busca os preços atuais da PriceCharting
3. Salva um registro de histórico para a data de hoje no backend
4. Atualiza a coleção para exibir o histórico completo

### 4. **Endpoints do Backend (Esperados)**

#### GET `/price-charting/{priceChartingId}`

Retorna os preços atuais de um jogo:

```json
{
  "id": "12345",
  "product_name": "Super Mario 64",
  "console_name": "Nintendo 64",
  "prices": {
    "loose": 25.5,
    "cib": 85.0,
    "new": 350.0,
    "graded": 1200.0
  }
}
```

#### POST `/gameincollections/{itemId}/price-history`

Adiciona um registro de histórico de preços:

```json
{
  "date": "2025-12-22",
  "loosePrice": 25.5,
  "cibPrice": 85.0,
  "newPrice": 350.0,
  "gradedPrice": 1200.0
}
```

#### GET `/gameincollections/{userId}`

Retorna os itens da coleção incluindo `priceHistory`:

```json
{
  "collections": [
    {
      "_id": "abc123",
      "gameTitle": "Super Mario 64",
      "platform": "Nintendo 64",
      "loosePrice": 25.5,
      "cibPrice": 85.0,
      "priceChartingId": "12345",
      "priceHistory": [
        {
          "date": "2025-12-20",
          "loosePrice": 25.0,
          "cibPrice": 84.0,
          "newPrice": 345.0,
          "gradedPrice": 1180.0
        },
        {
          "date": "2025-12-21",
          "loosePrice": 25.25,
          "cibPrice": 84.5,
          "newPrice": 348.0,
          "gradedPrice": 1190.0
        },
        {
          "date": "2025-12-22",
          "loosePrice": 25.5,
          "cibPrice": 85.0,
          "newPrice": 350.0,
          "gradedPrice": 1200.0
        }
      ]
    }
  ]
}
```

## Estrutura de Dados

### Item (MyCollectionsPage)

```typescript
interface PriceHistoryData {
  date: string; // ISO date format
  loosePrice?: number;
  cibPrice?: number;
  newPrice?: number;
  gradedPrice?: number;
}

interface Item {
  _id: string;
  gameTitle: string;
  platform: string;
  priceChartingId?: string;
  loosePrice?: number;
  cibPrice?: number;
  newPrice?: number;
  gradedPrice?: number;
  priceHistory?: PriceHistoryData[];
  // ... outros campos
}
```

## UX/UI

### 1. **Toggle de Histórico**

Cada item da coleção que possui preços do PriceCharting mostra um botão:

- **"Show Price History"** quando colapsado
- **"Hide Price History"** quando expandido

### 2. **Gráfico**

- **Legenda colorida** no topo mostrando cada tipo de preço
- **Scroll horizontal** para visualizar todo o histórico
- **Labels do eixo X**: Datas no formato `MM/DD`
- **Labels do eixo Y**: Valores em dólares com prefixo `$`
- **Estilo**: Gradiente escuro com linhas suaves (bezier curves)

### 3. **Indicadores de Tendência nos Cards**

Cada preço exibe um indicador ao lado do label:

- **↑ Verde** - Preço subiu desde a última verificação
- **↓ Vermelho** - Preço desceu desde a última verificação
- **→ Cinza** - Preço estável (variação < 0.2%)

**Exemplo visual:**

```
┌─────────────────┐
│ Loose      ↑    │  <- Verde, preço subindo
│ $25.50          │
└─────────────────┘

┌─────────────────┐
│ CIB        ↓    │  <- Vermelho, preço descendo
│ $85.00          │
└─────────────────┘
```

### 4. **Estado Vazio**

Quando não há histórico disponível:

```
📊 No price history available yet
Prices will be tracked when you access your collection
```

## Fluxo de Funcionamento

```
1. Usuário abre "My Collections"
   ↓
2. fetchCollections() busca os itens da coleção
   ↓
3. fetchAndUpdateDailyPrices() é chamado automaticamente
   ↓
4. Para cada item com priceChartingId:
   - Busca preços atuais da PriceCharting
   - Cria entrada de histórico para hoje
   - Envia POST para salvar no backend
   ↓
5. Recarrega a coleção com histórico atualizado
   ↓
6. Calcula tendências de preço comparando com histórico
   ↓
7. Exibe indicadores visuais nos cards de preço
   ↓
8. Usuário pode expandir/colapsar gráficos individuais
```

## Lógica de Cálculo de Tendência

A função `getPriceTrend()` determina a tendência de cada preço:

```typescript
1. Verifica se há histórico válido (mínimo 1 entrada)
2. Ordena o histórico por data (do mais antigo para o mais recente)
3. Filtra apenas entradas que possuem valor para o tipo de preço específico
4. Verifica se há pelo menos 2 entradas válidas
5. Compara a PRIMEIRA entrada (mais antiga) com a ÚLTIMA (mais recente):
   - oldestPrice: primeira entrada no histórico (ex: 17/12)
   - mostRecentPrice: última entrada no histórico (ex: 22/12)
6. Calcula a variação TOTAL do período:
   difference = mostRecentPrice - oldestPrice
   percentageChange = (difference / oldestPrice) * 100
7. Aplica regras:
   - Se |percentageChange| < 0.2% → Neutro (→ Cinza)
   - Se difference > 0 → Subindo (↑ Verde)
   - Se difference < 0 → Descendo (↓ Vermelho)
```

**Exemplo prático:**

```
Histórico de "New Price" (período completo):
- 17/12: $305.78 (primeira entrada - mais antiga)
- 18/12: $305.90
- 19/12: $306.00
- 21/12: $306.60 (última entrada - mais recente)

Cálculo (compara PRIMEIRA com ÚLTIMA):
- Diferença: $306.60 - $305.78 = $0.82
- Percentual: (0.82 / 305.78) * 100 = 0.268%
- Resultado: ↑ (subindo, 0.268% > 0.2%)

Vantagem: Mostra a tendência do PERÍODO COMPLETO, não apenas entre dias consecutivos.
```

Se a diferença for muito pequena:

- 17/12: $305.78
- 21/12: $305.90

Cálculo:

- Diferença: $305.90 - $305.78 = $0.12
- Percentual: (0.12 / 305.78) \* 100 = 0.039%
- Resultado: → (neutro, 0.039% < 0.2%)

```

**Nota importante:** O cálculo compara a **primeira entrada (mais antiga)** com a **última entrada (mais recente)** do histórico, mostrando a tendência do **período completo** registrado. Isso garante que você veja se o preço está subindo ou descendo desde o primeiro registro até hoje.

### Por que comparar período completo?

**Abordagem Anterior** (comparava apenas 2 dias consecutivos):
```

17/12: $305.78
18/12: $305.90 → Diferença: +$0.12
19/12: $306.00 → Diferença: +$0.10
21/12: $306.60 → Diferença: +$0.60

```
❌ Problema: Mostrava apenas a variação do último dia, não a tendência geral

**Abordagem Atual** (compara período completo):
```

17/12: $305.78 (início)
↓ (variações intermediárias)
21/12: $306.60 (fim)

Resultado: +$0.82 total (+0.268%)

````
✅ Vantagem: Mostra se o preço está REALMENTE subindo ou descendo no período completo

## Dependências Instaladas

```json
{
  "react-native-chart-kit": "^6.12.0",
  "react-native-svg": "15.12.1"
}
````

## Arquivos Criados/Modificados

### Novos Arquivos:

- `/components/PriceHistoryChart.tsx` - Componente do gráfico
- `/components/PriceHistoryChart.styles.ts` - Estilos do gráfico

### Arquivos Modificados:

- `/screens/MyCollectionsPage.tsx` - Adicionado fetch de histórico e exibição do gráfico
- `/screens/MyCollectionsPage.styles.ts` - Adicionados estilos para o toggle

## Próximos Passos (Backend)

Para esta funcionalidade funcionar completamente, o backend precisa:

1. **Implementar endpoint de histórico de preços**:

   ```
   POST /api/gameincollections/{itemId}/price-history
   POST /api/collection/{itemId}/price-history
   ```

2. **Modificar o schema do modelo de Collection** para incluir `priceHistory`:

   ```javascript
   priceHistory: [
     {
       date: { type: Date, required: true },
       loosePrice: Number,
       cibPrice: Number,
       newPrice: Number,
       gradedPrice: Number,
     },
   ];
   ```

3. **Implementar endpoint PriceCharting** (se ainda não existe):

   ```
   GET /price-charting/{priceChartingId}
   ```

4. **Evitar duplicatas**: Ao salvar histórico, verificar se já existe entrada para a data de hoje

## Notas de Implementação

- O gráfico usa scroll horizontal para acomodar muitos pontos de dados
- A largura do gráfico é dinâmica: `max(screenWidth, labels.length * 60)`
- Apenas linhas com dados válidos são exibidas no gráfico
- O histórico é armazenado por item (cada jogo tem seu próprio histórico)
- O fetch de preços é feito uma vez por acesso à página de coleções
- **Indicadores de tendência** calculam mudanças com base no histórico real
- **Limiar de sensibilidade**: Variações menores que 0.2% são consideradas neutras para evitar ruído excessivo

## Melhorias Futuras

1. **Cache Local**: Evitar fetch diário múltiplo usando AsyncStorage
2. ~~**Indicador de Tendência**: Setas ↑/↓ mostrando se o preço subiu ou desceu~~ ✅ **IMPLEMENTADO**
3. **Percentual de Mudança**: Mostrar % de variação junto com a seta
4. **Período Selecionável**: Filtrar gráfico por "7 dias", "30 dias", "Tudo"
5. **Notificações**: Alertar quando um preço atinge certo valor
6. **Comparação**: Comparar preços de múltiplos jogos no mesmo gráfico
7. **Alertas de Tendência**: Notificar quando um preço tem tendência forte de alta/baixa
