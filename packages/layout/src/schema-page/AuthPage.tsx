import React, { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import {
  ArrowForwardRounded,
  CheckRounded,
  LockRounded,
  StorefrontRounded,
  VisibilityOffRounded,
  VisibilityRounded,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  AUTH_ERROR_CODES,
  AuthActionError,
  AuthErrorCode,
  useAuthAdapter,
} from './auth/AuthAdapter';
import { AuthData } from './schemas/auth';

type Field = 'displayName' | 'email' | 'password' | 'confirmPassword';
type Values = Record<Field, string>;
type FieldErrors = Partial<Record<Field, string>>;
type ActivationState = '' | 'created' | 'pending';

const initialValues: Values = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
};
const Field = TextField as unknown as React.ComponentType<
  Omit<TextFieldProps<'outlined'>, 'variant'>
>;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const authErrorCodes = new Set<AuthErrorCode>(AUTH_ERROR_CODES);

function errorCode(error: unknown): AuthErrorCode {
  if (error instanceof AuthActionError) return error.code;
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    authErrorCodes.has((error as { code: AuthErrorCode }).code)
  )
    return (error as { code: AuthErrorCode }).code;
  return 'unknown';
}

export default function AuthPage({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: AuthData;
}) {
  const { t } = useTranslation('workspace');
  const adapter = useAuthAdapter();
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState<AuthErrorCode | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [activationState, setActivationState] = useState<ActivationState>('');
  const signup = data.mode === 'signup';

  const update = (field: Field) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setRequestError('');
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (signup && !values.displayName.trim()) errors.displayName = t('auth.validation.required');
    if (!values.email.trim()) errors.email = t('auth.validation.required');
    else if (!emailPattern.test(values.email.trim()))
      errors.email = t('auth.validation.invalidEmail');
    if (!values.password) errors.password = t('auth.validation.required');
    else if (values.password.length < 6) errors.password = t('auth.validation.passwordLength');
    if (signup && !values.confirmPassword) errors.confirmPassword = t('auth.validation.required');
    else if (signup && values.confirmPassword !== values.password)
      errors.confirmPassword = t('auth.validation.passwordMismatch');
    return errors;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length || !adapter) {
      if (!adapter) setRequestError('unavailable');
      return;
    }
    setPending(true);
    setRequestError('');
    try {
      const email = values.email.trim();
      if (signup) {
        await adapter.signup({
          displayName: values.displayName.trim(),
          email,
          password: values.password,
        });
        setValues(initialValues);
        setActivationState('created');
      } else await adapter.login({ email, password: values.password });
    } catch (error) {
      const code = errorCode(error);
      if (code === 'accountPending') setActivationState('pending');
      else setRequestError(code);
    } finally {
      setPending(false);
    }
  };

  const passwordToggle = (
    <InputAdornment position="end">
      <IconButton
        edge="end"
        aria-label={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
        onClick={() => setShowPassword((visible) => !visible)}
        onMouseDown={(event) => event.preventDefault()}
      >
        {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box
      component="section"
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(340px, 0.9fr) minmax(520px, 1.1fr)' },
        background:
          'radial-gradient(circle at 78% 12%, rgba(32, 133, 104, 0.12), transparent 28%), #f4f7f6',
      }}
    >
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { md: 6, lg: 9 },
          color: '#fff',
          background:
            'linear-gradient(145deg, rgba(9, 44, 39, 0.98), rgba(17, 92, 72, 0.96) 68%, rgba(43, 129, 94, 0.94))',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 380,
            height: 380,
            borderRadius: '50%',
            right: -170,
            top: -120,
            border: '70px solid rgba(255,255,255,0.055)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: 10,
            left: -120,
            bottom: -140,
            transform: 'rotate(28deg)',
            background: 'rgba(255,255,255,0.045)',
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: 'relative' }}>
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 46,
              height: 46,
              borderRadius: 2.5,
              color: '#123b32',
              backgroundColor: '#f4c95d',
              boxShadow: '0 14px 32px rgba(0,0,0,0.22)',
            }}
          >
            <StorefrontRounded />
          </Box>
          <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
            {t(data.brand)}
          </Typography>
        </Stack>

        <Box sx={{ position: 'relative', maxWidth: 510 }}>
          <Typography
            variant="overline"
            sx={{ color: '#f4c95d', fontWeight: 800, letterSpacing: '0.16em' }}
          >
            {t(data.eyebrow)}
          </Typography>
          <Typography
            variant="h2"
            sx={{ mt: 1.5, mb: 3, fontWeight: 800, fontSize: { md: '2.7rem', lg: '3.45rem' } }}
          >
            {t('auth.valueTitle')}
          </Typography>
          <Stack spacing={2.25}>
            {data.featureKeys.map((key) => (
              <Stack key={key} direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    display: 'grid',
                    flex: '0 0 auto',
                    placeItems: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    color: '#173d34',
                    backgroundColor: '#f4c95d',
                  }}
                >
                  <CheckRounded sx={{ fontSize: 18 }} />
                </Box>
                <Typography color="rgba(255,255,255,0.86)">{t(key)}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ position: 'relative' }}>
          <LockRounded sx={{ fontSize: 18, color: '#f4c95d' }} />
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            {t('auth.firebaseNote')}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4, lg: 10 },
          py: { xs: 4, sm: 7 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 520,
            p: { xs: 3, sm: 5 },
            borderRadius: { xs: 3, sm: 4 },
            border: '1px solid rgba(20, 72, 60, 0.1)',
            boxShadow: '0 30px 90px rgba(22, 61, 52, 0.12)',
          }}
        >
          <Stack spacing={1} sx={{ mb: activationState ? 2.5 : 4 }}>
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                alignItems: 'center',
                gap: 1,
                color: 'primary.main',
                mb: 2,
              }}
            >
              <StorefrontRounded />
              <Typography fontWeight={800}>{t(data.brand)}</Typography>
            </Box>
            <Typography
              component="h1"
              variant="h3"
              sx={{ fontWeight: 800, letterSpacing: '-0.035em', color: '#173d34' }}
            >
              {t(title)}
            </Typography>
            {description ? (
              <Typography color="text.secondary" sx={{ maxWidth: 440 }}>
                {t(description)}
              </Typography>
            ) : null}
          </Stack>

          {activationState ? (
            <Stack spacing={2.5}>
              <Alert severity="success" aria-live="polite">
                <Typography component="h2" fontWeight={800} sx={{ mb: 0.5 }}>
                  {t(activationState === 'created' ? 'auth.accountCreated' : 'auth.accessPending')}
                </Typography>
                {t('auth.activationRequired')}
              </Alert>
              {activationState === 'created' ? (
                <Button
                  component={RouterLink}
                  to={data.alternatePath}
                  size="large"
                  variant="contained"
                  endIcon={<ArrowForwardRounded />}
                  sx={{ minHeight: 52, borderRadius: 2, fontWeight: 800 }}
                >
                  {t('auth.returnToLogin')}
                </Button>
              ) : (
                <Button
                  size="large"
                  variant="contained"
                  endIcon={<ArrowForwardRounded />}
                  onClick={() => setActivationState('')}
                  sx={{ minHeight: 52, borderRadius: 2, fontWeight: 800 }}
                >
                  {t('auth.returnToLogin')}
                </Button>
              )}
            </Stack>
          ) : (
            <>
              <Box component="form" noValidate onSubmit={submit}>
                <Stack spacing={2.25}>
                  {signup ? (
                    <Field
                      autoFocus
                      fullWidth
                      autoComplete="name"
                      label={t('auth.displayName')}
                      value={values.displayName}
                      error={!!fieldErrors.displayName}
                      helperText={fieldErrors.displayName}
                      onChange={update('displayName')}
                      slotProps={{ htmlInput: { maxLength: 100 } }}
                    />
                  ) : null}
                  <Field
                    autoFocus={!signup}
                    fullWidth
                    type="email"
                    autoComplete="email"
                    label={t('auth.email')}
                    value={values.email}
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email}
                    onChange={update('email')}
                    slotProps={{ htmlInput: { inputMode: 'email', maxLength: 320 } }}
                  />
                  <Field
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={signup ? 'new-password' : 'current-password'}
                    label={t('auth.password')}
                    value={values.password}
                    error={!!fieldErrors.password}
                    helperText={
                      fieldErrors.password || (signup ? t('auth.passwordHint') : undefined)
                    }
                    onChange={update('password')}
                    slotProps={{ input: { endAdornment: passwordToggle } }}
                  />
                  {signup ? (
                    <Field
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      label={t('auth.confirmPassword')}
                      value={values.confirmPassword}
                      error={!!fieldErrors.confirmPassword}
                      helperText={fieldErrors.confirmPassword}
                      onChange={update('confirmPassword')}
                    />
                  ) : null}

                  {requestError ? (
                    <Alert severity="error" aria-live="polite">
                      {t(`auth.errors.${requestError}`)}
                    </Alert>
                  ) : null}

                  <Button
                    size="large"
                    type="submit"
                    variant="contained"
                    disabled={pending || !adapter}
                    endIcon={
                      pending ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <ArrowForwardRounded />
                      )
                    }
                    sx={{
                      mt: 0.5,
                      minHeight: 52,
                      borderRadius: 2,
                      fontWeight: 800,
                      boxShadow: '0 12px 28px rgba(23, 112, 87, 0.22)',
                    }}
                  >
                    {t(pending ? 'auth.processing' : signup ? 'auth.createAccount' : 'auth.login')}
                  </Button>
                </Stack>
              </Box>

              <Typography align="center" color="text.secondary" sx={{ mt: 3.5 }}>
                {t(signup ? 'auth.haveAccount' : 'auth.noAccount')}{' '}
                <Link
                  component={RouterLink}
                  to={data.alternatePath}
                  underline="hover"
                  fontWeight={800}
                >
                  {t(signup ? 'auth.backToLogin' : 'auth.openSignup')}
                </Link>
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
