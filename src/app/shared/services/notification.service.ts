/**
 * Notification Service
 * Wrapper for Angular Material Snackbar
 * 
 * @layer Shared
 * @package @angular/material/snack-bar
 * @responsibility Provide user notifications
 */
import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Notification Service
 * Provides toast/snackbar notifications
 * 
 * @example
 * ```typescript
 * constructor(private notification: NotificationService) {}
 * 
 * // Show success message
 * this.notification.success('Item saved successfully!');
 * 
 * // Show error message
 * this.notification.error('Failed to save item');
 * 
 * // Show with action
 * this.notification.show('Item deleted', 'Undo').onAction().subscribe(() => {
 *   // Handle undo
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'bottom'
  };

  /**
   * Show a generic notification
   * @param message - Message to display
   * @param action - Optional action button text
   * @param config - Optional configuration
   */
  show(message: string, action?: string, config?: MatSnackBarConfig) {
    return this.snackBar.open(message, action, {
      ...this.defaultConfig,
      ...config
    });
  }

  /**
   * Show a success notification
   * @param message - Success message
   * @param action - Optional action button text
   */
  success(message: string, action?: string) {
    return this.show(message, action, {
      panelClass: ['notification-success'],
      duration: 3000
    });
  }

  /**
   * Show an error notification
   * @param message - Error message
   * @param action - Optional action button text
   */
  error(message: string, action: string = 'Dismiss') {
    return this.show(message, action, {
      panelClass: ['notification-error'],
      duration: 5000
    });
  }

  /**
   * Show a warning notification
   * @param message - Warning message
   * @param action - Optional action button text
   */
  warning(message: string, action?: string) {
    return this.show(message, action, {
      panelClass: ['notification-warning'],
      duration: 4000
    });
  }

  /**
   * Show an info notification
   * @param message - Info message
   * @param action - Optional action button text
   */
  info(message: string, action?: string) {
    return this.show(message, action, {
      panelClass: ['notification-info'],
      duration: 3000
    });
  }

  /**
   * Dismiss all notifications
   */
  dismiss() {
    this.snackBar.dismiss();
  }
}
