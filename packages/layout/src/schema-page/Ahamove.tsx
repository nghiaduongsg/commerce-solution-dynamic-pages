import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import type { TextFieldProps } from '@mui/material/TextField';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import AhamoveLocation, { LocationChoice } from './AhamoveLocation';
import { AhamoveData } from './schemas/ahamove';
export { isAhamoveData } from './schemas/ahamove';
// Narrow MUI's generic variant to avoid TypeScript's combinatorial JSX union.
const Input = TextField as unknown as React.ComponentType<
  Omit<TextFieldProps<'outlined'>, 'variant'>
>;
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
  useEffect(() => {
    if (!quote) return;
    const timer = setTimeout(invalidateQuote, Math.max(0, quote.expires - Date.now()));
    return () => clearTimeout(timer);
  }, [quote]);
  const money = (amount: number) =>
    new Intl.NumberFormat(i18n.language.toLowerCase(), {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const label = (key: string) => t(`ahamove.${key}`);
  const endpoint = (id: string) => `${data.source.url}/${encodeURIComponent(id.trim())}`;
  const run = async (action: () => Promise<void>, mutation = false, failure = 'failed') => {
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
  };
  const read = async (id: string) => {
    const response = await axios.get(endpoint(id));
    if (typeof response.data?._id !== 'string' || typeof response.data?.status !== 'string')
      throw new Error('invalid_order');
    setOrder(response.data);
  };
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
  const field = (index: number, key: 'name' | 'mobile') => (
    <Input
      key={key}
      fullWidth
      label={label(key)}
      value={stops[index][key]}
      required
      type={key === 'mobile' ? 'tel' : 'text'}
      slotProps={{
        htmlInput: { pattern: key === 'mobile' ? '[+]?[0-9]{9,15}' : '.*\\S.*', maxLength: 500 },
      }}
      onChange={(e) =>
        setStops(stops.map((stop, i) => (i === index ? { ...stop, [key]: e.target.value } : stop)))
      }
    />
  );
  const sharedLink = safeTrackingLink(order?.shared_link);
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="overline" color="primary">
          {label('eyebrow')}
        </Typography>
        <Typography variant="h4" component="h1">
          {t(title)}
        </Typography>
        {description && <Typography color="text.secondary">{t(description)}</Typography>}
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {label(error)}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {label(notice)}
        </Alert>
      )}
      {busy && <Typography role="status">{label('loading')}</Typography>}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 3fr) minmax(0, 2fr)' },
          gap: 3,
        }}
      >
        <Paper
          variant="outlined"
          sx={{ p: 3 }}
          component="form"
          onSubmit={estimate}
          onChange={invalidateQuote}
        >
          <fieldset
            disabled={busy || created}
            style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
          >
            <Stack spacing={3}>
              <Typography variant="h6">{label('create')}</Typography>
              {stops.map((_, index) => (
                <Stack key={index} spacing={2}>
                  <Typography component="h2" variant="subtitle1">
                    {label(index === 0 ? 'pickup' : 'dropoff')}
                  </Typography>
                  <AhamoveLocation
                    url={data.source.url.replace(/\/orders$/, '/locations')}
                    query={stops[index].address}
                    selected={stops[index].location}
                    disabled={busy || created}
                    onQuery={(address) => {
                      invalidateQuote();
                      setStops(
                        stops.map((stop, i) =>
                          i === index
                            ? { ...stop, address, lat: '', lng: '', location: null }
                            : stop,
                        ),
                      );
                    }}
                    onSelect={(location) => {
                      invalidateQuote();
                      setStops(
                        stops.map((stop, i) =>
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
                    }}
                  />
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2,
                    }}
                  >
                    {(['name', 'mobile'] as const).map((key) => field(index, key))}
                  </Box>
                </Stack>
              ))}
              <Divider />
              <Input
                required
                label={label('service')}
                value={service}
                onChange={(e) => setService(e.target.value)}
                helperText={label('serviceHelp')}
                slotProps={{ htmlInput: { pattern: '[A-Z0-9-]+', maxLength: 80 } }}
              />
              <Input
                select
                label={label('payment')}
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              >
                {['CASH', 'BALANCE', 'CASH_BY_RECIPIENT'].map((method) => (
                  <MenuItem key={method} value={method}>
                    {label(method)}
                  </MenuItem>
                ))}
              </Input>
              <Box
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}
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
              <Typography variant="body2" color="text.secondary">
                {label('createHint')}
              </Typography>
              <Button type="submit" variant="contained" size="large">
                {label('getEstimate')}
              </Button>
              {quoteValid && (
                <Stack spacing={1}>
                  <Typography variant="subtitle1">{label('estimatedFee')}</Typography>
                  <Typography variant="h4">{money(quote.amount)}</Typography>
                  <Typography variant="body2">{label('quoteHint')}</Typography>
                  <Button type="button" variant="contained" onClick={() => setConfirmBooking(true)}>
                    {label('reviewBooking')}
                  </Button>
                </Stack>
              )}
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
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack
              spacing={2}
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                setOrder(null);
                void run(() => read(lookup));
              }}
            >
              <Typography variant="h6">{label('track')}</Typography>
              <Typography color="text.secondary" variant="body2">
                {label('trackHint')}
              </Typography>
              <Input
                label={label('orderId')}
                required
                disabled={busy}
                value={lookup}
                onChange={(e) => {
                  setLookup(e.target.value);
                  setOrder(null);
                }}
                slotProps={{ htmlInput: { pattern: '[A-Za-z0-9_-]{1,80}' } }}
              />
              <Button type="submit" variant="outlined" disabled={busy}>
                {label('refresh')}
              </Button>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              {!order ? (
                <Typography color="text.secondary">{label('empty')}</Typography>
              ) : (
                <>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6">{order._id}</Typography>
                    <Chip
                      label={label(
                        statuses.includes(order.status)
                          ? `statuses.${order.status}`
                          : 'unknownStatus',
                      )}
                    />
                  </Stack>
                  {typeof order.total_pay === 'number' && (
                    <Typography variant="h4">
                      {new Intl.NumberFormat(i18n.language.toLowerCase(), {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.total_pay)}
                    </Typography>
                  )}
                  {order.path?.map((stop, index) => (
                    <Box key={index}>
                      <Typography variant="overline">
                        {label(index === 0 ? 'pickup' : 'dropoff')}
                      </Typography>
                      <Typography>{stop.address}</Typography>
                      <Typography color="text.secondary">
                        {stop.name} · {stop.mobile}
                      </Typography>
                    </Box>
                  ))}
                  {order.supplier_name && (
                    <Typography>{t('ahamove.driver', { name: order.supplier_name })}</Typography>
                  )}
                  {sharedLink ? (
                    <Button
                      component="a"
                      href={sharedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label('journey')}
                    </Button>
                  ) : (
                    <Button
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const response = await axios.get(`${endpoint(order._id)}/shared-link`);
                          const link = safeTrackingLink(response.data?.shared_link);
                          if (!link) throw new Error('invalid_link');
                          setOrder({ ...order, shared_link: link });
                        })
                      }
                    >
                      {label('getLink')}
                    </Button>
                  )}
                  <Divider />
                  <Button
                    color="error"
                    disabled={busy || !cancellable.includes(order.status)}
                    onClick={() => setCancel(true)}
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
          <Stack spacing={2}>
            <Typography>{label('estimatedFee')}</Typography>
            <Typography variant="h4">{quote && money(quote.amount)}</Typography>
            <Typography>{label('quoteHint')}</Typography>
            {stops.map((stop, index) => (
              <Box key={index}>
                <Typography variant="subtitle2">
                  {label(index === 0 ? 'pickup' : 'dropoff')}
                </Typography>
                <Typography>{stop.address}</Typography>
              </Box>
            ))}
            <Typography>{service}</Typography>
            <Typography>{label(payment)}</Typography>
            <Typography>{t('ahamove.codSummary', { amount: money(Number(cod)) })}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setConfirmBooking(false)}>
            {label('backToDetails')}
          </Button>
          <Button variant="contained" disabled={busy || !quoteValid} onClick={book}>
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
