import { AnyType } from '@pkg-common/types';
import React from 'react';

export interface UserPreferencesProps {
  open: boolean;
  onClose: () => void;
  fullWidth?: boolean;
  styles?: {
    container?: React.CSSProperties;
    closeButton?: React.CSSProperties;
  };
}
