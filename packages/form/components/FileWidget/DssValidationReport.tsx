import React, { useState } from 'react';
import { Box, Chip, Collapse, Divider, Paper, Tooltip, Typography } from '@mui/material';
import { CheckCircle, Cancel, Warning } from '@mui/icons-material';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import {
  DssBuildingBlock,
  DssSignature,
  DssValidationEntry,
  DssValidationProcess,
  DssValidationResult,
  DssValidationStatus,
} from './hooks/useAttachmentValidation';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  color: 'success' | 'error' | 'warning' | 'default';
  icon: string;
}

export interface DssValidationReportProps {
  /** The DSS validation result to display. */
  result: DssValidationResult;
  /**
   * Optional DOM id prefix used for data-testid attributes on the status chip.
   * Defaults to 'dss'.
   */
  id?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<DssValidationStatus, StatusConfig> = {
  TOTAL_PASSED: { label: 'dssVerified', color: 'success', icon: '✅' },
  TOTAL_FAILED: { label: 'dssInvalid', color: 'error', icon: '❌' },
  INDETERMINATE: { label: 'dssInconclusive', color: 'warning', icon: '⚠️' },
  NOT_SIGNED: { label: 'dssNotSigned', color: 'default', icon: '' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export const indicationColor = (
  indication: string,
): 'error' | 'warning' | 'success' | 'inherit' => {
  if (!indication) return 'inherit';
  const upper = indication.toUpperCase();
  if (upper === 'PASSED' || upper === 'TOTAL_PASSED') return 'success';
  if (upper === 'FAILED' || upper === 'TOTAL_FAILED') return 'error';
  return 'warning';
};

export const indicationChipColor = (
  indication: string,
): 'success' | 'error' | 'warning' | 'default' => {
  const c = indicationColor(indication);
  return c === 'inherit' ? 'default' : c;
};

// ── Status icon ───────────────────────────────────────────────────────────────

const STATUS_ICON_MAP = {
  success: CheckCircle,
  error: Cancel,
  warning: Warning,
} as const;

const STATUS_COLOR_MAP = {
  success: 'success.main',
  error: 'error.main',
  warning: 'warning.main',
} as const;

export const StatusIcon: React.FC<{
  color: 'success' | 'warning' | 'error';
  tooltip?: string;
}> = ({ color, tooltip }) => {
  const Icon = STATUS_ICON_MAP[color];
  const muiColor = STATUS_COLOR_MAP[color];

  const icon = (
    <Box component="span" sx={{ color: muiColor, display: 'flex', alignItems: 'center' }}>
      <Icon sx={{ fontSize: 18 }} />
    </Box>
  );

  return tooltip ? (
    <Tooltip title={tooltip} placement="left">
      {icon}
    </Tooltip>
  ) : (
    icon
  );
};

// ── Constraint row ────────────────────────────────────────────────────────────
// Layout mirrors the DSS report: human-readable description fills the left
// column (body2, text.primary), the status icon sits flush right with a
// tooltip showing the technical key for debugging.

const ConstraintRow: React.FC<{ entry: DssValidationEntry; color: 'error' | 'warning' }> = ({
  entry,
  color,
}) => (
  <Box
    display="grid"
    gridTemplateColumns="1fr auto"
    alignItems="center"
    gap={1}
    sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
  >
    <Typography variant="body2" color="text.primary">
      {entry.description}
    </Typography>
    <StatusIcon color={color} tooltip={entry.key} />
  </Box>
);

const ConstraintList: React.FC<{
  errors: DssValidationEntry[];
  warnings: DssValidationEntry[];
}> = ({ errors, warnings }) => {
  if (!errors?.length && !warnings?.length) return null;
  return (
    <Box>
      {errors?.map((e) => <ConstraintRow key={e.key} entry={e} color="error" />)}
      {warnings?.map((e) => <ConstraintRow key={e.key} entry={e} color="warning" />)}
    </Box>
  );
};

// ── Collapsible card (top-level, primary header) ──────────────────────────────
// Matches GenericCard's expanded-state header: primary.main background,
// primary.contrastText text, primary.dark on hover.

const CollapsibleCard: React.FC<{
  header: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ header, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Paper
      elevation={0}
      sx={{ mb: 1.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
    >
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          userSelect: 'none',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>{header}</Box>
        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', opacity: 0.8 }}>
          {open ? (
            <ChevronDown size={18} aria-hidden="true" />
          ) : (
            <ChevronRight size={18} aria-hidden="true" />
          )}
        </Box>
      </Box>
      <Collapse in={open}>
        <Box sx={{ p: 2 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
};

// ── Nested collapsible card (secondary, light header) ────────────────────────
// Matches the app's secondary card style: primary.light background,
// primary.dark hover — consistent with GenericCard CardHeader hover behaviour.

const NestedCollapsibleCard: React.FC<{
  header: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ header, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Paper
      elevation={0}
      sx={{ mb: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
    >
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'primary.light',
          userSelect: 'none',
          '&:hover': { bgcolor: 'primary.dark', '& *': { color: 'primary.contrastText' } },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>{header}</Box>
        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', color: 'primary.dark' }}>
          {open ? (
            <ChevronDown size={18} aria-hidden="true" />
          ) : (
            <ChevronRight size={18} aria-hidden="true" />
          )}
        </Box>
      </Box>
      <Collapse in={open}>
        <Box sx={{ p: 2 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
};

// ── Building blocks section ───────────────────────────────────────────────────

const BuildingBlockSection: React.FC<{ block: DssBuildingBlock }> = ({ block }) => {
  const color = indicationChipColor(block.indication);
  const indColor = indicationColor(block.indication);
  const hasErrors = block.errors?.length > 0;
  const hasWarnings = block.warnings?.length > 0;
  const isPassed = !hasErrors && !hasWarnings;
  const { t: translate } = useTranslation([COMMON]);

  return (
    <Box sx={{ mb: 1 }}>
      {/* Block header: body2 label matches codebase field-label convention */}
      <Box display="flex" alignItems="center" gap={1} sx={{ py: 0.5 }}>
        <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>
          {block.blockTitle}
        </Typography>
        <Chip
          label={block.subIndication ?? block.indication}
          size="small"
          color={color}
          variant="filled"
        />
      </Box>

      {/* ── Indication description (mirrors the signature-level description paper) */}
      {(block.indicationDescription || block.subIndicationDescription) && (
        <Paper
          elevation={0}
          sx={{
            mb: 0.5,
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderLeft: '4px solid',
            borderLeftColor: `${indColor}.main`,
            bgcolor: 'primary.light',
          }}
        >
          {block.indicationDescription && (
            <Typography variant="body2" color={`${indColor}.main`} display="block">
              {block.indicationDescription}
            </Typography>
          )}
          {block.subIndicationDescription && (
            <Typography variant="body2" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
              {block.subIndicationDescription}
            </Typography>
          )}
        </Paper>
      )}

      {/* PASSED: single affirmative row; otherwise render individual constraint rows */}
      {isPassed ? (
        <Box
          display="grid"
          gridTemplateColumns="1fr auto"
          alignItems="center"
          gap={1}
          sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Typography variant="body2" color="text.secondary">
            {translate('allChecksPassed', {
              ns: COMMON,
            })}
          </Typography>
          <StatusIcon color="success" tooltip={translate('ok', { ns: COMMON })} />
        </Box>
      ) : (
        <ConstraintList errors={block.errors} warnings={block.warnings} />
      )}
    </Box>
  );
};

// ── Validation process card ───────────────────────────────────────────────────

const ValidationProcessCard: React.FC<{ process: DssValidationProcess }> = ({ process }) => {
  const { t: translate } = useTranslation([COMMON]);
  const { selectedLanguage } = useSystem();
  const hasErrors = process.errors?.length > 0;
  const hasWarnings = process.warnings?.length > 0;
  let overallColor: 'success' | 'warning' | 'error' = 'success';
  let labelKey = 'dssPassed';

  if (hasErrors) {
    overallColor = 'error';
    labelKey = 'dssFailed';
  } else if (hasWarnings) {
    overallColor = 'warning';
    labelKey = 'dssWarning';
  }

  const header = (
    <Box display="flex" alignItems="center" gap={1}>
      {/* body2 + primary.dark matches the codebase CardHeader title style */}
      <Typography variant="body2" color="primary.dark" sx={{ flex: 1, fontWeight: 600 }}>
        {process.processType}
      </Typography>
      <Chip
        label={translate(labelKey, { ns: COMMON, lng: selectedLanguage })}
        size="small"
        color={overallColor}
        variant="filled"
      />
    </Box>
  );

  return (
    <NestedCollapsibleCard header={header}>
      {!hasErrors && !hasWarnings ? (
        <Box display="flex" alignItems="center" gap={1} sx={{ py: 0.5 }}>
          <StatusIcon color="success" />
          <Typography variant="body2" color="success.main">
            {translate('allChecksPassed', {
              ns: COMMON,
              lng: selectedLanguage,
            })}
          </Typography>
        </Box>
      ) : (
        <ConstraintList errors={process.errors} warnings={process.warnings} />
      )}
    </NestedCollapsibleCard>
  );
};

// ── Signature section ─────────────────────────────────────────────────────────

const SignatureSection: React.FC<{ sig: DssSignature; index: number }> = ({ sig, index }) => {
  const { t: translate } = useTranslation([COMMON]);
  const { selectedLanguage } = useSystem();
  const sigColor = indicationChipColor(sig.indication);
  const indColor = indicationColor(sig.indication);

  const header = (
    <Box display="flex" alignItems="center" gap={1} minWidth={0}>
      {/* caption kept here intentionally — compact header inside a coloured bar */}
      <Typography
        variant="caption"
        sx={{
          color: 'primary.contrastText',
          fontWeight: 700,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {translate('dssSignature', { ns: COMMON, lng: selectedLanguage, index: index + 1 })} —{' '}
        {sig.signatureId}
      </Typography>
      <Chip
        label={sig.subIndication ?? sig.indication}
        size="small"
        color={sigColor}
        variant="filled"
        sx={{ flexShrink: 0 }}
      />
    </Box>
  );

  return (
    <CollapsibleCard header={header}>
      {/* ── Signer metadata grid ──
          Uses body2 label / body2 value pattern from Content.tsx:
          label: text.secondary  value: text.primary + fontWeight 600 */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(160px, 1fr))"
        gap={2}
        sx={{ mb: 2 }}
      >
        {[
          {
            label: translate('dssFormat', { ns: COMMON, lng: selectedLanguage }),
            value: sig.signatureFormat,
          },
          {
            label: translate('dssQualification', { ns: COMMON, lng: selectedLanguage }),
            value: sig.signatureQualification,
          },
          {
            label: translate('dssSigner', { ns: COMMON, lng: selectedLanguage }),
            value: sig.signerDn,
          },
          {
            label: translate('dssIssuer', { ns: COMMON, lng: selectedLanguage }),
            value: sig.issuerDn,
          },
          {
            label: translate('dssClaimedSigningTime', { ns: COMMON, lng: selectedLanguage }),
            value: sig.claimedSigningTime
              ? new Date(sig.claimedSigningTime).toLocaleString()
              : translate('dssNone', { ns: COMMON, lng: selectedLanguage }),
          },
          {
            label: translate('dssBestSigningTime', { ns: COMMON, lng: selectedLanguage }),
            value: sig.bestSigningTime
              ? new Date(sig.bestSigningTime).toLocaleString()
              : translate('dssNone', { ns: COMMON, lng: selectedLanguage }),
          },
        ].map(({ label, value }) => (
          <Box key={label}>
            <Typography variant="body2" color="text.secondary" display="block" noWrap>
              {label}
            </Typography>
            <Typography
              variant="body2"
              color="text.primary"
              display="block"
              sx={{ fontWeight: 600, wordBreak: 'break-word' }}
            >
              {value || translate('dssNone', { ns: COMMON, lng: selectedLanguage })}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Indication description ──
          Uses primary.light background (the app's standard info-tint surface)
          with divider border. Text colour driven by indication severity. */}
      {(sig.indicationDescription || sig.subIndicationDescription) && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderLeft: '4px solid',
            borderLeftColor: `${indColor}.main`,
            bgcolor: 'primary.light',
          }}
        >
          {sig.indicationDescription && (
            <Typography variant="body2" color={`${indColor}.main`} display="block">
              {sig.indicationDescription}
            </Typography>
          )}
          {sig.subIndicationDescription && (
            <Typography variant="body2" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {sig.subIndicationDescription}
            </Typography>
          )}
        </Paper>
      )}

      {/* ── Quick-check flags ──
          Outlined chips match the app's tag/filter chip convention */}
      <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        {[
          {
            label: translate('dssCertificateNotExpired', { ns: COMMON, lng: selectedLanguage }),
            value: sig.certificateNotExpired,
          },
          {
            label: translate('dssRevocationDataAvailable', { ns: COMMON, lng: selectedLanguage }),
            value: sig.revocationDataAvailable,
          },
          {
            label: translate('dssTimestampPresent', { ns: COMMON, lng: selectedLanguage }),
            value: sig.timestampPresent,
          },
          {
            label: translate('dssTrustedChain', { ns: COMMON, lng: selectedLanguage }),
            value: sig.trustedChain,
          },
        ].map(({ label, value }) => (
          <Chip
            key={label}
            size="small"
            label={`${label}: ${value ? translate('yes', { ns: COMMON, lng: selectedLanguage }) : translate('no', { ns: COMMON, lng: selectedLanguage })}`}
            color={value ? 'success' : 'default'}
            variant="outlined"
          />
        ))}
      </Box>

      {/* ── Validation Processes ──
          Section title uses body2 + primary.dark to match CardHeader title */}
      {sig.details?.validationProcesses?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            color="primary.dark"
            sx={{ fontWeight: 700, mb: 1 }}
            display="block"
          >
            {translate('dssValidationProcesses', { ns: COMMON, lng: selectedLanguage })}
          </Typography>
          {sig.details.validationProcesses.map((vp) => (
            <ValidationProcessCard key={vp.processType} process={vp} />
          ))}
        </Box>
      )}

      {/* ── Basic Building Blocks ── */}
      {sig.details?.buildingBlocks?.length > 0 && (
        <Box>
          <Typography
            variant="body2"
            color="primary.dark"
            sx={{ fontWeight: 700, mb: 1 }}
            display="block"
          >
            {translate('dssBasicBuildingBlocks', { ns: COMMON, lng: selectedLanguage })}
          </Typography>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 1.5 }}>
            {sig.details.buildingBlocks.map((block, i) => (
              <React.Fragment key={block.blockType}>
                <BuildingBlockSection block={block} />
                {i < sig.details.buildingBlocks.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </Paper>
        </Box>
      )}
    </CollapsibleCard>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Pure display component for a DSS validation result.
 *
 * Renders the full structured report: a summary header (overall status,
 * signed flag, signature count, validation time) followed by collapsible
 * per-signature cards containing nested validation-process cards and
 * building-block rows.
 *
 * This component is intentionally stateless with respect to loading/error
 * lifecycle — it only renders a `DssValidationResult` that has already been
 * resolved. Use `ValidationStatusBadge` when you need to also handle the
 * in-progress and error states produced by `useAttachmentValidation`.
 */
const DssValidationReport: React.FC<DssValidationReportProps> = ({ result, id = 'dss' }) => {
  const { t: translate } = useTranslation([COMMON]);
  const { selectedLanguage } = useSystem();

  const config = STATUS_CONFIG[result.status] ?? STATUS_CONFIG['NOT_SIGNED'];

  return (
    <Box sx={{ p: 1 }}>
      {/* ── Summary header ──
          primary.light background matches the app's standard info-surface
          used in expanded card headers / drag handles */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'primary.light',
        }}
      >
        {[
          {
            label: translate('dssOverallStatus', {
              ns: COMMON,
              lng: selectedLanguage,
            }),
            value: (
              <Chip
                size="small"
                label={translate(config.label, {
                  ns: COMMON,
                  lng: selectedLanguage,
                  defaultValue: result.status,
                })}
                color={config.color}
                variant="filled"
                data-testid={`${id}-validation-badge`}
              />
            ),
          },
          {
            label: translate('dssSigned', {
              ns: COMMON,
              lng: selectedLanguage,
            }),
            value: (
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                {result.signed
                  ? translate('yes', { ns: COMMON, lng: selectedLanguage })
                  : translate('no', { ns: COMMON, lng: selectedLanguage })}
              </Typography>
            ),
          },
          {
            label: translate('dssSignatures', {
              ns: COMMON,
              lng: selectedLanguage,
            }),
            value: (
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                {result.signatureCount}
              </Typography>
            ),
          },
          ...(result.validationTime
            ? [
                {
                  label: translate('dssValidatedAt', {
                    ns: COMMON,
                    lng: selectedLanguage,
                  }),
                  value: (
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                      {new Date(result.validationTime).toLocaleString()}
                    </Typography>
                  ),
                },
              ]
            : []),
        ].map(({ label: l, value }) => (
          <Box key={l}>
            {/* body2 + text.secondary matches the Content.tsx label pattern */}
            <Typography variant="body2" color="text.secondary" display="block" noWrap>
              {l}
            </Typography>
            {value}
          </Box>
        ))}
      </Paper>

      {/* ── Per-signature sections ── */}
      {result.signatures?.map((sig, i) => (
        <SignatureSection key={sig.signatureId ?? i} sig={sig} index={i} />
      ))}
    </Box>
  );
};

export default DssValidationReport;
