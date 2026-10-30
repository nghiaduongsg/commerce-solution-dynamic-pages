import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import type { TextFieldProps } from '@mui/material/TextField';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonRounded from '@mui/icons-material/PersonRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';

import AhamoveLocation, { LocationChoice } from './AhamoveLocation';
import { AhamoveData } from './schemas/ahamove';
export { isAhamoveData } from './schemas/ahamove';
// Narrow MUI's generic variant to avoid TypeScript's combinatorial JSX union.
const Input = TextField as unknown as React.ComponentType<
  Omit<TextFieldProps<'outlined'>, 'variant'>
>;
// Fixed Ahamove-style brand accents. Static strings keep sx cheap to serialise
// on the frequent form re-renders instead of re-running theme callbacks.
const BRAND = '#00B14F';
const BRAND_DARK = '#007A36';
const BRAND_SOFT = 'rgba(0,177,79,0.08)';
const HAIRLINE = 'rgba(0,0,0,0.12)';
const DISABLED_BG = 'rgba(0,0,0,0.12)';
const DISABLED_TEXT = 'rgba(0,0,0,0.38)';
type Stop = {
  address: string;
  name: string;
  mobile: string;
  lat: string;
  lng: string;
  location: LocationChoice | null;
};
const emptyStop = (): Stop => ({
  address: '',
  name: '',
  mobile: '',
  lat: '',
  lng: '',
  location: null,
});
const cancellable = ['IDLE', 'ASSIGNING', 'ACCEPTED', 'CONFIRMING', 'PAYING'];
const statuses = [...cancellable, 'IN_PROCESS', 'COMPLETED', 'CANCELLED'];
const payments = ['CASH', 'BALANCE', 'CASH_BY_RECIPIENT'];
// Status pill colour by lifecycle stage; the chip text stays a translation key.
const statusStyle = (status: string): { color: string; bg: string } =>
  status === 'COMPLETED'
    ? { color: '#027D3F', bg: 'rgba(2,125,63,0.14)' }
    : status === 'CANCELLED'
      ? { color: '#CC071E', bg: 'rgba(204,7,30,0.12)' }
      : status === 'IN_PROCESS'
        ? { color: '#0872E2', bg: 'rgba(8,114,226,0.12)' }
        : { color: '#B45309', bg: 'rgba(180,83,9,0.14)' };
type Order = {
  _id: string;
  status: string;
  total_pay?: number;
  path?: Stop[];
  supplier_name?: string;
  supplier_id?: string;
  shared_link?: string;
};
export function safeTrackingLink(value: unknown): string | undefined {
  try {
    const url = new URL(String(value));
    if (
      url.protocol === 'https:' &&
      ['express.ahamove.com', 'expressstg.ahamove.com'].includes(url.hostname)
    )
      return url.href;
  } catch {
    /* Missing or invalid provider link. */
  }
  return undefined;
}

// A selectable payment tile. Memoised with stable props so typing elsewhere in
// the form never re-renders it, and kept to two DOM nodes to keep the tests'
// accessibility queries (which walk the whole tree) fast.
const OptionCard = memo(function OptionCard({
  selected,
  disabled,
  value,
  onSelect,
  title,
}: {
  selected: boolean;
  disabled: boolean;
  value: string;
  onSelect: (value: string) => void;
  title: string;
}) {
  return (
    <ButtonBase
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={() => onSelect(value)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        p: 1.5,
        borderRadius: 3,
        border: 2,
        fontWeight: 600,
        fontSize: '0.875rem',
        textAlign: 'left',
        color: selected ? BRAND : 'text.primary',
        borderColor: selected ? BRAND : 'divider',
        bgcolor: selected ? BRAND_SOFT : 'background.paper',
        transition: 'border-color .15s ease, background-color .15s ease',
        '&:hover': { borderColor: selected ? BRAND : 'text.disabled' },
        '&.Mui-disabled': { opacity: 0.5 },
      }}
    >
      {title}
    </ButtonBase>
  );
});

// Tracking + live status column. Memoised so booking-form keystrokes, which do
// not touch any of its props, never trigger a re-render of this subtree.
const TrackPanel = memo(function TrackPanel({
  lookup,
  order,
  busy,
  label,
  money,
  t,
  onLookupChange,
  onTrack,
  onGetLink,
  onOpenCancel,
}: {
  lookup: string;
  order: Order | null;
  busy: boolean;
  label: (key: string) => string;
  money: (amount: number) => string;
  t: (key: string, options?: Record<string, unknown>) => string;
  onLookupChange: (value: string) => void;
  onTrack: () => void;
  onGetLink: (order: Order) => void;
  onOpenCancel: () => void;
}) {
  const sharedLink = safeTrackingLink(order?.shared_link);
  return (
    <Stack spacing={{ xs: 2, md: 3 }} sx={{ position: { md: 'sticky' }, top: { md: 16 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, boxShadow: 'none' }}>
        <Stack
          spacing={2}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            onTrack();
          }}
        >
          <Typography
            component="h2"
            variant="subtitle1"
            sx={{ fontWeight: 700, pl: 1.5, borderLeft: 3, borderColor: BRAND, lineHeight: 1.2 }}
          >
            {label('track')}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {label('trackHint')}
          </Typography>
          <Input
            label={label('orderId')}
            required
            disabled={busy}
            value={lookup}
            onChange={(e) => onLookupChange(e.target.value)}
            slotProps={{ htmlInput: { pattern: '[A-Za-z0-9_\\-]{1,80}' } }}
          />
          <Button type="submit" variant="outlined" disabled={busy}>
            {label('refresh')}
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, boxShadow: 'none' }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 700 }}>
            {label('summaryTitle')}
          </Typography>
          {!order ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              {label('empty')}
            </Typography>
          ) : (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    {label('orderRef')}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, fontFamily: 'monospace', wordBreak: 'break-all' }}
                  >
                    {order._id}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    color: statusStyle(order.status).color,
                    bgcolor: statusStyle(order.status).bg,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: statusStyle(order.status).color,
                    }}
                  />
                  {label(
                    statuses.includes(order.status) ? `statuses.${order.status}` : 'unknownStatus',
                  )}
                </Box>
              </Stack>
              {typeof order.total_pay === 'number' && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {label('totalPaid')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {money(order.total_pay)}
                  </Typography>
                </Box>
              )}
              {order.path && order.path.length > 0 && (
                <Stack spacing={2}>
                  {order.path.map((stop, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1.5 }}>
                      <Box
                        aria-hidden
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          pt: '6px',
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: index === 0 ? '50%' : '3px',
                            bgcolor: index === 0 ? BRAND : 'text.primary',
                          }}
                        />
                        {index < order.path!.length - 1 && (
                          <Box
                            sx={{
                              flexGrow: 1,
                              width: '2px',
                              my: 0.5,
                              minHeight: 20,
                              bgcolor: 'divider',
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="overline"
                          sx={{ color: 'text.secondary', fontWeight: 700 }}
                        >
                          {label(index === 0 ? 'pickup' : 'dropoff')}
                        </Typography>
                        <Typography sx={{ wordBreak: 'break-word' }}>{stop.address}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {stop.name} · {stop.mobile}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
              {order.supplier_name && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonRounded fontSize="small" color="action" />
                  <Typography>{t('ahamove.driver', { name: order.supplier_name })}</Typography>
                </Stack>
              )}
              {sharedLink ? (
                <Button
                  component="a"
                  href={sharedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<OpenInNewRounded />}
                >
                  {label('journey')}
                </Button>
              ) : (
                <Button variant="outlined" disabled={busy} onClick={() => onGetLink(order)}>
                  {label('getLink')}
                </Button>
              )}
              <Divider />
              <Button
                color="error"
                variant="outlined"
                disabled={busy || !cancellable.includes(order.status)}
                onClick={onOpenCancel}
              >
                {label('cancel')}
              </Button>
              <Typography variant="caption" color="text.secondary">
                {label('cancelHint')}
              </Typography>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
});

// One pickup/drop-off stop: timeline marker, location search and contact fields.
// Memoised on its own stop so editing one stop never re-renders the other.
const StopFields = memo(function StopFields({
  index,
  stop,
  url,
  locked,
  label,
  onQuery,
  onSelect,
  onContactChange,
}: {
  index: number;
  stop: Stop;
  url: string;
  locked: boolean;
  label: (key: string) => string;
  onQuery: (value: string) => void;
  onSelect: (value: LocationChoice) => void;
  onContactChange: (index: number, key: 'name' | 'mobile', value: string) => void;
}) {
  return (
    <Stack spacing={1.5} sx={{ minWidth: 0 }}>
      <Typography
        variant="overline"
        sx={{
          fontWeight: 700,
          color: 'text.secondary',
          pl: 1.5,
          borderLeft: 6,
          borderColor: index === 0 ? BRAND : 'text.primary',
          lineHeight: 1.6,
        }}
      >
        {label(index === 0 ? 'pickup' : 'dropoff')}
      </Typography>
      <AhamoveLocation
        url={url}
        query={stop.address}
        selected={stop.location}
        disabled={locked}
        onQuery={onQuery}
        onSelect={onSelect}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {(['name', 'mobile'] as const).map((key) => (
          <Input
            key={key}
            fullWidth
            label={label(key)}
            value={stop[key]}
            required
            type={key === 'mobile' ? 'tel' : 'text'}
            slotProps={{
              htmlInput: {
                pattern: key === 'mobile' ? '[+]?[0-9]{9,15}' : '.*\\S.*',
                maxLength: 500,
              },
            }}
            onChange={(e) => onContactChange(index, key, e.target.value)}
          />
        ))}
      </Box>
    </Stack>
  );
});

export default function Ahamove({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: AhamoveData;
}) {
  const { t, i18n } = useTranslation('workspace');
  const [stops, setStops] = useState([emptyStop(), emptyStop()]);
  const [service, setService] = useState('SGN-BIKE');
  const [payment, setPayment] = useState('CASH');
  const [cod, setCod] = useState('0');
  const [value, setValue] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [tracking, setTracking] = useState('');
  const [lookup, setLookup] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cancel, setCancel] = useState(false);
  const [comment, setComment] = useState('');
  const [quote, setQuote] = useState<{
    amount: number;
    payload: any;
    fingerprint: string;
    expires: number;
  } | null>(null);
  const [confirmBooking, setConfirmBooking] = useState(false);
  const invalidateQuote = () => {
    setQuote(null);
    setConfirmBooking(false);
  };
  // Stable handlers (setters + functional updates) so memoised children don't
  // re-render on every keystroke elsewhere in the form.
  const selectPayment = useCallback((next: string) => {
    setQuote(null);
    setConfirmBooking(false);
    setPayment(next);
  }, []);
  const changeContact = useCallback((index: number, key: 'name' | 'mobile', next: string) => {
    setStops((prev) => prev.map((stop, i) => (i === index ? { ...stop, [key]: next } : stop)));
  }, []);
  const locationHandlers = useMemo(
    () =>
      [0, 1].map((index) => ({
        onQuery: (address: string) => {
          setQuote(null);
          setConfirmBooking(false);
          setStops((prev) =>
            prev.map((stop, i) =>
              i === index ? { ...stop, address, lat: '', lng: '', location: null } : stop,
            ),
          );
        },
        onSelect: (location: LocationChoice) => {
          setQuote(null);
          setConfirmBooking(false);
          setStops((prev) =>
            prev.map((stop, i) =>
              i === index
                ? {
                    ...stop,
                    address: location.address,
                    lat: String(location.lat),
                    lng: String(location.lng),
                    location,
                  }
                : stop,
            ),
          );
        },
      })),
    [],
  );
  useEffect(() => {
    if (!quote) return;
    const timer = setTimeout(invalidateQuote, Math.max(0, quote.expires - Date.now()));
    return () => clearTimeout(timer);
  }, [quote]);
  const money = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(i18n.language.toLowerCase(), {
        style: 'currency',
        currency: 'VND',
      }).format(amount),
    [i18n.language],
  );
  const label = useCallback((key: string) => t(`ahamove.${key}`), [t]);
  const endpoint = useCallback(
    (id: string) => `${data.source.url}/${encodeURIComponent(id.trim())}`,
    [data.source.url],
  );
  const run = useCallback(
    async (action: () => Promise<void>, mutation = false, failure = 'failed') => {
      setBusy(true);
      setError('');
      setNotice('');
      try {
        await action();
      } catch (e: any) {
        const status = e.response?.status;
        setError(
          status === 503
            ? 'unconfigured'
            : failure === 'quoteFailed' && status !== 403
              ? failure
              : status === 404
                ? 'notFound'
                : status === 406
                  ? 'cannotCancel'
                  : status === 403
                    ? 'forbidden'
                    : mutation && (!status || status >= 500)
                      ? 'uncertain'
                      : failure,
        );
      } finally {
        setBusy(false);
      }
    },
    [],
  );
  const read = useCallback(
    async (id: string) => {
      const response = await axios.get(endpoint(id));
      if (typeof response.data?._id !== 'string' || typeof response.data?.status !== 'string')
        throw new Error('invalid_order');
      setOrder(response.data);
    },
    [endpoint],
  );
  // Stable handlers for the memoised tracking panel.
  const changeLookup = useCallback((next: string) => {
    setLookup(next);
    setOrder(null);
  }, []);
  const trackOrder = useCallback(() => {
    setOrder(null);
    void run(() => read(lookup));
  }, [run, read, lookup]);
  const openCancel = useCallback(() => setCancel(true), []);
  const getSharedLink = useCallback(
    (current: Order) =>
      void run(async () => {
        const response = await axios.get(`${endpoint(current._id)}/shared-link`);
        const link = safeTrackingLink(response.data?.shared_link);
        if (!link) throw new Error('invalid_link');
        setOrder({ ...current, shared_link: link });
      }),
    [run, endpoint],
  );
  const payload = {
    order_time: 0,
    path: stops.map((stop, index) => ({
      address: stop.address.trim(),
      name: stop.name.trim(),
      mobile: stop.mobile.trim(),
      lat: Number(stop.lat),
      lng: Number(stop.lng),
      ...(index === 1
        ? {
            cod: Number(cod),
            item_value: Number(value),
            ...(tracking.trim() ? { tracking_number: tracking.trim() } : {}),
          }
        : {}),
    })),
    service_id: service.trim(),
    requests: [],
    payment_method: payment,
    remarks,
  };
  const fingerprint = JSON.stringify(payload);
  const quoteValid = quote && quote.fingerprint === fingerprint && quote.expires > Date.now();
  const estimate = (event: React.FormEvent) => {
    event.preventDefault();
    invalidateQuote();
    if (stops.some((stop) => !stop.location)) {
      setError('selectLocations');
      return;
    }
    void run(
      async () => {
        const { service_id, requests, ...details } = payload;
        const response = await axios.post(`${data.source.url}/estimates`, {
          ...details,
          services: [{ _id: service_id, requests }],
        });
        const result = Array.isArray(response.data)
          ? response.data.find((item) => item.service_id === service_id)
          : undefined;
        const amount = result?.data?.total_price;
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0 || result.error)
          throw new Error('invalid_quote');
        setQuote({ amount, payload, fingerprint, expires: Date.now() + 120000 });
      },
      false,
      'quoteFailed',
    );
  };
  const book = () => {
    if (!quoteValid || busy || created) {
      invalidateQuote();
      return;
    }
    const accepted = quote;
    void run(async () => {
      const response = await axios.post(data.source.url, accepted.payload);
      const id = response.data?.order_id;
      if (typeof id !== 'string') throw new Error('invalid_order');
      setLookup(id);
      setCreated(true);
      invalidateQuote();
      setOrder({
        ...response.data.order,
        _id: id,
        status: response.data.status,
        shared_link: response.data.shared_link,
      });
      setNotice('created');
    }, true);
  };
  const locked = busy || created;
  const locationsUrl = useMemo(
    () => data.source.url.replace(/\/orders$/, '/locations'),
    [data.source.url],
  );
  // A section heading with a leading green accent bar. Kept to a single node
  // because every element here is walked by the tests' accessibility queries.
  const sectionHeading = (text: string) => (
    <Typography
      component="h2"
      variant="subtitle1"
      sx={{ fontWeight: 700, pl: 1.5, borderLeft: 3, borderColor: BRAND, lineHeight: 1.2 }}
    >
      {text}
    </Typography>
  );
  // Service, payment and package sections don't depend on the route fields, so
  // memoise them to skip re-rendering while addresses and contacts are typed.
  const deliveryOptions = useMemo(
    () => (
      <>
        <Divider />

        {/* Service */}
        <Stack spacing={1.5}>
          {sectionHeading(label('serviceTitle'))}
          <Input
            required
            label={label('service')}
            value={service}
            onChange={(e) => setService(e.target.value)}
            helperText={label('serviceHelp')}
            slotProps={{ htmlInput: { pattern: '[A-Z0-9\\-]+', maxLength: 80 } }}
          />
        </Stack>

        <Divider />

        {/* Payment */}
        <Stack spacing={1.5}>
          {sectionHeading(label('paymentTitle'))}
          <Box
            role="radiogroup"
            aria-label={label('payment')}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            {payments.map((option) => (
              <OptionCard
                key={option}
                title={label(option)}
                value={option}
                selected={payment === option}
                disabled={locked}
                onSelect={selectPayment}
              />
            ))}
          </Box>
        </Stack>

        <Divider />

        {/* Package */}
        <Stack spacing={2}>
          {sectionHeading(label('packageTitle'))}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            {[
              ['cod', cod, setCod],
              ['itemValue', value, setValue],
            ].map(([key, amount, setter]: any) => (
              <Input
                key={key}
                label={label(key)}
                required
                type="number"
                value={amount}
                onChange={(e) => setter(e.target.value)}
                slotProps={{ htmlInput: { min: 0, step: 1, max: 1000000000 } }}
              />
            ))}
          </Box>
          <Input
            label={label('trackingNumber')}
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
          <Input
            label={label('remarks')}
            multiline
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Stack>
      </>
    ),
    [service, payment, cod, value, tracking, remarks, locked, label, selectPayment],
  );
  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1240, mx: 'auto' }}>
      {/* Brand hero band */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          mb: 3,
          color: '#fff',
          background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND} 100%)`,
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 2 }}>
          {label('brand')} · {label('heroPill')}
        </Typography>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#fff' }}>
          {t(title)}
        </Typography>
        {description && (
          <Typography sx={{ mt: 0.5, maxWidth: 560, opacity: 0.92 }}>{t(description)}</Typography>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {label(error)}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
          {label(notice)}
        </Alert>
      )}
      {busy && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress sx={{ borderRadius: 999 }} />
          <Typography role="status" variant="caption" color="text.secondary">
            {label('loading')}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.55fr) minmax(0, 1fr)' },
          gap: { xs: 2, md: 3 },
          alignItems: 'start',
        }}
      >
        {/* Booking */}
        <Paper
          variant="outlined"
          sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, boxShadow: 'none' }}
          component="form"
          onSubmit={estimate}
          onChange={invalidateQuote}
        >
          <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {label('create')}
              </Typography>

              {/* Route timeline */}
              <Stack spacing={2.5}>
                {sectionHeading(label('routeTitle'))}
                {stops.map((stop, index) => (
                  <StopFields
                    key={index}
                    index={index}
                    stop={stop}
                    url={locationsUrl}
                    locked={locked}
                    label={label}
                    onQuery={locationHandlers[index].onQuery}
                    onSelect={locationHandlers[index].onSelect}
                    onContactChange={changeContact}
                  />
                ))}
              </Stack>

              {deliveryOptions}

              {/* Fare + primary action */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: 2,
                  borderColor: quoteValid ? BRAND : HAIRLINE,
                  bgcolor: quoteValid ? BRAND_SOFT : 'transparent',
                }}
              >
                <Stack spacing={1.5}>
                  {quoteValid ? (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Stack>
                        <Typography variant="caption" color="text.secondary">
                          {label('estimatedFee')}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: BRAND_DARK }}>
                          {money(quote.amount)}
                        </Typography>
                      </Stack>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {label('createHint')}
                    </Typography>
                  )}
                  {quoteValid && (
                    <Typography variant="caption" color="text.secondary">
                      {label('quoteHint')}
                    </Typography>
                  )}
                  {quoteValid ? (
                    <Button
                      type="button"
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={() => setConfirmBooking(true)}
                      sx={{
                        bgcolor: BRAND,
                        borderColor: BRAND,
                        color: '#fff',
                        borderRadius: 3,
                        '&:hover': { bgcolor: BRAND_DARK, borderColor: BRAND_DARK },
                      }}
                    >
                      {label('reviewBooking')}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        bgcolor: BRAND,
                        borderColor: BRAND,
                        color: '#fff',
                        borderRadius: 3,
                        '&:hover': { bgcolor: BRAND_DARK, borderColor: BRAND_DARK },
                        '&.Mui-disabled': {
                          bgcolor: DISABLED_BG,
                          borderColor: DISABLED_BG,
                          color: DISABLED_TEXT,
                        },
                      }}
                    >
                      {label('getEstimate')}
                    </Button>
                  )}
                </Stack>
              </Box>
            </Stack>
          </fieldset>
          {created && (
            <Button
              sx={{ mt: 2 }}
              onClick={() => {
                invalidateQuote();
                setCreated(false);
                setStops([emptyStop(), emptyStop()]);
                setTracking('');
                setRemarks('');
                setCod('0');
                setValue('0');
              }}
            >
              {label('another')}
            </Button>
          )}
        </Paper>

        <TrackPanel
          lookup={lookup}
          order={order}
          busy={busy}
          label={label}
          money={money}
          t={t}
          onLookupChange={changeLookup}
          onTrack={trackOrder}
          onGetLink={getSharedLink}
          onOpenCancel={openCancel}
        />
      </Box>

      <Dialog
        open={confirmBooking && !!quoteValid}
        onClose={() => {
          if (!busy) setConfirmBooking(false);
        }}
        fullWidth
        maxWidth="sm"
        aria-labelledby="ahamove-booking-title"
      >
        <DialogTitle id="ahamove-booking-title">{label('reviewBooking')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Box sx={{ p: 2, borderRadius: 3, bgcolor: BRAND_SOFT }}>
              <Typography variant="caption" color="text.secondary">
                {label('estimatedFee')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: BRAND_DARK }}>
                {quote && money(quote.amount)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {label('quoteHint')}
            </Typography>
            {stops.map((stop, index) => (
              <Typography
                key={index}
                sx={{
                  pl: 1.5,
                  borderLeft: 6,
                  borderColor: index === 0 ? BRAND : 'text.primary',
                }}
              >
                <Typography component="span" variant="caption" color="text.secondary" display="block">
                  {label(index === 0 ? 'pickup' : 'dropoff')}
                </Typography>
                {stop.address}
              </Typography>
            ))}
            <Divider />
            <Typography color="text.secondary" variant="body2">
              {label('serviceTitle')}: {service} · {label(payment)}
            </Typography>
            <Typography>{t('ahamove.codSummary', { amount: money(Number(cod)) })}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setConfirmBooking(false)}>
            {label('backToDetails')}
          </Button>
          <Button
            variant="contained"
            disabled={busy || !quoteValid}
            onClick={book}
            sx={{
              bgcolor: BRAND,
              borderColor: BRAND,
              color: '#fff',
              '&:hover': { bgcolor: BRAND_DARK, borderColor: BRAND_DARK },
              '&.Mui-disabled': {
                bgcolor: DISABLED_BG,
                borderColor: DISABLED_BG,
                color: DISABLED_TEXT,
              },
            }}
          >
            {label('confirmBooking')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={cancel}
        onClose={() => {
          if (!busy) setCancel(false);
        }}
        fullWidth
        maxWidth="sm"
        aria-labelledby="ahamove-cancel-title"
      >
        <DialogTitle id="ahamove-cancel-title">{label('confirmCancel')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography>{t('ahamove.cancelWarning', { id: order?._id })}</Typography>
            <Input
              autoFocus
              label={label('reason')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={busy}
              required
              multiline
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setCancel(false)}>
            {label('keep')}
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={busy || !comment.trim()}
            onClick={() =>
              void run(async () => {
                if (!order) return;
                await axios.delete(endpoint(order._id), { data: { comment: comment.trim() } });
                setOrder({ ...order, status: 'CANCELLED' });
                setCancel(false);
                setComment('');
                setNotice('cancelled');
              }, true)
            }
          >
            {label('confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
