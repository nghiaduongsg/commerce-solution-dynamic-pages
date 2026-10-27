import React from 'react';
import { Slide } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useSystem from '@pkg-setup/src/system/useSystem';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';

export interface CardFloatingProps {
  id: string;
  title: string;
  children: React.ReactElement | Array<React.ReactElement>;
  onClose: () => void;
  open: boolean;
}

const CardFloating: React.FC<CardFloatingProps> = ({
  id,
  title,
  children,
  onClose,
  open = false,
}) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  return (
    <Slide in={open} style={{ zIndex: 9999 }}>
      <GenericCard
        id={id}
        title={title}
        resizable
        actions={
          <GenericIconButton
            id={`${title}-close-btn`}
            testId={`${title}-filter-close-btn`}
            ariaLabel={translate('close', { ns: COMMON, lng: selectedLanguage })}
            ariaDescription={translate('closeAriaDescription', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
            })}
            onClick={onClose}
            icon={<AssetByType input="icons" name="Close" props={{ className: 'primary' }} />}
          />
        }
      >
        {children}
      </GenericCard>
    </Slide>
  );
};

export default CardFloating;
