import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, FormControl } from '@mui/material';
import FieldTitle from '@pkg-form/templates/FieldTitle/FieldTitle';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import { FormWidgetProps } from '@pkg-form/types';
import getStyles from '../styles';
import { AnyType, ApiValuesSchema } from '@pkg-common/types';
import GenericDynamicTreeNode from './GenericDynamicTreeNode';
import type { GenericTreeOptions } from './GenericTree.types';
import useApiLocalData from '@pkg-core/apiData/hooks/useApiLocalData';
import IstLoader from '@pkg-common/atomics/IstLoader/IstLoader';
import LoadMoreButton from '@pkg-form/components/Tree/GenericDynamicTree/LoadMoreButton';
import { useTheme } from '@mui/material/styles';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';

const GenericDynamicTree = ({
  id,
  options,
  schema,
  formContext,
}: FormWidgetProps & { options: GenericTreeOptions }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const {
    labelUppercase: label,
    omitValidationHints,
    required,
  } = useWidgetUtils(schema, options, formContext);

  const { apiValues, pageSize = 10, validations } = options;

  const [page, setPage] = useState(0);
  const [rootNodes, setRootNodes] = useState<AnyType[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);

  const requestApiValues = useMemo(() => {
    return {
      ...apiValues,
      queryFrom: [
        { key: 'size', defaultValue: pageSize },
        { key: 'page', defaultValue: page },
      ],
    };
  }, [apiValues, pageSize, page]);

  const {
    data: response,
    loading,
    error,
  } = useApiLocalData(`${id}__root`, requestApiValues as ApiValuesSchema);

  useEffect(() => {
    if (!response) return;
    if (!Array.isArray(response?.content)) return;

    const responsePage = response?.pageMetadata?.requestedPageNumber;

    if (responsePage !== page) return;

    const content = response.content as AnyType[];
    const next = Boolean(response?.pageMetadata?.hasNextPage);

    setHasNextPage(next);
    setRootNodes((prev) => (page === 0 ? content : [...prev, ...content]));
  }, [response, page]);

  const loadMoreRoot = useCallback(() => setPage((p) => p + 1), []);

  return (
    <Box sx={{ width: '100%', mb: 1 }}>
      <FormControl fullWidth title={label} required={Boolean(validations?.required)}>
        <FieldTitle
          sx={styles.fieldLabel}
          title={
            <StyledFieldLabel
              label={label}
              required={required}
              omitValidationHints={omitValidationHints}
            />
          }
          isValid={true}
        />
      </FormControl>

      <Box
        id={`generic-tree-${id}`}
        sx={{
          maxHeight: '90vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {rootNodes.map((n) => (
          <GenericDynamicTreeNode key={n.id} widgetId={id} options={options} node={n} level={0} />
        ))}
      </Box>

      <IstLoader busy={loading} />

      {hasNextPage && (
        <LoadMoreButton error={error} loading={loading} id={id} onClick={loadMoreRoot} level={-1} />
      )}
    </Box>
  );
};

export default GenericDynamicTree;
