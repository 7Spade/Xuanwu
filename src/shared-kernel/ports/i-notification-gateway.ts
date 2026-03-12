/**
 * Module: i-notification-gateway.ts
 * Purpose: define SK_PORTS NotificationGateway interface in shared-kernel (L9)
 * Responsibilities: abstract user-level push and email notification delivery
 * Constraints: deterministic logic, no infrastructure imports, respect module boundaries
 *
 * Per docs/architecture/guidelines/infrastructure-spec.md §7 NotificationGateway.
 * Note: IMessaging is the lower-level FCM adapter (token-based).
 *       NotificationGateway is the higher-level domain port (userId-based routing).
 */

export interface NotificationGateway {
  /**
   * Send a push notification to a user.
   * The gateway resolves the user's active FCM token(s) internally.
   *
   * @param userId - Domain user identifier (not FCM token).
   * @param title - Notification title.
   * @param body - Notification body text.
   * @param data - Optional key-value metadata for client-side routing.
   */
  sendPush(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void>;

  /**
   * Send a transactional email to a user via template.
   *
   * @param to - Recipient email address.
   * @param templateId - Provider-specific template identifier.
   * @param variables - Template variable substitutions.
   */
  sendEmail(
    to: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<void>;
}
