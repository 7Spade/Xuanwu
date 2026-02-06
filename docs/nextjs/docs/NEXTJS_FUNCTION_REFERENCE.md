# Next.js Demo Project - Function Reference

> **Document Type**: Reference (Information-oriented)  
> **Target Audience**: Developers implementing OrgVerse features  
> **Purpose**: Complete catalog of functions, components, and hooks  
> **Version**: 1.0  
> **Project**: OrgVerse (Next.js Implementation)  
> **Last Updated**: 2026-02-05

## When to Use This

- 🔍 **Finding functions** - Locate specific implementations quickly
- 📝 **Understanding APIs** - See function signatures and purposes
- 🎯 **Code completion** - Reference for implementing similar features
- 🤖 **AI assistance** - Context for code generation

**Prerequisites**: TypeScript and React knowledge  
**Related Docs**: [Project Tree](./NEXTJS_PROJECT_TREE.md) (File structure), [Blueprint](./blueprint.md) (Architecture)

---

## 📋 Table of Contents

1. [Page Components](#page-components)
2. [Shared Components](#shared-components)
3. [UI Components](#ui-components)
4. [Firebase Hooks](#firebase-hooks)
5. [Custom Hooks](#custom-hooks)
6. [AI Flows](#ai-flows)
7. [Utilities](#utilities)
8. [State Management](#state-management)
9. [Types & Interfaces](#types--interfaces)

---

## Page Components

### Landing Page
**File**: `src/app/page.tsx`

```typescript
export default function LandingPage(): JSX.Element
```
- Root landing page component
- Displays welcome message and login link

### Login Page
**File**: `src/app/login/page.tsx`

```typescript
export default function LoginPage(): JSX.Element
```
- User authentication page
- Demo credentials: demo/12345

### Dashboard Home
**File**: `src/app/dashboard/page.tsx`

```typescript
export default function DashboardPage(): JSX.Element
```
- Dashboard home displaying:
  - Statistics cards
  - Recent organizations
  - Recent workspaces
  - Recent containers
  - Permission constellation

### Dashboard Layout
**File**: `src/app/dashboard/layout.tsx`

```typescript
export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}): JSX.Element
```
- Provides dashboard shell with:
  - Header
  - Sidebar
  - Main content area

### Organization Settings
**File**: `src/app/dashboard/organization/settings/page.tsx`

```typescript
export default function OrganizationSettingsPage(): JSX.Element
```
- Organization configuration interface

### Organization Members
**File**: `src/app/dashboard/organization/members/page.tsx`

```typescript
export default function OrganizationMembersPage(): JSX.Element
```
- Member management for organizations

### Organization Teams
**File**: `src/app/dashboard/organization/teams/page.tsx`

```typescript
export default function OrganizationTeamsPage(): JSX.Element
```
- Team listing and management

### Organization Team Detail
**File**: `src/app/dashboard/organization/teams/[id]/page.tsx`

```typescript
export default function TeamDetailPage({ 
  params 
}: { 
  params: { id: string } 
}): JSX.Element
```
- Individual team details and management

### Organization Partners
**File**: `src/app/dashboard/organization/partners/page.tsx`

```typescript
export default function PartnersPage(): JSX.Element
```
- External partner management

### Organization Partner Detail
**File**: `src/app/dashboard/organization/partners/[id]/page.tsx`

```typescript
export default function PartnerDetailPage({ 
  params 
}: { 
  params: { id: string } 
}): JSX.Element
```
- Individual partner details

### Workspaces List
**File**: `src/app/dashboard/workspaces/page.tsx`

```typescript
export default function WorkspacesPage(): JSX.Element
```
- Display all workspaces for current organization

### Workspace Detail
**File**: `src/app/dashboard/workspaces/[id]/page.tsx`

```typescript
export default function WorkspaceDetailPage({ 
  params 
}: { 
  params: { id: string } 
}): JSX.Element
```
- Workspace detail with tabs:
  - Tasks
  - Members
  - Files
  - Finance
  - QA
  - Daily
  - Acceptance
  - Capabilities
  - Dialogs
  - Issues

---

## Shared Components

### Dashboard Header
**File**: `src/components/dashboard/dashboard-header.tsx`

```typescript
export function DashboardHeader(): JSX.Element
```
- Top navigation bar
- Contains:
  - Global switcher (org/workspace)
  - User menu
  - Notifications

### Dashboard Sidebar
**File**: `src/components/dashboard/dashboard-sidebar.tsx`

```typescript
export function DashboardSidebar(): JSX.Element
```
- Left navigation sidebar
- Menu items:
  - Dashboard home
  - Organization
  - Workspaces
  - Teams
  - Settings

### Global Switcher
**File**: `src/components/dashboard/global-switcher.tsx`

```typescript
export function GlobalSwitcher(): JSX.Element
```
- Dropdown for switching between:
  - Organizations (dimensions)
  - Workspaces (logical spaces)

### Page Header
**File**: `src/components/dashboard/page-header.tsx`

```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  actions 
}: PageHeaderProps): JSX.Element
```
- Standardized page title component
- Optional description and action buttons

### UI Adapter
**File**: `src/components/dashboard/ui-adapter.tsx`

```typescript
export function UIAdapter(): JSX.Element
```
- AI-powered theme adapter
- Uses Genkit to detect organization context
- Applies HSL color scheme automatically

### Firebase Error Listener
**File**: `src/components/dashboard/firebase-error-listener.tsx`

```typescript
export function FirebaseErrorListener(): JSX.Element
```
- Global error handler for Firebase events
- Displays toast notifications on errors

### Organization Card
**File**: `src/components/organization/organization-card.tsx`

```typescript
interface OrganizationCardProps {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  onClick?: () => void;
}

export function OrganizationCard(props: OrganizationCardProps): JSX.Element
```
- Card component for displaying organization

### Workspace Card
**File**: `src/components/workspaces/workspace-card.tsx`

```typescript
interface WorkspaceCardProps {
  id: string;
  name: string;
  orgId: string;
  visibility: 'visible' | 'hidden';
  onClick?: () => void;
}

export function WorkspaceCard(props: WorkspaceCardProps): JSX.Element
```
- Card component for workspace display

### Workspace List Item
**File**: `src/components/workspaces/workspace-list-item.tsx`

```typescript
interface WorkspaceListItemProps {
  id: string;
  name: string;
  capabilities?: string[];
  onClick?: () => void;
}

export function WorkspaceListItem(props: WorkspaceListItemProps): JSX.Element
```
- List item for workspace in table/list view

### Stat Cards
**File**: `src/app/dashboard/_components/stat-cards.tsx`

```typescript
export function StatCards(): JSX.Element
```
- Dashboard statistics display
- Shows key metrics

### Recent Organizations
**File**: `src/app/dashboard/_components/recent-organizations.tsx`

```typescript
export function RecentOrganizations(): JSX.Element
```
- Display recently accessed organizations

### Recent Workspaces
**File**: `src/app/dashboard/_components/recent-workspaces.tsx`

```typescript
export function RecentWorkspaces(): JSX.Element
```
- Display recently accessed workspaces

### Recent Containers
**File**: `src/app/dashboard/_components/recent-containers.tsx`

```typescript
export function RecentContainers(): JSX.Element
```
- Display recent container activity

### Permission Constellation
**File**: `src/app/dashboard/_components/permission-constellation.tsx`

```typescript
export function PermissionConstellation(): JSX.Element
```
- Visual representation of permission relationships

### Create Workspace Dialog
**File**: `src/app/dashboard/workspaces/_components/create-workspace-dialog.tsx`

```typescript
interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog(props: CreateWorkspaceDialogProps): JSX.Element
```
- Modal dialog for creating new workspace

### Workspace Context
**File**: `src/app/dashboard/workspaces/[id]/workspace-context.tsx`

```typescript
interface WorkspaceContextValue {
  workspaceId: string;
  workspace?: Workspace;
  loading: boolean;
}

export const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ 
  workspaceId, 
  children 
}: { 
  workspaceId: string; 
  children: React.ReactNode 
}): JSX.Element

export function useWorkspace(): WorkspaceContextValue
```
- React context for workspace data
- Provides workspace info to child components

---

## UI Components

All components from `src/components/ui/` are ShadCN UI components. They follow the standard ShadCN API:

### Button
**File**: `src/components/ui/button.tsx`

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...)
```

### Card
**File**: `src/components/ui/card.tsx`

```typescript
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(...)
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(...)
export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(...)
export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(...)
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(...)
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(...)
```

### Dialog
**File**: `src/components/ui/dialog.tsx`

```typescript
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogPortal = DialogPrimitive.Portal
export const DialogClose = DialogPrimitive.Close
export const DialogOverlay = React.forwardRef<...>(...)
export const DialogContent = React.forwardRef<...>(...)
export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (...)
export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (...)
export const DialogTitle = React.forwardRef<...>(...)
export const DialogDescription = React.forwardRef<...>(...)
```

### Input
**File**: `src/components/ui/input.tsx`

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(...)
```

### Select
**File**: `src/components/ui/select.tsx`

```typescript
export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value
export const SelectTrigger = React.forwardRef<...>(...)
export const SelectScrollUpButton = React.forwardRef<...>(...)
export const SelectScrollDownButton = React.forwardRef<...>(...)
export const SelectContent = React.forwardRef<...>(...)
export const SelectLabel = React.forwardRef<...>(...)
export const SelectItem = React.forwardRef<...>(...)
export const SelectSeparator = React.forwardRef<...>(...)
```

_Note: Other UI components (Accordion, Alert, Avatar, Badge, Calendar, Carousel, Chart, Checkbox, Collapsible, Dropdown Menu, Form, Label, Menubar, Popover, Progress, Radio Group, Scroll Area, Separator, Sheet, Sidebar, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Toaster, Tooltip) follow similar ShadCN patterns._

---

## Firebase Hooks

### useUser
**File**: `src/firebase/auth/use-user.tsx`

```typescript
interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useUser(): UseUserReturn
```
- Hook for authentication state
- Provides user object and auth methods

### useCollection
**File**: `src/firebase/firestore/use-collection.tsx`

```typescript
interface UseCollectionOptions<T> {
  query?: QueryConstraint[];
  transform?: (data: DocumentData) => T;
}

interface UseCollectionReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export function useCollection<T = DocumentData>(
  collectionPath: string,
  options?: UseCollectionOptions<T>
): UseCollectionReturn<T>
```
- Real-time Firestore collection subscription
- Auto-updates on data changes

### useDoc
**File**: `src/firebase/firestore/use-doc.tsx`

```typescript
interface UseDocOptions<T> {
  transform?: (data: DocumentData) => T;
}

interface UseDocReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDoc<T = DocumentData>(
  docPath: string,
  options?: UseDocOptions<T>
): UseDocReturn<T>
```
- Real-time Firestore document subscription
- Auto-updates on document changes

---

## Custom Hooks

### useToast
**File**: `src/hooks/use-toast.ts`

```typescript
interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

interface UseToastReturn {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

export function useToast(): UseToastReturn
```
- Toast notification management
- Add/remove toast messages

### useMobile
**File**: `src/hooks/use-mobile.tsx`

```typescript
export function useMobile(): boolean
```
- Detect if viewport is mobile size
- Returns true if width < 768px

### useDimensionSync
**File**: `src/hooks/use-dimension-sync.ts`

```typescript
interface UseDimensionSyncReturn {
  currentOrgId: string | null;
  currentWorkspaceId: string | null;
  switchOrg: (orgId: string) => void;
  switchWorkspace: (workspaceId: string) => void;
}

export function useDimensionSync(): UseDimensionSyncReturn
```
- Synchronize organization/workspace context
- Manages dimension switching

---

## AI Flows

### Adapt UI Color to Org Context
**File**: `src/ai/flows/adapt-ui-color-to-org-context.ts`

```typescript
interface AdaptUIColorInput {
  orgId: string;
  orgName: string;
  orgDescription?: string;
}

interface AdaptUIColorOutput {
  primary: string;      // HSL color
  secondary: string;    // HSL color
  accent: string;       // HSL color
  background: string;   // HSL color
}

export const adaptUIColorToOrgContext = ai.defineFlow<
  AdaptUIColorInput,
  AdaptUIColorOutput
>(...)
```
- Genkit flow for theme generation
- Uses Gemini 2.5 Flash to analyze org context
- Returns HSL color scheme

---

## Utilities

### utils.ts
**File**: `src/lib/utils.ts`

```typescript
export function cn(...inputs: ClassValue[]): string
```
- Merges Tailwind classes with clsx
- Handles conditional classes

```typescript
export function formatDate(date: Date | string, format?: string): string
```
- Format dates for display
- Default format: "MMM dd, yyyy"

```typescript
export function truncate(text: string, maxLength: number): string
```
- Truncate long text with ellipsis

### placeholder-images.ts
**File**: `src/lib/placeholder-images.ts`

```typescript
export function getPlaceholderImage(category: string): string
```
- Get placeholder image URL by category
- Returns data from placeholder-images.json

---

## State Management

### Global Store
**File**: `src/lib/store.ts`

```typescript
interface AppState {
  currentOrgId: string | null;
  currentWorkspaceId: string | null;
  setCurrentOrg: (orgId: string) => void;
  setCurrentWorkspace: (workspaceId: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentOrgId: null,
      currentWorkspaceId: null,
      setCurrentOrg: (orgId) => set({ currentOrgId: orgId }),
      setCurrentWorkspace: (workspaceId) => set({ currentWorkspaceId: workspaceId }),
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-storage',
    }
  )
)
```
- Zustand store with persistence
- Manages global app state

---

## Types & Interfaces

### Domain Types
**File**: `src/types/domain.ts`

```typescript
export interface Organization {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Guest';
  theme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  orgId: string;
  visibility: 'visible' | 'hidden';
  protocol?: string;
  scope?: string[];
  capabilities?: Capability[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Capability {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
}

export interface PartnerInvite {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedAt: Date;
  protocol?: string;
}

export interface Member {
  id: string;
  userId: string;
  orgId?: string;
  workspaceId?: string;
  role: string;
  joinedAt: Date;
}
```

### Firebase Config
**File**: `src/firebase/config.ts`

```typescript
export const firebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const app: FirebaseApp
export const auth: Auth
export const db: Firestore
export const storage: FirebaseStorage
```

---

## 📖 Usage Examples

### Fetching Organizations

```typescript
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Organization } from '@/types/domain';

function MyComponent() {
  const { data: organizations, loading, error } = useCollection<Organization>(
    'organizations',
    {
      query: [where('role', '==', 'Member')],
      transform: (doc) => ({
        id: doc.id,
        ...doc,
        createdAt: doc.createdAt?.toDate(),
        updatedAt: doc.updatedAt?.toDate(),
      }),
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {organizations.map((org) => (
        <OrganizationCard key={org.id} {...org} />
      ))}
    </div>
  );
}
```

### Using Global Switcher

```typescript
import { useDimensionSync } from '@/hooks/use-dimension-sync';

function MyComponent() {
  const { currentOrgId, switchOrg } = useDimensionSync();

  return (
    <select 
      value={currentOrgId || ''} 
      onChange={(e) => switchOrg(e.target.value)}
    >
      {/* options */}
    </select>
  );
}
```

### AI Theme Adaptation

```typescript
import { ai } from '@/ai/genkit';
import { adaptUIColorToOrgContext } from '@/ai/flows/adapt-ui-color-to-org-context';

async function applyOrgTheme(orgId: string, orgName: string) {
  const colors = await ai.runFlow(adaptUIColorToOrgContext, {
    orgId,
    orgName,
    orgDescription: 'Tech startup focused on AI',
  });

  // Apply to CSS variables
  document.documentElement.style.setProperty('--primary', colors.primary);
  document.documentElement.style.setProperty('--secondary', colors.secondary);
}
```

---

## 📖 Related Documentation

- [Project Tree](./NEXTJS_PROJECT_TREE.md) - Complete file structure
- [Blueprint](./blueprint.md) - Architecture overview
- [Backend Schema](./backend.json) - Firestore data models

---

**Version History**:
- v1.0 (2026-02-05): Initial function reference documentation
