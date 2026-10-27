import React, { useMemo } from 'react';
import { isEqual } from 'lodash';

import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useFieldServerValidations from '@pkg-form/validations/hooks/useFieldServerValidations';
import useDiffs from '@pkg-common/dataComparison/useDiffs';
import { Grid } from '@mui/material';
import { getAccessibilityErrorProps } from '@pkg-form/validations/utils/widgetUtils';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
import useValidations from '@pkg-form/validations/hooks/useValidations';

function ArrayErrorContainer({ fieldId, items, validations }) {
  const { errors: serverErrors } = useFieldServerValidations(fieldId);
  const { isFieldDirty } = useFormManagerContext();
  const { diffs } = useDiffs();

  const dirty = isFieldDirty(fieldId);

  const { errors: clientErrors } = useValidations(
    fieldId,
    items,
    'array',
    validations,
    undefined,
    serverErrors,
    true,
  );

  const isValid = useMemo(() => {
    return (!clientErrors || !clientErrors.length) && (!serverErrors || !serverErrors.length);
  }, [clientErrors, serverErrors]);

  const accessibilityErrorProps = useMemo(() => {
    return getAccessibilityErrorProps(fieldId, dirty);
  }, [dirty, fieldId]);

  if (isValid) {
    return null;
  }

  return (
    <Grid size={{ xs: 12 }} {...accessibilityErrorProps}>
      <ValidationErrors
        id={fieldId}
        clientErrors={clientErrors}
        serverErrors={serverErrors}
        diffs={(diffs || {})[fieldId] || []}
        dirty={dirty}
      />
    </Grid>
  );
}

export default React.memo(
  ArrayErrorContainer,
  (prev, next) =>
    prev.fieldId === next.fieldId &&
    isEqual(prev.items, next.items) &&
    isEqual(prev.validations, next.validations),
);
