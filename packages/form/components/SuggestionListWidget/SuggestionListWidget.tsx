import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useTextWidgetValidations from '@pkg-form/validations/hooks/useTextWidgetValidations';
import { Box, List, ListItem, ListItemText, TextField } from '@mui/material';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps, TextWidgetOptions } from '@pkg-form/types';
import useFormData from '@pkg-common/dataResolver/useFormData';
import { hasValue } from '@pkg-common/utils/utils';
import { getMatchingSuggestion, SUGGESTION_REGEX, transformValue } from './utils';
import useSystem from '@pkg-setup/src/system/useSystem';
import { getAccessibilityErrorProps } from '@pkg-form/validations/utils/widgetUtils';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';

const getStyles = () => ({
  label: {
    '&.MuiInputLabel-root': {
      '&.MuiInputLabel-root': {
        textTransform: 'uppercase',
        paddingLeft: 4,
        fontSize: 12,
        position: 'relative',
        color: '#757575',
      },
    },
    '&.MuiInputLabel-filled.MuiInputLabel-shrink': {
      transform: 'translate(12px, 10px)',
    },
  },
  box: {
    border: '1px solid #3498db',
    backgroundColor: '#f0f8ff',
    padding: '5px 10px',
    borderRadius: '5px',
    boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
    cursor: 'pointer',
    transition: 'box-shadow 0.3s ease-in-out',
    marginBottom: '5px',
  },
  focused: {
    backgroundColor: '#e6e6e6',
  },
  listContainer: { listStyleType: 'none', maxHeight: '200px', overflowY: 'auto' },
});

const SuggestionListWidget = ({
  id,
  autofocus = false,
  options,
  inputProps,
  schema,
  serverErrors,
  diffs,
  formContext,
  value: innerValue,
  onChange,
  required = false,
}: FormWidgetProps & { options: TextWidgetOptions }) => {
  const {
    validations = undefined,
    showLabel = true,
    validateFrom,
    fullWidth = true,
    multiline = true,
    rows = 3,
    validateWhen,
    translation,
    suggestionFrom,
    autoCompleteListKeys,
  } = options;

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { code, label } = autoCompleteListKeys || { code: '', label: '' };

  const classes = getStyles();
  const inputRef = useRef(null);

  const useDefaultMechanism = formContext?.mechanism === 'DEFAULT';

  const { value, setFieldValue, dirty } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const { source } = suggestionFrom;
  const { value: suggestionArray = [''] } = useFormData(id, source);

  const {
    labelUppercase: labelfield,
    helpText,
    omitValidationHints,
  } = useWidgetUtils(schema, options, formContext);

  const { valid, errors } = useTextWidgetValidations(
    id,
    value,
    validations,
    serverErrors || [],
    validateFrom,
    validateWhen,
  );

  useEffect(() => {
    const filteredArray = Array.isArray(suggestionArray)
      ? suggestionArray.filter((item) => !!item[code])
      : [];

    setSuggestions(filteredArray);
  }, [suggestionArray, value]);

  const selectSuggestion = (suggestion) => {
    const words = value.split(SUGGESTION_REGEX);

    const updatedWords = words.map((word) =>
      getMatchingSuggestion(word, suggestions, { inputKey: label, outputKey: code }),
    );

    updatedWords[updatedWords.length - 1] = suggestion[code];
    const updatedValue = updatedWords.join(' ');

    setFocusedIndex(null);
    setFieldValue(updatedValue);
    setFilteredSuggestions([]);
    onChange(updatedValue);
  };

  const onElementChange = (e) => {
    const userValue = e.target.value;
    setFieldValue(userValue);

    const words = userValue.split(SUGGESTION_REGEX);
    const lastWord = words[words.length - 1];

    const filtered = suggestions
      .filter((suggestion) => !!suggestion)
      .filter(
        (suggestion) =>
          (suggestion[label as keyof typeof suggestion] as string)
            ?.toLowerCase()
            ?.indexOf(lastWord?.toLowerCase()) >= 0,
      );
    setFilteredSuggestions(filtered || []);

    const updatedValue = transformValue(userValue, suggestions, {
      inputKey: label,
      outputKey: code,
    });

    setFieldValue(updatedValue);
  };

  const visibleValue = useMemo(() => {
    return transformValue(value, suggestions, {
      inputKey: code,
      outputKey: label,
    });
  }, [value, suggestions]);

  const accessibilityErrorProps = useMemo(() => {
    return getAccessibilityErrorProps(id, !valid);
  }, [valid, id]);

  return (
    <Box>
      <TextField
        ref={inputRef}
        placeholder={translate('expression', { ns: COMMON, lng: selectedLanguage })}
        id={id}
        label={
          showLabel ? (
            <StyledFieldLabel
              label={label}
              required={required}
              omitValidationHints={omitValidationHints}
            />
          ) : null
        }
        helperText={helpText}
        variant={'outlined'}
        color="primary"
        rows={rows}
        multiline={multiline}
        value={hasValue(visibleValue) ? visibleValue : ''}
        fullWidth={fullWidth}
        autoFocus={autofocus}
        required={(validations || {}).required || false}
        slotProps={{
          input: inputProps,
          htmlInput: {
            ['data-testid']: id,
            'aria-label': labelfield,
            'aria-multiline': multiline,
            'aria-required': required,
            ...accessibilityErrorProps,
            tabIndex: 0,
          },
        }}
        type={schema.type || 'string'}
        onChange={onElementChange}
        error={!valid}
      />
      <ValidationErrors
        id={id}
        clientErrors={errors}
        serverErrors={serverErrors}
        validationTranslations={translation}
        diffs={diffs}
        dirty={dirty}
      />
      <List sx={classes.listContainer}>
        {filteredSuggestions &&
          filteredSuggestions.map((suggestion, index) => (
            <ListItem
              key={index}
              data-testid={`${suggestion[label]}`}
              onClick={() => selectSuggestion(suggestion)}
              onMouseOver={() => setFocusedIndex(index)}
              sx={{
                ...classes.box,
                ...classes.label,
                ...(index === focusedIndex ? classes.focused : {}),
              }}
              component="button"
            >
              <ListItemText primary={suggestion[label]} />
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default SuggestionListWidget;
