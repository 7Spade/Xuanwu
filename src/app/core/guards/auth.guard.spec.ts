import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authGuard } from './auth.guard';
import { AppStateService } from '../services/app-state.service';
import { signal } from '@angular/core';

describe('authGuard', () => {
  let mockAppState: { isAuthenticated: ReturnType<typeof signal<boolean>> };
  let mockRouter: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // Create mock AppStateService with signal
    mockAppState = {
      isAuthenticated: signal(false),
    };

    // Create mock Router
    mockRouter = {
      createUrlTree: vi.fn((commands, extras) => {
        return { commands, extras } as unknown as UrlTree;
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

  it('should allow access when user is authenticated', () => {
    // Arrange
    mockAppState.isAuthenticated.set(true);
    const route = {} as any;
    const state = { url: '/dashboard' } as any;

    // Act
    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state)
    );

    // Assert
    expect(result).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Arrange
    mockAppState.isAuthenticated.set(false);
    const route = {} as any;
    const state = { url: '/dashboard' } as any;

    // Act
    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state)
    );

    // Assert
    expect(result).not.toBe(true);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard' },
    });
  });

  it('should include return URL in redirect', () => {
    // Arrange
    mockAppState.isAuthenticated.set(false);
    const route = {} as any;
    const protectedUrl = '/protected/resource';
    const state = { url: protectedUrl } as any;

    // Act
    TestBed.runInInjectionContext(() => authGuard(route, state));

    // Assert
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: protectedUrl },
    });
  });

  it('should handle multiple calls with different auth states', () => {
    // Arrange
    const route = {} as any;
    const state = { url: '/test' } as any;

    // Act & Assert - First call (not authenticated)
    mockAppState.isAuthenticated.set(false);
    let result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).not.toBe(true);

    // Act & Assert - Second call (authenticated)
    mockAppState.isAuthenticated.set(true);
    result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBe(true);
  });

  it('should work with route parameters', () => {
    // Arrange
    mockAppState.isAuthenticated.set(true);
    const route = {
      params: { id: '123' },
      queryParams: { filter: 'active' },
    } as any;
    const state = { url: '/items/123?filter=active' } as any;

    // Act
    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state)
    );

    // Assert
    expect(result).toBe(true);
  });

  it('should handle empty return URL', () => {
    // Arrange
    mockAppState.isAuthenticated.set(false);
    const route = {} as any;
    const state = { url: '' } as any;

    // Act
    TestBed.runInInjectionContext(() => authGuard(route, state));

    // Assert
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '' },
    });
  });

  it('should handle root URL redirect', () => {
    // Arrange
    mockAppState.isAuthenticated.set(false);
    const route = {} as any;
    const state = { url: '/' } as any;

    // Act
    TestBed.runInInjectionContext(() => authGuard(route, state));

    // Assert
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/' },
    });
  });
});
