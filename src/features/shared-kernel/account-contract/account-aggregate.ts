import type { Timestamp } from '@/shared/ports';
import type { SkillGrant } from '../skill-tier';
import type { AccountType, OrganizationRole } from './account-identity';
import type { MemberReference, Team } from './organization-membership';

export interface ThemeConfig {
  primary: string;
  background: string;
  accent: string;
}

export interface Wallet {
  balance: number;
}

export interface ExpertiseBadge {
  id: string;
  name: string;
  icon?: string;
}

export interface Account {
  id: string;
  name: string;
  accountType: AccountType;
  email?: string;
  photoURL?: string;
  bio?: string;
  achievements?: string[];
  expertiseBadges?: ExpertiseBadge[];
  skillGrants?: SkillGrant[];
  wallet?: Wallet;
  description?: string;
  ownerId?: string;
  role?: OrganizationRole;
  theme?: ThemeConfig;
  members?: MemberReference[];
  memberIds?: string[];
  teams?: Team[];
  createdAt?: Timestamp;
}
