import { Injectable, signal, computed } from '@angular/core';
import type { User, Organization, Workspace } from '../../domain';

/**
 * Application State Service
 *
 * Manages global application state using Angular Signals.
 * This service follows the private writable + public readonly pattern
 * for reactive state management.
 *
 * @remarks
 * - Uses signals for reactive state management
 * - Exposes readonly signals to prevent external mutations
 * - Provides computed signals for derived state
 * - Follows Angular 21 best practices (inject(), signals, OnPush compatible)
 *
 * State Management:
 * - User authentication state
 * - Organizations list and active organization
 * - Workspaces list filtered by active organization
 *
 * @example
 * ```typescript
 * @Component({...})
 * export class MyComponent {
 *   private appState = inject(AppStateService);
 *
 *   // Read state
 *   user = this.appState.user;
 *   isAuth = this.appState.isAuthenticated;
 *
 *   // Mutate state
 *   login(user: User) {
 *     this.appState.setUser(user);
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  //
  // ============================================================
  // Private Writable Signals (Internal State)
  // ============================================================
  //

  /**
   * Current authenticated user
   * @private
   */
  private readonly _user = signal<User | null>(null);

  /**
   * All organizations the user has access to
   * @private
   */
  private readonly _organizations = signal<Organization[]>([]);

  /**
   * ID of the currently active organization
   * @private
   */
  private readonly _activeOrgId = signal<string | null>(null);

  /**
   * All workspaces the user has access to
   * @private
   */
  private readonly _workspaces = signal<Workspace[]>([]);

  //
  // ============================================================
  // Public Readonly Signals (External API)
  // ============================================================
  //

  /**
   * Current authenticated user (readonly)
   *
   * @returns User object if authenticated, null otherwise
   */
  readonly user = this._user.asReadonly();

  /**
   * All organizations the user has access to (readonly)
   *
   * @returns Array of organizations
   */
  readonly organizations = this._organizations.asReadonly();

  /**
   * ID of the currently active organization (readonly)
   *
   * @returns Organization ID if one is active, null otherwise
   */
  readonly activeOrgId = this._activeOrgId.asReadonly();

  /**
   * All workspaces the user has access to (readonly)
   *
   * @returns Array of workspaces
   */
  readonly workspaces = this._workspaces.asReadonly();

  //
  // ============================================================
  // Computed Signals (Derived State)
  // ============================================================
  //

  /**
   * Whether a user is currently authenticated
   *
   * @returns True if user is not null, false otherwise
   */
  readonly isAuthenticated = computed(() => this._user() !== null);

  /**
   * The currently active organization object
   *
   * @returns Organization object if an active org ID is set and found,
   *          null otherwise
   */
  readonly activeOrg = computed(() => {
    const id = this._activeOrgId();
    if (!id) {
      return null;
    }
    return this._organizations().find(org => org.id === id) ?? null;
  });

  /**
   * Workspaces belonging to the currently active organization
   *
   * @returns Array of workspaces filtered by active org ID,
   *          empty array if no active org
   */
  readonly activeOrgWorkspaces = computed(() => {
    const orgId = this._activeOrgId();
    if (!orgId) {
      return [];
    }
    return this._workspaces().filter(ws => ws.orgId === orgId);
  });

  //
  // ============================================================
  // Mutation Methods
  // ============================================================
  //

  /**
   * Set the current authenticated user
   *
   * @param user - User object or null to clear
   *
   * @example
   * ```typescript
   * // Login
   * appState.setUser(userData);
   *
   * // Logout
   * appState.setUser(null);
   * ```
   */
  setUser(user: User | null): void {
    this._user.set(user);
  }

  /**
   * Set the list of organizations
   *
   * @param organizations - Array of organizations
   *
   * @example
   * ```typescript
   * appState.setOrganizations([org1, org2, org3]);
   * ```
   */
  setOrganizations(organizations: Organization[]): void {
    this._organizations.set(organizations);
  }

  /**
   * Set the active organization ID
   *
   * @param id - Organization ID or null to clear
   *
   * @example
   * ```typescript
   * // Activate organization
   * appState.setActiveOrgId('org123');
   *
   * // Clear active organization
   * appState.setActiveOrgId(null);
   * ```
   */
  setActiveOrgId(id: string | null): void {
    this._activeOrgId.set(id);
  }

  /**
   * Set the list of workspaces
   *
   * @param workspaces - Array of workspaces
   *
   * @example
   * ```typescript
   * appState.setWorkspaces([ws1, ws2, ws3]);
   * ```
   */
  setWorkspaces(workspaces: Workspace[]): void {
    this._workspaces.set(workspaces);
  }
}
