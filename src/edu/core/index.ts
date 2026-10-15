/**
 * EduSpace V3 - Core Architecture Barrel Export
 * Central entrypoint for domain models, constants, errors, permissions, normalizers, repositories, and API client.
 */

export * from './constants/index.ts';
export * from './domain/index.ts';
export * from './schema/version.ts';
export * from './errors/EduSpaceError.ts';
export * from './permissions/helpers.ts';
export * from './normalizers/index.ts';
export * from './repositories/index.ts';
export * from './api/index.ts';
