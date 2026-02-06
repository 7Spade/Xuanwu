import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { noAuthGuard } from './no-auth.guard';
import { AppStateService } from '../services/app-state.service';
import { signal } from '@angular/core';

describe('noAuthGuard', () => {
  let mockAppState: { isAuthenticated: ReturnType<typeof signal<boolean>> };
  let mockRouter: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // Create mock AppStateService with signal
    mockAppState = {
      isAuthenticated: signal(false),
    };

    // Create mock Router
    mockRouter = {
      createUrlTree: vi.fn((commands) => {
        return { commands } as unknown as UrlTree;
      }),
    };

    // Configure TestBed
    TestBed.configureTestingModule({
      providers: [
        { provide: AppStateService, useValue: mockAppState },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should allow access when user is not authenticated', () => {
    // Arrange
    mockAppState.isAuthenticated.set(false);
    const route = {} as any;
    const state = { url: '/login' } as any;

    // Act
    const result = TestBed.runInInjectionContext(() =>
      noAuthGuard(route, state)
    );

    // Assert
    expect(result).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when user is authenticated', () => {
    // Arrange
    mockAppState.isAuthenticated.set(true);
    const route = {} as any;
    const state = { url: '/login' } as any;

    // Act
    const result = TestBed.runInInjectionContext(() =>
      noAuthGuard(route, state)
    );

    // Assert
    expect(result).not.toBe(true);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle multiple calls with different auth states', () => {
    // Arrange
    const route = {} as any;
    const state = { url: '/login' } as any;

    // Act & Assert - First call (not authenticated)
    mockAppState.isAuthenticated.set(false);
    let result = TestBed.runInInjectionContext(() =>
      noAuthGuard(route, state)
    );
    expect(result).toBe(true);

    // Act & Assert - Second call (authenticated)
    mockAppState.isAuthenticated.set(true);
    result = TestBed.runInInjectionContext(() => noAuthGuard(route, state));
    expect(result).not.toBe(true);
  });

  it('should work on signup page (common use case)', () => {
    // Arrange
    mockAppState.isAuthenticated.set(false);
    const route = {} as any;
    const state = { url: '/signup' } as any;

    // Act
    const result = TestBed.runInInjectionContext(() =>
      noAuthGuard(route, state)
    );

    // Assert
    expect(result).toBe(true);
  });

  it('should prevent authenticated users from accessing login', () => {
    // Arrange
    mockAppState.isAuthenticated.set(true);
    const route = {} as any;
    const state = { url: '/login' } as any;

    // Act
    const result = TestBed.runInInjectionContext(() =>
      noAuthGuard(route, state)
    );

    // Assert
    expect(result).not.toBe(true);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle forgot-password page', () => {
    // Arrange
    mockAppState.isAuthenticated.set(false);
    const route = {} as any;
    const state = { url: '/forgot-password' } as any;

    // Act
    const result = TestBed.runInInjectionContext(() =>
      noAuthGuard(route, state)
    );

    // Assert
    expect(result).toBe(true);
  });

  it('should redirect authenticated users from public pages', () => {
    // Arrange
    mockAppState.isAuthenticated.set(true);
    const route = {} as any;
    const state = { url: '/public-landing' } as any;

    // Act
    TestBed.runInInjectionContext(() => noAuthGuard(route, state));

    // Assert
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });
});
