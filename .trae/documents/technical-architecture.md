## 1. 架构设计

```mermaid
flowchart TB
    subgraph "前端层"
        "React 18 + TypeScript"
        "React Router DOM"
        "Tailwind CSS"
        "Zustand 状态管理"
        "Lucide React 图标"
    end
    subgraph "数据层"
        "Mock 数据服务"
        "Zustand Store 持久化"
        "LocalStorage"
    end
    "前端层" --> "数据层"
```

本产品为纯前端应用，使用 Mock 数据模拟后端服务，所有数据通过 Zustand + LocalStorage 持久化存储。

## 2. 技术说明

- **前端框架**：React@18 + TypeScript + Vite
- **样式方案**：Tailwind CSS@3 + 自定义设计令牌
- **状态管理**：Zustand（带 persist 中间件）
- **路由方案**：React Router DOM v6
- **图标库**：Lucide React
- **初始化工具**：vite-init（react-ts 模板）
- **后端服务**：无，使用 Mock 数据
- **数据库**：无，使用 LocalStorage 持久化

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 首页 - 今日概览和快捷入口 |
| `/chores` | 家务板 - 轮值排班和打卡 |
| `/shopping` | 购物清单 - 共编和补录 |
| `/ledger` | 账本 - 开销分摊和基金 |
| `/fridge` | 冰箱页 - 食材和借用 |
| `/chat` | 群聊 - 公告和沟通 |
| `/vote` | 投票页 - 决策和投票 |
| `/visitors` | 访客管理 - 报备和记录 |
| `/profile` | 个人中心 - 设置和管理 |

## 4. API 定义

不适用后端 API，使用 Zustand Store 管理 Mock 数据。

## 5. 服务端架构图

不适用，本产品为纯前端应用。

## 6. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    "House" ||--o{ "Member" : "contains"
    "House" ||--o{ "ChoreSchedule" : "has"
    "House" ||--o{ "ShoppingItem" : "has"
    "House" ||--o{ "Expense" : "has"
    "House" ||--o{ "FridgeItem" : "has"
    "House" ||--o{ "Vote" : "has"
    "House" ||--o{ "Visitor" : "has"
    "House" ||--o{ "ChatMessage" : "has"
    "House" ||--o{ "Announcement" : "has"
    "Member" ||--o{ "ChoreCheckin" : "creates"
    "Member" ||--o{ "Expense" : "pays"
    "Member" ||--o{ "ShiftRequest" : "submits"

    "House" {
        "string id PK"
        "string name"
        "string address"
        "string inviteCode"
        "string[] rules"
        "string ownerId"
        "number commonFund"
    }

    "Member" {
        "string id PK"
        "string houseId FK"
        "string name"
        "string avatar"
        "string role"
    }

    "ChoreSchedule" {
        "string id PK"
        "string houseId FK"
        "string memberId FK"
        "string date"
        "string choreType"
        "boolean completed"
    }

    "ChoreCheckin" {
        "string id PK"
        "string scheduleId FK"
        "string memberId FK"
        "string photoUrl"
        "string completedAt"
    }

    "ShiftRequest" {
        "string id PK"
        "string houseId FK"
        "string requesterId FK"
        "string targetId FK"
        "string date"
        "string status"
    }

    "ShoppingItem" {
        "string id PK"
        "string houseId FK"
        "string name"
        "string addedBy FK"
        "string urgency"
        "boolean purchased"
        "string purchasedBy FK"
        "string photoUrl"
    }

    "Expense" {
        "string id PK"
        "string houseId FK"
        "string payerId FK"
        "number amount"
        "string category"
        "string splitType"
        "string description"
        "string createdAt"
        "boolean settled"
    }

    "FridgeItem" {
        "string id PK"
        "string houseId FK"
        "string name"
        "string ownerId FK"
        "string ownership"
        "string expiryDate"
        "string category"
        "boolean borrowed"
        "string borrowedBy FK"
    }

    "Vote" {
        "string id PK"
        "string houseId FK"
        "string createdBy FK"
        "string title"
        "string type"
        "string[] options"
        "string deadline"
        "boolean anonymous"
    }

    "Visitor" {
        "string id PK"
        "string houseId FK"
        "string hostId FK"
        "string visitorName"
        "string relation"
        "string visitDate"
        "string status"
    }

    "ChatMessage" {
        "string id PK"
        "string houseId FK"
        "string senderId FK"
        "string content"
        "string type"
        "string createdAt"
    }

    "Announcement" {
        "string id PK"
        "string houseId FK"
        "string authorId FK"
        "string content"
        "string createdAt"
        "string[] readBy"
    }
```

### 6.2 数据定义语言

使用 TypeScript 接口定义代替 SQL DDL：

```typescript
interface House {
  id: string;
  name: string;
  address: string;
  inviteCode: string;
  rules: string[];
  ownerId: string;
  commonFund: number;
}

interface Member {
  id: string;
  houseId: string;
  name: string;
  avatar: string;
  role: 'owner' | 'member';
}

interface ChoreSchedule {
  id: string;
  houseId: string;
  memberId: string;
  date: string;
  choreType: string;
  completed: boolean;
}

interface ShoppingItem {
  id: string;
  houseId: string;
  name: string;
  addedBy: string;
  urgency: 'low' | 'medium' | 'high';
  purchased: boolean;
  purchasedBy?: string;
  price?: number;
  photoUrl?: string;
}

interface Expense {
  id: string;
  houseId: string;
  payerId: string;
  amount: number;
  category: string;
  splitType: 'equal' | 'custom';
  description: string;
  createdAt: string;
  settled: boolean;
  splits: { memberId: string; amount: number; paid: boolean }[];
}

interface FridgeItem {
  id: string;
  houseId: string;
  name: string;
  ownerId: string;
  ownership: 'shared' | 'personal';
  expiryDate?: string;
  category: string;
  borrowed: boolean;
  borrowedBy?: string;
  borrowReturnDate?: string;
}
```
