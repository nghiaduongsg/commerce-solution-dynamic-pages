import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { getCellContent } from '@pkg-list/utils/tableRowUtils';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTranslation } from 'react-i18next';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import FormattedCellText from '@pkg-list/components/GenericTableCell/FormattedCellText';
import { useTheme } from '@mui/material/styles';

const TreeNodeContent = ({ config, tableId, namespace, row, relatedColumnValue, isLeaf }) => {
  const theme = useTheme();
  const { t: translate } = useTranslation([namespace || COMMON]);
  const { selectedLanguage } = useSystem();

  const formattedValue = useMemo(() => {
    const useFallback = row?.__STATUS__ === 'EDITED' || row?.__STATUS__ === 'ADDED';
    const value =
      getCellContent(
        row,
        config,
        selectedLanguage,
        translate,
        [namespace],
        useFallback && config?.fallbackAccessors,
      ) ?? config.defaultValue;
    if (value === 'true' && config?.type === 'boolean') {
      return <CheckBox sx={{ color: 'green' }} />;
    } else if (value === 'false' && config?.type === 'boolean') {
      return <CheckBoxOutlineBlank color="primary" />;
    } else {
      return value;
    }
  }, [selectedLanguage, translate, namespace, row]);

  return (
    <Box
      sx={{
        paddingRight: theme.spacing(5),
        paddingTop: theme.spacing(1),
        paddingLeft: isLeaf ? theme.spacing(5) : 0,
      }}
    >
      <Typography
        sx={{ lineHeight: 1 }}
        variant="overline"
        component="div"
        id={`content-${tableId}-${config?.name}-${row.__INDEX__}-title`}
        data-testid={`content-${tableId}-${config?.name}-${row.__INDEX__}-title`}
      >
        {translate(config?.name, { ns: namespace, lng: selectedLanguage })}
      </Typography>
      <FormattedCellText
        value={formattedValue}
        relatedColumnValue={relatedColumnValue}
        column={config}
      />
    </Box>
  );
};

export default TreeNodeContent;
