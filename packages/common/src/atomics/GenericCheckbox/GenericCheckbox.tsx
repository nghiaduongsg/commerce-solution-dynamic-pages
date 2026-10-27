import React, { useMemo } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import { GenericCheckboxProps } from './GenericCheckbox.d';
import { AnyType } from '@pkg-common/types';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import { getAccessibilityErrorProps } from '@pkg-form/validations/utils/widgetUtils';

const GenericCheckbox = ({
  id,
  label,
  value,
  disabled,
  readOnly,
  required,
  autofocus,
  onChange,
  isIndeterminate,
  onBlur,
  onFocus,
  onKeyDown,
  errors,
  uiSchema = {},
  ariaHasPopup = false,
  invalid = false,
  additionalInfo,
}: GenericCheckboxProps) => {
  const onFieldChange = (_e: AnyType, checked: AnyType) => onChange && onChange(checked);
  const onFieldBlur = ({ target: { value: fieldValue } }: AnyType) =>
    onBlur && onBlur(id, fieldValue);
  const onFieldFocus = ({ target: { value: fieldValue } }: AnyType) =>
    onFocus && onFocus(id, fieldValue);

  const buttons = uiSchema['ui:buttons'] ?? {};

  const accessibilityErrorProps = useMemo(() => {
    return getAccessibilityErrorProps(id, invalid);
  }, [invalid, id]);

  return (
    <>
      <FormControlLabel
        style={{ marginLeft: 0 }}
        value={value}
        title={label}
        control={
          <>
            <Checkbox
              id={id}
              data-testid={id}
              checked={value ?? false}
              required={required}
              disabled={disabled || readOnly}
              autoFocus={autofocus}
              onChange={onFieldChange}
              onBlur={onFieldBlur}
              onFocus={onFieldFocus}
              onKeyDown={onKeyDown}
              indeterminate={isIndeterminate}
              sx={{
                '& .MuiSvgIcon-root': {
                  color: disabled || readOnly ? 'primary' : '#0F7B9F',
                },
              }}
              slotProps={{
                input: {
                  'data-testid': id,
                  'aria-checked': value ?? false,
                  'aria-labelledby': `${id}-label`,
                  'aria-required': required,
                  'aria-haspopup': ariaHasPopup,
                  ...(accessibilityErrorProps ?? {}),
                  tabIndex: 0,
                  'aria-description': additionalInfo,
                },
              }}
            />
            <div style={{ display: 'flex', paddingTop: '14px' }}>
              {buttons && (
                <AppActions
                  page={uiSchema['ui:page'] || { id: `${id}` }}
                  actions={uiSchema['ui:buttons'] ?? {}}
                  checkPermissions={true}
                />
              )}
            </div>
          </>
        }
        label={label ? <span id={`${id}-label`}>{label}</span> : null}
      />
      {errors}
    </>
  );
};
export default GenericCheckbox;
