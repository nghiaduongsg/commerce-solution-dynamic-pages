import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Radio,
} from '@mui/material';
import { COMMON, ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import GenericSelect from '@pkg-common/atomics/GenericSelect/GenericSelect';
import useFilterSettings from '@pkg-setup/src/userSettings/useFilterSettings';

export const SavedFiltersDialog = ({ open, onClose, tableId }) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const { savedGroups, saveFilterGroup } = useFilterSettings(tableId);

  const [saveMode, setSaveMode] = useState<'existing' | 'new'>(
    savedGroups.length > 0 ? 'existing' : 'new',
  );
  const [groupName, setGroupName] = useState('');

  const onSave = () => {
    const finalGroup = groupName?.trim();
    if (finalGroup) {
      saveFilterGroup(finalGroup);
    }
    setGroupName('');
    onClose();
  };

  useEffect(() => {
    if (savedGroups.length === 0) {
      setSaveMode('new');
    } else if (saveMode !== 'existing') {
      setSaveMode('existing');
    }
  }, [savedGroups]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          'aria-labelledby': 'save-filters-dialog-title',
          'aria-label': translate('saveFilters', { ns: COMMON, lng: selectedLanguage }),
          role: 'dialog',
          'aria-modal': 'true',
          'aria-hidden': !open,
        },
      }}
    >
      <DialogTitle id="save-filters-dialog-title">
        {translate('saveFilters', { ns: COMMON, lng: selectedLanguage })}
      </DialogTitle>
      <DialogContent
        id="save-filters-dialog-description"
        data-testid="save-filters-dialog-description"
      >
        {savedGroups.length > 0 && (
          <FormControl component="fieldset" sx={{ mb: 2 }} role="group">
            <RadioGroup
              row
              value={saveMode}
              onChange={(e) => setSaveMode(e.target.value as 'existing' | 'new')}
            >
              <FormControlLabel
                value="existing"
                control={<Radio />}
                label={translate('saveToExistingGroup', {
                  ns: COMMON,
                  lng: selectedLanguage,
                })}
              />
              <FormControlLabel
                value="new"
                control={<Radio />}
                label={translate('saveToNewGroup', {
                  ns: COMMON,
                  lng: selectedLanguage,
                })}
              />
            </RadioGroup>
          </FormControl>
        )}
        {saveMode === 'existing' && savedGroups.length > 0 && (
          <GenericSelect
            id="filter-group-select"
            testId="filter-group-select"
            options={savedGroups.map((group) => ({
              code: group.groupId,
              label: group.groupId,
            }))}
            renderBy={'label'}
            onChange={(e) => setGroupName(e.target.value)}
            label={translate('selectGroup', { ns: COMMON, lng: selectedLanguage })}
            value={groupName}
            multiple={false}
            fullWidth={true}
          />
        )}

        {saveMode === 'new' && (
          <TextField
            id="new-group-name-input"
            data-testid="new-group-name-input"
            label={translate('newGroupName', {
              ns: COMMON,
              lng: selectedLanguage,
            })}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth={true}
            placeholder={translate('optionalNewGroup', {
              ns: COMMON,
              lng: selectedLanguage,
            })}
            aria-label={translate('newGroupNameAriaLabel', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
            })}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          id="cancel-save-button"
          data-testid="cancel-save-button"
          aria-label={translate('cancelSaveAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
          })}
        >
          {translate('cancel', { ns: COMMON, lng: selectedLanguage })}
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          id="confirm-save-button"
          data-testid="confirm-save-button"
          aria-label={translate('confirmSaveAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
          })}
          disabled={!groupName}
        >
          {translate('save', { ns: COMMON, lng: selectedLanguage })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
