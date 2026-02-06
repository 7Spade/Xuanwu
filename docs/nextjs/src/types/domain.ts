export type UserRole = 'Owner' | 'Admin' | 'Member' | 'Guest';
export type WorkspaceStatus = 'preparatory' | 'active' | 'stopped';

/**
 * 維度主題配置 (Dimension Theme)
 */
export interface ThemeConfig {
  primary: string;
  background: string;
  accent: string;
}

/**
 * 成員身分參考 (Member Reference)
 */
export interface MemberReference {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'away' | 'offline';
  isExternal?: boolean;
  group?: string; 
  expiryDate?: string; 
  accessProtocol?: 'Deep Isolation' | 'Standard Bridge' | 'Full Collaborative';
}

/**
 * 第一層：維度 (Dimension / Organization)
 */
export interface Organization {
  id: string;
  name: string;
  description: string; 
  isExternal?: boolean;
  role: UserRole;
  theme?: ThemeConfig;
  members: MemberReference[];
  teams: Team[];
  partnerGroups: PartnerGroup[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  memberIds: string[]; 
}

export interface PartnerGroup {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
}

/**
 * 原子能力規範
 */
export interface CapabilitySpec {
  id: string;
  name: string;
  type: 'ui' | 'api' | 'data';
  status: 'stable' | 'beta';
  description: string;
}

export interface Capability extends CapabilitySpec {
  config?: object;
}

/**
 * 空間節點 (Workspace)
 */
export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  status: WorkspaceStatus;
  visibility: 'visible' | 'hidden'; 
  scope: string[];
  protocol: string;
  capabilities: Capability[]; 
  members: MemberReference[]; 
  teamIds: string[]; 
  partnerGroupIds: string[]; 
}

export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * 動態日誌 (Daily Log) - 用戶手動紀錄
 */
export interface DailyLog {
  id: string;
  content: string;
  author: string;
  timestamp: any;
  orgId: string;
  workspaceId?: string;
  workspaceName?: string;
}

/**
 * 脈動日誌 (Pulse Log) - 系統自動事件
 */
export interface PulseLog {
  id: string;
  orgId: string;
  workspaceId?: string; 
  timestamp: any;
  actor: string;
  action: string;
  target: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  read: boolean;
  timestamp: number;
}
