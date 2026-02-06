import { describe, it, expect, beforeEach } from 'vitest';
import { AppStateService } from './app-state.service';
import type { User, Organization, Workspace } from '../../domain';

describe('AppStateService', () => {
  let service: AppStateService;

  beforeEach(() => {
    service = new AppStateService();
  });

  //
  // ============================================================
  // Service Creation
  // ============================================================
  //

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null user', () => {
    expect(service.user()).toBeNull();
  });

  it('should initialize with empty organizations', () => {
    expect(service.organizations()).toEqual([]);
  });

  it('should initialize with null active org ID', () => {
    expect(service.activeOrgId()).toBeNull();
  });

  it('should initialize with empty workspaces', () => {
    expect(service.workspaces()).toEqual([]);
  });

  //
  // ============================================================
  // State Mutations
  // ============================================================
  //

  describe('setUser', () => {
    it('should update user signal', () => {
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        createdAt: new Date()
      };

      service.setUser(mockUser);

      expect(service.user()).toEqual(mockUser);
    });

    it('should allow setting user to null', () => {
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        createdAt: new Date()
      };

      service.setUser(mockUser);
      expect(service.user()).toEqual(mockUser);

      service.setUser(null);
      expect(service.user()).toBeNull();
    });
  });

  describe('setOrganizations', () => {
    it('should update organizations signal', () => {
      const mockOrgs: Organization[] = [
        {
          id: 'org1',
          name: 'Organization 1',
          description: 'Test Org 1',
          ownerId: 'user123',
          memberIds: ['user123'],
          adminIds: ['user123'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'org2',
          name: 'Organization 2',
          description: 'Test Org 2',
          ownerId: 'user456',
          memberIds: ['user123', 'user456'],
          adminIds: ['user456'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      service.setOrganizations(mockOrgs);

      expect(service.organizations()).toEqual(mockOrgs);
      expect(service.organizations().length).toBe(2);
    });

    it('should allow setting empty organizations array', () => {
      const mockOrgs: Organization[] = [
        {
          id: 'org1',
          name: 'Organization 1',
          description: 'Test Org 1',
          ownerId: 'user123',
          memberIds: ['user123'],
          adminIds: ['user123'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      service.setOrganizations(mockOrgs);
      expect(service.organizations().length).toBe(1);

      service.setOrganizations([]);
      expect(service.organizations()).toEqual([]);
    });
  });

  describe('setActiveOrgId', () => {
    it('should update activeOrgId signal', () => {
      service.setActiveOrgId('org123');

      expect(service.activeOrgId()).toBe('org123');
    });

    it('should allow setting activeOrgId to null', () => {
      service.setActiveOrgId('org123');
      expect(service.activeOrgId()).toBe('org123');

      service.setActiveOrgId(null);
      expect(service.activeOrgId()).toBeNull();
    });
  });

  describe('setWorkspaces', () => {
    it('should update workspaces signal', () => {
      const mockWorkspaces: Workspace[] = [
        {
          id: 'ws1',
          name: 'Workspace 1',
          description: 'Test WS 1',
          orgId: 'org1',
          memberIds: ['user123'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'ws2',
          name: 'Workspace 2',
          description: 'Test WS 2',
          orgId: 'org1',
          memberIds: ['user123', 'user456'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      service.setWorkspaces(mockWorkspaces);

      expect(service.workspaces()).toEqual(mockWorkspaces);
      expect(service.workspaces().length).toBe(2);
    });

    it('should allow setting empty workspaces array', () => {
      const mockWorkspaces: Workspace[] = [
        {
          id: 'ws1',
          name: 'Workspace 1',
          description: 'Test WS 1',
          orgId: 'org1',
          memberIds: ['user123'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      service.setWorkspaces(mockWorkspaces);
      expect(service.workspaces().length).toBe(1);

      service.setWorkspaces([]);
      expect(service.workspaces()).toEqual([]);
    });
  });

  //
  // ============================================================
  // Computed Signals
  // ============================================================
  //

  describe('isAuthenticated', () => {
    it('should be false when user is null', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should be true when user exists', () => {
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        createdAt: new Date()
      };

      service.setUser(mockUser);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should update reactively when user changes', () => {
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        createdAt: new Date()
      };

      expect(service.isAuthenticated()).toBe(false);

      service.setUser(mockUser);
      expect(service.isAuthenticated()).toBe(true);

      service.setUser(null);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('activeOrg', () => {
    const mockOrgs: Organization[] = [
      {
        id: 'org1',
        name: 'Organization 1',
        description: 'Test Org 1',
        ownerId: 'user123',
        memberIds: ['user123'],
        adminIds: ['user123'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'org2',
        name: 'Organization 2',
        description: 'Test Org 2',
        ownerId: 'user456',
        memberIds: ['user123', 'user456'],
        adminIds: ['user456'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    it('should return null when no active org ID is set', () => {
      service.setOrganizations(mockOrgs);

      expect(service.activeOrg()).toBeNull();
    });

    it('should return null when active org ID is set but no organizations', () => {
      service.setActiveOrgId('org1');

      expect(service.activeOrg()).toBeNull();
    });

    it('should return matching organization when ID is set', () => {
      service.setOrganizations(mockOrgs);
      service.setActiveOrgId('org1');

      expect(service.activeOrg()).toEqual(mockOrgs[0]);
    });

    it('should return null when active org ID does not match any organization', () => {
      service.setOrganizations(mockOrgs);
      service.setActiveOrgId('nonexistent');

      expect(service.activeOrg()).toBeNull();
    });

    it('should update reactively when active org ID changes', () => {
      service.setOrganizations(mockOrgs);

      service.setActiveOrgId('org1');
      expect(service.activeOrg()).toEqual(mockOrgs[0]);

      service.setActiveOrgId('org2');
      expect(service.activeOrg()).toEqual(mockOrgs[1]);

      service.setActiveOrgId(null);
      expect(service.activeOrg()).toBeNull();
    });

    it('should update reactively when organizations change', () => {
      service.setActiveOrgId('org1');
      expect(service.activeOrg()).toBeNull();

      service.setOrganizations(mockOrgs);
      expect(service.activeOrg()).toEqual(mockOrgs[0]);
    });
  });

  describe('activeOrgWorkspaces', () => {
    const mockWorkspaces: Workspace[] = [
      {
        id: 'ws1',
        name: 'Workspace 1',
        description: 'Org1 WS 1',
        orgId: 'org1',
        memberIds: ['user123'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ws2',
        name: 'Workspace 2',
        description: 'Org1 WS 2',
        orgId: 'org1',
        memberIds: ['user123'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ws3',
        name: 'Workspace 3',
        description: 'Org2 WS 1',
        orgId: 'org2',
        memberIds: ['user456'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    it('should return empty array when no active org ID is set', () => {
      service.setWorkspaces(mockWorkspaces);

      expect(service.activeOrgWorkspaces()).toEqual([]);
    });

    it('should return empty array when active org ID is set but no workspaces', () => {
      service.setActiveOrgId('org1');

      expect(service.activeOrgWorkspaces()).toEqual([]);
    });

    it('should filter workspaces by active org ID', () => {
      service.setWorkspaces(mockWorkspaces);
      service.setActiveOrgId('org1');

      const result = service.activeOrgWorkspaces();
      expect(result.length).toBe(2);
      expect(result).toEqual([mockWorkspaces[0], mockWorkspaces[1]]);
    });

    it('should return different workspaces when active org changes', () => {
      service.setWorkspaces(mockWorkspaces);

      service.setActiveOrgId('org1');
      expect(service.activeOrgWorkspaces().length).toBe(2);

      service.setActiveOrgId('org2');
      const result = service.activeOrgWorkspaces();
      expect(result.length).toBe(1);
      expect(result).toEqual([mockWorkspaces[2]]);
    });

    it('should return empty array when active org ID does not match any workspace', () => {
      service.setWorkspaces(mockWorkspaces);
      service.setActiveOrgId('nonexistent');

      expect(service.activeOrgWorkspaces()).toEqual([]);
    });

    it('should update reactively when workspaces change', () => {
      service.setActiveOrgId('org1');
      expect(service.activeOrgWorkspaces()).toEqual([]);

      service.setWorkspaces(mockWorkspaces);
      expect(service.activeOrgWorkspaces().length).toBe(2);
    });
  });
});
