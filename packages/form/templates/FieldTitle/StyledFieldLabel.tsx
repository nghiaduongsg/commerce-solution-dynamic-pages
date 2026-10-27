import React from 'react';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { hasValue } from '@pkg-common/utils';
import useSystem from '@pkg-setup/src/system/useSystem';
import { HIGHLIGHT_MANDATORY, HIGHLIGHT_OPTIONAL } from '@pkg-constants/codeListVariables';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';

export interface StyledFieldLabelProps {
  label: string;
  required?: boolean;
  omitValidationHints?: boolean;
}

const StyledFieldLabel = ({ label, required, omitValidationHints }: StyledFieldLabelProps) => {
  const {
    selectedLanguage,
    labelIndicatorMode,
    labelIndicatorSymbol,
    labelIndicatorIcon,
    labelIndicatorColor,
  } = useSystem();

  const { t: translate } = useTranslation([COMMON]);

  const isHighlightMandatoryMode = labelIndicatorMode === HIGHLIGHT_MANDATORY;
  const isHighlightOptionalMode = labelIndicatorMode === HIGHLIGHT_OPTIONAL;

  const highlightMandatory = isHighlightMandatoryMode && required;
  const highlightOptional = isHighlightOptionalMode && !required;
  const shouldHighlight = (!omitValidationHints && highlightOptional) || highlightMandatory;

  const translateIndicator = (key: 'required' | 'optional') =>
    translate(key, { ns: COMMON, lng: selectedLanguage });

  const indicatorKey = highlightMandatory ? 'required' : 'optional';
  const defaultIndicator =
    highlightMandatory || highlightOptional ? translateIndicator(indicatorKey) : '';

  if (!shouldHighlight) {
    return <>{label}</>;
  }

  const finalLabel =
    hasValue(labelIndicatorColor) || hasValue(labelIndicatorSymbol) || labelIndicatorIcon
      ? label
      : `${label} - ${defaultIndicator}`;

  return (
    <span
      style={{
        color: labelIndicatorColor || undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
        verticalAlign: 'middle',
        gap: '4px',
      }}
    >
      {finalLabel}
      {labelIndicatorIcon && (
        <AssetByType
          input="icons"
          name={labelIndicatorIcon}
          props={{ size: 'small', sx: { color: labelIndicatorColor ?? 'inherit' } }}
        />
      )}
      {labelIndicatorSymbol}
    </span>
  );
};

export default React.memo(StyledFieldLabel);
