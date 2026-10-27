import React, { useEffect, useMemo, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import TabPanel from './TabPanel';
import DynamicFormGroups from '@pkg-form/groups/DynamicFormGroups';
import { DynamicFormGroup, FormContextSchema } from '@pkg-form/types';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useSelector, useStore } from 'react-redux';
import { selectFormServerErrors } from '@pkg-form/validations/redux/selectors';
import { extractKeyArrayFromErrors } from '@pkg-form/validations/utils/widgetUtils';
import { AnyType, CheckFromSchema, InfoSchema } from '@pkg-common/types';
import { AppActionButtons } from '@pkg-common/components/AppActions/types';
import HeaderTitle from '@pkg-form/templates/FieldTitle/HeaderTitle';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTheme } from '@mui/material/styles';
import { shouldBeApplied } from '@pkg-common/dataResolver/utils';
import { useUser } from '@pkg-setup/index';
import { useLocation, useParams } from 'react-router';
import useFormValidity from '@pkg-form/validations/hooks/useFormValidity';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import { hasValue } from '@pkg-common/utils';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';
import { getTabKeys, hasErrorsInsideTab } from '@pkg-common/utils/utils';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const getStyles = (theme) => {
  return {
    container: {
      width: '100%',
    },
    tabContainer: {
      paddingTop: theme.spacing(3),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  };
};

const TabsFormGrouping = ({
  id,
  tabs,
  namespace,
  elements,
  level,
  options,
  parentId,
  buttons,
  information,
  formContext,
}: {
  id: string;
  tabs: Array<DynamicFormGroup> | undefined;
  namespace: string;
  elements: Array<AnyType>;
  level: number;
  options?: {
    activeTab?: number;
  };
  parentId: string;
  buttons?: AppActionButtons;
  information?: Array<InfoSchema>;
  formContext: FormContextSchema;
}) => {
  const styles = getStyles(useTheme());
  const { t: translate } = useTranslation([namespace || COMMON, ACCESSIBILITY]);
  const { setValidationStep, validationStep, resetValidationStep } = useFormValidity();

  const { selectedLanguage, application } = useSystem();
  const { partyRoleId, userId } = useUser();
  const storeState = useStore();
  const { state: locationState } = useLocation();
  const routeParams = useParams();
  const pageId = useMemo(() => {
    return routeParams?.category || '';
  }, [routeParams]);
  const { isFormValid, errors: clientErrors } = useValidationsContext();
  const { isFormDirty } = useFormManagerContext();
  const errors = useSelector(selectFormServerErrors);

  const formDirty = isFormDirty(pageId);

  // We added initialization of selectedTabindex via props (which is coming from schema) to set an active tab initially.
  // This is needed in cases where we want to filter listings initially while the filter widgets does not belong to the first group
  // So by setting the second tab as an active tab the filter widgets are rendered and request accordingly.
  // The downside of this is that we can't initially trigger filters across different groups
  // TODO: we need to find a way to mount all the tabs but to show only one as well for the afformentioned reasons.
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(options?.activeTab ?? 0);

  const finalErrors = useMemo(() => {
    if (Object.keys(clientErrors).length > 0 && !isFormValid(pageId) && formDirty)
      return clientErrors;
    else return errors;
  }, [errors, clientErrors, isFormValid, formDirty]);

  const tabKeysWithErrors = useMemo(() => {
    return extractKeyArrayFromErrors(finalErrors, '_', 1);
  }, [finalErrors]);

  const user = useMemo(() => {
    return application === 'ISS' ? userId : partyRoleId;
  }, [partyRoleId, userId]);

  const visibleTabs = useMemo(() => {
    return (tabs || []).filter((tab) =>
      shouldBeApplied(tab?.visibilityFrom as CheckFromSchema, id, {
        user,
        state: storeState?.getState() || {},
        routeParams,
        routerData: locationState,
      }),
    );
  }, [id, storeState?.getState(), routeParams, locationState]);

  const selectedTabValidationStep = useMemo(() => {
    return visibleTabs?.find((_, index) => index === selectedTabIndex)?.validationStep;
  }, [selectedTabIndex, visibleTabs]);

  useEffect(() => {
    if (selectedTabValidationStep && selectedTabValidationStep !== validationStep) {
      setValidationStep(selectedTabValidationStep);
    } else if (!hasValue(selectedTabValidationStep) && hasValue(validationStep)) {
      resetValidationStep();
    }
  }, [selectedTabValidationStep, validationStep]);

  return (
    <Box sx={styles.container}>
      <Tabs
        id={`${parentId}-${id}-tabs`}
        role="tablist"
        tabIndex={0}
        data-testid={`${parentId}-${id}-tabs`}
        value={selectedTabIndex || 0}
        onChange={(_, tabIndex) => setSelectedTabIndex(tabIndex)}
        scrollButtons="auto"
        variant="scrollable"
        textColor="primary"
        indicatorColor="secondary"
        slotProps={{
          scrollButtons: {
            id: `${parentId}-${id}-scroll-button`,
            'data-testid': `${parentId}-${id}-scroll-button`,
          },
        }}
      >
        {visibleTabs?.map((tab, index) => (
          <Tab
            label={
              <HeaderTitle
                id={`${id}-${tab.key}-tab-title`}
                testId={id}
                title={translate(tab.key, { ns: namespace, lng: selectedLanguage })}
                buttons={buttons}
                information={information}
              />
            }
            aria-controls={`${id}-${tab.key}-panel`}
            role="tab"
            key={`${id}-${tab.key}-tab`}
            id={`${parentId}-${id}-${tab.key}-tab`}
            data-testid={`${parentId}-${id}-${tab.key}-tab`}
            aria-selected={selectedTabIndex === index}
            aria-labelledby={`${id}-${tab.key}-tab-title`}
            tabIndex={0}
            icon={
              hasErrorsInsideTab(getTabKeys(tab), tabKeysWithErrors) ? (
                <AssetByType input="icons" name="InfoRounded" props={{ htmlColor: '#E40505' }} />
              ) : (
                ''
              )
            }
          />
        ))}
      </Tabs>
      {visibleTabs?.map((tab, index) => (
        <TabPanel
          key={`${id}-${tab.key}-tab-content`}
          id={`${id}-${tab.key}`}
          data-testid={`${parentId}-${tab.key}-tab-content`}
          selectedTabIndex={selectedTabIndex}
          index={index}
        >
          <Box sx={styles.tabContainer}>
            <DynamicFormGroups
              id={`${id}-${tab.key}-tab-content-groups`}
              data-testid={`${id}-${tab.key}-tab-content-groups`}
              namespace={namespace}
              elements={elements}
              groups={tab.groups || []}
              level={level}
              formContext={formContext}
            />
            <AppActions page={{ id }} actions={tab['ui:buttons']} checkPermissions={true} />
          </Box>
        </TabPanel>
      ))}
    </Box>
  );
};

export default TabsFormGrouping;
