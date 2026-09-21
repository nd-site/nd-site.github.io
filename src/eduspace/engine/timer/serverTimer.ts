/**
 * EduSpace V3 Exam Engine - Server-Authoritative Timer Abstraction
 * Source of truth: docs/eduspace-v3-api-contract.md
 * 
 * Computes official expiration and validates remaining time using server timestamps.
 * Client countdown is purely for UI display; the server holds absolute authority.
 */

export interface TimerOptions {
  durationMinutes: number;
  bufferSeconds?: number; // Network grace buffer (default: 30s)
}

export class ServerTimer {
  /**
   * Computes official ISO expiresAt timestamp given start time and duration.
   */
  computeExpiresAt(startedAtIso: string, options: TimerOptions): string {
    const started = new Date(startedAtIso).getTime();
    const durationMs = options.durationMinutes * 60 * 1000;
    const bufferMs = (options.bufferSeconds ?? 30) * 1000;
    const expiresMs = started + durationMs + bufferMs;
    return new Date(expiresMs).toISOString();
  }

  /**
   * Evaluates whether the session has expired given current server time.
   */
  isExpired(
    expiresAtIso: string,
    serverNow: string | Date = new Date(),
    gracePeriodSeconds: number = 0
  ): boolean {
    const expiresMs = new Date(expiresAtIso).getTime();
    const nowMs = typeof serverNow === 'string' ? new Date(serverNow).getTime() : serverNow.getTime();
    const graceMs = gracePeriodSeconds * 1000;
    return nowMs > (expiresMs + graceMs);
  }

  /**
   * Returns remaining seconds until expiration, clamped to 0.
   */
  getRemainingSeconds(expiresAtIso: string, serverNow: string | Date = new Date()): number {
    const expiresMs = new Date(expiresAtIso).getTime();
    const nowMs = typeof serverNow === 'string' ? new Date(serverNow).getTime() : serverNow.getTime();
    const diff = Math.floor((expiresMs - nowMs) / 1000);
    return Math.max(0, diff);
  }
}

export const defaultServerTimer = new ServerTimer();
