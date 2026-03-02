放置運行時組合與平台啟動代碼（Providers、服務組件）。
只允許向下依賴；向上 import 為架構違規。

app-runtime is the runtime wiring layer.
It initializes providers and connects config, shared, and infrastructure.
No business logic or feature code is allowed here.
