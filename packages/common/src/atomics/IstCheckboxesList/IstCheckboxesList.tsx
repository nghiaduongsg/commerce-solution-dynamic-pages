import React from 'react';
import { Box, ListItem, List } from '@mui/material';
import { IstCheckboxesListProps } from './IstCheckboxesList.d';
import GenericCheckbox from '../GenericCheckbox/GenericCheckbox';
import { AnyType } from '@pkg-common/types';

const IstCheckboxesList = ({
  id,
  value,
  multiple,
  options,
  disabledOptions = [],
  onChange,
  errors,
}: IstCheckboxesListProps) => {
  const onValueChecked = (checked: AnyType, code: AnyType) => {
    if (!onChange) {
      return;
    }

    if (!multiple) {
      onChange([code]);
    } else {
      onChange(checked ? [...(value || []), code] : (value || []).filter((v) => v !== code));
    }
  };

  return (
    <List>
      {options.map((option) => (
        <ListItem key={`${id}-${option.code}-list-item`} sx={{ padding: 0 }}>
          <Box component="div">
            <GenericCheckbox
              id={`${id}-${option.code}`}
              label={option.label}
              value={(value || []).includes(option.code)}
              disabled={(disabledOptions || [])?.includes(option.code)}
              readOnly={false}
              required={false}
              autofocus={false}
              onChange={(checked) => onValueChecked(checked, option.code)}
            />
          </Box>
        </ListItem>
      ))}
      {errors}
    </List>
  );
};

export default IstCheckboxesList;
