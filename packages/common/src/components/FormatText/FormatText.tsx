import React, { useMemo } from 'react';
import { Typography } from '@mui/material';

import FormatTextProps from './FormatText.d';
import FormattedAmount from '@pkg-common/components/FormattedAmount/FormattedAmount';
import FormattedDate from '@pkg-common/components/FormattedDate/FormattedDate';
import { AnyType } from '@pkg-common/types';
import useCodeList from '../../../../core/codeList/hooks/useCodeList';
import useCodeListAttributes from '@pkg-core/codeList/hooks/useCodeListAttributes';
import { hasValue } from '@pkg-common/utils';
import { createCodelistKey } from '@pkg-form/validations/utils/widgetUtils';

const FormatText = ({ id, type, value, defaultSymbol, color, metadata }: FormatTextProps) => {
  const styles = color ? { color, fontWeight: 'bold' } : {};
  const commonProps = {
    id,
    value,
    style: styles,
  };

  // metadata can be undefined - always default to {} to avoid
  // runtime crashes when destructuring as it can be error-prone
  const {
    codelist = '',
    suffixCodelist = '',
    value: relatedColumnValue = '',
    showCode,
  } = metadata ?? {};

  const { getAttribute } = useCodeListAttributes(suffixCodelist);
  const validCodelist = useMemo(() => {
    if (codelist && suffixCodelist && relatedColumnValue) {
      const suffix = getAttribute(relatedColumnValue, 'validCodelist');
      return suffix?.length ? suffix[0] : '';
    }
    return '';
  }, [codelist, suffixCodelist, relatedColumnValue, getAttribute]);

  const { list } = useCodeList(
    hasValue(validCodelist)
      ? createCodelistKey(codelist, { '{codelistCode}': validCodelist })
      : codelist,
  );

  const labeledValue = useMemo(() => {
    const label = (list || []).find((option: AnyType) => option.code === value)?.label;
    if (label && showCode) {
      return `${value} - ${label}`;
    }
    return label || value;
  }, [list, value]);

  if (!relatedColumnValue && defaultSymbol) {
    return (
      <Typography variant="inherit">
        {value}
        {defaultSymbol}
      </Typography>
    );
  }

  switch (type) {
    case 'amount':
      return <FormattedAmount {...(commonProps as any)} currency={relatedColumnValue} />;

    case 'extendedAmount':
      return <FormattedAmount {...(commonProps as any)} extended={true} />;

    case 'monthDay':
    case 'date':
    case 'datetime':
      return <FormattedDate {...(commonProps as any)} type={type} />;

    default:
      return (
        <Typography variant="inherit" style={styles}>
          {labeledValue}
        </Typography>
      );
  }
};

export default FormatText;
