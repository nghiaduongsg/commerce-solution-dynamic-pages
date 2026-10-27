import React, { useEffect, useMemo, useRef, useState } from 'react';
import useSystem from '@pkg-setup/src/system/useSystem';
import i18n from 'i18next';
import { AnyType } from '@pkg-common/types';
import { Skeleton } from '@mui/material';
import { SxProps } from '@mui/system';

const TranslationsElementController = ({
  namespace,
  children,
  skeletonProps,
}: {
  namespace: string;
  children?: React.ReactNode;
  skeletonProps?: {
    variant: 'text' | 'rectangular' | 'rounded' | 'circular';
    width?: string;
    height?: string;
    sx?: SxProps;
  };
}) => {
  const { selectedLanguage } = useSystem();

  const hasBundle = useMemo(() => {
    return i18n.hasResourceBundle(selectedLanguage, namespace);
  }, [selectedLanguage, namespace]);

  const [translationsLoaded, setTranslationsLoaded] = useState(hasBundle);

  const intervalRef = useRef<AnyType>(null);

  useEffect(() => {
    if (hasBundle) {
      setTranslationsLoaded(true);
      return;
    } else if (!translationsLoaded) {
      intervalRef.current = setInterval(() => {
        if (i18n.hasResourceBundle(selectedLanguage, namespace)) {
          setTranslationsLoaded(true);
          clearInterval(intervalRef.current);
        }
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedLanguage, namespace, translationsLoaded, hasBundle]);

  if (children && translationsLoaded) {
    return children;
  }

  return (
    <Skeleton
      aria-busy={true}
      width={skeletonProps?.width ?? '200px'}
      height={skeletonProps?.height ?? '30px'}
      variant={skeletonProps?.variant ?? 'text'}
      sx={{ backgroundColor: 'lightgray' }}
    />
  );
};

export default TranslationsElementController;
