import React from 'react';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import getStyles from '../styles';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import { useTheme } from '@mui/material/styles';

const LoadMoreButton = ({
  id,
  error,
  loading,
  level,
  onClick,
}: {
  error: string;
  loading: boolean;
  id: string;
  level: number;
  onClick: () => void;
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const childIndentPx = (level + 1) * 16;

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const extraStyles = error ? styles.loadMoreButtonError : styles.loadMoreButton;

  const buttonStyles = {
    ...extraStyles,
    marginLeft: `${childIndentPx}px`,
    width: `calc(100% - ${childIndentPx}px)`,
    boxSizing: 'border-box',
  };

  return (
    <GenericButton
      id={`${id}-load-more-button`}
      onClick={onClick}
      label={translate(error ? 'tryAgain' : 'loadMore', { ns: COMMON, lng: selectedLanguage })}
      ariaLabel={translate(error ? 'tryAgain' : 'loadMore', { ns: COMMON, lng: selectedLanguage })}
      ariaDescription={error}
      variant="outlined"
      size="small"
      loading={loading}
      disabled={loading || !!error}
      styles={buttonStyles}
    />
  );
};

export default LoadMoreButton;
