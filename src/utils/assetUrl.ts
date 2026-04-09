// src/utils/assetUrl.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
// Use a dedicated asset base URL if provided, otherwise derive from API URL
const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || API_BASE_URL.replace(/\/api(\/.*)?$/, '');

/**
 * Converts a relative asset URL (e.g., "/uploads/products/xxx.jpg") into an absolute URL
 * pointing to the backend server. Absolute URLs (http://, https://, //) are returned unchanged.
 *
 * @param relativeUrl - The asset URL from the database (can be relative or absolute)
 * @returns Absolute URL string, or empty string if input is falsy
 */
export function getAssetUrl(relativeUrl: string | undefined): string {
  if (!relativeUrl) return '';

  // Already absolute – return as is
  if (/^(https?:)?\/\//i.test(relativeUrl)) {
    return relativeUrl;
  }

  // Remove leading slash to avoid double slashes
  const clean = relativeUrl.replace(/^\/+/, '');
  const base = ASSET_BASE_URL.replace(/\/+$/, '');

  return `${base}/${clean}`;
}