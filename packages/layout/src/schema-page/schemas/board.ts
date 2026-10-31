// Declarative contract for the Orders Kanban board workspace. The host supplies
// JSON only; this validator keeps the renderer from invoking arbitrary data.

/** Order lifecycle states, mirroring the backend orders domain enum. */
export const ORDER_STATUSES = ['draft', 'pending', 'confirmed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** One board lane, declared by the status it collects. */
export type OrderBoardColumn = { status: OrderStatus };

/** Board page data: where to read orders from and which lanes to show. */
export type OrderBoardData = {
  source: { url: string };
  columns: OrderBoardColumn[];
  // Securable-object key that gates moving tickets (persisting status changes).
  // Absent means the board is read-only.
  writePermission?: string;
};

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStatus = (value: unknown): value is OrderStatus =>
  typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value);

export function isOrderBoardData(value: unknown): value is OrderBoardData {
  if (!record(value)) return false;
  if (!record(value.source) || !/^\/api\/v1\/orders$/.test(String(value.source.url))) return false;
  if (!Array.isArray(value.columns) || value.columns.length === 0) return false;
  if (!value.columns.every((column) => record(column) && isStatus(column.status))) return false;
  if (value.writePermission !== undefined && typeof value.writePermission !== 'string') return false;
  const statuses = value.columns.map((column) => (column as OrderBoardColumn).status);
  return new Set(statuses).size === statuses.length;
}
