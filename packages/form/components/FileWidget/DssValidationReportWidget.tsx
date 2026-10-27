import React from 'react';
import { normaliseDssResponse } from './hooks/useAttachmentValidation';
import DssValidationReport from './DssValidationReport';
import useFieldVisibility from '@pkg-form/hooks/useFieldVisibility';
import { procStringToObj } from '@pkg-common/utils/utils';

export const DSS_VALIDATION_REPORT_WIDGET = 'DssValidationReportWidget';

interface DssValidationReportWidgetProps {
  id: string;
  value: unknown;
  readonly?: boolean;
  disabled?: boolean;
  uiSchema?: Record<string, unknown>;
}

/**
 * Schema-driven widget that renders a DSS validation report from a formData
 * field value.
 *
 * Handles all three forms the value may arrive in:
 * - A JSON-encoded string (the backend stores the report stringified)
 * - A raw API response object (fields named `overallStatus`, etc.)
 * - An already-normalised `DssValidationResult` object
 *
 * All forms are processed through `normaliseDssResponse` which maps the
 * wire-format field names to the internal type and fills missing optional
 * fields with safe defaults.
 *
 * Supports `visibilityFrom` in `ui:options` using the standard
 * `useFieldVisibility` hook — identical behaviour to all other form widgets.
 *
 * Usage in uiSchema:
 * ```UiJson
 * "validationReport": {
 *   "ui:widget": "DssValidationReportWidget",
 *   "ui:options": {
 *     "visibilityFrom": {
 *       "fields": [{ "key": "signatureValidation", "checkWhen": [true] }]
 *     }
 *   }
 * }
 * ```
 */
const DssValidationReportWidget: React.FC<DssValidationReportWidgetProps> = ({
  id,
  value,
  readonly = false,
  disabled = false,
  uiSchema = {},
}) => {
  const options = uiSchema['ui:options'] as Record<string, unknown> | undefined;
  const { visible, preventRender } = useFieldVisibility(id, readonly, disabled, options);

  if (!visible) {
    return preventRender ? null : <div style={{ display: 'none', height: 0 }} />;
  }

  if (!value) return null;

  const raw: unknown = typeof value === 'string' ? procStringToObj(value) : value;

  const result = normaliseDssResponse(raw);
  if (!result) return null;

  return <DssValidationReport result={result} id={id} />;
};

export default DssValidationReportWidget;
