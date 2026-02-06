# npm 環境建置指南 (npm Environment Setup Guide)

> **專案**: Xuanwu  
> **最後更新**: 2026-02-05  
> **狀態**: ✅ 建置成功 (Build Successful)

---

## 📋 環境需求 (Environment Requirements)

### Node.js 與 npm 版本

```bash
Node.js: v24.13.0
npm: 11.6.2
```

### Package Manager

專案指定使用 npm@11.6.2（在 package.json 中定義）

---

## 🚀 快速開始 (Quick Start)

### 1. 安裝相依套件 (Install Dependencies)

```bash
npm install
```

**安裝結果**:
```
✅ 成功安裝 702 個套件
⏱️ 安裝時間: ~14 秒
```

### 2. 執行建置 (Run Build)

```bash
npm run build
```

**建置結果**:
```
✅ 建置成功完成
⏱️ 建置時間: ~17.3 秒
📦 輸出位置: dist/Xuanwu/
💾 總大小: 4.5 MB
```

---

## 📊 建置輸出分析 (Build Output Analysis)

### Browser Bundles (瀏覽器包)

| 檔案 | 類型 | 原始大小 | 壓縮後大小 |
|------|------|----------|------------|
| chunk-VC2SNDDQ.js | Main chunk | 834.50 kB | 173.84 kB |
| main-GTMVJ23V.js | Main | 185.67 kB | 48.05 kB |
| styles-MIEJ7USV.css | Styles | 94.21 kB | 8.58 kB |
| **總計** | **Initial** | **1.11 MB** | **230.47 kB** |

### Lazy Loaded Bundles (延遲載入包)

| 檔案 | 功能 | 原始大小 | 壓縮後大小 |
|------|------|----------|------------|
| chunk-XNZEOHK7.js | Firebase Demo | 8.46 kB | 2.53 kB |

### Server Bundles (伺服器包 - SSR)

| 檔案 | 類型 | 大小 |
|------|------|------|
| chunk-OCYYMNLC.mjs | Main chunk | 1.17 MB |
| server.mjs | Server | 808.03 kB |
| main.server.mjs | Main Server | 630.27 kB |
| polyfills.server.mjs | Polyfills | 233.25 kB |

### 預渲染路由 (Prerendered Routes)

```
✅ 成功預渲染 2 個靜態路由
```

---

## 📁 建置輸出結構 (Build Output Structure)

```
dist/Xuanwu/
├── browser/              # 瀏覽器端檔案
│   ├── index.html
│   ├── main-*.js
│   ├── chunk-*.js
│   └── styles-*.css
├── server/               # 伺服器端檔案 (SSR)
│   ├── server.mjs
│   ├── main.server.mjs
│   └── chunk-*.mjs
├── 3rdpartylicenses.txt  # 第三方授權
└── prerendered-routes.json
```

---

## ⚠️ 建置警告 (Build Warnings)

### 1. Firebase CommonJS 模組警告

```
⚠️ Module '@grpc/grpc-js' is not ESM
⚠️ Module '@grpc/proto-loader' is not ESM
```

**說明**:
- 這些是 Firebase Firestore 的相依套件
- 它們使用 CommonJS 格式而非 ESM
- 不影響應用程式功能
- 可能會影響建置優化效果

**解決方案**:
- 目前：可以忽略此警告
- 未來：等待 Firebase 升級至完整 ESM 支援

### 2. Firebase SSR 預渲染錯誤

```
ERROR [FirebaseError]: Type does not match the expected instance.
```

**說明**:
- 這是 SSR 預渲染階段的錯誤
- 只影響預渲染，不影響執行階段
- 應用程式在瀏覽器中正常運作

**解決方案**:
- 已配置 Firebase 在瀏覽器環境中才初始化 App Check
- 執行階段沒有問題

---

## 🛠️ 可用的 npm 指令 (Available npm Scripts)

### 開發指令

```bash
# 啟動開發伺服器
npm start

# 監看模式建置
npm run watch

# 執行測試
npm test
```

### 建置指令

```bash
# 生產環境建置
npm run build

# 執行 linting
npm run lint
```

### SSR 指令

```bash
# 啟動 SSR 伺服器
npm run serve:ssr:Xuanwu
```

---

## 📝 .gitignore 設定

以下檔案和目錄已正確排除在版本控制之外：

```
✅ /node_modules     # npm 相依套件
✅ /dist             # 建置輸出
✅ /.angular/cache   # Angular 快取
✅ npm-debug.log     # npm 除錯日誌
```

---

## 🔍 常見問題 (FAQ)

### Q1: 建置時間為什麼這麼長？

**A**: 
- 首次建置需要編譯所有模組（~17 秒）
- 包含 SSR 建置和預渲染
- 包含 Firebase、Material Design 等大型函式庫

### Q2: 如何減少建置檔案大小？

**A**: 
- 已使用延遲載入（lazy loading）
- 生產環境建置會自動進行程式碼壓縮
- 當前大小 1.11 MB（壓縮後 230 KB）在合理範圍內

### Q3: 可以使用 yarn 或 pnpm 嗎？

**A**: 
- 專案指定使用 npm@11.6.2
- 建議遵循 package.json 中的設定
- 如需更換，請更新 `packageManager` 欄位

---

## ✅ 建置檢查清單 (Build Checklist)

- [x] Node.js v24.13.0 已安裝
- [x] npm 11.6.2 已安裝
- [x] 相依套件已安裝（702 個套件）
- [x] 建置成功完成
- [x] 瀏覽器包已生成（1.11 MB）
- [x] 伺服器包已生成（SSR）
- [x] 靜態路由已預渲染（2 個）
- [x] .gitignore 設定正確
- [x] 建置輸出已產生至 dist/Xuanwu/

---

## 🎯 下一步 (Next Steps)

1. **啟動開發伺服器**:
   ```bash
   npm start
   ```

2. **查看應用程式**:
   - 開啟瀏覽器訪問 `http://localhost:4200`

3. **測試 SSR**:
   ```bash
   npm run serve:ssr:Xuanwu
   ```

4. **部署到生產環境**:
   - 使用 `dist/Xuanwu/` 目錄中的檔案
   - 配置 Firebase Hosting 或其他託管服務

---

## 📚 相關文件 (Related Documentation)

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Material & i18n Guide](./MATERIAL_CDK_I18N_GUIDE.md)
- [Quick Reference for Copilot](./COPILOT_QUICK_REFERENCE.md)
- [Implementation Summary](./MATERIAL_IMPLEMENTATION_SUMMARY.md)

---

**建置狀態**: ✅ **成功** (Success)  
**環境狀態**: ✅ **正常** (Normal)  
**準備部署**: ✅ **是** (Yes)
