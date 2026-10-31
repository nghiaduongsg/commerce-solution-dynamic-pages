import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import AddRounded from '@mui/icons-material/AddRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded';
import EventRounded from '@mui/icons-material/EventRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import usePermissions from '@pkg-setup/src/user/usePermissions';
import OrderCreateDialog from './OrderCreateDialog';
import { ORDER_STATUSES, OrderBoardData, OrderStatus } from './schemas/board';

export { isOrderBoardData } from './schemas/board';

// Narrow MUI's generic variant to avoid TypeScript's combinatorial JSX union,
// matching the pattern used by the Ahamove workspace.
const Field = TextField as unknown as React.ComponentType<Omit<TextFieldProps<'outlined'>, 'variant'>>;

// Lifecycle accents. Colours live here, not in JSON, so lane tone stays a
// presentation concern; the labels remain translation keys.
const STATUS_TONE: Record<OrderStatus, { accent: string; soft: string; text: string }> = {
  draft: { accent: '#64748B', soft: 'rgba(100,116,139,0.12)', text: '#334155' },
  pending: { accent: '#D97706', soft: 'rgba(217,119,6,0.14)', text: '#92540A' },
  confirmed: { accent: '#059669', soft: 'rgba(5,150,105,0.14)', text: '#047857' },
  cancelled: { accent: '#DC2626', soft: 'rgba(220,38,38,0.12)', text: '#B91C1C' },
};
const toneFor = (status: string) => STATUS_TONE[status as OrderStatus] || STATUS_TONE.draft;

type Ticket = {
  id: string;
  reference: string;
  status: OrderStatus;
  source: string;
  currency: string;
  totalMinor: number;
  itemCount: number;
  customer: string;
  createdAt: string;
  haystack: string;
};

const pick = (...values: unknown[]): string => {
  for (const value of values) if (value != null && value !== '') return String(value);
  return '';
};

const shortId = (id: string) => (id.length > 8 ? id.slice(0, 8) : id);

function normalize(order: Record<string, any>): Ticket {
  const id = pick(order.id);
  const status = (pick(order.status) || 'draft') as OrderStatus;
  const source = pick(order.source);
  const currency = pick(order.currency, 'USD');
  const reference = pick(order.externalReference, order.external_reference) || `#${shortId(id)}`;
  const customer = pick(order.customerExternalId, order.customer_external_id);
  const createdAt = pick(order.createdAt, order.created_at);
  const totalMinor = Number(pick(order.totalAmountMinor, order.total_amount_minor, '0')) || 0;
  const items: any[] = Array.isArray(order.items) ? order.items : [];
  // The list endpoint returns item_count without the items themselves; fall
  // back to the loaded items when a count is not provided.
  const itemCount = Number(order.itemCount ?? order.item_count ?? items.length) || 0;
  const itemText = items.map((item) => `${pick(item.name)} ${pick(item.sku)}`).join(' ');
  return {
    id,
    reference,
    status,
    source,
    currency,
    totalMinor,
    itemCount,
    customer,
    createdAt,
    haystack: `${reference} ${source} ${customer} ${currency} ${status} ${itemText} ${pick(
      order.notes,
    )}`.toLowerCase(),
  };
}

const fractionDigits = (currency: string): number => {
  try {
    return (
      new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
        .maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
};
const formatAmount = (minor: number, currency: string, language: string): string => {
  const major = minor / Math.pow(10, fractionDigits(currency));
  try {
    return new Intl.NumberFormat(language, { style: 'currency', currency }).format(major);
  } catch {
    return `${major} ${currency}`;
  }
};
const formatDate = (value: string, language: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat(language, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date);
};

type CardProps = {
  ticket: Ticket;
  statuses: OrderStatus[];
  dragging: boolean;
  canWrite: boolean;
  onOpen: (id: string) => void;
  onMove: (id: string, status: OrderStatus) => void;
  onDragStart: (id: string, event: React.DragEvent) => void;
  onDragEnd: () => void;
};

function TicketCard({
  ticket,
  statuses,
  dragging,
  canWrite,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
}: CardProps) {
  const { t, i18n } = useTranslation('workspace');
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const tone = toneFor(ticket.status);
  const amount = formatAmount(ticket.totalMinor, ticket.currency, i18n.language);
  const created = formatDate(ticket.createdAt, i18n.language);
  return (
    <Paper
      elevation={0}
      draggable={canWrite}
      onDragStart={canWrite ? (event) => onDragStart(ticket.id, event) : undefined}
      onDragEnd={canWrite ? onDragEnd : undefined}
      sx={{
        position: 'relative',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'rgba(15,23,42,0.08)',
        borderLeft: `3px solid ${tone.accent}`,
        p: 3,
        cursor: canWrite ? 'grab' : 'default',
        backgroundColor: '#FFFFFF',
        opacity: dragging ? 0.4 : 1,
        transition: 'box-shadow 120ms ease, transform 120ms ease, opacity 120ms ease',
        '&:hover': { boxShadow: '0 6px 16px rgba(15,23,42,0.12)', transform: 'translateY(-1px)' },
        ...(canWrite ? { '&:active': { cursor: 'grabbing' } } : {}),
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        {canWrite ? (
          <DragIndicatorRounded
            aria-hidden
            sx={{ fontSize: 16, color: 'rgba(15,23,42,0.28)', mt: '2px', ml: '-4px' }}
          />
        ) : null}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={() => onOpen(ticket.id)}
            aria-label={t('board.openTicket', { reference: ticket.reference })}
            sx={{
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 700,
              color: '#0F172A',
              textAlign: 'left',
              display: 'block',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ticket.reference}
          </Link>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0F172A', mt: 0.5 }}>
            {amount}
          </Typography>
        </Box>
        {canWrite ? (
          <IconButton
            size="small"
            aria-label={t('board.moveTicket', { reference: ticket.reference })}
            aria-haspopup="menu"
            onClick={(event) => {
              event.stopPropagation();
              setAnchor(event.currentTarget);
            }}
            sx={{ mt: '-4px', mr: '-6px' }}
          >
            <MoreVertRounded fontSize="small" />
          </IconButton>
        ) : null}
      </Stack>

      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        sx={{ mt: 1.5, gap: 1, color: 'rgba(15,23,42,0.6)' }}
      >
        {ticket.source ? (
          <Chip
            size="small"
            label={ticket.source}
            sx={{
              height: 20,
              fontSize: 11,
              fontWeight: 600,
              backgroundColor: tone.soft,
              color: tone.text,
            }}
          />
        ) : null}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <ReceiptLongRounded sx={{ fontSize: 14 }} aria-hidden />
          <Typography sx={{ fontSize: 12 }}>
            {t('board.itemCount', { count: ticket.itemCount })}
          </Typography>
        </Stack>
        {created ? (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <EventRounded sx={{ fontSize: 14 }} aria-hidden />
            <Typography sx={{ fontSize: 12 }} title={t('board.created')}>
              {created}
            </Typography>
          </Stack>
        ) : null}
      </Stack>

      {ticket.customer ? (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1, minWidth: 0 }}>
          <PersonRounded sx={{ fontSize: 14, color: 'rgba(15,23,42,0.5)' }} aria-hidden />
          <Typography
            title={t('board.customer')}
            sx={{
              fontSize: 12,
              color: 'rgba(15,23,42,0.6)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ticket.customer}
          </Typography>
        </Stack>
      ) : null}

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        slotProps={{ list: { 'aria-label': t('board.moveMenu') } }}
      >
        {statuses
          .filter((status) => status !== ticket.status)
          .map((status) => (
            <MenuItem
              key={status}
              onClick={() => {
                setAnchor(null);
                onMove(ticket.id, status);
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: toneFor(status).accent,
                  mr: 1.5,
                }}
              />
              {t(`board.statuses.${status}`)}
            </MenuItem>
          ))}
      </Menu>
    </Paper>
  );
}

export default function OrderBoard({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: OrderBoardData;
}) {
  const { t, i18n } = useTranslation('workspace');
  const navigate = useNavigate();
  const writeAllowed = usePermissions(data.writePermission || '');
  const canWrite = !!data.writePermission && writeAllowed;
  const columns = useMemo<OrderStatus[]>(
    () => data.columns.map((column) => column.status).filter((status) => ORDER_STATUSES.includes(status)),
    [data.columns],
  );

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('all');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<OrderStatus | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [errorNote, setErrorNote] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    controller.current = abort;
    setLoading(true);
    setError(false);
    axios
      .get(data.source.url, { signal: abort.signal })
      .then((response) => {
        const rows = Array.isArray(response.data?.orders) ? response.data.orders : [];
        setTickets(rows.map(normalize));
        setLoading(false);
      })
      .catch((caught) => {
        if (axios.isCancel?.(caught) || abort.signal.aborted) return;
        setError(true);
        setLoading(false);
      });
    return () => abort.abort();
  }, [data.source.url, reload]);

  const sources = useMemo(
    () => Array.from(new Set(tickets.map((ticket) => ticket.source).filter(Boolean))).sort(),
    [tickets],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tickets.filter(
      (ticket) =>
        (source === 'all' || ticket.source === source) &&
        (!needle || ticket.haystack.includes(needle)),
    );
  }, [tickets, query, source]);

  const grouped = useMemo(() => {
    const map: Record<string, Ticket[]> = {};
    for (const status of columns) map[status] = [];
    for (const ticket of filtered) if (map[ticket.status]) map[ticket.status].push(ticket);
    return map;
  }, [filtered, columns]);

  // Optimistically move the ticket, persist the new status, and roll back with
  // a visible error if the server rejects it (e.g. read-only access).
  const move = useCallback(
    (id: string, status: OrderStatus) => {
      const ticket = tickets.find((item) => item.id === id);
      if (!ticket || ticket.status === status) return;
      const previous = ticket.status;
      setErrorNote('');
      setTickets((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
      setAnnouncement(
        t('board.moved', { reference: ticket.reference, status: t(`board.statuses.${status}`) }),
      );
      axios.patch(`${data.source.url}/${encodeURIComponent(id)}`, { status }).catch(() => {
        setTickets((current) =>
          current.map((item) => (item.id === id ? { ...item, status: previous } : item)),
        );
        setErrorNote(t('board.saveFailed', { reference: ticket.reference }));
        setAnnouncement(t('board.saveFailed', { reference: ticket.reference }));
      });
    },
    [tickets, t, data.source.url],
  );

  const openTicket = useCallback(
    (id: string) => navigate(`/page/Order/${encodeURIComponent(id)}`),
    [navigate],
  );

  const handleDrop = useCallback(
    (status: OrderStatus, event: React.DragEvent) => {
      if (!canWrite) return;
      event.preventDefault();
      const id = event.dataTransfer?.getData('text/plain') || draggingId;
      if (id) move(id, status);
      setDraggingId(null);
      setDragOver(null);
    },
    [canWrite, draggingId, move],
  );

  const filtersActive = query.trim() !== '' || source !== 'all';
  const clearFilters = () => {
    setQuery('');
    setSource('all');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        boxSizing: 'border-box',
        pt: 20,
        px: { xs: 4, md: 8 },
        pb: 4,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F8FAFC',
      }}
    >
      <Box aria-live="polite" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {announcement}
      </Box>

      <Typography variant="h1" sx={{ fontSize: 26, fontWeight: 800, color: '#0F172A' }}>
        {t(title)}
      </Typography>
      {description ? (
        <Typography sx={{ mt: 0.5, color: 'rgba(15,23,42,0.6)' }}>{t(description)}</Typography>
      ) : null}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mt: 3 }}
      >
        <Field
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('board.search')}
          inputProps={{ 'aria-label': t('board.search') }}
          sx={{ flex: 1, minWidth: 180, backgroundColor: '#FFFFFF' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" sx={{ color: 'rgba(15,23,42,0.45)' }} />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label={t('board.clearSearch')}
                  onClick={() => setQuery('')}
                >
                  <CloseRounded fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <Field
          select
          size="small"
          label={t('board.filterSource')}
          value={source}
          onChange={(event) => setSource(event.target.value)}
          sx={{ minWidth: 170, backgroundColor: '#FFFFFF' }}
        >
          <MenuItem value="all">{t('board.allSources')}</MenuItem>
          {sources.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Field>
        {filtersActive ? (
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={clearFilters}
            sx={{ fontSize: 13, color: 'rgba(15,23,42,0.6)', whiteSpace: 'nowrap' }}
          >
            {t('board.clearFilters')}
          </Link>
        ) : null}
        <Box sx={{ flex: { xs: 'unset', sm: 1 } }} />
        <Typography sx={{ fontSize: 13, color: 'rgba(15,23,42,0.55)', whiteSpace: 'nowrap' }}>
          {t('board.showing', { count: filtered.length, total: tickets.length })}
        </Typography>
        <IconButton aria-label={t('board.refresh')} onClick={() => setReload((value) => value + 1)}>
          <RefreshRounded />
        </IconButton>
        {canWrite ? (
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => setCreateOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {t('board.create')}
          </Button>
        ) : null}
      </Stack>

      {!canWrite ? (
        <Typography sx={{ mt: 1.5, fontSize: 13, color: 'rgba(15,23,42,0.5)' }}>
          {t('board.readOnly')}
        </Typography>
      ) : null}
      {errorNote ? (
        <Alert
          severity="error"
          onClose={() => setErrorNote('')}
          sx={{ mt: 2, py: 0 }}
          slotProps={{ closeButton: { 'aria-label': t('board.dismiss') } }}
        >
          {errorNote}
        </Alert>
      ) : null}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }} spacing={2}>
          <CircularProgress aria-label={t('board.loading')} />
          <Typography sx={{ color: 'rgba(15,23,42,0.6)' }}>{t('board.loading')}</Typography>
        </Stack>
      ) : error ? (
        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }} spacing={2}>
          <Typography sx={{ color: 'rgba(15,23,42,0.7)' }}>{t('board.loadFailed')}</Typography>
          <Link component="button" type="button" onClick={() => setReload((value) => value + 1)}>
            {t('board.retry')}
          </Link>
        </Stack>
      ) : tickets.length === 0 ? (
        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
          <Typography sx={{ color: 'rgba(15,23,42,0.6)' }}>{t('board.empty')}</Typography>
        </Stack>
      ) : (
        <Box
          sx={{
            mt: 3,
            flex: 1,
            minHeight: 0,
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            pb: 1,
          }}
        >
          {columns.map((status) => {
            const items = grouped[status] || [];
            const tone = toneFor(status);
            const active = dragOver === status;
            return (
              <Box
                key={status}
                component="section"
                aria-label={t('board.columnLabel', {
                  status: t(`board.statuses.${status}`),
                  count: items.length,
                })}
                onDragOver={(event) => {
                  if (!canWrite) return;
                  event.preventDefault();
                  setDragOver(status);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node))
                    setDragOver((current) => (current === status ? null : current));
                }}
                onDrop={(event) => handleDrop(status, event)}
                sx={{
                  flex: '0 0 300px',
                  maxWidth: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  borderRadius: 2,
                  backgroundColor: active ? tone.soft : 'rgba(15,23,42,0.03)',
                  outline: active ? `2px dashed ${tone.accent}` : '2px dashed transparent',
                  transition: 'background-color 120ms ease, outline-color 120ms ease',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ px: 2, py: 1.5, position: 'sticky', top: 0 }}
                >
                  <Box
                    sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: tone.accent }}
                  />
                  <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#0F172A', flex: 1 }}>
                    {t(`board.statuses.${status}`)}
                  </Typography>
                  <Chip
                    size="small"
                    label={items.length}
                    title={t('board.ticketCount', { count: items.length })}
                    sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                  />
                </Stack>
                <Stack
                  spacing={1.5}
                  sx={{ px: 2, pb: 2, overflowY: 'auto', flex: 1, minHeight: 0 }}
                >
                  {items.length === 0 ? (
                    <Box
                      sx={{
                        border: '1px dashed rgba(15,23,42,0.15)',
                        borderRadius: 2,
                        py: 3,
                        textAlign: 'center',
                        color: 'rgba(15,23,42,0.4)',
                        fontSize: 12,
                      }}
                    >
                      {filtersActive ? t('board.noResults') : t('board.columnEmpty')}
                    </Box>
                  ) : (
                    items.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        statuses={columns}
                        dragging={draggingId === ticket.id}
                        canWrite={canWrite}
                        onOpen={openTicket}
                        onMove={move}
                        onDragStart={(id, event) => {
                          if (event.dataTransfer) {
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData('text/plain', id);
                          }
                          setDraggingId(id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDragOver(null);
                        }}
                      />
                    ))
                  )}
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}

      <OrderCreateDialog
        open={createOpen}
        createUrl={data.source.url}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          setErrorNote('');
          setReload((value) => value + 1);
          setAnnouncement(t('board.created'));
        }}
      />
    </Box>
  );
}
