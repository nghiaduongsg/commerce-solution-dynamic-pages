import React from 'react';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps, TextWidgetOptions } from '@pkg-form/types';
import { Box, Chip, FormControl, useTheme } from '@mui/material';
import FieldTitle from '@pkg-form/templates/FieldTitle/FieldTitle';
import useTextWidgetValidations from '@pkg-form/validations/hooks/useTextWidgetValidations';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useCodeListWidgetUtils from '../../SelectCodeListWidget/hooks/useCodeListWidgetUtils';
import { COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import getStyles from '../styles';

const CodelistTree = ({
  id,
  options,
  schema,
  serverErrors,
  formContext,
  serverErrorTypes,
  diffs,
  value: innerValue,
  onChange,
}: FormWidgetProps & { options: TextWidgetOptions }) => {
  const { validations, multiple, mapToProperty } = options;
  const theme = useTheme();
  const styles = getStyles(theme);
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  const { mechanism } = formContext || {};
  const useDefaultMechanism = mechanism === 'DEFAULT';
  const { value } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
    600,
  );
  const { label } = useWidgetUtils(schema, options, formContext);

  const { valid, errors } = useTextWidgetValidations(id, value, validations, serverErrors || []);

  const { selectedValue } = useCodeListWidgetUtils(value, multiple, mapToProperty);
  return (
    <>
      <FormControl
        fullWidth={true}
        title={label}
        required={(validations || {}).required || false}
        error={!valid}
      >
        <FieldTitle sx={{ ...styles.fieldLabel }} title={label} isValid={valid} />
        <Box sx={{ ...styles.box }} tabIndex={0}>
          <Box sx={styles.selectedItem}>
            {selectedValue.length === 0 ? (
              <Box sx={{ color: 'text.secondary' }}>
                {translate('noSelection', { ns: COMMON, lng: selectedLanguage })}
              </Box>
            ) : (
              <Box sx={{ color: 'text.secondary' }}>
                {(Array.isArray(selectedValue) ? selectedValue : [selectedValue])?.map(
                  (item, index) => {
                    return (
                      <Chip
                        key={`${item}-${index}`}
                        label={item}
                        size="small"
                        clickable={false}
                        variant={'outlined'}
                      />
                    );
                  },
                )}
              </Box>
            )}
          </Box>
        </Box>
      </FormControl>
      {errors && (
        <ValidationErrors
          id={id}
          clientErrors={errors}
          serverErrors={serverErrors}
          serverErrorTypes={serverErrorTypes}
          diffs={diffs}
          dirty={true}
        />
      )}
    </>
  );
};

export default CodelistTree;
