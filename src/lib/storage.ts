import type { MetadataMode } from '@/types';

/** Each editing mode persists its own draft under a separate localStorage entry. */
export function metadataStorageKey(mode: MetadataMode): string {
  return `metadata:${mode}`;
}

/** Remembers which mode was last active so a reload restores the same tab. */
export const METADATA_MODE_STORAGE_KEY = 'metadata:mode';
