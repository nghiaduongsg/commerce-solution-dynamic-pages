import { AnyType } from '@pkg-common/types';
import { TableConfiguration } from '@pkg-list-types/*';

export interface GenericFormProps {
  pageId: string;
  relatedId?: string;
  namespaces?: Array<string>;
  requestParams: { code: string; screenTypeCL: string; entitySubType?: string };
  fallbackSchemas: {
    configuration?: Pick<TableConfiguration, 'tableId' | 'url' | 'rowId'>;
    schema?: any;
    uiSchema?: any;
  };
  customFunctionNames?: {
    codeFn?: string;
    buttonsFn?: string;
  };
  children?: JSX.Element;
  disabled?: boolean;
  hideActionButtons?: boolean;
  routeStateData?: AnyType;
  mode?: 'PAGE' | 'SIMPLE';
  excludeSystemApis?: boolean;
}
