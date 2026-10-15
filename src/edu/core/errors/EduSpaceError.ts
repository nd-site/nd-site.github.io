/**
 * EduSpace V3 - Canonical Error System
 * Source of truth: docs/eduspace-v3-api-contract.md
 */

import type { ErrorCode } from '../constants/index.ts';

export interface EduSpaceErrorOptions {
  code: ErrorCode;
  message: string;
  status: number;
  retryAllowed: boolean;
  details?: unknown[];
}

export class EduSpaceError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly retryAllowed: boolean;
  public readonly details: unknown[];

  constructor(options: EduSpaceErrorOptions) {
    super(options.message);
    this.name = 'EduSpaceError';
    this.code = options.code;
    this.status = options.status;
    this.retryAllowed = options.retryAllowed;
    this.details = options.details ?? [];

    // Ensure prototype chain is maintained across transpilation
    Object.setPrototypeOf(this, EduSpaceError.prototype);
  }

  public get httpStatus(): number {
    return this.status;
  }

  /**
   * Serializes error to the standard public API error response envelope.
   * Internal stack trace is deliberately excluded for security.
   */
  public toResponse(): {
    success: false;
    error: {
      code: ErrorCode;
      message: string;
      details: unknown[];
      retryAllowed: boolean;
    };
  } {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        retryAllowed: this.retryAllowed
      }
    };
  }

  // -----------------------------------------------------------------
  // Canonical Static Factory Helpers
  // -----------------------------------------------------------------

  public static validationError(message = 'Dữ liệu yêu cầu không hợp lệ hoặc thiếu trường bắt buộc.', details?: unknown[]): EduSpaceError {
    return new EduSpaceError({
      code: 'VALIDATION_ERROR',
      status: 400,
      message,
      retryAllowed: false,
      details
    });
  }

  public static validation(message?: string, details?: unknown[]): EduSpaceError {
    return EduSpaceError.validationError(message, details);
  }

  public static unauthenticated(message = 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'): EduSpaceError {
    return new EduSpaceError({
      code: 'UNAUTHENTICATED',
      status: 401,
      message,
      retryAllowed: false
    });
  }

  public static forbidden(message = 'Bạn không có quyền thực hiện thao tác này.'): EduSpaceError {
    return new EduSpaceError({
      code: 'FORBIDDEN',
      status: 403,
      message,
      retryAllowed: false
    });
  }

  public static notFound(message = 'Tài nguyên yêu cầu không tồn tại trên hệ thống.'): EduSpaceError {
    return new EduSpaceError({
      code: 'NOT_FOUND',
      status: 404,
      message,
      retryAllowed: false
    });
  }

  public static conflict(message = 'Dữ liệu đã tồn tại hoặc trạng thái tài nguyên bị xung đột.'): EduSpaceError {
    return new EduSpaceError({
      code: 'CONFLICT',
      status: 409,
      message,
      retryAllowed: false
    });
  }

  public static rateLimited(message = 'Thao tác quá nhanh. Vui lòng thử lại sau giây lát.'): EduSpaceError {
    return new EduSpaceError({
      code: 'RATE_LIMITED',
      status: 429,
      message,
      retryAllowed: true
    });
  }

  public static sessionExpired(message = 'Phiên làm bài đã quá thời gian quy định và đã tự động đóng.'): EduSpaceError {
    return new EduSpaceError({
      code: 'SESSION_EXPIRED',
      status: 410,
      message,
      retryAllowed: false
    });
  }

  public static submissionClosed(message = 'Bài thi hoặc bài tập này đã bị khóa nhận bài.'): EduSpaceError {
    return new EduSpaceError({
      code: 'SUBMISSION_CLOSED',
      status: 423,
      message,
      retryAllowed: false
    });
  }

  public static gradingUnavailable(message = 'Hệ thống chấm điểm tự động đang bận. Vui lòng thử lại sau.'): EduSpaceError {
    return new EduSpaceError({
      code: 'GRADING_UNAVAILABLE',
      status: 503,
      message,
      retryAllowed: true
    });
  }

  public static internalError(message = 'Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau.'): EduSpaceError {
    return new EduSpaceError({
      code: 'INTERNAL_ERROR',
      status: 500,
      message,
      retryAllowed: true
    });
  }

  public static internal(message?: string): EduSpaceError {
    return EduSpaceError.internalError(message);
  }

  /**
   * Maps any unknown error safely to an EduSpaceError.
   */
  public static fromUnknown(err: unknown): EduSpaceError {
    if (err instanceof EduSpaceError) {
      return err;
    }
    return EduSpaceError.internalError();
  }
}
