import React, { useCallback, useMemo, useState } from 'react';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps, VirtualisedTreeOptions } from '@pkg-form/types';
import FormTypeTreeNode from './FormTypeTreeNode';
import { Box, useTheme } from '@mui/material';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useClearFrom from '@pkg-form/hooks/useClearFrom';
import FormTypeTreeDialog from '@pkg-form/components/Tree/FormTypeVirtualTree/FormTypeTreeDialog';
import VirtualItem from '@pkg-common/virtualScroller/VirtualItem';
import VirtualScroller from '@pkg-common/virtualScroller/VirtualScroller';
import FormGroupDividerTitle from '@pkg-form/groups/FormGroupDividerTitle';
import { AnyType } from '@pkg-common/types';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';

const getContainerWidget = (level) => {
  if (level === 0) {
    return '60%';
  } else {
    return '100%';
  }
};

const treeContainer = (level) => {
  return {
    width: getContainerWidget(level),
    flexDirection: 'column',
    alignItems: 'center',
    maxHeight: '80vh',
    overflow: 'auto',
    margin: 3,
  };
};

const FormTypeVirtualTree = ({
  id,
  options,
  formContext,
  schema,
  uiSchema,
  disabled: isTreeDisabled,
  parent,
  onItemClear,
}: FormWidgetProps & { options: VirtualisedTreeOptions }) => {
  const theme = useTheme();

  const {
    clearFrom,
    childrenProperty,
    nodeProperties,
    parentProperty,
    level,
    omitAddNew,
    omitDelete,
  } = options ?? {};

  const { namespace } = formContext || {};

  const { selectedLanguage } = useSystem();
  const { label, readOnlyLabel } = useWidgetUtils(schema, options, formContext);
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, namespace]);
  const { value } = useFormField(id, undefined, false);

  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AnyType>();
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [openSearch, setOpenSearch] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState([]);

  useClearFrom(id, clearFrom);

  const disabled = useMemo(() => {
    return uiSchema['ui:disabled'];
  }, [uiSchema]);

  const isDisabled = useMemo(() => {
    return disabled || isTreeDisabled;
  }, [disabled, isTreeDisabled]);

  // const [_, cancel] = useTableFilterActions(
  //   () => {
  //     if (query) {
  //       setOperationInProgress(true);
  //       const results = filterItems(value, query);
  //       console.log(results);
  //       setSearchResults(results);
  //       onNodeChange();
  //     } else {
  //       setSearchResults([]);
  //     }
  //   },
  //   600,
  //   [query, value],
  // );

  const onNodeChange = useCallback(() => {
    setOperationInProgress(true);

    const timeout = setTimeout(() => {
      setOperationInProgress(false);
      // if (selectedItem?.__INDEX__ === itemIndex) {
      setSelectedItem(null);
      // }
      if (timeout) {
        clearTimeout(timeout);
      }
    }, 10);
  }, [value, selectedItem]);

  const VirtualScrollChildren = (query ? searchResults : value)?.map((item, index) => (
    <VirtualItem key={index} height={60}>
      <FormTypeTreeNode
        id={id}
        selected={index === selectedItem?.__INDEX__}
        item={{ ...item, __INDEX__: index }}
        level={level}
        nodeProperties={nodeProperties}
        childrenProperty={childrenProperty}
        schema={schema}
        uiSchema={uiSchema}
        formContext={formContext}
        namespace={namespace}
        disabled={isDisabled}
        parent={parent}
        omitAddNew={omitAddNew}
        omitDelete={omitDelete}
        label={readOnlyLabel}
        onNodeSelect={() => {
          setSelectedItem(null);
          setTimeout(() => {
            setSelectedItem({ ...item, __INDEX__: index });
          }, 20);
        }}
        onNodeChange={onNodeChange}
      />
    </VirtualItem>
  ));

  return (
    <Box
      sx={{
        width: '100%',
        displayItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
      }}
    >
      <FormGroupDividerTitle
        id={id}
        title={parent?.__LABEL__ ? `${readOnlyLabel}: ${parent?.__LABEL__}` : readOnlyLabel}
      >
        {/*{!openSearch && (*/}
        {/*  <GenericIconButton*/}
        {/*    id={`search-button`}*/}
        {/*    testId={`search-button`}*/}
        {/*    ariaLabel={translate('openSearchKeyButtonAriaLabel', {*/}
        {/*      ns: ACCESSIBILITY,*/}
        {/*      lng: selectedLanguage,*/}
        {/*      table: label,*/}
        {/*    })}*/}
        {/*    onClick={() => setOpenSearch(!openSearch)}*/}
        {/*    icon={*/}
        {/*      <AssetByType*/}
        {/*        input="icons"*/}
        {/*        name="Search"*/}
        {/*        props={query ? { color: theme.palette.primary.dark } : {}}*/}
        {/*      />*/}
        {/*    }*/}
        {/*  />*/}
        {/*)}*/}

        {/*{openSearch && (*/}
        {/*  <TextField*/}
        {/*    size="small"*/}
        {/*    onChange={(event) => setQuery(event.target.value.toLowerCase())}*/}
        {/*    value={query}*/}
        {/*    autoFocus*/}
        {/*    slotProps={{*/}
        {/*      htmlInput: {*/}
        {/*        ['data-testid']: 'menu-searchField',*/}
        {/*        'aria-label': translate('searchKeyFieldAriaLabel', {*/}
        {/*          ns: ACCESSIBILITY,*/}
        {/*          lng: selectedLanguage,*/}
        {/*          table: label,*/}
        {/*        }),*/}
        {/*        tabIndex: 0,*/}
        {/*        role: 'searchbox',*/}
        {/*      },*/}
        {/*      input: {*/}
        {/*        style: { padding: theme.spacing(0.5, 1) },*/}
        {/*        endAdornment: (*/}
        {/*          <InputAdornment position="end">*/}
        {/*            <GenericIconButton*/}
        {/*              id={`${id}-close-search-btn`}*/}
        {/*              testId="close-search-btn"*/}
        {/*              ariaLabel={translate('clearSearchKeyButtonAriaLabel', {*/}
        {/*                ns: COMMON,*/}
        {/*                lng: selectedLanguage,*/}
        {/*                table: label,*/}
        {/*              })}*/}
        {/*              onClick={() => {*/}
        {/*                setQuery('');*/}
        {/*                setOpenSearch(false);*/}
        {/*                // setAnnouncement(*/}
        {/*                //   `${id}-search-key-clear`,*/}
        {/*                //   translate('searchKeyCleared', {*/}
        {/*                //     ns: ACCESSIBILITY,*/}
        {/*                //     lng: selectedLanguage,*/}
        {/*                //   }),*/}
        {/*                // );*/}
        {/*              }}*/}
        {/*              icon={<AssetByType input="icons" name="Clear" />}*/}
        {/*            />*/}
        {/*          </InputAdornment>*/}
        {/*        ),*/}
        {/*      },*/}
        {/*    }}*/}
        {/*  />*/}
        {/*)}*/}

        {!omitAddNew ? (
          <GenericIconButton
            id={`${id}-add-btn`}
            testId={`${id}-add-btn`}
            ariaLabel={translate('addNewAriaDescription', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
              field: translate(id, {
                ns: namespace,
                lng: selectedLanguage,
              }),
            })}
            ariaHasPopup={'dialog'}
            ariaControls={showDialog ? id : undefined}
            onClick={() => {
              setShowDialog(true);
            }}
            icon={<AssetByType input="icons" name="AddCircle" />}
            applyDebounce={false}
          />
        ) : null}

        {level > 0 && !!onItemClear ? (
          <GenericIconButton
            id={`${id}-close-btn`}
            testId={`${id}-close-btn`}
            ariaLabel={translate('closeAriaDescription', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
              field: translate(id, {
                ns: namespace,
                lng: selectedLanguage,
              }),
            })}
            onClick={onItemClear}
            icon={<AssetByType input="icons" name="Close" />}
            applyDebounce={false}
          />
        ) : null}
      </FormGroupDividerTitle>

      {!operationInProgress && (
        <Box sx={{ display: 'flex' }}>
          <VirtualScroller
            id={`collapsible-tree-${id}`}
            sx={treeContainer(level)}
            items={VirtualScrollChildren}
          />

          {selectedItem && (
            <FormTypeVirtualTree
              schema={{
                ...schema?.items?.properties?.[childrenProperty],
              }}
              uiSchema={{
                ...uiSchema?.items?.[childrenProperty],
              }}
              id={`${id}_${selectedItem?.__INDEX__}_${childrenProperty}`}
              label={label}
              value={selectedItem?.[childrenProperty] || []}
              options={{
                ...(uiSchema?.items?.[childrenProperty]?.['ui:options'] ?? {}),
                translation: { key: nodeProperties?.[0]?.name },
              }}
              formContext={formContext}
              parent={{ ...selectedItem, __LABEL__: selectedItem?.[nodeProperties?.[0]?.name] }}
              onItemClear={() => setSelectedItem(null)}
            />
          )}
        </Box>
      )}

      <FormTypeTreeDialog
        id={id}
        level={0}
        disabled={isDisabled}
        namespace={namespace}
        action={'ADD'}
        index={-1}
        schema={schema}
        uiSchema={uiSchema}
        childrenProperty={childrenProperty}
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onNodeChange={onNodeChange}
      />
    </Box>
  );
};

export default FormTypeVirtualTree;
