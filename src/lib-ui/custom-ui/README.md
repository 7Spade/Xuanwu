# src/shadcn-ui/custom-ui

以 shadcn/ui 組件為基礎自訂的複合組件。組件僅含 UI 邏輯，不包含業務邏輯或 Firestore 呼叫。

## Files

| File | Exports | Purpose |
|------|---------|---------|
| `language-switcher.tsx` | `LanguageSwitcher` | 多語系切換下拉選單 |
| `mode-toggle.tsx` | `ModeToggle` | Light / Dark / System 主題切換 |
| `page-header.tsx` | `PageHeader` | 頁面標題列（title / description / actions） |
| `parallel-slot-header-loading.tsx` | `ParallelSlotHeaderLoading` | 平行路由 Header slot 統一 loading 骨架 |
| `global-command-palette.tsx` | `GlobalCommandPalette` | 全域命令面板（快捷鍵、搜尋、動作觸發） |
| `status-progress.tsx` | `StatusProgress` | 帶標籤的進度條封裝 |
| `inline-spinner.tsx` | `InlineSpinner` | 行內載入指示器 |
| `nexus-alert-dialog.tsx` | `NexusAlertDialog` | 全域確認/危險操作對話框 |
| `nexus-dialog-shell.tsx` | `NexusDialogShell` | 統一標題/內容/操作區的 Dialog 框架 |
| `nexus-tooltip.tsx` | `NexusTooltip` | 預設延遲與邊框光學的 Tooltip 包裝 |
| `nexus-toaster.tsx` | `NexusToaster` | 全域通知容器（Sonner） |
| `nexus-typography.tsx` | `NexusTitle`, `NexusLead`, `NexusBody`, `NexusMuted` | 文字階層預設 |
| `nexus-separator.tsx` | `NexusSeparator` | 柔和分隔線預設 |
| `nexus-breadcrumb.tsx` | `NexusBreadcrumb` | 路徑導覽組件封裝 |
| `nexus-accordion.tsx` | `NexusAccordion` | FAQ/說明區折疊面板封裝 |
| `nexus-nav-menu.tsx` | `NexusNavMenu` | Navigation Menu 群組化導覽封裝 |
| `nexus-skeleton-block.tsx` | `NexusSkeletonBlock` | 全域 Skeleton 區塊模板 |
| `avatar-badge.tsx` | `AvatarBadge` | Avatar + Badge 身份顯示元件 |
| `media-carousel.tsx` | `MediaCarousel` | 圖片輪播（Carousel + AspectRatio） |
| `index.ts` | `*` | custom-ui 公開 API 匯出入口 |

## Usage

```ts
import { LanguageSwitcher } from "@/shadcn-ui/custom-ui/language-switcher"
import { ModeToggle } from "@/shadcn-ui/custom-ui/mode-toggle"
import { PageHeader } from "@/shadcn-ui/custom-ui/page-header"

// 或使用 barrel 匯入
import { GlobalCommandPalette, NexusToaster } from "@/shadcn-ui/custom-ui"
```

## Notes

- custom-ui 元件只負責 UI 組合，不直接耦合 feature business logic。
- 所有可視文字需透過 i18n key 注入（禁止硬編碼）。
