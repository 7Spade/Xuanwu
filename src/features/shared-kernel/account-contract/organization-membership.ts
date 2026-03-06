import type { Timestamp } from '@/shared/ports';
import type { SkillGrant } from '../skill-tier';
import type { InviteState, OrganizationRole, Presence } from './account-identity';

export interface MemberReference {
  id: string;
  name: string;
  email: string;
  role: OrganizationRole;
  presence: Presence;
  isExternal?: boolean;
  expiryDate?: Timestamp;
  skillGrants?: SkillGrant[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  type: 'internal' | 'external';
  memberIds: string[];
}

export interface PartnerInvite {
  id: string;
  email: string;
  teamId: string;
  role: OrganizationRole;
  inviteState: InviteState;
  invitedAt: Timestamp;
  protocol: string;
}
