# Frontend Firebase（前端）

本目錄代表「前端 Firebase 能力邊界」，僅提供 Web App 端可安全使用的功能。

## 規範

- 前端使用 Firebase Web SDK。
- 所有需要後端權限的操作，必須改由 Cloud Functions 提供 API。
- 前端不得實作或持有 Admin 等級能力。

## 版本來源

前端 Firebase 版本由根目錄 `package.json` 鎖定：

- `firebase`: `^11.9.1`

## 與後端分工

- 前端：驗證、UI 互動、一般可授權資料讀寫。
- 後端（必要時）：由 `Cloud Functions` 執行高權限與業務流程。

結論：前端與後端 Firebase 需分層；後端能力必須透過 Functions 對外提供。
