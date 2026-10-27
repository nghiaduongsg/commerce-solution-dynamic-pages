import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { Box, Chip, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TaxpayerDetails from './TaxpayerDetails';
import useSystem from '@pkg-setup/src/system/useSystem';
import useApiLoadedData from '@pkg-core/apiData/hooks/useApiLoadedData';
import { AssignmentInd } from '@mui/icons-material';

const taxpayerIds = [
  'TaxpayerFinancial',
  'TaxpayerCompliance',
  'TaxpayerActivity',
  'TaxpayerRegistration',
];

export default function Taxpayer() {
  const location = useLocation();

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation(['accessibility']);
  const [open, setOpen] = useState(false);
  const taxpayerPage = taxpayerIds.some((route) => location.pathname.includes(route));

  const party = useApiLoadedData('Party');

  const fullName = useMemo(() => {
    if (party) {
      const primaryName = (party?.names || []).find((n) => n.primary);
      const { fullName: primaryFullName } = primaryName || {};
      return primaryFullName;
    }
  }, [party]);

  const partyTypeCode = useMemo(() => {
    if (party) {
      return party.partyTypeCode;
    }
  }, [party?.partyTypeCode]);

  if (fullName && taxpayerPage) {
    return (
      <Box style={{ display: 'flex', paddingRight: '12px' }}>
        <Chip
          id="taxpayer-btn"
          label={translate('taxpayerInfoButtonAriaLabel', {
            fullName,
            lng: selectedLanguage,
          })}
          size="medium"
          variant="outlined"
          color="primary"
          icon={<AssignmentInd sx={{ color: 'primary' }} />}
          onClick={() => setOpen(true)}
        />
        {partyTypeCode && open && (
          <>
            <Divider orientation="vertical" flexItem style={{ margin: '-14px 8px' }} />
            <TaxpayerDetails
              open={open}
              onClose={() => setOpen(false)}
              partyTypeCode={partyTypeCode}
            />
          </>
        )}
      </Box>
    );
  }

  return null;
}
