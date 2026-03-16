# Firebase Infrastructure Design Guide

**Project:** `xuanwu-i-00708880-4e2d8`  
**Location:** `src/infrastructure/firebase/`

---

## 1️⃣ 基礎檔案結構（成本可控版）

```
src/
├─ infrastructure/
│   └─ firebase/
│       ├─ app.ts                    # Firebase App 初始化（client 側共用）
│       ├─ index.ts                  # 公開 barrel
│       ├─ README.md                 # 本設計文件
│       │
│       ├─ client/                   # 前端 SDK 封裝（firebase Web SDK）
│       │   ├─ auth.ts               # 認證操作
│       │   ├─ firestore.ts          # 讀取操作（可搭配快取）
│       │   ├─ storage.ts            # Storage 上傳 / 下載
│       │   ├─ database.ts           # Realtime Database
│       │   ├─ messaging.ts          # FCM / In-App Messaging
│       │   ├─ analytics.ts          # Google Analytics for Firebase
│       │   ├─ app-check.ts          # App Check（reCAPTCHA Enterprise）
│       │   ├─ remoteConfig.ts       # Remote Config 動態配置
│       │   └─ index.ts              # 前端公開 barrel
│       │
│       └─ admin/                    # 後端 Server Actions（firebase-admin）
│           ├─ index.ts              # Admin App 初始化
│           ├─ auth/
│           │   └─ index.ts          # 後端認證邏輯（token 驗證、custom claims）
│           ├─ db/
│           │   ├─ batchWrite.ts     # 批次寫入（降低 Firestore 寫入成本）
│           │   └─ cacheLayer.ts     # 快取層（memory / 可升級 Redis via ICachePort）
│           ├─ storage/
│           │   └─ index.ts          # 後端檔案處理（signed URL、刪除、複製）
│           └─ utils/
│               └─ index.ts          # 公共工具函數
```

> **Note:** `functions/` has been renamed to `admin/` to avoid confusion with Firebase Cloud Functions (which live at the repo root in `functions/`). All imports should use `@/infrastructure/firebase/admin`.

### Dependency direction

```
src/shared/  →  src/infrastructure/firebase/  →  src/modules/
```

- `src/shared/` defines port interfaces (e.g. `ICachePort`, `IQueuePort`) that infrastructure adapters implement.
- Infrastructure adapters (`admin/`, `client/`, `upstash/`, `document-ai/`) depend on `src/shared/` for shared types but have **no dependency** on `src/modules/`.
- Domain Modules depend on both `src/shared/` and, indirectly, infrastructure through port interfaces.

---

## 2️⃣ 名稱映射表（含快取層與成本考量）

| 層級 | Firebase 服務 | 功能 | 對應位置 | 成本控制策略 |
|------|--------------|------|----------|------------|
| `client/` | `firebaseAuth` | Email/Password / 第三方登入 | `client/auth.ts` | 前端登入即可，避免頻繁驗證 API |
| `client/` | `firestore` | 即時讀取 / 查詢 | `client/firestore.ts` | 讀取可加快取，減少直接 DB 調用次數 |
| `client/` | `firebaseStorage` | 檔案上傳 / 下載 | `client/storage.ts` | 大檔案使用 resumable upload，避免重試成本 |
| `client/` | `cloudMessaging` | FCM / In-App Messaging | `client/messaging.ts` | 控制推播頻率，使用主題訂閱 |
| `client/` | `remoteConfig` | 動態配置讀取 | `client/remoteConfig.ts` | 降低更新頻率（預設 12h），批量拉取 |
| `admin/` | `firebase-admin` | 後端管理寫入 / 批次操作 | `admin/db/batchWrite.ts` | 批次寫入 + 快取層，降低每筆寫入成本 |
| `admin/` | `auth` | 後端認證操作 | `admin/auth/` | 高敏感操作集中後端處理 |
| `admin/` | `storage` | 後端檔案處理 | `admin/storage/` | 批量處理檔案或壓縮後再寫入 Storage |
| `admin/` | `cacheLayer` | 快取層（memory / Redis） | `admin/db/cacheLayer.ts` | 讀寫分離 + 彙整寫入降低 DB 次數 |
| `shared/` | `constants/types/interfaces` | 前後端共用契約、collection 名稱 | `src/shared/` | 前後端統一接口，避免重複查詢 |

---

## 3️⃣ 設計重點

### 讀寫分離

**前端（`client/`）：**
- 普通讀取、簡單寫入
- 使用快取層減少直接 Firestore 呼叫

**後端（`admin/`，在 Next.js Server Actions / Route Handlers 執行）：**
- 敏感寫入、批次寫入、聚合操作
- 快取層彙整後再批次寫入，降低成本

### 快取層設計（`admin/db/cacheLayer.ts`）

```typescript
// Cache-aside 讀取模式
const user = await cacheAside(
  cacheKey("users", uid),
  () => getAdminFirestore().collection("users").doc(uid).get(),
  5 * 60 * 1000, // TTL: 5 min
);

// 寫入後失效
await commitBatch([{ type: "update", ref: userRef, data: { name } }]);
await invalidateCache(cacheKey("users", uid));
```

升級路徑：將 `MemoryCacheStore` 替換為 `ICachePort` + `src/infrastructure/upstash/redis.ts` 以支援水平擴展。

### 批次寫入（`admin/db/batchWrite.ts`）

```typescript
const ops: WriteOperation[] = documents.map((doc) => ({
  type: "set",
  ref: db.collection("items").doc(doc.id),
  data: doc,
  merge: true,
}));
await commitBatch(ops); // 自動分片，每批最多 490 筆
```

### 成本控制

| 策略 | 說明 |
|------|------|
| 降低 Firestore 寫入次數 | 批次 + 快取層 |
| 減少前端頻繁訂閱 | 使用快取 + 定時更新 |
| 控制 Functions 執行次數 | 批量操作 + 事件觸發策略 |
| 優化 Storage 上傳 | 大檔案分段（resumable upload）/ 壓縮 |

---

## 4️⃣ 使用範例

### Client Component（Web SDK）

```typescript
import { getFirebaseAuth, getFirestoreDb } from "@/infrastructure/firebase/client";

// 取得 Auth 實例
const auth = getFirebaseAuth();

// 取得 Firestore 實例
const db = getFirestoreDb();
```

### Server Action（Admin SDK）

```typescript
"use server";
import { verifyIdToken }  from "@/infrastructure/firebase/admin/auth";
import { cacheAside }     from "@/infrastructure/firebase/admin/db/cacheLayer";
import { commitBatch }    from "@/infrastructure/firebase/admin/db/batchWrite";

export async function getUser(idToken: string) {
  const claims = await verifyIdToken(idToken);
  return cacheAside(`users:${claims.uid}`, () => fetchUserFromFirestore(claims.uid));
}
```

---

## 5️⃣ 環境變數

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | No | Overrides dev API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | No | Overrides dev auth domain |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | No | Realtime Database URL |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | No | Overrides project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | No | Overrides storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | No | Overrides sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | No | Overrides app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | No | Analytics measurement ID |
| `NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_KEY` | No | App Check reCAPTCHA key |
| `NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN` | No | App Check debug token |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | No | FCM Web Push VAPID key |
| `NEXT_PUBLIC_FIREBASE_REMOTE_CONFIG_FETCH_INTERVAL_MS` | No | Remote Config TTL (ms) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Prod | Base64-encoded service account JSON for Admin SDK |

---

> ⚠️ `FIREBASE_SERVICE_ACCOUNT_JSON` is server-only and must **never** be prefixed with `NEXT_PUBLIC_`.
> Client-side config values (`NEXT_PUBLIC_*`) are intentionally public — Firebase security is enforced via Security Rules and App Check.

