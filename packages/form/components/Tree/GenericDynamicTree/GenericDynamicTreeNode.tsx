import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { AnyType, ApiValuesSchema } from '@pkg-common/types';
import { GenericTreeNodeProps } from './GenericTree.types';
import jp from 'jsonpath';
import useApiLocalData from '@pkg-core/apiData/hooks/useApiLocalData';
import IstLoader from '@pkg-common/atomics/IstLoader/IstLoader';
import LoadMoreButton from '@pkg-form/components/Tree/GenericDynamicTree/LoadMoreButton';
import TreeNodeContent from '@pkg-form/components/Tree/GenericDynamicTree/TreeNodeContent';

const GenericDynamicTreeNode: React.FC<GenericTreeNodeProps> = ({
  widgetId,
  options,
  node,
  level,
}) => {
  const { apiValues, pageSize = 10, idProp = 'id' } = options;

  const nodeId = useMemo(() => jp.value(node, idProp), [node, idProp]);

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<number | null>(null);
  const [children, setChildren] = useState<AnyType[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    setOpen(false);
    setPage(null);
    setChildren([]);
    setHasNextPage(false);
  }, [nodeId]);

  const canExpand = useMemo(() => {
    if (!nodeId || !node) return false;
    return node?.hasChildren;
  }, [nodeId, node]);

  const requestId = useMemo(() => {
    return `${widgetId}__node__${nodeId || 'missing'}`;
  }, [widgetId, nodeId]);

  const requestApiValues = useMemo(() => {
    if (page === null) return undefined;
    if (!nodeId) return undefined;

    return {
      ...apiValues,
      url: apiValues.url.replace('{id}', String(nodeId)),
      queryFrom: [
        { key: 'size', defaultValue: String(pageSize) },
        { key: 'page', defaultValue: String(page) },
      ],
    };
  }, [apiValues, nodeId, pageSize, page]);

  const {
    data: response,
    loading,
    error,
  } = useApiLocalData(requestId, requestApiValues as ApiValuesSchema);

  useEffect(() => {
    if (page === null) return;
    if (!response) return;
    if (!Array.isArray(response?.content)) return;

    const responsePage = response?.pageMetadata?.requestedPageNumber;

    if (responsePage !== page) return;

    const content = response.content as AnyType[];
    const next = Boolean(response?.pageMetadata?.hasNextPage);

    setHasNextPage(next);
    setChildren((prev) => (page === 0 ? content : [...prev, ...content]));
  }, [response, page]);

  const handleToggle = useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }

    if (!canExpand) return;

    setOpen(true);

    setPage((prev) => (prev === null ? 0 : prev));
  }, [open, canExpand]);

  const handleLoadMore = useCallback(() => {
    if (!open) return;
    if (!hasNextPage) return;
    setPage((p) => (p === null ? 0 : p + 1));
  }, [open, hasNextPage]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <TreeNodeContent
        node={node}
        level={level}
        options={options}
        onToggle={handleToggle}
        open={open}
      />

      {open && (
        <Box>
          {children.map((child) => (
            <GenericDynamicTreeNode
              key={jp.value(child, idProp)}
              widgetId={widgetId}
              options={options}
              node={child}
              level={level + 1}
            />
          ))}

          <IstLoader busy={loading} />

          {hasNextPage && (
            <LoadMoreButton
              error={error}
              loading={loading}
              id={nodeId}
              onClick={handleLoadMore}
              level={level}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default GenericDynamicTreeNode;
