// src/utils/assetUrl.ts
const ASSET_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function getAssetUrl(relativeUrl: string | undefined): string {
  if (!relativeUrl) return '';
  if (/^(https?:)?\/\//i.test(relativeUrl)) return relativeUrl;
  const clean = relativeUrl.replace(/^\/+/, '');
  const base = ASSET_BASE_URL.replace(/\/+$/, '');
  return `${base}/${clean}`;
}