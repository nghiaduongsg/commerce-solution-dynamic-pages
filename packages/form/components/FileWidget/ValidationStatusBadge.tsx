import React, { useState } from 'react';
import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { AttachmentValidationState } from './hooks/useAttachmentValidation';
import DssValidationReport, { STATUS_CONFIG } from './DssValidationReport';

interface ValidationStatusBadgeProps {
  attachmentId: string;
  validationState: AttachmentValidationState | undefined;
}

/**
 * Displays a DSS validation status badge for a single attachment.
 *
 * - Shows a spinner while validation is in progress.
 * - Renders a colour-coded Chip once the result is available.
 * - An info icon opens a SimpleDialog containing the full DssValidationReport.
 * - Renders nothing when there is no validation state yet (e.g. file type
 *   did not match fileTypesToBeValidated).
 */
const ValidationStatusBadge: React.FC<ValidationStatusBadgeProps> = ({
  attachmentId,
  validationState,
}) => {
  const { t: translate } = useTranslation([COMMON]);
  const { selectedLanguage } = useSystem();
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!validationState) return null;

  const { loading, result, error } = validationState;

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          {translate('dssValidating', {
            ns: COMMON,
            lng: selectedLanguage,
          })}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="text.primary">
        {translate(error, { ns: COMMON, lng: selectedLanguage })}
      </Typography>
    );
  }

  if (!result) return null;

  const config = STATUS_CONFIG[result.status] ?? STATUS_CONFIG['NOT_SIGNED'];
  const hasDetails = result.status !== 'NOT_SIGNED' && result.signatures?.length > 0;
  const label = `${config.icon ? config.icon + ' ' : ''}${translate(config.label, {
    ns: COMMON,
    lng: selectedLanguage,
    defaultValue: result.status,
  })}`;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
      <Typography variant="body2" color="text.secondary">
        {translate('dssValidationStatus', {
          ns: COMMON,
          lng: selectedLanguage,
        })}
      </Typography>
      <Box display="flex" justifyContent="center" alignItems="center" gap={0.5}>
        <Chip
          size="small"
          label={label}
          color={config.color}
          variant="outlined"
          data-testid={`${attachmentId}-validation-badge`}
        />

        {hasDetails && (
          <>
            <GenericIconButton
              id={`${attachmentId}-validation-info-btn`}
              testId={`${attachmentId}-validation-info-btn`}
              ariaLabel={translate('dssShowDetails', {
                ns: COMMON,
                lng: selectedLanguage,
              })}
              onClick={() => setDetailsOpen(true)}
              icon={<AssetByType input="icons" name="InfoRounded" />}
            />

            {detailsOpen && (
              <SimpleDialog
                id={`${attachmentId}-validation-details-dialog`}
                open={detailsOpen}
                title={translate('dssValidationDetails', {
                  ns: COMMON,
                  lng: selectedLanguage,
                })}
                onClose={() => setDetailsOpen(false)}
                keepMounted={true}
                size="md"
              >
                <Box onClick={(e) => e.stopPropagation()}>
                  <DssValidationReport result={result} id={attachmentId} />
                </Box>
              </SimpleDialog>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ValidationStatusBadge;
