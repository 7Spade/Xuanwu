/**
 * Platform Service
 * Wrapper for Angular CDK Platform
 * 
 * @layer Shared
 * @package @angular/cdk/platform
 * @responsibility Provide platform detection utilities
 */
import { inject, Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

/**
 * Platform Service
 * Provides platform detection capabilities
 * 
 * @example
 * ```typescript
 * constructor(private platform: PlatformService) {}
 * 
 * if (this.platform.isBrowser) {
 *   // Browser-specific code
 * }
 * 
 * if (this.platform.isIOS) {
 *   // iOS-specific code
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  private readonly platform = inject(Platform);

  /**
   * Whether the code is running in a browser
   */
  get isBrowser(): boolean {
    return this.platform.isBrowser;
  }

  /**
   * Whether the code is running on the server
   */
  get isServer(): boolean {
    return !this.platform.isBrowser;
  }

  /**
   * Whether the code is running on Android
   */
  get isAndroid(): boolean {
    return this.platform.ANDROID;
  }

  /**
   * Whether the code is running on iOS
   */
  get isIOS(): boolean {
    return this.platform.IOS;
  }

  /**
   * Whether the code is running on Safari
   */
  get isSafari(): boolean {
    return this.platform.SAFARI;
  }

  /**
   * Whether the code is running on Firefox
   */
  get isFirefox(): boolean {
    return this.platform.FIREFOX;
  }

  /**
   * Whether the code is running on Edge
   */
  get isEdge(): boolean {
    return this.platform.EDGE;
  }

  /**
   * Whether the code is running on Trident (IE)
   */
  get isTrident(): boolean {
    return this.platform.TRIDENT;
  }

  /**
   * Whether the code is running on Blink (Chrome, Opera)
   */
  get isBlink(): boolean {
    return this.platform.BLINK;
  }

  /**
   * Whether the code is running on WebKit
   */
  get isWebKit(): boolean {
    return this.platform.WEBKIT;
  }

  /**
   * Whether touch events are supported
   * 
   * @remarks
   * SSR-safe implementation that checks platform before accessing browser APIs
   */
  get isTouchDevice(): boolean {
    // SSR-safe: Check if we're in a browser environment first
    if (!this.isBrowser) {
      return false;
    }
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
}
