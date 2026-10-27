import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { InfoSchema } from '@pkg-common/types';
import WithInfo from '@pkg-form/groups/WithInfo';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  containerRow: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },
} as const;

const isTooltipGroup = (infoPiece: InfoSchema): boolean => {
  const { type = 'DEFAULT', fields } = infoPiece || {};
  if (fields) {
    return type === 'FORMATTED_TIME' || type === 'DYNAMIC_MESSAGE';
  }
  return type === 'TOOLTIP';
};

const buildInfoKey = (id: string, infoPiece: InfoSchema, index: number): string =>
  `${id}-${infoPiece.type ?? 'DEFAULT'}-${index}`;

type IndexedInfo = { infoPiece: InfoSchema; originalIndex: number };

const WithInfoPieces = ({
  id,
  children,
  info,
}: {
  id: string;
  children: React.ReactElement | Array<React.ReactElement>;
  info: undefined | Array<InfoSchema>;
}) => {
  const { tooltipInfos, alertInfos } = useMemo(() => {
    const tooltipInfos: Array<IndexedInfo> = [];
    const alertInfos: Array<IndexedInfo> = [];

    (info ?? []).forEach((infoPiece, originalIndex) => {
      const entry = { infoPiece, originalIndex };
      (isTooltipGroup(infoPiece) ? tooltipInfos : alertInfos).push(entry);
    });
    return { tooltipInfos, alertInfos };
  }, [info]);

  if (!info?.length) {
    return children;
  }

  return (
    <Box sx={styles.container}>
      {alertInfos.map(({ infoPiece, originalIndex }) => (
        <WithInfo key={buildInfoKey(id, infoPiece, originalIndex)} id={id} info={infoPiece} />
      ))}
      <Box sx={styles.containerRow}>
        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
        {tooltipInfos.map(({ infoPiece, originalIndex }) => (
          <WithInfo key={buildInfoKey(id, infoPiece, originalIndex)} id={id} info={infoPiece} />
        ))}
      </Box>
    </Box>
  );
};

export default WithInfoPieces;
