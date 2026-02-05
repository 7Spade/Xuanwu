erDiagram
    %% 核心身份與權限
    USER {
        string id PK
        string email
        string name
        string current_context_id "紀錄上次停留的 Scope"
    }

    ORGANIZATION {
        string id PK
        string name
        string slug
        string owner_user_id FK
    }

    %% 關聯表：用戶與組織的關係
    MEMBERSHIP {
        string user_id FK
        string org_id FK
        string role "Admin, Member, Viewer"
    }

    %% 核心邏輯容器 (Scope 為多型關聯)
    LOGICAL_CONTAINER {
        string id PK
        string owner_type "User or Organization"
        string owner_id "User.id or Org.id"
        string name
        string icon
        json settings
    }

    %% 可堆疊功能 (Stackable Features)
    FEATURE_STACK {
        string id PK
        string container_id FK
        string type "Kanban, Wiki, Calendar, CI/CD..."
        int sort_order
        json config_data
    }

    %% 關係定義
    USER ||--o{ MEMBERSHIP : joins
    ORGANIZATION ||--o{ MEMBERSHIP : has
    USER ||--o{ ORGANIZATION : owns

    USER ||--o{ LOGICAL_CONTAINER : "owns (Personal Scope)"
    ORGANIZATION ||--o{ LOGICAL_CONTAINER : "owns (Org Scope)"

    LOGICAL_CONTAINER ||--o{ FEATURE_STACK : "contains"