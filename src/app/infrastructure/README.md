# Infrastructure Layer - Technical Implementation

> **Layer**: 4 of 8 (Infrastructure Implementation)  
> **Framework Dependency**: ✅ Allowed (Angular, Firebase, external libs)  
> **Purpose**: Implement technical concerns (persistence, storage, authentication, adapters)

---

## 📋 Table of Contents

1. [Responsibilities](#responsibilities)
2. [Structure](#structure)
3. [Firebase Services](#firebase-services)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)
6. [Configuration](#configuration)

---

## 📋 Responsibilities

- **Firestore Operations**: Type-safe CRUD and real-time subscriptions
- **Repositories**: Concrete repository implementations
- **File Storage**: Upload/download operations via Firebase Storage
- **Authentication**: User authentication and management
- **Transactions**: Atomic operations and batch writes
- **External Adapters**: Third-party service integrations

## 🚫 What NOT to Put Here

- Business logic (→ domain layer)
- Use case orchestration (→ application layer)
- UI components (→ features layer)

---

## 📁 Structure

```
infrastructure/
├── persistence/
│   ├── firestore/
│   │   ├── firestore.adapter.ts      # Generic Firestore CRUD
│   │   ├── collection.service.ts     # Real-time subscriptions
│   │   ├── transaction.service.ts    # Atomic operations
│   │   └── index.ts
│   └── repositories/
│       ├── base.repository.ts        # Generic repository base
│       └── index.ts
└── adapters/
    └── firebase/
        ├── auth.adapter.ts           # Authentication
        ├── storage.adapter.ts        # File storage
        └── index.ts
```

---

## 🔥 Firebase Services

### Firestore Adapter

Generic wrapper for Firestore CRUD operations with type safety.

**Key Methods:**
- `getDocument<T>(collection, id)` - Get single document
- `getDocuments<T>(collection, ...constraints)` - Query documents
- `addDocument<T>(collection, data)` - Add new document
- `setDocument<T>(collection, id, data)` - Set/overwrite document
- `updateDocument<T>(collection, id, data)` - Update document
- `deleteDocument(collection, id)` - Delete document

### Collection Service

Real-time reactive streams for Firestore collections and documents.

**Key Methods:**
- `watchCollection<T>(collection, ...constraints)` - Subscribe to collection changes
- `watchDocument<T>(collection, id)` - Subscribe to document changes

### Transaction Service

Atomic operations and batch writes for maintaining data consistency.

**Key Methods:**
- `runTransaction<T>(updateFunction)` - Execute atomic transaction
- `batchWrite(batchFunction)` - Execute batch write operation

### Base Repository

Generic repository implementation following the Repository pattern.

**Key Methods:**
- `findById(id)`, `findAll()`, `findWhere()` - Query operations
- `create()`, `save()`, `update()`, `delete()` - CRUD operations
- `watch()`, `watchById()` - Real-time subscriptions

### Storage Adapter

File storage operations using Firebase Storage.

**Key Methods:**
- `uploadFile(path, file)` - Upload file and get URL
- `uploadFileWithProgress(path, file)` - Upload with progress tracking
- `getDownloadURL(path)` - Get download URL
- `deleteFile(path)` - Delete file

### Auth Adapter

User authentication and management via Firebase Auth.

**Key Methods:**
- `signIn()`, `signUp()`, `signOut()` - Authentication
- `getCurrentUser$()` - Real-time auth state stream
- `sendPasswordReset()` - Password reset
- `updateUserProfile()`, `updateUserEmail()` - Profile management

---

## 📖 Usage Examples

### 1. Create a Domain Repository

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseRepository } from './base.repository';
import { where } from '../firestore';

interface User {
  id?: string;
  email: string;
  name: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserRepositoryImpl extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  findByEmail(email: string): Observable<User[]> {
    return this.findWhere(where('email', '==', email));
  }
}
```

### 2. Real-time Data with Signals

```typescript
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CollectionService, where } from '../../../infrastructure';

@Component({
  selector: 'app-dashboard',
  template: `
    @for (order of orders(); track order.id) {
      <div>{{ order.name }}</div>
    }
  `
})
export class DashboardComponent {
  private readonly collectionService = inject(CollectionService);
  
  orders = toSignal(
    this.collectionService.watchCollection<Order>(
      'orders',
      where('status', '==', 'active')
    ),
    { initialValue: [] }
  );
}
```

### 3. File Upload with Progress

```typescript
import { Component, inject, signal } from '@angular/core';
import { StorageAdapter } from '../../../infrastructure';

@Component({
  selector: 'app-upload',
  template: `
    <input type="file" (change)="onFileSelected($event)" />
    @if (uploadProgress()) {
      <p>Progress: {{ uploadProgress() }}%</p>
    }
  `
})
export class UploadComponent {
  private readonly storage = inject(StorageAdapter);
  uploadProgress = signal<number>(0);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const path = `uploads/${Date.now()}_${file.name}`;
    const uploadTask = this.storage.uploadFileWithProgress(path, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.uploadProgress.set(progress);
      }
    );
  }
}
```

### 4. Atomic Transaction

```typescript
import { inject, Injectable } from '@angular/core';
import { TransactionService } from '../../../infrastructure';

@Injectable({ providedIn: 'root' })
export class ProcessPaymentUseCase {
  private readonly transactionService = inject(TransactionService);

  execute(userId: string, amount: number): Observable<void> {
    return this.transactionService.runTransaction(async (transaction) => {
      const userRef = this.transactionService.getDocumentRef('users', userId);
      const userDoc = await transaction.get(userRef);
      
      const currentBalance = userDoc.data()?.balance || 0;
      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }
      
      transaction.update(userRef, { balance: currentBalance - amount });
    });
  }
}
```

---

## ✅ Best Practices

### 1. Always Use Type Parameters

```typescript
// ✅ Good - Type-safe
this.firestoreAdapter.getDocument<User>('users', '123');

// ❌ Bad - No type safety
this.firestoreAdapter.getDocument('users', '123');
```

### 2. Extend BaseRepository for Domain Entities

```typescript
// ✅ Good - Domain-specific repository
@Injectable({ providedIn: 'root' })
export class UserRepositoryImpl extends BaseRepository<User> {
  constructor() {
    super('users');
  }
}
```

### 3. Use Signals for Real-time Data

```typescript
// ✅ Good - Signals with toSignal
users = toSignal(
  this.collectionService.watchCollection<User>('users'),
  { initialValue: [] }
);
```

### 4. Use Transactions for Related Updates

```typescript
// ✅ Good - Atomic transaction
this.transactionService.runTransaction(async (transaction) => {
  transaction.update(userRef, { balance: newBalance });
  transaction.set(orderRef, orderData);
});
```

### 5. Leverage Query Constraints

```typescript
// ✅ Good - Efficient querying
this.userRepository.findWhere(
  where('role', '==', 'admin'),
  orderBy('createdAt', 'desc'),
  limit(10)
);
```

---

## ⚙️ Configuration

### Firebase Config

Firebase is configured in `src/app/core/providers/firebase.config.ts`:

```typescript
export const firebaseConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
    provideAppCheck(...)
  ]
};
```

### App Check Setup

**Important:** Replace the placeholder reCAPTCHA site key:

```typescript
provideAppCheck(() => {
  const appCheck = initializeAppCheck(undefined as any, {
    provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'), // Replace
    isTokenAutoRefreshEnabled: true
  });
  return appCheck;
})
```

For development, use debug tokens:
1. Console: `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;`
2. Copy debug token from console
3. Add to Firebase Console → App Check → Debug tokens

---

## 🔗 Dependencies

- ✅ Can import: domain (interfaces), application (ports), Angular, Firebase
- ❌ Cannot import: features, shared (UI)

## 💡 Key Principle

**Implement interfaces defined in domain/application layers.**  
Infrastructure provides the "how", not the "what".

---

## 📚 Related Documentation

- [Project Architecture](../../../docs/PROJECT_ARCHITECTURE.md)
- [DDD Layer Boundaries](../../../docs/DDD_LAYER_BOUNDARIES.md)
- [Import Rules](../../../docs/IMPORT_RULES.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [AngularFire Documentation](https://github.com/angular/angularfire)

---

**Last Updated**: 2026-02-05  
**Maintainer**: Infrastructure Team
