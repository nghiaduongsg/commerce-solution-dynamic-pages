import React, { forwardRef, useMemo } from 'react';
import { GenericTextFieldProps } from './GenericTextField.d';
import { FormControl, TextField } from '@mui/material';
import useMask from '@pkg-form/hooks/useMask';
import { getAccessibilityErrorProps, getWidgetSize } from '@pkg-form/validations/utils/widgetUtils';
import FieldTitle from '@pkg-form/templates/FieldTitle/FieldTitle';
import { AnyType } from '@pkg-common/types';
import { useTheme } from '@mui/material/styles';
import { useGenericSelectStyles } from '@pkg-common/atomics/GenericSelect/styles';

export const GenericTextField: React.FC<GenericTextFieldProps> = forwardRef(
  (
    {
      id,
      required = false,
      readonly = false,
      disabled = false,
      label = '',
      value,
      onChange,
      onClick,
      onBlur,
      onFocus,
      autofocus = false,
      rows,
      multiline,
      emptyValue,
      inputProps,
      errors,
      valid = true,
      type = 'text',
      description,
      showLabel = true,
      fullWidth = false,
      widthSize,
      labelAlignment = 'top',
      mask,
      testId,
      textAreaProps = {},
      variant,
      placeHolder,
      additionalInfo,
      styledFieldLabel,
    }: GenericTextFieldProps,
    ref,
  ) => {
    const styles = useGenericSelectStyles();

    const onElementChange = ({ target: { value: fieldValue } }: AnyType) => {
      if (!onChange || (mask && shouldApplyMask)) {
        return;
      }
      try {
        let finalValue: AnyType;

        if (type === 'number') {
          finalValue = Number.parseFloat(fieldValue);
        } else if (type === 'integer') {
          let sanitized = fieldValue.replaceAll(/[^0-9+-]/g, '');
          finalValue = Number.parseInt(sanitized, 10);
        } else {
          finalValue = fieldValue?.replaceAll(/↵/, '\n');
        }

        onChange(fieldValue === '' ? emptyValue : finalValue); // replace carriage return with \n to maintain new lines
      } catch {
        onChange(fieldValue === '' ? emptyValue : fieldValue);
      }
    };

    const onElementBlur = ({ target }: AnyType) => {
      if (!onBlur || !target || !target.value) {
        return;
      }

      try {
        let finalValue: AnyType;

        if (type === 'number') {
          finalValue = Number.parseFloat(target.value);
        } else if (type === 'integer') {
          let sanitized = target.value.replaceAll(/[^0-9+-]/g, '');
          finalValue = Number.parseInt(sanitized, 10);
        } else {
          finalValue = target.value;
        }

        onBlur(id, finalValue);
      } catch {
        onBlur(id, emptyValue);
      }
    };

    const onElementFocus = ({ target: { value: fieldValue } }: AnyType) =>
      onFocus && onFocus(id, fieldValue);

    const {
      ref: maskRef,
      value: maskedValue,
      unmaskedValue,
      shouldApplyMask,
    } = useMask(id, mask, onChange);

    const accessibilityErrorProps = useMemo(() => {
      return getAccessibilityErrorProps(id, !valid);
    }, [valid, id]);

    const memoizedWidgetSize = useMemo(() => {
      return getWidgetSize(widthSize, fullWidth);
    }, [widthSize, fullWidth]);

    const finalType = useMemo(() => {
      if (type === 'integer') return 'number';
      return type;
    }, [type]);

    return (
      <FormControl
        required={required}
        error={!valid}
        sx={{
          color: useTheme().palette?.primary.contrastText,
          ...memoizedWidgetSize,
        }}
        fullWidth={fullWidth}
        title={label}
      >
        {labelAlignment === 'left' && <FieldTitle title={label} isBold={true} isValid={valid} />}

        <TextField
          placeholder={placeHolder}
          inputRef={mask ? maskRef : ref}
          id={`${id}-html-input`}
          label={showLabel ? styledFieldLabel : ''}
          variant={variant ?? 'outlined'}
          color="primary"
          value={mask && shouldApplyMask ? maskedValue || unmaskedValue || value : value}
          multiline={multiline}
          minRows={rows}
          maxRows={Number(rows) >= 5 ? rows : undefined}
          autoFocus={autofocus}
          required={required}
          slotProps={
            {
              inputLabel: {
                required: false,
                sx: labelAlignment === 'left' ? styles.leftAlignmentLabel : {},
                error: !valid,
                disabled: false,
                id: `${id}-input-label`,
                ['data-testid']: `${id}-label`,
              },
              input: {
                sx: { minHeight: 24, minWidth: 24, padding: 0 },
                ...inputProps,
                id: `${id}-input`,
                'aria-description': additionalInfo,
              },
              htmlInput: {
                ['data-testid']: testId ?? id,
                id: `${id}-html-input`,
                tabIndex: 0,
                'aria-labelledby': showLabel ? `${id}-input-label` : undefined,
                'aria-label': !showLabel ? label : undefined,
                'aria-required': required,
                'aria-multiline':
                  type !== 'number' && type !== 'integer' && multiline ? 'true' : undefined,

                ...accessibilityErrorProps,
                ...textAreaProps,
                style: inputProps?.style,
              },
            } as any
          }
          disabled={disabled || readonly}
          onChange={onElementChange}
          onClick={onClick}
          onBlur={onElementBlur}
          onFocus={onElementFocus}
          error={!valid}
          type={finalType}
          helperText={description}
          onKeyDown={(event) => {
            if (event.key.toLowerCase() === 'c') {
              event.stopPropagation();
            }
          }}
        />
        {errors}
      </FormControl>
    );
  },
);

export default GenericTextField;
