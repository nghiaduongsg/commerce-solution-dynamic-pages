import { WidgetProps } from '@rjsf/core';

export type fileUploadParams = {
  fieldForAttachmentFile?: string;
  fieldsEncapsulationField?: string;
  fields?: any;
  fieldsToQueryFrom?: Array<{ key: string }>;
  fieldsToQueryFromEncapsulation?: Array<{ key: string; value: any }>;
  fieldsEncapsulation?: string;
  apiValues: ApiValuesSchema;
};

export type fileOptions = {
  options: {
    uploadParams: fileUploadParams;
    apiValues: ApiValuesSchema;
    path: string;
    importFile?: boolean;
    useCommonFileUploader?: boolean;
    acceptFiles?: {
      withFormat?: string;
      withText?: string;
      withMaxSizeInMB?: number;
    };
    queryFrom?: Array<ReplacementSchema>;
    validations?: any;
  };
};

export type GenericFileWidgetProps = WidgetProps &
  fileOptions & {
    serverErrors: string[];
    value: any;
  };

export type FileUploadWidgetProps = fileOptions & {
  id: string;
  value: any;
  fileUsed: any;
  fileStatus: any;
  onStatusChanged: (string) => void;
  onServerError: (_: Array<string>) => void;
};
