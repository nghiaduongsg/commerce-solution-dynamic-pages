export type AhamoveData = { source: { url: string } };
export function isAhamoveData(value: unknown): value is AhamoveData {
  const url = (value as AhamoveData)?.source?.url;
  return typeof url === 'string' && /^\/api\/v1\/ahamove\/orders$/.test(url);
}
