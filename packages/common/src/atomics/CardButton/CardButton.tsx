import React from 'react';
import { AddCircle } from '@mui/icons-material';
import { Card, CardActions, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import getStyles from './styles';

export interface CardButtonProps {
  ctaLabel: string;
  ariaDescription?: string;
  ctaIcon?: React.ReactNode;
  ctaAction: () => void;
  fullHeight: boolean;
  id: string;
  message?: string;
}

const CardButton: React.FC<CardButtonProps> = ({
  ctaLabel,
  ariaDescription,
  ctaAction,
  ctaIcon,
  fullHeight = false,
  id,
  message,
}) => {
  const styles = getStyles(useTheme());

  return (
    <Card sx={{ ...styles.card, height: fullHeight ? '100%' : 'auto' }}>
      <CardActions
        id={`card-button-${id}-add-new`}
        sx={{ ...styles.cardActions, height: fullHeight ? '100%' : 'auto' }}
      >
        {message && <Typography variant="body1">{message}</Typography>}
        <GenericButton
          id={`${id}-add-new`}
          variant="text"
          color="primary"
          startIcon={ctaIcon || <AddCircle />}
          label={ctaLabel}
          ariaDescription={ariaDescription}
          ariaHasPopup={'dialog'}
          onClick={ctaAction}
        />
      </CardActions>
    </Card>
  );
};

export default CardButton;
