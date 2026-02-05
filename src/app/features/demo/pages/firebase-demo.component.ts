/**
 * Firebase Infrastructure Demo Component
 * 
 * This component demonstrates the usage of Firebase infrastructure services:
 * - Firestore adapter for data operations
 * - Collection service for real-time subscriptions
 * - Storage adapter for file uploads
 * - Auth adapter for authentication
 * 
 * @layer Features - Demo
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { 
  FirestoreAdapter,
  CollectionService,
  orderBy,
  limit
} from '../../../infrastructure';

interface DemoItem {
  id?: string;
  title: string;
  description: string;
  createdAt: number;
}

@Component({
  selector: 'app-firebase-demo',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-container">
      <h1>🔥 Firebase Infrastructure Demo</h1>
      <p class="subtitle">Demonstrating Firestore, Storage, and Auth integration</p>
      
      <!-- Firestore Demo -->
      <section class="firestore-section">
        <h2>📊 Firestore Operations</h2>
        
        <div class="actions">
          <input #titleInput type="text" placeholder="Title" />
          <input #descInput type="text" placeholder="Description" />
          <button (click)="addItem(titleInput.value, descInput.value)">
            Add Item
          </button>
        </div>

        <h3>Real-time Items ({{ items().length }})</h3>
        @for (item of items(); track item.id) {
          <div class="item">
            <div>
              <strong>{{ item.title }}</strong><br>
              <small>{{ item.description }}</small>
            </div>
            <button (click)="deleteItem(item.id!)">Delete</button>
          </div>
        } @empty {
          <p class="empty">No items yet. Add one above to test real-time sync!</p>
        }
      </section>

      <!-- Status Messages -->
      @if (statusMessage()) {
        <div class="status" [class.error]="isError()">
          {{ statusMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
    }

    h1 {
      color: #333;
      border-bottom: 3px solid #4285f4;
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #666;
      margin-bottom: 2rem;
    }

    section {
      margin: 2rem 0;
      padding: 1.5rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    h2 {
      color: #555;
      margin-top: 0;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
    }

    button {
      padding: 0.75rem 1.5rem;
      background: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      white-space: nowrap;
    }

    button:hover {
      background: #357ae8;
    }

    .item {
      padding: 1rem;
      margin: 0.75rem 0;
      background: white;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .item button {
      background: #dc3545;
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
    }

    .item button:hover {
      background: #c82333;
    }

    .empty {
      text-align: center;
      padding: 2rem;
      color: #999;
      font-style: italic;
    }

    .status {
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      animation: slideIn 0.3s ease;
    }

    .status.error {
      background: #f8d7da;
      color: #721c24;
      border-color: #f5c6cb;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class FirebaseDemoComponent {
  private readonly firestoreAdapter = inject(FirestoreAdapter);
  private readonly collectionService = inject(CollectionService);

  // Real-time items subscription
  items = toSignal(
    this.collectionService.watchCollection<DemoItem>(
      'demo-items',
      orderBy('createdAt', 'desc'),
      limit(10)
    ),
    { initialValue: [] }
  );

  // UI state
  statusMessage = signal<string>('');
  isError = signal<boolean>(false);

  /**
   * Add a new item to Firestore
   */
  addItem(title: string, description: string): void {
    if (!title || !description) {
      this.showError('Please enter both title and description');
      return;
    }

    const item: DemoItem = {
      title,
      description,
      createdAt: Date.now()
    };

    this.firestoreAdapter.addDocument('demo-items', item).subscribe({
      next: (id) => {
        this.showMessage(`✅ Item added with ID: ${id.substring(0, 8)}...`);
      },
      error: (error) => {
        this.showError(`❌ Error adding item: ${error.message}`);
      }
    });
  }

  /**
   * Delete an item from Firestore
   */
  deleteItem(id: string): void {
    this.firestoreAdapter.deleteDocument('demo-items', id).subscribe({
      next: () => {
        this.showMessage('✅ Item deleted successfully');
      },
      error: (error) => {
        this.showError(`❌ Error deleting item: ${error.message}`);
      }
    });
  }

  /**
   * Show success message
   */
  private showMessage(message: string): void {
    this.statusMessage.set(message);
    this.isError.set(false);
    setTimeout(() => this.statusMessage.set(''), 5000);
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.statusMessage.set(message);
    this.isError.set(true);
    setTimeout(() => this.statusMessage.set(''), 5000);
  }
}
