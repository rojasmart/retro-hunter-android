# Funcionalidade de Pastas (Folders)

## Visão Geral

A funcionalidade de pastas permite organizar sua coleção de jogos em categorias personalizadas. Você pode criar pastas temáticas como "Jogos SNES", "Jogos Mega Drive", "Compras da Feira X", etc.

## Características Implementadas

### 1. **Criação de Pastas**

- Botão "📁+" no cabeçalho para criar nova pasta
- Campos:
  - **Nome**: obrigatório (ex: "SNES Games")
  - **Descrição**: opcional (ex: "Jogos comprados em 2024")
  - **Cor**: 6 opções de cores para identificação visual
    - Roxo (#a855f7)
    - Vermelho (#ef4444)
    - Verde (#10b981)
    - Azul (#3b82f6)
    - Laranja (#f59e0b)
    - Rosa (#ec4899)

### 2. **Visualização de Pastas**

- Scroll horizontal de pastas no topo da lista
- Chip "All Games" mostra todos os jogos
- Cada pasta mostra:
  - Nome da pasta
  - Contador de jogos na pasta
  - Cor personalizada

### 3. **Gerenciamento de Pastas**

- **Editar**: Long press na pasta → opção "Edit"
- **Deletar**: Long press na pasta → opção "Delete"
  - Jogos NÃO são deletados, apenas removidos da pasta
- **Ver detalhes**: Long press mostra nome e descrição

### 4. **Mover Jogos entre Pastas**

- Botão "Move to Folder" em cada jogo
- Modal com lista de todas as pastas disponíveis
- Opção "No Folder" para remover jogo de qualquer pasta
- Cada pasta mostra nome e descrição

### 5. **Filtragem por Pasta**

- Toque em uma pasta para filtrar jogos
- Toque em "All Games" para ver todos
- Contador atualizado dinamicamente

## Estrutura de Dados

### Interface Folder

```typescript
interface Folder {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  userId: string;
  createdAt?: string;
}
```

### Interface Item (atualizada)

```typescript
interface Item {
  _id: string;
  gameTitle: string;
  platform: string;
  folderId?: string; // ID da pasta onde o jogo está
  // ... outros campos
}
```

## Endpoints do Backend (Esperados)

### GET `/folders/{userId}`

Retorna as pastas do usuário:

```json
{
  "folders": [
    {
      "_id": "folder123",
      "name": "SNES Games",
      "description": "Super Nintendo games collection",
      "color": "#a855f7",
      "userId": "user123",
      "createdAt": "2025-12-26T..."
    }
  ]
}
```

### POST `/folders`

Cria nova pasta:

**Request:**

```json
{
  "name": "Mega Drive Games",
  "description": "Genesis/Mega Drive collection",
  "color": "#ef4444",
  "userId": "user123"
}
```

**Response:**

```json
{
  "_id": "folder456",
  "name": "Mega Drive Games",
  "description": "Genesis/Mega Drive collection",
  "color": "#ef4444",
  "userId": "user123",
  "createdAt": "2025-12-26T..."
}
```

### PUT `/folders/{folderId}`

Atualiza pasta existente:

**Request:**

```json
{
  "name": "Mega Drive Updated",
  "description": "Updated description",
  "color": "#10b981"
}
```

### DELETE `/folders/{folderId}`

Deleta uma pasta (jogos não são deletados, apenas folderId é removido)

### PATCH `/gameincollections/{gameId}/folder`

Atribui jogo a uma pasta:

**Request:**

```json
{
  "folderId": "folder123" // ou null para remover de pasta
}
```

### Endpoints Alternativos Tentados

O código tenta múltiplos endpoints para compatibilidade:

- `/folders/{userId}`
- `/folders?userId={userId}`
- `/collection-folders/{userId}`
- `/gameincollections/{gameId}/folder`
- `/collection/{gameId}/folder`

## Interface do Usuário

### Componentes Visuais

1. **Botão Criar Pasta**

   - Ícone: 📁+
   - Localização: Header, ao lado do botão de atualização de preços

2. **Chips de Pastas**

   - Scroll horizontal
   - Fundo com cor da pasta (opaco quando selecionada, transparente quando não)
   - Texto branco
   - Contador de jogos

3. **Modal de Pasta**

   - Campos de nome e descrição
   - Seletor de cores visual (círculos coloridos)
   - Botões Cancel e Save

4. **Modal Mover para Pasta**

   - Lista de todas as pastas
   - Opção "No Folder"
   - Cada pasta mostra nome e descrição
   - Fundo semi-transparente com cor da pasta

5. **Botões no Card do Jogo**
   - "Move to Folder" (roxo)
   - "Delete" (vermelho)
   - Dispostos lado a lado

## Fluxo de Uso

### Criar Pasta

1. Usuário toca em "📁+" no header
2. Modal abre com campos vazios
3. Preenche nome (obrigatório)
4. Opcionalmente preenche descrição
5. Seleciona cor
6. Toca "Save"
7. Pasta aparece no scroll horizontal

### Mover Jogo para Pasta

1. Usuário toca "Move to Folder" no card do jogo
2. Modal mostra todas as pastas disponíveis
3. Usuário seleciona pasta desejada
4. Jogo é movido e lista é atualizada

### Filtrar por Pasta

1. Usuário toca em uma pasta no scroll horizontal
2. Lista mostra apenas jogos dessa pasta
3. Toque em "All Games" volta a mostrar todos

### Editar Pasta

1. Long press na pasta
2. Menu com opções: Edit, Delete
3. Toque em "Edit"
4. Modal abre pré-preenchido
5. Usuário faz alterações
6. Toca "Save"

### Deletar Pasta

1. Long press na pasta
2. Toque em "Delete"
3. Confirmação pergunta se tem certeza
4. Pasta é deletada
5. Jogos permanecem na coleção (sem pasta)

## Estilos

### folderChip

```typescript
{
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  marginRight: 8,
  borderWidth: 2,
  borderColor: "rgba(255, 255, 255, 0.3)",
}
```

### folderChipText

```typescript
{
  color: "#fff",
  fontSize: 14,
  fontWeight: "bold",
}
```

### folderOption

```typescript
{
  padding: 16,
  borderRadius: 8,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.2)",
}
```

## Estados do Component

```typescript
const [folders, setFolders] = useState<Folder[]>([]);
const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
const [isEditingFolder, setIsEditingFolder] = useState(false);
const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
const [folderName, setFolderName] = useState("");
const [folderDescription, setFolderDescription] = useState("");
const [folderColor, setFolderColor] = useState("#a855f7");
const [isMoveToFolderVisible, setIsMoveToFolderVisible] = useState(false);
const [gameToMove, setGameToMove] = useState<Item | null>(null);
```

## Funcionalidades Técnicas

- ✅ Fetch de pastas no load do componente
- ✅ Criação de novas pastas com validação
- ✅ Edição de pastas existentes
- ✅ Deleção de pastas com confirmação
- ✅ Movimentação de jogos entre pastas
- ✅ Filtragem de jogos por pasta
- ✅ Contador dinâmico de jogos por pasta
- ✅ Seletor visual de cores
- ✅ Scroll horizontal de pastas
- ✅ Long press para opções de pasta
- ✅ Modals para gerenciamento

## Benefícios

1. **Organização**: Separe jogos por console, época, evento de compra, etc.
2. **Visualização**: Veja rapidamente quantos jogos tem em cada categoria
3. **Personalização**: Cores diferentes para identificação rápida
4. **Flexibilidade**: Jogos podem mudar de pasta facilmente
5. **Não-destrutivo**: Deletar pasta não deleta jogos

## Exemplo de Uso

### Cenário: Colecionador de Retro Games

1. Cria pasta "SNES" (cor roxa)
2. Cria pasta "Mega Drive" (cor vermelha)
3. Cria pasta "Feira 2024" (cor verde)
4. Move jogos Super Mario World → SNES
5. Move jogos Sonic → Mega Drive
6. Move alguns jogos específicos → Feira 2024
7. Filtra por "SNES" para ver só jogos do Super Nintendo
8. Edita "Feira 2024" para "Feira Retro São Paulo 2024"

## Próximas Melhorias Possíveis

- [ ] Ordenação customizada de pastas
- [ ] Busca dentro de pasta
- [ ] Estatísticas por pasta (valor total, etc.)
- [ ] Compartilhamento de pastas
- [ ] Tags adicionais além de pastas
- [ ] Subpastas
- [ ] Importar/exportar configuração de pastas
