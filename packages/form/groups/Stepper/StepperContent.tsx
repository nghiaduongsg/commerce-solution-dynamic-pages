import React from 'react';
import DynamicFormGroups from '@pkg-form/groups/DynamicFormGroups';
import { DynamicFormGroup, FormContextSchema } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import GenericInfoCard from '@pkg-common/atomics/GenericInfoCard/GenericInfoCard';
import { getStyles } from '@pkg-form/groups/Stepper/styles';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import Resource from '@pkg-common/components/Resource/Resource';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { Box } from '@mui/material';

const StepperContent = ({
  id,
  step,
  namespace,
  elements,
  level,
  parentId,
  active,
  formContext,
}: {
  id: string;
  step: DynamicFormGroup;
  namespace: string;
  elements: Array<AnyType>;
  level: number;
  parentId: string;
  active: boolean;
  formContext: FormContextSchema;
}) => {
  const styles = getStyles();
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([namespace || COMMON, ACCESSIBILITY]);

  const { check: visible } = useCheckFrom(id, step?.visibilityFrom, true);

  return (
    visible && (
      <div
        key={`${id}-${step.key}-step-content`}
        id={`${parentId}-${step.key}-step-content`}
        data-testid={`${parentId}-${step.key}-tab-content`}
        aria-label={translate('stepPanelAriaLabel', { ns: ACCESSIBILITY, lng: selectedLanguage })}
        style={{
          visibility: active ? 'visible' : 'hidden',
          height: active ? 'auto' : 0,
        }}
      >
        {step.info && (
          <GenericInfoCard info={translate(step.info, { ns: namespace, lng: selectedLanguage })} />
        )}

        {active &&
          step?.callApis?.map((resource) => (
            <Resource key={resource.resourceId} resource={resource} widgetId={id} />
          ))}

        <Box sx={styles.container}>
          <DynamicFormGroups
            id={`${id}-${step.key}-step-content-groups`}
            data-testid={`${id}-${step.key}-step-content-groups`}
            namespace={namespace}
            elements={elements}
            groups={step.groups || []}
            level={level}
            formContext={formContext}
          />
        </Box>
      </div>
    )
  );
};

export default StepperContent;
