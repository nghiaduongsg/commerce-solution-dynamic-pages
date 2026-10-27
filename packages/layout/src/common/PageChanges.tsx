import React, { useMemo, useState } from 'react';

import useSystem from '@pkg-setup/src/system/useSystem';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import ChangesConfirmation from '@pkg-common/components/ChangesConfirmation/ChangesConfirmation';
import { History } from '@mui/icons-material';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useParams } from 'react-router';

const PageChanges = () => {
  const routeParams = useParams<{ category?: string; idKey?: string }>();
  const { selectedLanguage } = useSystem();

  const pageId = useMemo(() => {
    return routeParams?.category || '';
  }, [routeParams]);

  const [open, setOpen] = useState(false);
  const { t: translate } = useTranslation([COMMON]);
  const { hasChanges } = useEntityFormData(pageId);

  if (!hasChanges) {
    return null;
  }

  return (
    <>
      <GenericButton
        id={`${pageId}-changes-history-btn`}
        variant="text"
        color="primary"
        size="small"
        label={translate('changesHistory', { ns: COMMON, lng: selectedLanguage })}
        ariaLabel={translate('changesHistory', { ns: COMMON, lng: selectedLanguage })}
        startIcon={<History />}
        onClick={() => setOpen(true)}
        ariaHasPopup={true}
      />
      <ChangesConfirmation
        pageId={pageId}
        open={open}
        showMessage={false}
        showButtons={false}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </>
  );
};

export default PageChanges;
