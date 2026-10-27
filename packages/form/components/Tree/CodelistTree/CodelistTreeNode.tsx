import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Chip, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import GenericCheckbox from '@pkg-common/atomics/GenericCheckbox/GenericCheckbox';
import { useSystem } from '@pkg-setup/index';
import { AnyType } from '@pkg-common/types';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import DynamicForm from '../../DynamicForm/DynamicForm';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import useClearFrom from '@pkg-form/hooks/useClearFrom';
import getStyles from '../styles';
import TruncatedInput from '@pkg-common/components/TruncatedInput/TruncatedInput';

export type CodeListItemLabelsType = {
  languageCL: string;
  id: number;
  description: string;
};

type CodeListItem = {
  codeListItemId: string;
  codeListItemCode: string;
  codeListItemDescription: CodeListItemLabelsType;
  codeListItemDetails: AnyType;
};

const fetchChildren = async (
  apiUrl: string,
  id: string,
  page: number,
  size: number,
  relationshipType,
  callback: (res: Array<CodeListItem>, hasMoreItems: boolean) => void,
  formData: Record<string, string | number> = {},
) => {
  try {
    const res = await axios.get(`${apiUrl}/reference-data/codelist-item-relationships`, {
      params: {
        relatedCodeListItemId: id,
        relationshipTypeCL: relationshipType,
        page,
        size,
        ...formData,
      },
    });

    callback(res?.data?.content || [], res?.data?.pageMetadata?.hasNextPage);
  } catch (error) {
    console.error('Error fetching children:', error);
    callback([], false);
  }
};

const CodelistTreeNode = ({ id, options, item, level, onSelect, value, onChildrenFetched }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { apiUrl } = useSystem();
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(-1);
  const [hasMoreItems, setHasMoreItems] = useState<boolean>(true);
  const [hasFilters, setHasFilters] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [nodes, setNodes] = useState<Array<CodeListItem> | null>(null);
  const { formData, setEntityFormData } = useEntityFormData(`${item?.id}-searchForm`);

  const {
    disableFirstLevel = false,
    size = 3,
    multiple = false,
    filterSchema,
    openByDefault,
    filterUiSchema,
    relationshipType,
    truncate = { enabled: false },
    clearFrom,
  } = options;

  const hasFilterSchema = !!filterSchema && !!filterUiSchema;
  const isExpired = !!item?.expired;
  const loadedOnce = nodes !== null;
  const isFirstLevelDisabled = disableFirstLevel && level === 0;
  const hasVisibleChildren = !!(nodes?.length || !loadedOnce);
  const showCheckbox = !isFirstLevelDisabled;
  const shouldShowButtons = !isExpired && hasVisibleChildren;
  const normalizeValue = Array.isArray(value) ? value : [];
  const isSelected = multiple ? normalizeValue.includes(item?.code) : value === item?.code;
  const showFilterButton = shouldShowButtons && hasFilterSchema;
  const showNoItemsLabel = !shouldShowButtons;

  useClearFrom(id, clearFrom);

  const loadChildren = useCallback(
    ({ reset = false, clearFilters = false, filters = formData }) => {
      if (loading) return;

      setLoading(true);
      const nextPage = reset ? 0 : page + 1;

      fetchChildren(
        apiUrl,
        item?.id,
        nextPage,
        size,
        relationshipType,
        (response: Array<AnyType>, hasMoreItems: boolean) => {
          setNodes((prevNodes) => (reset ? response : [...(prevNodes || []), ...response]));
          setPage(nextPage);
          setLoading(false);
          setHasMoreItems(hasMoreItems);

          if (onChildrenFetched) {
            onChildrenFetched(response);
          }

          if (clearFilters) {
            setHasFilters(false);
            setTimeout(() => setEntityFormData({}), 650);
          }
        },
        filters,
      );
    },
    [loading, apiUrl, item?.id, page, size, formData],
  );

  const handleClear = () => {
    setNodes(null);
    setPage(0);
    setHasMoreItems(false);
    setOpen(true);
    loadChildren({ reset: true, clearFilters: true, filters: {} });
  };

  useEffect(() => {
    if (loadedOnce) {
      return;
    }
    if (openByDefault && level === 0) {
      setOpen(true);
      loadChildren({});
    }
  }, [loadedOnce, openByDefault, level]);

  const handleCheckboxChange = useCallback(() => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = isSelected
        ? currentValues.filter((val) => val !== item?.code)
        : [...currentValues, item?.code];
      onSelect(newValues);
    } else {
      onSelect(isSelected ? null : item?.code);
    }
  }, [value, item?.code, multiple, isSelected, onSelect]);

  const handleApply = () => {
    setNodes(null);
    setPage(0);
    setHasMoreItems(false);
    setOpen(true);
    loadChildren({ reset: true, filters: formData });
  };

  const onItemClick = useCallback(() => {
    if (loadedOnce) {
      return;
    }
    loadChildren({});
  }, [loadChildren, loadedOnce]);

  const statusIndicatorRenderAction = () => {
    if (shouldShowButtons) {
      return (
        <GenericIconButton
          id={`${item?.code}-btn`}
          testId={`${item?.code}-btn`}
          onClick={() => {
            onItemClick();
            setOpen((prev) => !prev);
          }}
          ariaLabel={translate(open ? 'collapse' : 'expand', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
          })}
          icon={<AssetByType input="icons" name={open ? 'KeyboardArrowUp' : 'KeyboardArrowDown'} />}
        />
      );
    }

    if (isExpired) {
      return (
        <Box sx={styles.expiredChipContainer} className="keep-active">
          <Chip
            label={translate('expired', {
              ns: COMMON,
              lng: selectedLanguage,
              defaultValue: 'Expired',
            })}
            size="small"
            color="error"
            variant="outlined"
            sx={styles.expiredChip}
          />
        </Box>
      );
    }

    return (
      <AssetByType
        input="icons"
        name="SearchOff"
        props={{ sx: { marginLeft: 1, marginRight: 1, cursor: 'none' } }}
      />
    );
  };

  const bgColor = isSelected ? 'primary.light' : 'transparent';

  const description =
    item?.labels?.find((label: CodeListItemLabelsType) => label.languageCL === selectedLanguage)
      ?.description ?? item?.label;

  const missingLabelText = translate('missingLabel', {
    ns: COMMON,
    lng: selectedLanguage,
    defaultValue: 'Missing Label',
  });
  const isMissingLabel = !description;

  const label = (
    <Box
      sx={{
        ...styles.box,
        backgroundColor: bgColor,
        ml: `${level * 16}px`,
        width: 'unset',
        mb: 1,
        ...styles.expiredContainer(isExpired),
      }}
    >
      {statusIndicatorRenderAction()}
      {showCheckbox && (
        <GenericCheckbox
          id={item?.code}
          value={isSelected}
          onChange={handleCheckboxChange}
          readOnly={isExpired}
          required={false}
          ariaHasPopup={false}
          autofocus={false}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCheckboxChange();
            }
          }}
        />
      )}
      <Box sx={{ ml: 1, width: '100%' }}>
        <Typography variant="body2" fontWeight="bold">
          {item?.code}
        </Typography>
        <TruncatedInput truncate={truncate} title={item?.label}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={styles.missingLabel(isMissingLabel)}
          >
            {description ?? missingLabelText}
          </Typography>
        </TruncatedInput>
        {showFilterButton && (
          <GenericIconButton
            id={`${item?.id}-search`}
            onClick={() => setHasFilters((prev) => !prev)}
            ariaLabel={translate('search', { ns: COMMON, lng: selectedLanguage })}
            size={'small'}
            styles={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
            }}
            icon={<AssetByType input="icons" name="Search" />}
          />
        )}
        {showNoItemsLabel && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}
          >
            {translate('noItemsFound', {
              ns: COMMON,
              lng: selectedLanguage,
            })}
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        paddingLeft: 5,
      }}
    >
      <Box sx={{ display: 'flex', position: 'relative', alignItems: 'center', width: '100%' }}>
        <Box id={`${item?.code}-${level}`} tabIndex={0} sx={{ width: '100%' }}>
          {label}
          {loading && (
            <Box sx={{ pl: 2, py: 1 }}>
              <CircularProgress size={16} thickness={4} />
            </Box>
          )}
          {hasFilters && (
            <Box
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              sx={styles.filtersContainer}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                {`${item?.code} Search`}
              </Typography>

              <DynamicForm
                id={`${item?.id}-searchForm`}
                schema={filterSchema}
                uiSchema={filterUiSchema}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Grid size={{ xs: 'auto' }}>
                  <GenericButton
                    id={`${item?.id}-clear-btn`}
                    testId={`${item?.id}-clear-btn`}
                    label={translate('clear', { ns: COMMON, lng: selectedLanguage })}
                    ariaLabel={translate('clearButtonAriaLabel', {
                      ns: ACCESSIBILITY,
                      lng: selectedLanguage,
                    })}
                    variant="outlined"
                    size="small"
                    onClick={handleClear}
                  />
                </Grid>

                <Grid size={{ xs: 'auto' }}>
                  <GenericButton
                    id={`${item?.id}-apply-btn`}
                    testId={`${item?.id}-apply-btn`}
                    label={translate('apply', { ns: COMMON, lng: selectedLanguage })}
                    ariaLabel={translate('applyButtonAriaLabel', {
                      ns: ACCESSIBILITY,
                      lng: selectedLanguage,
                    })}
                    styles={{ ml: 2 }}
                    size="small"
                    type="button"
                    onClick={handleApply}
                  />
                </Grid>
              </Box>
            </Box>
          )}
          {open &&
            (nodes || []).map((n) => {
              const codelistItem = n.codeListItemDetails ?? {};
              return (
                <CodelistTreeNode
                  key={codelistItem?.codeListItemId}
                  item={{
                    id: codelistItem?.codeListItemId,
                    code: codelistItem?.codeListItemCode,
                    label: codelistItem?.codeListItemDescription,
                    expired: !!codelistItem?.expired,
                  }}
                  level={level + 1}
                  onSelect={onSelect}
                  value={value}
                  size={size}
                  disableFirstLevel={false}
                  options={options}
                />
              );
            })}

          {hasMoreItems && loadedOnce && open && (
            <GenericButton
              id={`${item?.id}-load-more`}
              onClick={loadChildren}
              label={translate('loadMore', { ns: COMMON, lng: selectedLanguage })}
              ariaLabel={translate('loadMore', { ns: COMMON, lng: selectedLanguage })}
              variant={'outlined'}
              styles={{ width: '100%', marginLeft: `${level * 20}px` }}
              size={'small'}
              loading={loading}
              disabled={loading}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CodelistTreeNode;
