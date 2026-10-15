/**
 * EduSpace V3 - Governance, Moderation & Analytics Domain Models
 * Source of truth: docs/eduspace-v3-database-schema.md
 */

export type ModerationTargetType = 'exam' | 'assignment' | 'question' | 'report';
export type ModerationAction = 'approve' | 'reject' | 'request_changes' | 'archive';

export interface ModerationRecord {
  id: string;
  schemaVersion: 1;
  targetType: ModerationTargetType;
  targetId: string;
  submittedByCodeId: string;
  reviewedByCodeId: string;
  action: ModerationAction;
  reason?: string;
  previousStatus: string;
  newStatus: string;
  reviewedAt: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsCognitiveBreakdown {
  recognition: number;
  comprehension: number;
  application: number;
  high_application: number;
}

export interface AnalyticsRecord {
  id: string;
  schemaVersion: 1;
  targetType: 'student' | 'classroom' | 'exam' | 'topic';
  targetId: string;
  timeWindow: 'weekly' | 'monthly' | 'all_time';
  calculatedAt: string;
  metrics: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    cognitiveLevelBreakdown: AnalyticsCognitiveBreakdown;
    topicWeaknesses?: Array<{ topicId: string; errorRate: number }>;
  };
}

export interface SystemSetting {
  id: string;
  schemaVersion: 1;
  category: 'general' | 'assessment' | 'security' | 'integrations';
  configPayload: Record<string, any>;
  updatedByCodeId: string;
  updatedAt: string;
}
