import React, { useMemo } from 'react';

import HeroCards from '@pkg-common/components/Hero/HeroCards';
import { useSystem } from '@pkg-setup/index';
import usePage from '@pkg-layout/src/common/hooks/usePage';

const PageHighlightData = () => {
  const { securableObjects } = useSystem();
  const uiSchema = usePage();

  const cards = useMemo(() => {
    return ((uiSchema || {})['ui:cards'] || {})?.cards || [];
  }, [uiSchema]);

  const cardsPermission = useMemo(() => {
    return ((uiSchema || {})['ui:cards'] || {})?.key || '';
  }, [uiSchema]);

  const namespaces = useMemo(() => {
    return ((uiSchema || {})['ui:cards'] || {})?.namespaces || [];
  }, [uiSchema]);

  const isAllowed = useMemo(() => {
    return securableObjects[cardsPermission];
  }, [cardsPermission, securableObjects]);

  return isAllowed ? <HeroCards heroCards={cards} namespaces={namespaces} /> : null;
};

export default PageHighlightData;
