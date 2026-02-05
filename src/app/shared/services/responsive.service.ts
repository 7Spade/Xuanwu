/**
 * Responsive Service
 * Wrapper for Angular CDK BreakpointObserver
 * 
 * @layer Shared
 * @package @angular/cdk/layout
 * @responsibility Provide responsive breakpoint detection
 */
import { inject, Injectable, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

/**
 * Responsive Service
 * Provides reactive signals for responsive breakpoints
 * 
 * @example
 * ```typescript
 * constructor(private responsive: ResponsiveService) {}
 * 
 * // Check if mobile
 * if (this.responsive.isMobile()) {
 *   // Mobile-specific logic
 * }
 * 
 * // Check current breakpoint
 * const breakpoint = this.responsive.currentBreakpoint();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  /**
   * Is currently mobile (Handset)
   */
  readonly isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  /**
   * Is currently tablet
   */
  readonly isTablet = toSignal(
    this.breakpointObserver.observe([Breakpoints.Tablet]).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  /**
   * Is currently desktop (Web)
   */
  readonly isDesktop = toSignal(
    this.breakpointObserver.observe([Breakpoints.Web]).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  /**
   * Is in portrait mode
   */
  readonly isPortrait = toSignal(
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait, Breakpoints.TabletPortrait]).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  /**
   * Is in landscape mode
   */
  readonly isLandscape = toSignal(
    this.breakpointObserver.observe([Breakpoints.HandsetLandscape, Breakpoints.TabletLandscape]).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  /**
   * Current breakpoint name
   */
  readonly currentBreakpoint = toSignal(
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).pipe(
      map(result => {
        if (result.breakpoints[Breakpoints.XSmall]) return 'XSmall';
        if (result.breakpoints[Breakpoints.Small]) return 'Small';
        if (result.breakpoints[Breakpoints.Medium]) return 'Medium';
        if (result.breakpoints[Breakpoints.Large]) return 'Large';
        if (result.breakpoints[Breakpoints.XLarge]) return 'XLarge';
        return 'Unknown';
      })
    ),
    { initialValue: 'Unknown' }
  );

  /**
   * Check if a custom breakpoint matches
   * @param query - Media query string
   * @returns Signal indicating if the query matches
   */
  isMatching(query: string) {
    return toSignal(
      this.breakpointObserver.observe(query).pipe(
        map(result => result.matches)
      ),
      { initialValue: false }
    );
  }
}
