import React from 'react';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import GenericSelect from '@pkg-common/atomics/GenericSelect/GenericSelect';
import useFilterSettings from '@pkg-setup/src/userSettings/useFilterSettings';

const FilterGroupSelector = ({ tableId }: { tableId: string }) => {
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);
  const { selectedLanguage } = useSystem();

  const { lastSavedGroup, setLatest, savedGroups } = useFilterSettings(tableId);

  if (!savedGroups?.length) {
    return null;
  }

  return (
    <GenericSelect
      id="filter-group-select"
      testId="filter-group-select"
      options={savedGroups.map((group) => ({
        code: group.groupId,
        label: group.groupId,
      }))}
      renderBy={'label'}
      onChange={(e) => {
        setLatest(e.target.value);
      }}
      label={translate('selectGroupAriaLabel', {
        ns: ACCESSIBILITY,
        lng: selectedLanguage,
      })}
      value={lastSavedGroup ?? ''}
      multiple={false}
      showLabel={false}
      placeholder={translate('selectFilterGroupPlaceholder', {
        ns: COMMON,
        lng: selectedLanguage,
      })}
    />
  );
};

export default FilterGroupSelector;
