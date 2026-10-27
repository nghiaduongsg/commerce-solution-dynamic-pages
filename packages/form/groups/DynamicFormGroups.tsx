import React from 'react';
import FormGroup from './FormGroup';
import { DynamicFormGroup, FormContextSchema } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';
import { Grid } from '@mui/material';

const DynamicFormGroups = ({
  id,
  namespace,
  groups,
  elements,
  formContext,
  level,
  disableGrouping,
}: {
  id: string;
  namespace: string;
  elements: Array<AnyType>;
  formContext: FormContextSchema;
  groups: Array<DynamicFormGroup>;
  level: number;
  disableGrouping?: boolean;
}) => {
  const groupings =
    groups && groups.length && !disableGrouping
      ? groups
      : ([
          {
            key: 'DEFAULT_GROUP',
            type: 'Ungrouped',
            widgets: elements.map((element) => element.name),
          },
        ] as Array<DynamicFormGroup>);

  return (
    <Grid
      container
      alignItems="flex-start"
      justifyContent="flex-start"
      wrap="wrap"
      direction="row"
      spacing={10}
      sx={{ width: '100%' }}
    >
      {groupings.map((group) => (
        <FormGroup
          id={id}
          key={`${group.key}-group`}
          group={group}
          formContext={formContext}
          namespace={namespace}
          elements={elements}
          level={level}
          totalGroups={groups?.length || 1}
        />
      ))}
    </Grid>
  );
};

export default DynamicFormGroups;
