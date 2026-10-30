import React, { useEffect } from 'react';
import { Stack } from '@mui/material';
import { SlidersHorizontal } from 'lucide-react';
import FormGroupContentContainer from '@pkg-form/groups/FormGroupContentContainer';
import { DynamicFormGroup, FormContextSchema } from '@pkg-form/types';
import TabsFormGrouping from '@pkg-form/groups/Tabbar/TabsFormGrouping';
import FormGroupContent from '@pkg-form/groups/FormGroupContent';
import FormGroupContainer from '@pkg-form/groups/FormGroupContainer';
import CollapseContent from '@pkg-common/atomics/CollapseContent/CollapseContent';
import FormGroupTitle from '@pkg-form/groups/FormGroupTitle';
import FormGroupDividerTitle from '@pkg-form/groups/FormGroupDividerTitle';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { AnyType } from '@pkg-common/types';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import HeaderTitle from '@pkg-form/templates/FieldTitle/HeaderTitle';
import GenericCard from '../../common/src/atomics/GenericCard/GenericCard';
import StepsFormGrouping from '@pkg-form/groups/Stepper/StepsFormGrouping';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { hasValue } from '@pkg-common/utils';
import DynamicFormGroups from './DynamicFormGroups';
import { resolveFilterIcon } from '@pkg-layout/src/common/utils';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';
import WithInfoPieces from '@pkg-form/groups/WithInfoPieces';
import FormAccordionProvider from '@pkg-form/groups/contexts/FormAccordionProvider';
import StackedAccordion from '@pkg-form/groups/accordion/StackedAccordion';
import useReviewDocument from '@pkg-form/hooks/useReviewDocument';

const FormGroup = ({
  id,
  namespace,
  elements,
  group,
  formContext,
  level,
  totalGroups,
}: {
  id: string;
  namespace: string;
  elements: Array<AnyType>;
  formContext: FormContextSchema;
  group: DynamicFormGroup;
  level: number;
  totalGroups: number;
}) => {
  const { t: localizeUi } = useTranslation('common');

  const { formId } = formContext ?? {};
  const { setManyFieldsVisibility } = useFormManagerContext();
  const { removeMultipleFieldErrors } = useValidationsContext();
  const { selectedLanguage } = useSystem();

  const { options, visibilityFrom, widgets, values } = group;
  const buttons = group['ui:buttons'];
  const contentButton = group['ui:content:buttons'];
  const information = group['ui:information'];
  const normalizedInformation = information ? [{ ...information, namespace }] : undefined;

  const { columns, icon, styleOverrides } = options || {};

  const { t: translate } = useTranslation([namespace, COMMON]);
  const { check: visible } = useCheckFrom(id, visibilityFrom, true);
  const { fetchReviewDocument } = useReviewDocument(values);

  useEffect(() => {
    if (!visible && hasValue(visibilityFrom) && widgets?.length) {
      const ids = widgets?.map((widgetId) => `${formId}_${widgetId}`);
      setManyFieldsVisibility(ids, visible);
      removeMultipleFieldErrors(ids);
    }
  }, [visible, widgets, visibilityFrom]);

  if (!visible) {
    return null;
  }

  switch (group.type) {
    case 'Tab':
      return (
        <FormGroupContainer visible={visible} totalGroups={totalGroups} columns={columns}>
          <TabsFormGrouping
            id={group.key}
            parentId={id}
            tabs={group.tabs}
            options={group.options}
            namespace={namespace}
            elements={elements}
            level={level}
            buttons={buttons}
            information={normalizedInformation}
            formContext={formContext}
          />
        </FormGroupContainer>
      );
    case 'StackedAccordions':
      return (
        <FormGroupContainer visible={visible} totalGroups={totalGroups} columns={columns}>
          <Stack spacing={1.5} role="list" aria-label={localizeUi('ui.filterCategories')}>
            <FormAccordionProvider>
              {group?.groups?.map((acc, index) => {
                const accLabel = translate(acc.key, { ns: namespace, lng: selectedLanguage });

                const Icon = resolveFilterIcon(acc?.icon ?? 'SlidersHorizontal');

                return (
                  <StackedAccordion
                    key={acc.key}
                    groupKey={acc.key}
                    index={index + 1}
                    label={accLabel}
                    icon={Icon ? <Icon size={20} /> : <SlidersHorizontal size={18} />}
                    defaultExpanded={acc?.defaultExpanded}
                  >
                    <DynamicFormGroups
                      id={`${id}-${acc.key}-filter-groups`}
                      namespace={namespace}
                      elements={elements}
                      groups={acc.groups ?? []}
                      level={1}
                      formContext={formContext}
                    />
                  </StackedAccordion>
                );
              })}
            </FormAccordionProvider>
          </Stack>
        </FormGroupContainer>
      );
    case 'Stepper':
      return (
        <FormGroupContainer visible={visible} totalGroups={totalGroups} columns={columns}>
          <StepsFormGrouping
            id={group.key}
            parentId={id}
            steps={group.tabs}
            buttons={group['ui:buttons:last']}
            information={normalizedInformation}
            options={group.options}
            namespace={namespace}
            elements={elements}
            level={level}
            formContext={formContext}
          />
        </FormGroupContainer>
      );
    case 'Accordion':
      return (
        <FormGroupContainer visible={visible} totalGroups={totalGroups} columns={columns}>
          <CollapseContent
            title={translate(group.key, { ns: namespace, lng: selectedLanguage })}
            id={`${group.key}-accordion`}
            buttons={buttons}
            information={normalizedInformation}
          >
            <FormGroupContentContainer spacing={group.styles?.spacing}>
              <FormGroupContent
                namespace={namespace}
                elements={elements}
                group={group}
                level={level}
                formContext={formContext}
              />
            </FormGroupContentContainer>
          </CollapseContent>
        </FormGroupContainer>
      );
    case 'ReviewDocument':
      return (
        <FormGroupContainer visible={visible} totalGroups={totalGroups} columns={columns}>
          <CollapseContent
            title={translate(group.key, { ns: namespace, lng: selectedLanguage })}
            id={`${group.key}-accordion`}
            buttons={buttons}
            information={normalizedInformation}
            collapseStatus={true}
            onToggle={async (nextExpanded) => {
              if (nextExpanded) {
                await fetchReviewDocument();
              }
            }}
          >
            <FormGroupContentContainer spacing={group.styles?.spacing}>
              <FormGroupContent
                namespace={namespace}
                elements={elements}
                group={group}
                level={level}
                formContext={formContext}
              />
            </FormGroupContentContainer>
          </CollapseContent>
        </FormGroupContainer>
      );
    case 'Header':
      return (
        <FormGroupContainer visible={visible} totalGroups={totalGroups} columns={columns}>
          <FormGroupTitle
            id={group.key}
            elements={elements}
            title={
              <HeaderTitle
                id={`${id}-${group?.key}`}
                testId={id}
                title={translate(group.key, { ns: namespace, lng: selectedLanguage })}
                buttons={buttons}
                information={normalizedInformation}
              />
            }
            isTable={group.isTable ?? false}
            showHistoryDetails={group.showHistoryDetails}
          />

          <FormGroupContentContainer spacing={group.styles?.spacing}>
            <FormGroupContent
              namespace={namespace}
              elements={elements}
              group={group}
              level={level}
              formContext={formContext}
            />
          </FormGroupContentContainer>
        </FormGroupContainer>
      );

    case 'TableCell': {
      return (
        <FormGroupContainer
          visible={visible}
          totalGroups={totalGroups}
          applySpacing={false}
          columns={columns}
        >
          <FormGroupTitle
            id={group.key}
            title={translate(group.key, { ns: namespace, lng: selectedLanguage })}
            isTable
          />
          <FormGroupContentContainer>
            <FormGroupContent
              namespace={namespace}
              elements={elements}
              group={group}
              level={level}
              formContext={formContext}
            />
          </FormGroupContentContainer>
        </FormGroupContainer>
      );
    }

    case 'Divider':
      return (
        <FormGroupContainer visible={visible} totalGroups={totalGroups} columns={columns}>
          <FormGroupDividerTitle
            id={group.key}
            title={translate(group.key, { ns: namespace, lng: selectedLanguage })}
            drawerActivityFrom={group.drawerActivityFrom}
            buttons={buttons}
            information={normalizedInformation}
          />

          <FormGroupContentContainer spacing={group.styles?.spacing} sx={{ marginTop: 4 }}>
            <FormGroupContent
              namespace={namespace}
              elements={elements}
              group={group}
              level={level}
              formContext={formContext}
            />
          </FormGroupContentContainer>
        </FormGroupContainer>
      );

    case 'ExpandableCard':
    case 'Card':
      return (
        <FormGroupContainer visible={visible} totalGroups={totalGroups} columns={columns}>
          <GenericCard
            id={id}
            title={translate(group.key, { ns: namespace, lng: selectedLanguage })}
            collapsible={group.type === 'ExpandableCard'}
            actions={<AppActions page={{ id }} actions={buttons} checkPermissions={true} />}
            information={normalizedInformation}
            styleOverrides={styleOverrides}
            icon={icon}
          >
            <FormGroupContentContainer spacing={group.styles?.spacing || 2}>
              <AppActions page={{ id }} actions={contentButton} checkPermissions={true} />
              <FormGroupContent
                namespace={namespace}
                elements={elements}
                group={group}
                level={level}
                formContext={formContext}
              />
            </FormGroupContentContainer>
          </GenericCard>
        </FormGroupContainer>
      );
    default:
      return (
        <FormGroupContainer visible={visible} totalGroups={totalGroups} columns={columns}>
          <FormGroupContentContainer spacing={group.styles?.spacing || 1}>
            <AppActions page={{ id }} actions={buttons} checkPermissions={true} />
            <WithInfoPieces id={id} info={normalizedInformation}>
              <FormGroupContent
                namespace={namespace}
                elements={elements}
                group={group}
                level={level}
                formContext={formContext}
              />
            </WithInfoPieces>
          </FormGroupContentContainer>
        </FormGroupContainer>
      );
  }
};

export default FormGroup;
