import React, { useEffect, useMemo, useState } from 'react';

import useTable from '@pkg-list/hooks/useTable';
import { Box } from '@mui/material';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import TreeNode from '@pkg-form/components/ArrayHandler/TreeNode';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import { AnyType } from '@pkg-common/types';
import { TableConfiguration } from '@pkg-list/src/types';

const TreeTable = ({
  configuration,
  props,
  childrenProperties,
}: {
  configuration: TableConfiguration;
  props: AnyType;
  childrenProperties: Array<string>;
}) => {
  const { tableId, rowId, columns: defaultColumns, title } = configuration || {};

  const { selectedLanguage } = useSystem();
  const { tableData, initTable, columns } = useTable(tableId);

  const namespace = useMemo(() => {
    if (!configuration) {
      return '';
    }
    return configuration['ui:labels']?.namespace || '';
  }, [configuration]);

  const [initialised, setInitialised] = useState(columns?.length > 0);

  const { t: translate } = useTranslation([namespace, ACCESSIBILITY, COMMON]);

  useEffect(() => {
    if (!initialised) {
      initTable({
        columns: defaultColumns,
        rowIdKey: rowId,
        selectedRowIds: { 0: {} },
        filterEntities: false,
        id: tableId,
      });
    }
  }, [rowId, defaultColumns, initialised, initTable]);

  useEffect(() => {
    if (columns?.length > 0) {
      setInitialised(true);
    }
  }, [columns]);

  return (
    <Box
      id={tableId}
      title={translate(title || tableId, { ns: namespace, lng: selectedLanguage })}
      aria-label={translate(title || tableId, { ns: namespace, lng: selectedLanguage })}
      sx={{
        marginTop: '10px',
      }}
    >
      {(tableData || []).map((row, index) => (
        <TreeNode
          key={`${rowId}_${index}`}
          row={{
            ...row,
            __INDEX__: index,
            __LEVEL__: 1,
            __ACTION__: undefined,
            __JSON_PATH__: `${tableId}_${index}`,
          }}
          configuration={configuration}
          props={props}
          childrenProperties={childrenProperties}
        />
      ))}
    </Box>
  );
};

export default TreeTable;
