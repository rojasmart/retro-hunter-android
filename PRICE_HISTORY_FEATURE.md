# Funcionalidade de Histórico de Preços

## Visão Geral

Esta funcionalidade adiciona gráficos de histórico de preços à página My Collections do app React Native, similar à versão web.

## Características Implementadas

### 1. **Componente PriceHistoryChart**

- Localização: `/components/PriceHistoryChart.tsx`
- Biblioteca utilizada: `react-native-chart-kit` (compatível com React Native)
- Exibe um gráfico de linhas horizontal com até 4 linhas de preço:
  - **Loose Price** (Azul - #0ea5e9)
  - **CIB Price** (Roxo - #8b5cf6)
  - **New Price** (Verde - #10b981)
  - **Graded Price** (Âmbar - #f59e0b)

### 2. **Fetch Automático de Preços Diários**

Quando o usuário acessa `MyCollectionsPage`:

1. A função `fetchAndUpdateDailyPrices()` é executada automaticamente
2. Para cada jogo com `priceChartingId`, busca os preços atuais da PriceCharting
3. Salva um registro de histórico para a data de hoje no backend
4. Atualiza a coleção para exibir o histórico completo

### 3. **Endpoints do Backend (Esperados)**

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

- **"▶ Show Price History"** quando colapsado
- **"▼ Hide Price History"** quando expandido

### 2. **Gráfico**

- **Legenda colorida** no topo mostrando cada tipo de preço
- **Scroll horizontal** para visualizar todo o histórico
- **Labels do eixo X**: Datas no formato `MM/DD`
- **Labels do eixo Y**: Valores em dólares com prefixo `$`
- **Estilo**: Gradiente escuro com linhas suaves (bezier curves)

### 3. **Estado Vazio**

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
6. Usuário pode expandir/colapsar gráficos individuais
```

## Dependências Instaladas

```json
{
  "react-native-chart-kit": "^6.12.0",
  "react-native-svg": "15.12.1"
}
```

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

## Melhorias Futuras

1. **Cache Local**: Evitar fetch diário múltiplo usando AsyncStorage
2. **Indicador de Tendência**: Setas ↑/↓ mostrando se o preço subiu ou desceu
3. **Período Selecionável**: Filtrar gráfico por "7 dias", "30 dias", "Tudo"
4. **Notificações**: Alertar quando um preço atinge certo valor
5. **Comparação**: Comparar preços de múltiplos jogos no mesmo gráfico
