import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Button,
  CircularProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import type { TextFieldProps } from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';

const Input = TextField as unknown as React.ComponentType<
  Omit<TextFieldProps<'outlined'>, 'variant'>
>;
// Static Ahamove-style accents keep the frequently re-rendered picker cheap.
const BRAND = '#00B14F';
const BRAND_SOFT = 'rgba(0,177,79,0.08)';
const BRAND_HOVER = 'rgba(0,177,79,0.1)';
const BRAND_BORDER = 'rgba(0,177,79,0.45)';
export type LocationChoice = {
  id: string;
  address: string;
  lat: number;
  lng: number;
  attributions?: { provider: string; providerUri: string }[];
};
export function isLocation(value: any): value is LocationChoice {
  return (
    typeof value?.id === 'string' &&
    !!value.id &&
    typeof value.address === 'string' &&
    !!value.address.trim() &&
    Number.isFinite(value.lat) &&
    Math.abs(value.lat) <= 90 &&
    Number.isFinite(value.lng) &&
    Math.abs(value.lng) <= 180 &&
    (value.attributions === undefined ||
      (Array.isArray(value.attributions) &&
        value.attributions.every(
          (a: any) => typeof a?.provider === 'string' && typeof a.providerUri === 'string',
        )))
  );
}

function AhamoveLocation({
  url,
  query,
  selected,
  onQuery,
  onSelect,
  disabled,
}: {
  url: string;
  query: string;
  selected: LocationChoice | null;
  onQuery: (value: string) => void;
  onSelect: (value: LocationChoice) => void;
  disabled: boolean;
}) {
  const { t, i18n } = useTranslation('workspace');
  const [items, setItems] = useState<LocationChoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const request = useRef<AbortController | null>(null);
  const revision = useRef(0);
  const reset = useCallback(() => {
    revision.current++;
    request.current?.abort();
    setItems([]);
    setSearched(false);
    setError('');
    setLoading(false);
  }, []);
  useEffect(() => {
    reset();
  }, [query, url, i18n.language, reset]);
  useEffect(
    () => () => {
      revision.current++;
      request.current?.abort();
    },
    [],
  );
  const search = async () => {
    reset();
    if (query.trim().length < 3 || disabled) return;
    const current = revision.current;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    try {
      const response = await axios.get(url, {
        params: { q: query.trim(), language: i18n.language.toLowerCase() },
        signal: controller.signal,
      });
      if (!Array.isArray(response.data?.items)) throw new Error('invalid_locations');
      if (current !== revision.current) return;
      setItems(response.data.items.filter(isLocation).slice(0, 5));
      setSearched(true);
    } catch (e: any) {
      if (current === revision.current && !controller.signal.aborted)
        setError(e.response?.status === 503 ? 'locationUnconfigured' : 'locationFailed');
    } finally {
      if (current === revision.current) setLoading(false);
    }
  };
  const attribution = (choice: LocationChoice) =>
    choice.attributions?.map((source, i) => (
      <Typography variant="caption" color="text.secondary" key={i}>
        {source.provider}
        {source.providerUri?.startsWith('https://') && (
          <Link href={source.providerUri} target="_blank" rel="noopener noreferrer" sx={{ ml: 0.5 }}>
            {t('ahamove.source')}
          </Link>
        )}
      </Typography>
    ));
  return (
    <Stack spacing={1.5}>
      <Input
        fullWidth
        required
        label={t('ahamove.address')}
        value={query}
        disabled={disabled}
        helperText={t('ahamove.locationHelp')}
        slotProps={{ htmlInput: { maxLength: 500 } }}
        onChange={(event) => {
          reset();
          onQuery(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            void search();
          }
        }}
      />
      <Button
        type="button"
        variant="outlined"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchRounded />}
        disabled={disabled || loading || query.trim().length < 3}
        onClick={() => void search()}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('ahamove.searchLocation')}
      </Button>
      {loading && (
        <Typography role="status" variant="body2" color="text.secondary">
          {t('ahamove.searchingLocation')}
        </Typography>
      )}
      {error && <Alert severity="error">{t(`ahamove.${error}`)}</Alert>}
      {searched && items.length === 0 && (
        <Typography role="status" variant="body2" color="text.secondary">
          {t('ahamove.noLocations')}
        </Typography>
      )}
      {items.map((choice) => (
        <Stack key={choice.id} spacing={0.25}>
          <Button
            type="button"
            fullWidth
            disabled={disabled}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              textTransform: 'none',
              letterSpacing: 'normal',
              color: 'text.primary',
              borderColor: 'divider',
              borderRadius: 2,
              px: 2,
              py: 1.25,
              '&:hover,&:focus': { borderColor: BRAND, backgroundColor: BRAND_HOVER },
            }}
            onClick={() => {
              reset();
              onSelect(choice);
            }}
          >
            {choice.address}
          </Button>
          {attribution(choice)}
        </Stack>
      ))}
      {selected && (
        <Alert
          severity="success"
          icon={<CheckCircleRounded fontSize="inherit" />}
          sx={{ borderRadius: 2, borderColor: BRAND_BORDER, bgcolor: BRAND_SOFT }}
        >
          <Typography variant="subtitle2" sx={{ color: BRAND, fontWeight: 700 }}>
            {t('ahamove.locationSelected')}
          </Typography>
          <Typography sx={{ color: 'text.primary' }}>{selected.address}</Typography>
          <Typography variant="caption" color="text.secondary">
            {t('ahamove.coordinates', {
              latitude: new Intl.NumberFormat(i18n.language.toLowerCase(), {
                maximumFractionDigits: 7,
              }).format(selected.lat),
              longitude: new Intl.NumberFormat(i18n.language.toLowerCase(), {
                maximumFractionDigits: 7,
              }).format(selected.lng),
            })}
          </Typography>
          {attribution(selected)}
        </Alert>
      )}
      {(items.length > 0 || selected) && (
        <Typography
          variant="caption"
          translate="no"
          sx={{
            whiteSpace: 'nowrap',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            letterSpacing: 'normal',
            color: '#5E5E5E',
          }}
        >
          {t('ahamove.googleMaps')}
        </Typography>
      )}
    </Stack>
  );
}

export default React.memo(AhamoveLocation);
