import axios from 'axios';
import { AnyType } from '@pkg-common/types';
import { getSchema } from '@pkg-core/schemas/SchemasController';

export interface BulkJobTypeLabel {
  languageCL: string;
  shortActionLabel?: string;
  description?: string;
}

export interface BulkJobType {
  code: string;
  ownerCL?: string;
  activeSw?: string;
  entityCL: string;
  uiEntityId?: string;
  validationDroolConfig?: AnyType;
  submissionDroolConfig?: AnyType;
  maxEntries?: number;
  maxRetries?: number;
  backoffPeriod?: number;
  labels?: BulkJobTypeLabel[];
  createdDttm?: string;
  updatedDttm?: string;
}

export interface BulkJobTypesPage {
  pageMetadata?: AnyType;
  content?: BulkJobType[];
}

export interface JobSchemas {
  uiSchema?: AnyType;
  schema?: AnyType;
}

export interface UnprocessedItem {
  entityId: string;
  entityType?: string;
  id?: string;
  statusCL?: string;
}

export interface RecordValidationResult {
  entityId: string;
  status: 'PASS' | 'ERROR';
  errors: string[];
}

export interface ParameterViolation {
  fieldName: string;
  rejectedValue: string;
  message: string;
  errorCode: string;
}

export interface ParameterValidationResponse {
  message?: string;
  status?: number;
  timestamp?: string;
  path?: string;
  errorCode?: string;
  violations?: ParameterViolation[];
  innerViolations?: ParameterViolation[];
}

const getJobTypeLabelByLanguage = (
  job: BulkJobType,
  languageCL?: string,
): BulkJobTypeLabel | undefined => {
  return job?.labels?.find((jobLabel) => jobLabel?.languageCL === languageCL) ?? job?.labels?.[0];
};

export const getJobTypeLabel = (job: BulkJobType, languageCL?: string): string => {
  const label = getJobTypeLabelByLanguage(job, languageCL);
  return label?.shortActionLabel || job?.code;
};

export const getJobTypeDescription = (job: BulkJobType, languageCL?: string): string => {
  const label = getJobTypeLabelByLanguage(job, languageCL);
  return label?.description ?? '';
};

const BULK_JOB_TYPES_URL = 'bulk-actions/bulk-job-types';
const UI_ENTITIES_URL = 'ui-configuration/ui-entities';
const UNPROCESSED_ITEMS_URL = 'bulk-actions/bulk-jobs/unprocessed-items';

const BULK_JOB_TYPES_ENTITY_CL_OVERRIDES: Record<string, string> = {
  UnassignedHumanTask: 'HumanTask',
};

export const fetchBulkJobTypes = async (
  apiUrl: string,
  entityCL: string,
): Promise<BulkJobType[]> => {
  try {
    const res = await axios.get<BulkJobTypesPage>(`${apiUrl}/${BULK_JOB_TYPES_URL}`, {
      params: {
        entityCL: BULK_JOB_TYPES_ENTITY_CL_OVERRIDES[entityCL] ?? entityCL,
        active: true,
      },
    });

    return res?.data?.content ?? [];
  } catch (error) {
    console.error('Error fetching bulk job types:', error);
    return [];
  }
};

export const fetchJobSchema = async (
  apiUrl: string,
  uiEntityId: string,
): Promise<JobSchemas | null> => {
  try {
    const res = await axios.get(`${apiUrl}/${UI_ENTITIES_URL}/${uiEntityId}`);

    const data = res?.data;
    const uiSchema = getSchema(data?.schemas, 'UI');
    const schema = getSchema(data?.schemas, 'JSON');

    return {
      uiSchema,
      schema,
    };
  } catch (error) {
    console.error('Error fetching job schema:', error);
    return null;
  }
};

export const fetchUnprocessedItems = async (
  apiUrl: string,
  entityIds: string[],
  entityType: string,
  jobTypeCode: string,
): Promise<UnprocessedItem[]> => {
  try {
    const res = await axios.get(`${apiUrl}/${UNPROCESSED_ITEMS_URL}`, {
      params: {
        entityIds: entityIds.join(','),
        entityType,
        jobTypeCode,
      },
    });

    const data = res?.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data?.content ?? [];
  } catch (error) {
    console.error('Error fetching unprocessed items:', error);
    return [];
  }
};

const BULK_JOBS_URL = 'bulk-actions/bulk-jobs';

const mapRecordResults = (data: AnyType[]): RecordValidationResult[] =>
  data.map((item) => ({
    entityId: item?.entityId,
    status: item?.status === 'PASS' ? 'PASS' : 'ERROR',
    errors: Array.isArray(item?.errors) ? item.errors : [],
  }));

const extractJobId = (data: AnyType): string | null => {
  if (typeof data === 'string') {
    return data;
  }
  if (data && typeof data === 'object') {
    return data?.jobId ?? data?.jobReferenceId ?? data?.id ?? null;
  }
  return null;
};

export const validateBulkJob = async (
  apiUrl: string,
  jobCode: string,
  entityIds: string[],
  params: AnyType,
): Promise<{
  results: RecordValidationResult[] | null;
  parameterError: ParameterValidationResponse | null;
}> => {
  try {
    const res = await axios.post(
      `${apiUrl}/${BULK_JOBS_URL}/${jobCode}/validate`,
      { entityIds, params },
      { validateStatus: (status) => status === 200 || status === 400 },
    );

    const data = res?.data;
    if (Array.isArray(data)) {
      return { results: mapRecordResults(data), parameterError: null };
    }
    return { results: null, parameterError: data as ParameterValidationResponse };
  } catch (error: any) {
    const data = error?.response?.data;
    if (data?.violations || data?.innerViolations) {
      return { results: null, parameterError: data as ParameterValidationResponse };
    }
    return { results: null, parameterError: null };
  }
};

export const submitBulkJob = async (
  apiUrl: string,
  jobCode: string,
  entityIds: string[],
  params: AnyType,
): Promise<{
  jobId: string | null;
  results: RecordValidationResult[] | null;
  parameterError: ParameterValidationResponse | null;
}> => {
  try {
    const res = await axios.post(
      `${apiUrl}/${BULK_JOBS_URL}/${jobCode}/submit`,
      { entityIds, params },
      { validateStatus: (status) => status === 200 || status === 201 || status === 400 },
    );

    const data = res?.data;
    if (Array.isArray(data)) {
      return { jobId: null, results: mapRecordResults(data), parameterError: null };
    }
    const jobId = extractJobId(data);
    if (jobId) {
      return { jobId, results: null, parameterError: null };
    }
    if (data && (data?.violations || data?.innerViolations)) {
      return { jobId: null, results: null, parameterError: data as ParameterValidationResponse };
    }
    return { jobId: null, results: null, parameterError: null };
  } catch (error: any) {
    const data = error?.response?.data;
    if (Array.isArray(data)) {
      return { jobId: null, results: mapRecordResults(data), parameterError: null };
    }
    if (data?.violations || data?.innerViolations) {
      return { jobId: null, results: null, parameterError: data as ParameterValidationResponse };
    }
    return { jobId: null, results: null, parameterError: null };
  }
};
