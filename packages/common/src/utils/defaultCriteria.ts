import { AnyType, DataSourceSchema } from '../types';
import { resolveDateToken, DATE_TOKENS } from './dateTokens';

export type DefaultCriteriaValue = AnyType | { source?: DataSourceSchema };

export const resolveDefaultCriteria = (
  criteria: { [key: string]: DefaultCriteriaValue },
  resolveSourceValue?: (value: AnyType) => { value: AnyType; apply: boolean },
): { [key: string]: AnyType } => {
  const resolved: { [key: string]: AnyType } = {};

  for (const [key, value] of Object.entries(criteria)) {
    if (typeof value === 'string' && DATE_TOKENS.has(value)) {
      resolved[key] = resolveDateToken(value);
    } else if (typeof value === 'object' && value !== null && value?.source && resolveSourceValue) {
      const { value: resolvedValue, apply } = resolveSourceValue(value);
      if (apply && resolvedValue !== undefined) {
        resolved[key] = resolvedValue;
      }
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
};
