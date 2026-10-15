/**
 * EduSpace V3 - Schema Versioning Detection & Helpers
 * Source of truth: docs/eduspace-v3-database-schema.md
 */

import { SCHEMA_VERSION_LEGACY, SCHEMA_VERSION_CANONICAL, type SchemaVersion } from '../constants/index.ts';

/**
 * Extracts and determines the schema version of an unknown data record.
 * - If schemaVersion is present as a number, returns that number.
 * - Otherwise, defaults to 0 (Legacy V2).
 * 
 * Does NOT mutate data.
 */
export function getSchemaVersion(data: unknown): SchemaVersion | number {
  if (data && typeof data === 'object' && 'schemaVersion' in data) {
    const ver = (data as { schemaVersion: unknown }).schemaVersion;
    if (typeof ver === 'number') {
      return ver;
    }
  }
  return SCHEMA_VERSION_LEGACY;
}

/**
 * Checks whether the data is in legacy V2 format (schemaVersion 0).
 */
export function isLegacySchema(data: unknown): boolean {
  return getSchemaVersion(data) === SCHEMA_VERSION_LEGACY;
}

/**
 * Checks whether the data is in canonical V3 format (schemaVersion 1).
 */
export function isCanonicalSchema(data: unknown): boolean {
  return getSchemaVersion(data) === SCHEMA_VERSION_CANONICAL;
}
