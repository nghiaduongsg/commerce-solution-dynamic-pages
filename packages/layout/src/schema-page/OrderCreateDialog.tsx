import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import AddRounded from '@mui/icons-material/AddRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';

const Field = TextField as unknown as React.ComponentType<Omit<TextFieldProps<'outlined'>, 'variant'>>;

type ItemRow = { name: string; sku: string; quantity: string; unitPrice: string };
const emptyItem = (): ItemRow => ({ name: '', sku: '', quantity: '1', unitPrice: '' });

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
const toMinor = (value: string, currency: string): number =>
  Math.round((Number(value) || 0) * Math.pow(10, fractionDigits(currency)));

export default function OrderCreateDialog({
  open,
  createUrl,
  onClose,
  onCreated,
}: {
  open: boolean;
  createUrl: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation('workspace');
  const [source, setSource] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [customer, setCustomer] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemRow[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setSource('');
    setCurrency('USD');
    setCustomer('');
    setReference('');
    setNotes('');
    setItems([emptyItem()]);
    setError('');
    setSubmitting(false);
  };
  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };
  const setItem = (index: number, patch: Partial<ItemRow>) =>
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const submit = async () => {
    const valid = items.filter((item) => item.name.trim() && Number(item.quantity) > 0);
    if (valid.length === 0) {
      setError(t('board.needItem'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axios.post(createUrl, {
        source: source.trim(),
        currency: currency.trim() || 'USD',
        customer_external_id: customer.trim(),
        external_reference: reference.trim(),
        notes: notes.trim(),
        items: valid.map((item) => ({
          name: item.name.trim(),
          sku: item.sku.trim(),
          quantity: Number(item.quantity),
          unit_price_minor: toMinor(item.unitPrice, currency),
        })),
      });
      reset();
      onCreated();
    } catch {
      setSubmitting(false);
      setError(t('board.createFailed'));
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>{t('board.newOrder')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Field
              size="small"
              fullWidth
              label={t('board.fieldSource')}
              value={source}
              onChange={(event) => setSource(event.target.value)}
            />
            <Field
              size="small"
              label={t('board.fieldCurrency')}
              value={currency}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              sx={{ width: { xs: '100%', sm: 120 } }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Field
              size="small"
              fullWidth
              label={t('board.fieldCustomer')}
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
            />
            <Field
              size="small"
              fullWidth
              label={t('board.fieldReference')}
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </Stack>
          <Field
            size="small"
            fullWidth
            label={t('board.fieldNotes')}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />

          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                {t('board.items')}
              </Typography>
              <Button
                size="small"
                startIcon={<AddRounded />}
                onClick={() => setItems((rows) => [...rows, emptyItem()])}
              >
                {t('board.addItem')}
              </Button>
            </Stack>
            <Stack spacing={1}>
              {items.map((item, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <Field
                    size="small"
                    label={t('board.itemName')}
                    value={item.name}
                    onChange={(event) => setItem(index, { name: event.target.value })}
                    sx={{ flex: 1 }}
                  />
                  <Field
                    size="small"
                    type="number"
                    label={t('board.itemQty')}
                    value={item.quantity}
                    onChange={(event) => setItem(index, { quantity: event.target.value })}
                    sx={{ width: 72 }}
                  />
                  <Field
                    size="small"
                    type="number"
                    label={t('board.itemPrice')}
                    value={item.unitPrice}
                    onChange={(event) => setItem(index, { unitPrice: event.target.value })}
                    sx={{ width: 104 }}
                  />
                  <IconButton
                    size="small"
                    aria-label={t('board.removeItem')}
                    disabled={items.length === 1}
                    onClick={() => setItems((rows) => rows.filter((_, i) => i !== index))}
                  >
                    <CloseRounded fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={close} disabled={submitting} color="inherit">
          {t('board.cancel')}
        </Button>
        <Button onClick={submit} disabled={submitting} variant="contained">
          {submitting ? t('board.creating') : t('board.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
