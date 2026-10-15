/**
 * EduSpace V3 Exam Engine - Session State Machine
 * Source of truth: docs/eduspace-v3-database-schema.md & docs/eduspace-v3-api-contract.md
 * 
 * Enforces deterministic lifecycle state transitions.
 * STRICT: Graded, submitted, or expired sessions can NEVER return to in_progress.
 */

import { EduSpaceError } from '../../core/errors/EduSpaceError.ts';
import type { SessionState } from '../types.ts';

const VALID_TRANSITIONS: Record<SessionState, readonly SessionState[]> = {
  created: ['in_progress', 'cancelled'],
  in_progress: ['submitted', 'expired', 'cancelled'],
  submitted: ['grading', 'graded'],
  grading: ['graded'],
  graded: [], // Terminal
  expired: ['grading', 'graded'], // Autosaved answers can still be graded
  cancelled: [] // Terminal
};

export class SessionStateMachine {
  /**
   * Checks if a transition from currentState to targetState is permitted.
   */
  canTransition(currentState: SessionState, targetState: SessionState): boolean {
    const allowed = VALID_TRANSITIONS[currentState] || [];
    return allowed.includes(targetState);
  }

  /**
   * Transitions from currentState to targetState.
   * Throws EduSpaceError(CONFLICT / FORBIDDEN) if transition is disallowed.
   */
  transition(currentState: SessionState, targetState: SessionState): SessionState {
    if (currentState === targetState) {
      return currentState;
    }

    if (!this.canTransition(currentState, targetState)) {
      if (currentState === 'graded' || currentState === 'submitted') {
        throw EduSpaceError.submissionClosed(
          `Cannot transition exam session from '${currentState}' to '${targetState}': session is closed`
        );
      }
      if (currentState === 'expired') {
        throw EduSpaceError.sessionExpired(
          `Cannot transition expired exam session to '${targetState}'`
        );
      }
      throw EduSpaceError.conflict(
        `Invalid session state transition: cannot transition from '${currentState}' to '${targetState}'`
      );
    }

    return targetState;
  }
}

export const defaultSessionStateMachine = new SessionStateMachine();
