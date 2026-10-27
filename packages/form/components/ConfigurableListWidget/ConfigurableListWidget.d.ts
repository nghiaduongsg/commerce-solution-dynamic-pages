import {
  DataSourceSchema,
  FormWidgetProps,
  CheckFromSchema,
  ValidationRule,
} from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';

export type ConfigurableListWidgetProps = FormWidgetProps & {
  options: {
    translation: {
      key: string;
      namespace: string;
    };
    validations?: ValidationRule;
    visibleInCard?: boolean;
    enableLinkFrom?: CheckFromSchema;
    dependency: {
      entityId: string;
      entityIdKey: string;
      selectAll?: boolean;
      idKeyAs: string;
      fieldKeyAs: string;
      entitySource: DataSourceSchema;
      isFlat: boolean;
      loadDetails?: boolean;
      entityFields?: Array<string>;
      redirectLinkEnabled?: boolean;
      selectEnabled: boolean;
      createEnabled: boolean;
      configuration?: AnyType;
      filterUiSchema?: AnyType;
      filterSchema?: AnyType;
      entitySchema?: AnyType;
      entityUiSchema?: AnyType;
      loadEntity?: AnyType;
      editable?: boolean;
      overrides?: AnyType;
      pageRedirectUrl?: string;
      excludeFromLabel?: Array<string>;
      searchById?: {
        enabled: boolean;
        idParam?: string;
      };
      enableConfigMerge?: boolean;
    };
  };
};
