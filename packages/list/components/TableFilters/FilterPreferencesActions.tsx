import React, { useState } from 'react';
import { Box } from '@mui/material';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { SavedFiltersDialog } from './SavedFiltersDialog';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { exportFilters } from '@pkg-setup/src/userSettings/reducers';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useFilterSettings from '@pkg-setup/src/userSettings/useFilterSettings';
import { hasValue } from '@pkg-common/utils';

interface FilterPreferencesActionsProps {
  tableId: string;
  baseDataTestId?: string;
}

export const FilterPreferencesActions: React.FC<FilterPreferencesActionsProps> = ({
  tableId,
  baseDataTestId,
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  const { savedGroups, lastSavedGroup, deleteFilterGroup } = useFilterSettings(tableId);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
      {savedGroups.length > 0 && (
        <GenericIconButton
          id={`${tableId}-export-filters-btn`}
          testId={`${baseDataTestId}-export-filters-btn`}
          ariaLabel={translate('exportFilters', { ns: 'common', lng: selectedLanguage })}
          onClick={() => {
            exportFilters(savedGroups, tableId, lastSavedGroup);
          }}
          icon={<AssetByType input="icons" name="FileDownload" props={{ color: 'primary' }} />}
        />
      )}
      <GenericIconButton
        id={`${tableId}-save-filters-btn`}
        testId={`${baseDataTestId}-save-filter-btn`}
        ariaLabel={translate('saveFiltersToPreferences', { ns: COMMON, lng: selectedLanguage })}
        onClick={() => setShowSaveDialog(true)}
        icon={<AssetByType input="icons" name="Save" />}
        ariaHasPopup={'dialog'}
        ariaExpanded={showSaveDialog}
      />
      {hasValue(lastSavedGroup) && (
        <GenericIconButton
          id={`${tableId}-delete-filters-btn`}
          testId={`${baseDataTestId}-delete-filter-btn`}
          ariaLabel={translate('deleteFiltersFromPreferences', {
            ns: COMMON,
            lng: selectedLanguage,
          })}
          onClick={deleteFilterGroup}
          icon={<AssetByType input="icons" name="Delete" />}
          // @ts-ignore
          warning={{
            fieldId: tableId,
            translation: {
              warningTitleKey: 'deleteSelectedGroupFilterTitle',
              warningMessageKey: 'deleteSelectedGroupFilterMessage',
              namespace: COMMON,
              parameters: { groupId: lastSavedGroup },
            },
          }}
        />
      )}
      <SavedFiltersDialog
        tableId={tableId}
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
      />
    </Box>
  );
};
