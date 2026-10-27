import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import TruncatedInput from '@pkg-common/components/TruncatedInput/TruncatedInput';
import getStyles from '../styles';
import { GenericTreeNodeContentProps } from './GenericTree.types';
import jp from 'jsonpath';
import AppActions from '@pkg-common/components/AppActions/AppActions';
import { useTheme } from '@mui/material/styles';

const GenericDynamicTreeNode: React.FC<GenericTreeNodeContentProps> = ({
  options,
  node,
  level,
  onToggle,
  open,
}) => {
  const styles = getStyles(useTheme());
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const { displayProps, idProp = 'id', truncate = { enabled: false } } = options;

  const nodeId = useMemo(() => jp.value(node, idProp), [node, idProp]);

  const canExpand = useMemo(() => {
    if (!nodeId || !node) return false;
    return node?.hasChildren;
  }, [nodeId, node]);

  const canToggle = open || canExpand;

  const labelLines = useMemo(() => {
    return (displayProps || []).map((prop) => jp.value(node, prop)).filter(Boolean);
  }, [node, displayProps]);

  const indentPx = level * 16;

  return (
    <Box
      sx={{
        ...styles.box,
        backgroundColor: 'transparent',
        ml: `${indentPx}px`,
        width: `calc(100% - ${indentPx}px)`,
        boxSizing: 'border-box',
        mb: 1,
        position: 'relative',
        minWidth: 0,
        height: '100%',
      }}
    >
      {canToggle && (
        <GenericIconButton
          id={`${nodeId}-toggle`}
          testId={`${nodeId}-toggle`}
          onClick={onToggle}
          ariaLabel={translate(open ? 'collapse' : 'expand', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
          })}
          icon={<AssetByType input="icons" name={open ? 'KeyboardArrowUp' : 'KeyboardArrowDown'} />}
        />
      )}

      <Box sx={{ ml: 1, width: '100%', minWidth: 0 }}>
        <Typography variant="body2">{labelLines[0] || nodeId}</Typography>
        {labelLines.slice(1).map((line, idx) => (
          <TruncatedInput key={`${nodeId}-line-${idx}`} truncate={truncate} title={line}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {line}
            </Typography>
          </TruncatedInput>
        ))}
      </Box>
      <AppActions
        page={{ id: nodeId }}
        actions={options['ui:row:buttons'] || {}}
        checkPermissions={true}
        source={node}
      />
    </Box>
  );
};

export default GenericDynamicTreeNode;
