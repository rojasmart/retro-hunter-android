# Backend Endpoints Necessários para Folders

## ⚠️ IMPORTANTE

O frontend está pronto para usar folders, mas o **backend ainda não implementou os endpoints necessários**.

Quando tentares mover um jogo para uma folder, vais ver o erro:

```
Failed to move game. Backend Not Ready.
```

## Endpoints Que Precisam Ser Implementados

### 1. GET - Listar Folders do Utilizador

**Endpoint:** `GET /api/folders/{userId}`

**Headers:**

```
Authorization: Bearer {token}
```

**Resposta (200):**

```json
[
  {
    "_id": "folder123",
    "name": "SNES Games",
    "description": "My Super Nintendo collection",
    "color": "#FF6B6B",
    "userId": "user123",
    "createdAt": "2025-12-26T10:00:00.000Z"
  }
]
```

---

### 2. POST - Criar Nova Folder

**Endpoint:** `POST /api/folders`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "name": "SNES Games",
  "description": "My Super Nintendo collection",
  "color": "#FF6B6B",
  "userId": "user123"
}
```

**Resposta (201):**

```json
{
  "_id": "folder123",
  "name": "SNES Games",
  "description": "My Super Nintendo collection",
  "color": "#FF6B6B",
  "userId": "user123",
  "createdAt": "2025-12-26T10:00:00.000Z"
}
```

---

### 3. PUT - Atualizar Folder

**Endpoint:** `PUT /api/folders/{folderId}`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "name": "SNES & Genesis",
  "description": "16-bit era games",
  "color": "#4ECDC4"
}
```

**Resposta (200):**

```json
{
  "_id": "folder123",
  "name": "SNES & Genesis",
  "description": "16-bit era games",
  "color": "#4ECDC4",
  "userId": "user123",
  "createdAt": "2025-12-26T10:00:00.000Z"
}
```

---

### 4. DELETE - Apagar Folder

**Endpoint:** `DELETE /api/folders/{folderId}`

**Headers:**

```
Authorization: Bearer {token}
```

**Resposta:** `200 OK` ou `204 No Content`

**Nota:** Quando uma folder é apagada, os jogos dentro dela devem ter o campo `folderId` removido (set to `null`).

---

### 5. PATCH - Mover Jogo para Folder ⚠️ **CRÍTICO - FALTANDO**

**Endpoint:** `PATCH /api/gameincollections/{gameId}/folder`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "folderId": "folder123"
}
```

Para remover jogo de uma folder:

```json
{
  "folderId": null
}
```

**Resposta (200):**

```json
{
  "_id": "game123",
  "gameName": "Super Mario World",
  "folderId": "folder123"
  // ... other game fields
}
```

---

## Alteração no Schema da Base de Dados

### GameInCollection Schema

Adicionar campo `folderId`:

```javascript
const GameInCollectionSchema = new Schema({
  gameName: String,
  console: String,
  userId: String,
  // ... existing fields ...
  folderId: {
    type: Schema.Types.ObjectId,
    ref: "Folder",
    required: false,
    default: null,
  },
});
```

### Folder Schema (Novo)

```javascript
const FolderSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    required: true,
    enum: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"],
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index para queries rápidas
FolderSchema.index({ userId: 1 });
```

---

## Cores Disponíveis

O frontend suporta estas 6 cores para folders:

| Cor         | Hex Code | Nome   |
| ----------- | -------- | ------ |
| 🔴 Vermelho | #FF6B6B  | Red    |
| 🔵 Azul     | #4ECDC4  | Teal   |
| 🌊 Oceano   | #45B7D1  | Ocean  |
| 🍑 Coral    | #FFA07A  | Coral  |
| 💚 Verde    | #98D8C8  | Mint   |
| 🌟 Amarelo  | #F7DC6F  | Yellow |

---

## Endpoints Alternativos Testados

O frontend tenta automaticamente estes endpoints (pela ordem):

### Para mover jogos:

1. `PATCH /api/gameincollections/{gameId}/folder` ✅ **Recomendado**
2. `PATCH /api/collection/{gameId}/folder` (fallback)

### Para criar jogos com folder:

- `POST /api/gameincollections` - O body já inclui `folderId` se selecionado

---

## Como Testar

1. Implementa os endpoints no backend
2. Testa criar uma folder
3. Testa adicionar jogos à folder (ao criar novo jogo)
4. Testa mover jogos existentes para a folder
5. Testa editar folder
6. Testa apagar folder

---

## Estado Atual

✅ **Frontend:** Completamente implementado e pronto  
❌ **Backend:** Endpoints faltando - precisam ser criados

Quando implementares os endpoints, a funcionalidade de folders vai funcionar imediatamente sem alterações ao frontend.
