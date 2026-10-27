import axios from 'axios';
import { getSchema } from '@pkg-core/schemas/SchemasController';
import {
  getJobTypeLabel,
  getJobTypeDescription,
  fetchBulkJobTypes,
  fetchJobSchema,
  fetchUnprocessedItems,
  validateBulkJob,
} from './bulkActions';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@pkg-core/schemas/SchemasController', () => ({
  __esModule: true,
  getSchema: jest.fn(),
}));

describe('getJobTypeLabel', () => {
  it('returns the shortActionLabel for the matching language', () => {
    const job = {
      code: 'JOB1',
      entityCL: 'Case',
      labels: [
        { languageCL: 'EN', shortActionLabel: 'English Label' },
        { languageCL: 'CS', shortActionLabel: 'Czech Label' },
      ],
    };

    expect(getJobTypeLabel(job, 'CS')).toBe('Czech Label');
  });

  it('falls back to the first label when the language does not match', () => {
    const job = {
      code: 'JOB1',
      entityCL: 'Case',
      labels: [
        { languageCL: 'EN', shortActionLabel: 'English Label' },
        { languageCL: 'CS', shortActionLabel: 'Czech Label' },
      ],
    };

    expect(getJobTypeLabel(job, 'DE')).toBe('English Label');
  });

  it('falls back to the job code when no labels exist', () => {
    const job = {
      code: 'JOB1',
      entityCL: 'Case',
    };

    expect(getJobTypeLabel(job, 'EN')).toBe('JOB1');
  });

  it('falls back to the job code when the label has no shortActionLabel', () => {
    const job = {
      code: 'JOB1',
      entityCL: 'Case',
      labels: [
        {
          languageCL: 'EN',
          description: 'only a description',
        },
      ],
    };

    expect(getJobTypeLabel(job, 'EN')).toBe('JOB1');
  });
});

describe('getJobTypeDescription', () => {
  it('returns the description for the matching language', () => {
    const job = {
      code: 'JOB1',
      entityCL: 'Case',
      labels: [
        {
          languageCL: 'EN',
          description: 'English description',
        },
        {
          languageCL: 'CS',
          description: 'Czech description',
        },
      ],
    };

    expect(getJobTypeDescription(job, 'CS')).toBe('Czech description');
  });

  it('returns an empty string when the label has no description', () => {
    const job = {
      code: 'JOB1',
      entityCL: 'Case',
      labels: [
        {
          languageCL: 'EN',
          shortActionLabel: 'Label',
        },
      ],
    };

    expect(getJobTypeDescription(job, 'EN')).toBe('');
  });

  it('returns an empty string when no labels exist', () => {
    const job = {
      code: 'JOB1',
      entityCL: 'Case',
    };

    expect(getJobTypeDescription(job, 'EN')).toBe('');
  });
});

describe('fetchBulkJobTypes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the job types content from the API', async () => {
    const jobTypes = [
      {
        code: 'JOB1',
        entityCL: 'Entity',
      },
    ];

    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        content: jobTypes,
      },
    });

    const result = await fetchBulkJobTypes('http://api', 'Entity');

    expect(axios.get).toHaveBeenCalledWith('http://api/bulk-actions/bulk-job-types', {
      params: {
        entityCL: 'Entity',
        active: true,
      },
    });

    expect(result).toEqual(jobTypes);
  });

  it('returns an empty array when the API returns no content', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {},
    });

    const result = await fetchBulkJobTypes('http://api', 'Entity');

    expect(result).toEqual([]);
  });

  it('returns an empty array and logs the error when the request fails', async () => {
    const error = new Error('network error');

    (axios.get as jest.Mock).mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await fetchBulkJobTypes('http://api', 'Entity');

    expect(result).toEqual([]);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching bulk job types:', error);

    consoleErrorSpy.mockRestore();
  });
});

describe('fetchJobSchema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the UI and JSON schemas', async () => {
    const schemas = [
      {
        type: 'UI',
        schema: 'ui-schema',
      },
      {
        type: 'JSON',
        schema: 'json-schema',
      },
    ];

    (axios.get as jest.Mock).mockResolvedValue({
      data: { schemas },
    });

    (getSchema as jest.Mock).mockReturnValueOnce('ui-schema').mockReturnValueOnce('json-schema');

    const result = await fetchJobSchema('http://api', 'entity-1');

    expect(axios.get).toHaveBeenCalledWith('http://api/ui-configuration/ui-entities/entity-1');

    expect(getSchema).toHaveBeenCalledWith(schemas, 'UI');
    expect(getSchema).toHaveBeenCalledWith(schemas, 'JSON');

    expect(result).toEqual({
      uiSchema: 'ui-schema',
      schema: 'json-schema',
    });
  });

  it('returns null and logs the error when the request fails', async () => {
    const error = new Error('network error');

    (axios.get as jest.Mock).mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await fetchJobSchema('http://api', 'entity-1');

    expect(result).toBeNull();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching job schema:', error);

    consoleErrorSpy.mockRestore();
  });
});
describe('fetchUnprocessedItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the unprocessed items from the API when the response is a plain array', async () => {
    const items = [
      {
        entityId: 'e1',
        entityType: 'HumanTask',
        id: 'dbe32cee-54f1-453f-aec3-07ee5661fd49',
        statusCL: 'PENDING',
      },
    ];

    (axios.get as jest.Mock).mockResolvedValue({
      data: items,
    });

    const result = await fetchUnprocessedItems('http://api', ['e1', 'e2'], 'Case', 'JOB1');

    expect(axios.get).toHaveBeenCalledWith('http://api/bulk-actions/bulk-jobs/unprocessed-items', {
      params: {
        entityIds: 'e1,e2',
        entityType: 'Case',
        jobTypeCode: 'JOB1',
      },
    });

    expect(result).toEqual(items);
  });

  it('returns the unprocessed items content from the API when the response is wrapped', async () => {
    const items = [
      {
        entityId: 'e1',
        statusCL: 'PENDING',
      },
    ];

    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        content: items,
      },
    });

    const result = await fetchUnprocessedItems('http://api', ['e1', 'e2'], 'Case', 'JOB1');

    expect(result).toEqual(items);
  });

  it('returns an empty array when the API returns no content', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {},
    });

    const result = await fetchUnprocessedItems('http://api', ['e1'], 'Case', 'JOB1');

    expect(result).toEqual([]);
  });

  it('returns an empty array and logs the error when the request fails', async () => {
    const error = new Error('network error');

    (axios.get as jest.Mock).mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await fetchUnprocessedItems('http://api', ['e1'], 'Case', 'JOB1');

    expect(result).toEqual([]);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching unprocessed items:', error);

    consoleErrorSpy.mockRestore();
  });
});

describe('validateBulkJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns per-record results when the API returns an array', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: [
        { entityId: 'e1', status: 'PASS', errors: [] },
        { entityId: 'e2', status: 'ERROR', errors: ['Something failed'] },
      ],
    });

    const result = await validateBulkJob('http://api', 'JOB1', ['e1', 'e2'], {});

    expect(axios.post).toHaveBeenCalledWith(
      'http://api/bulk-actions/bulk-jobs/JOB1/validate',
      { entityIds: ['e1', 'e2'], params: {} },
      expect.objectContaining({ validateStatus: expect.any(Function) }),
    );

    expect(result.parameterError).toBeNull();
    expect(result.results).toEqual([
      { entityId: 'e1', status: 'PASS', errors: [] },
      { entityId: 'e2', status: 'ERROR', errors: ['Something failed'] },
    ]);
  });

  it('maps non-PASS status to ERROR', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: [{ entityId: 'e1', status: 'FAILED', errors: ['err'] }],
    });

    const result = await validateBulkJob('http://api', 'JOB1', ['e1'], {});

    expect(result.results).toEqual([{ entityId: 'e1', status: 'ERROR', errors: ['err'] }]);
  });

  it('returns parameterError when the API returns a non-array object', async () => {
    const paramError = { violations: [{ fieldName: 'x', message: 'bad' }] };

    (axios.post as jest.Mock).mockResolvedValue({
      data: paramError,
    });

    const result = await validateBulkJob('http://api', 'JOB1', ['e1'], {});

    expect(result.results).toBeNull();
    expect(result.parameterError).toEqual(paramError);
  });

  it('returns null results and null parameterError on network error', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('network'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await validateBulkJob('http://api', 'JOB1', ['e1'], {});

    expect(result.results).toBeNull();
    expect(result.parameterError).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it('returns parameterError from error response when violations exist', async () => {
    const errorData = { violations: [{ fieldName: 'y', message: 'invalid' }] };

    (axios.post as jest.Mock).mockRejectedValue({
      response: { data: errorData },
    });

    const result = await validateBulkJob('http://api', 'JOB1', ['e1'], {});

    expect(result.results).toBeNull();
    expect(result.parameterError).toEqual(errorData);
  });
});
