import React, { ReactElement } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { AnyType } from '@pkg-common/types';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';
import SingleValueRenderer from '@pkg-common/components/ValuesRenderer/SingleValueRenderer';
import { humanizeKey } from '@pkg-common/utils';

const ValuesRenderer = ({
  source,
  renderField,
  renderSingleField,
}: {
  source: Record<string, AnyType> | string | number | boolean;
  renderField?: (label: string, key: string, value: AnyType) => ReactElement;
  renderSingleField?: (value: AnyType) => ReactElement;
}) => {
  if (typeof source === 'string' || typeof source === 'number' || typeof source === 'boolean') {
    return renderSingleField ? renderSingleField(source) : <SingleValueRenderer value={source} />;
  }
  const entries = Object.entries(source ?? {}).filter(([, v]) => v !== undefined);

  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        —
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {entries.map(([key, value]) => {
        if (Array.isArray(value)) {
          return <ArrayRenderer key={key} name={key} array={value} />;
        }
        if (value !== null && typeof value === 'object') {
          return (
            <Box key={key} sx={{ p: 1 }}>
              <ValuesRenderer
                source={value}
                renderField={renderField}
                renderSingleField={renderSingleField}
              />
            </Box>
          );
        }
        return renderField ? (
          renderField(humanizeKey(key), key, value)
        ) : (
          <KeyValuePairRenderer key={key} label={humanizeKey(key)} value={value} />
        );
      })}
    </Box>
  );
};

export default ValuesRenderer;

const ArrayRenderer = ({
  name,
  array,
  renderField,
  renderSingleField,
}: {
  name: string;
  array: Array<AnyType>;
  renderField?: (label: string, key: string, value: AnyType) => ReactElement;
  renderSingleField?: (value: AnyType) => ReactElement;
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {array?.map((item, index) => {
        return (
          <GenericCard
            id={`${index}-array-item`}
            key={`${name}-array-item`}
            title={`#${index + 1} ${humanizeKey(name)}`}
            styleOverrides={{ cardHeaderText: { fontSize: 'body2' } }}
          >
            <ValuesRenderer
              source={item}
              renderField={renderField}
              renderSingleField={renderSingleField}
            />
          </GenericCard>
        );
      })}
    </Box>
  );
};

const KeyValuePairRenderer = ({ label, value }: { label: string; value: AnyType }) => {
  return (
    <Grid container>
      <Grid size={{ xs: 6 }}>
        <Typography variant="body2">{label}</Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <SingleValueRenderer value={value} />
      </Grid>
    </Grid>
  );
};
