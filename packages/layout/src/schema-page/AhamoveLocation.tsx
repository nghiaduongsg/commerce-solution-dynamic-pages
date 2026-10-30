import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';

const Input = TextField as unknown as React.ComponentType<
  Omit<TextFieldProps<'outlined'>, 'variant'>
>;
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

export default function AhamoveLocation({
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
      <Typography variant="caption" key={i}>
        {source.provider}
        {source.providerUri?.startsWith('https://') && (
          <Link href={source.providerUri} target="_blank" rel="noopener noreferrer">
            {t('ahamove.source')}
          </Link>
        )}
      </Typography>
    ));
  return (
    <Stack spacing={1}>
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
        disabled={disabled || loading || query.trim().length < 3}
        onClick={() => void search()}
      >
        {t('ahamove.searchLocation')}
      </Button>
      {loading && <Typography role="status">{t('ahamove.searchingLocation')}</Typography>}
      {error && <Alert severity="error">{t(`ahamove.${error}`)}</Alert>}
      {searched && items.length === 0 && (
        <Typography role="status">{t('ahamove.noLocations')}</Typography>
      )}
      {items.map((choice) => (
        <Stack key={choice.id}>
          <Button
            type="button"
            disabled={disabled}
            sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
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
        <Alert severity="success">
          <Typography>{t('ahamove.locationSelected')}</Typography>
          <Typography>{selected.address}</Typography>
          <Typography variant="caption">
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
