/**
 * EduSpace V3 Exam Engine - Grading Registry & Capabilities
 * Source of truth: docs/eduspace-v3-api-contract.md & docs/eduspace-v3-database-schema.md
 * 
 * Enforces server-authoritative grading governance.
 * STRICT: AI-assisted grading must never silently finalize official results.
 */

import type { GradingMethod } from '../../core/constants/index.ts';
import { EduSpaceError } from '../../core/errors/EduSpaceError.ts';
import type { GradingCapabilityDescriptor } from '../types.ts';

export const GRADING_CAPABILITIES: Record<GradingMethod, GradingCapabilityDescriptor> = {
  automatic: {
    method: 'automatic',
    canFinalizeOfficialScore: true,
    requiresTeacherReview: false,
    description: 'Deterministic rule-based machine grading for objective question types.'
  },
  manual: {
    method: 'manual',
    canFinalizeOfficialScore: true,
    requiresTeacherReview: true,
    description: 'Human instructor evaluation with rubric feedback and score allocation.'
  },
  ai_assisted: {
    method: 'ai_assisted',
    canFinalizeOfficialScore: false,
    requiresTeacherReview: true,
    description: 'AI-generated assessment suggestion. CANNOT finalize official grade without human teacher approval.'
  },
  hybrid: {
    method: 'hybrid',
    canFinalizeOfficialScore: false,
    requiresTeacherReview: true,
    description: 'Combination of automatic objective grading with pending manual essay review.'
  }
};

export class GradingRegistry {
  getDescriptor(method: GradingMethod): GradingCapabilityDescriptor {
    const desc = GRADING_CAPABILITIES[method];
    if (!desc) {
      throw EduSpaceError.validationError(`Unknown grading method: '${method}'`);
    }
    return desc;
  }

  /**
   * Asserts whether a given grading result can be officially finalized.
   * Rejects AI-assisted scores if no human reviewer is specified.
   */
  assertCanFinalize(method: GradingMethod, reviewerCodeId?: string | null): void {
    const descriptor = this.getDescriptor(method);
    if (descriptor.requiresTeacherReview && !reviewerCodeId) {
      throw EduSpaceError.forbidden(
        `Grading method '${method}' requires human teacher review and cannot be automatically finalized without a reviewerCodeId`
      );
    }
  }
}

export const defaultGradingRegistry = new GradingRegistry();
