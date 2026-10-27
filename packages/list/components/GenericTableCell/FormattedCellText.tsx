import React from 'react';
import FormatText from '@pkg-common/components/FormatText/FormatText';
import { AnyType } from '@pkg-common/types';
import TruncatedInput from '@pkg-common/components/TruncatedInput/TruncatedInput';

const FormattedCellText = ({
  column,
  value,
  relatedColumnValue,
  cellColor,
}: {
  column: AnyType;
  value: string | JSX.Element;
  relatedColumnValue?: string;
  cellColor?: string;
}) => {
  const {
    entityId,
    defaultSymbol,
    type,
    truncate,
    relatedCodelist,
    relatedCodelistSuffix,
    showCode = false,
  } = column || {};

  return (
    <TruncatedInput title={typeof value === 'string' ? value : ''} truncate={truncate}>
      <FormatText
        defaultSymbol={defaultSymbol}
        id={entityId}
        value={value}
        type={type}
        color={cellColor}
        metadata={{
          codelist: relatedCodelist,
          suffixCodelist: relatedCodelistSuffix,
          value: relatedColumnValue,
          showCode,
        }}
      />
    </TruncatedInput>
  );
};

export default FormattedCellText;
