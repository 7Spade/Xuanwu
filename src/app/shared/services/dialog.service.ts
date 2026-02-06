/**
 * Dialog Service
 * Wrapper for Angular Material Dialog
 * 
 * @layer Shared
 * @package @angular/material/dialog
 * @responsibility Provide dialog/modal utilities
 */
import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';

/**
 * Confirmation Dialog Data
 */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * Dialog Service
 * Provides dialog/modal management
 * 
 * @example
 * ```typescript
 * constructor(private dialog: DialogService) {}
 * 
 * // Open a custom dialog
 * const dialogRef = this.dialog.open(MyComponent, {
 *   data: { id: 123 }
 * });
 * 
 * dialogRef.afterClosed().subscribe(result => {
 *   console.log('Dialog result:', result);
 * });
 * 
 * // Open confirmation dialog
 * this.dialog.confirm({
 *   title: 'Delete Item',
 *   message: 'Are you sure you want to delete this item?'
 * }).subscribe(confirmed => {
 *   if (confirmed) {
 *     // Delete the item
 *   }
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly dialog = inject(MatDialog);

  /**
   * Open a dialog
   * @param component - Component to display in dialog
   * @param config - Dialog configuration
   * @returns Dialog reference
   */
  open<T, D = any, R = any>(
    component: ComponentType<T>,
    config?: MatDialogConfig<D>
  ): MatDialogRef<T, R> {
    return this.dialog.open(component, config);
  }

  /**
   * Open a confirmation dialog
   * @param data - Confirmation dialog data
   * @returns Observable of confirmation result (true/false)
   * 
   * @remarks
   * This method is SSR-safe and will work correctly during server-side rendering.
   * On the server, it returns false immediately without attempting to access browser APIs.
   */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    // SSR-safe implementation: Use Material Dialog when available
    // For now, use a simple platform-aware approach
    return new Observable(observer => {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        const confirmed = window.confirm(`${data.title}\n\n${data.message}`);
        observer.next(confirmed);
      } else {
        // SSR fallback: Return false
        observer.next(false);
      }
      observer.complete();
    });
  }

  /**
   * Close all open dialogs
   */
  closeAll() {
    this.dialog.closeAll();
  }

  /**
   * Get a dialog by ID
   * @param id - Dialog ID
   * @returns Dialog reference or undefined
   */
  getDialogById(id: string): MatDialogRef<any> | undefined {
    return this.dialog.getDialogById(id);
  }

  /**
   * Check if any dialogs are open
   * @returns True if dialogs are open
   */
  get hasOpenDialogs(): boolean {
    return this.dialog.openDialogs.length > 0;
  }
}
