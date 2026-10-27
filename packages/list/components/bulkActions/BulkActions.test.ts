import { renderHook, act, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import useTable from '@pkg-list/hooks/useTable';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { useSystem } from '@pkg-setup/index';

import {
  fetchBulkJobTypes,
  fetchJobSchema,
  fetchUnprocessedItems,
  validateBulkJob,
  submitBulkJob,
} from '../../utils/bulkActions';

import { useBulkActions } from './BulkActions';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@pkg-list/hooks/useTable', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-entity/hooks/useEntityFormData', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-setup/index', () => ({
  useSystem: jest.fn(),
}));

jest.mock('@pkg-common/components/GenericButton/GenericButton', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@pkg-common/components/SimpleDialog/SimpleDialog', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@pkg-form/components/DynamicForm/DynamicForm', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@pkg-common/atomics/GenericCard/GenericCard', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@pkg-form/validations/redux/reducers', () => ({
  SetFormServerErrors: jest.fn(() => ({
    type: 'SET_FORM_SERVER_ERRORS',
  })),
  ClearFormServerErrors: jest.fn(() => ({
    type: 'CLEAR_FORM_SERVER_ERRORS',
  })),
}));

jest.mock('@pkg-form/validations/utils/validationUtils', () => ({
  getBEValidations: jest.fn(() => []),
  getBEValidationTypes: jest.fn(() => []),
}));

jest.mock('./styles', () => ({
  getBulkActionsStyles: jest.fn(() => ({
    menuPaper: {},
    menuHeader: {},
    menuHeaderTitle: {},
    menuHeaderDescription: {},
    menuDivider: {},
    menuItem: {},
    menuItemIcon: {},
    menuItemContent: {},
    menuItemLabel: {},
    menuItemDescription: {},
    stepperContainer: {},
    stepsRow: {},
    stepConnector: jest.fn(() => ({})),
    stepItem: {},
    stepErrorBadge: {},
    stepBadge: jest.fn(() => ({})),
    stepLabel: jest.fn(() => ({})),
    stepperBottomRow: {},
    stepperDescription: {},
    stepperAction: {},
    dialogContent: {},
    dialogErrorList: {},
  })),
}));

jest.mock('../../utils/bulkActions', () => ({
  fetchBulkJobTypes: jest.fn(),
  fetchJobSchema: jest.fn(),
  fetchUnprocessedItems: jest.fn(),
  validateBulkJob: jest.fn(),
  submitBulkJob: jest.fn(),
  getJobTypeDescription: jest.fn(),
  getJobTypeLabel: jest.fn(),
}));

const mockDispatch = jest.fn();
const mockClearSelections = jest.fn();
const mockSetMaxLimit = jest.fn();
const mockSetEntityFormData = jest.fn();
const mockClearEntityFormData = jest.fn();
const mockSetExtraTableData = jest.fn();
const mockSetTableData = jest.fn();
const mockSetColumnData = jest.fn();
const mockApplyCriteria = jest.fn();
const mockSetFilterData = jest.fn();

const mockTranslate = jest.fn((key: string) => key);

const defaultTableMock = {
  criteria: {},
  clearSelections: mockClearSelections,
  setMaxLimit: mockSetMaxLimit,
  selectedRowsNumber: 0,
  selectedEntities: [],
  rowIdKey: 'id',
  tableData: [],
  setTableData: mockSetTableData,
  columns: [],
  setColumnData: mockSetColumnData,
  applyCriteria: mockApplyCriteria,
  setFilterData: mockSetFilterData,
  setExtraTableData: mockSetExtraTableData,
};

const defaultProps = {
  apiUrl: '/api',
  tableId: 'cases',
  mandatoryBulkActionCriterion: null,
  selectedEntities: [{ id: '1' }, { id: '2' }],
  rowIdKey: 'id',
};

const defaultJob = {
  code: 'TEST_JOB',
  uiEntityId: 'entity-1',
  entityCL: 'CASE',
};

describe('useBulkActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

    (useTranslation as jest.Mock).mockReturnValue({
      t: mockTranslate,
    });

    (useSystem as jest.Mock).mockReturnValue({
      apiUrl: '/api',
      selectedLanguage: 'en',
    });

    (useTable as jest.Mock).mockReturnValue({
      ...defaultTableMock,
    });

    (useEntityFormData as jest.Mock).mockReturnValue({
      setEntityFormData: mockSetEntityFormData,
      clearEntityFormData: mockClearEntityFormData,
      formData: {},
    });

    (fetchBulkJobTypes as jest.Mock).mockResolvedValue([]);

    (fetchJobSchema as jest.Mock).mockResolvedValue({
      schema: {},
      uiSchema: {},
    });

    (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

    (validateBulkJob as jest.Mock).mockResolvedValue({
      results: [],
    });

    (submitBulkJob as jest.Mock).mockResolvedValue({
      jobId: null,
      results: null,
      parameterError: null,
    });
  });

  describe('initialization', () => {
    it('should initialize and fetch bulk jobs', async () => {
      const jobs = [
        {
          code: 'TEST_JOB',
          uiEntityId: 'entity-1',
          entityCL: 'CASE',
        },
      ];

      (fetchBulkJobTypes as jest.Mock).mockResolvedValue(jobs);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [],
          rowIdKey: 'id',
        }),
      );

      await waitFor(() => {
        expect(result.current.jobs).toEqual(jobs);
      });

      expect(result.current.bulkActionMode).toBe(true);
    });

    it('should initialize with an empty jobs list when no jobs are returned', async () => {
      (fetchBulkJobTypes as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [],
          rowIdKey: 'id',
        }),
      );

      await waitFor(() => {
        expect(fetchBulkJobTypes).toHaveBeenCalledWith('/api', 'cases');
      });

      expect(result.current.jobs).toEqual([]);
      expect(result.current.bulkActionMode).toBe(true);
    });
  });

  describe('mandatory criterion', () => {
    it('should disable bulk action mode when the mandatory criterion is not selected', () => {
      (useTable as jest.Mock).mockReturnValue({
        ...defaultTableMock,
        criteria: {
          humanTaskTypeCode: null,
        },
      });

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: 'humanTaskTypeCode',
          selectedEntities: [],
          rowIdKey: 'id',
        }),
      );

      expect(result.current.bulkActionMode).toBe(false);
      expect(mockClearSelections).toHaveBeenCalled();
    });

    it('should enable bulk action mode when the mandatory criterion is selected', async () => {
      (useTable as jest.Mock).mockReturnValue({
        ...defaultTableMock,
        criteria: {
          humanTaskTypeCode: 'TASK',
        },
      });

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: 'humanTaskTypeCode',
          selectedEntities: [],
          rowIdKey: 'id',
        }),
      );

      await waitFor(() => {
        expect(result.current.bulkActionMode).toBe(true);
      });

      expect(result.current.bulkActionMode).toBe(true);
    });

    it('should enable bulk action mode when no mandatory criterion is configured', () => {
      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [],
          rowIdKey: 'id',
        }),
      );

      expect(result.current.bulkActionMode).toBe(true);
    });
  });

  describe('openJobDialog', () => {
    it('should open the job dialog and fetch the job schema', async () => {
      const fetchedSchemas = {
        schema: {
          type: 'object',
          properties: {},
        },
        uiSchema: {},
      };

      (fetchJobSchema as jest.Mock).mockResolvedValue(fetchedSchemas);
      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }, { id: '2' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(defaultJob);
      });

      await waitFor(() => {
        expect(result.current.jobDialogOpen).toBe(true);
      });

      expect(fetchJobSchema).toHaveBeenCalledWith('/api', 'entity-1');

      expect(fetchUnprocessedItems).toHaveBeenCalledWith('/api', ['1', '2'], 'cases', 'TEST_JOB');

      expect(result.current.activeJob).toEqual(defaultJob);
      expect(result.current.jobSchemas).toEqual(fetchedSchemas);
    });

    it('should not open the dialog when the job has no uiEntityId', async () => {
      const jobWithoutUiEntityId = {
        code: 'TEST_JOB',
        uiEntityId: '',
        entityCL: 'CASE',
      };

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(jobWithoutUiEntityId);
      });

      expect(result.current.jobDialogOpen).toBe(false);
      expect(fetchJobSchema).not.toHaveBeenCalled();
      expect(fetchUnprocessedItems).not.toHaveBeenCalled();
    });

    it('should set the max limit when maxEntries is defined', async () => {
      const jobWithLimit = {
        ...defaultJob,
        maxEntries: 5,
      };

      (fetchJobSchema as jest.Mock).mockResolvedValue({
        schema: {},
        uiSchema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }, { id: '2' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(jobWithLimit);
      });

      expect(mockSetMaxLimit).toHaveBeenCalledWith(5);
      expect(result.current.jobDialogOpen).toBe(true);
    });

    it('should open the limit exceeded dialog when selected records exceed maxEntries', async () => {
      const jobWithLimit = {
        ...defaultJob,
        maxEntries: 2,
      };

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }, { id: '2' }, { id: '3' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(jobWithLimit);
      });

      expect(result.current.limitExceededOpen).toBe(true);

      expect(result.current.limitExceededInfo).toEqual({
        selectedCount: 3,
        maxEntries: 2,
        excess: 1,
      });

      expect(fetchJobSchema).not.toHaveBeenCalled();
      expect(fetchUnprocessedItems).not.toHaveBeenCalled();
      expect(mockSetMaxLimit).not.toHaveBeenCalled();
    });

    it('should open the unprocessed dialog when unprocessed records are returned', async () => {
      (fetchJobSchema as jest.Mock).mockResolvedValue({
        schema: {},
        uiSchema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([
        {
          entityId: '2',
        },
      ]);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }, { id: '2' }, { id: '3' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(defaultJob);
      });

      await waitFor(() => {
        expect(result.current.unprocessedOpen).toBe(true);
      });

      expect(result.current.unprocessedItems).toEqual([
        {
          entityId: '2',
        },
      ]);

      expect(mockSetExtraTableData).toHaveBeenCalledWith({
        unprocessedRowIds: ['2'],
      });

      expect(result.current.jobDialogOpen).toBe(false);
      expect(result.current.activeJob).toBe(null);
    });

    it('should open the job dialog when there are no unprocessed items', async () => {
      (fetchJobSchema as jest.Mock).mockResolvedValue({
        schema: {},
        uiSchema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }, { id: '2' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(defaultJob);
      });

      await waitFor(() => {
        expect(result.current.jobDialogOpen).toBe(true);
      });

      expect(result.current.unprocessedOpen).toBe(false);
      expect(result.current.unprocessedItems).toEqual([]);
      expect(result.current.activeJob).toEqual(defaultJob);
    });

    it('should set entity form data using the mandatory criterion', async () => {
      (useTable as jest.Mock).mockReturnValue({
        ...defaultTableMock,
        criteria: {
          humanTaskTypeCode: 'TASK',
        },
      });

      (fetchJobSchema as jest.Mock).mockResolvedValue({
        schema: {},
        uiSchema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: 'humanTaskTypeCode',
          selectedEntities: [{ id: '1' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(defaultJob);
      });

      expect(mockSetEntityFormData).toHaveBeenCalledWith({
        humanTaskTypeCode: 'TASK',
      });

      expect(result.current.jobDialogOpen).toBe(true);
    });
  });

  describe('closeJobDialog', () => {
    it('should close the job dialog and clear form data', async () => {
      (fetchJobSchema as jest.Mock).mockResolvedValue({
        schema: {},
        uiSchema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(defaultJob);
      });

      await waitFor(() => {
        expect(result.current.jobDialogOpen).toBe(true);
      });

      act(() => {
        result.current.closeJobDialog();
      });

      expect(result.current.jobDialogOpen).toBe(false);
      expect(result.current.activeJob).toBe(null);
      expect(result.current.submittedJobId).toBe(null);
      expect(mockClearEntityFormData).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('closeLimitExceededDialog', () => {
    it('should close the limit exceeded dialog and clear its info', async () => {
      const jobWithLimit = {
        ...defaultJob,
        maxEntries: 1,
      };

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }, { id: '2' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(jobWithLimit);
      });

      expect(result.current.limitExceededOpen).toBe(true);

      act(() => {
        result.current.closeLimitExceededDialog();
      });

      expect(result.current.limitExceededOpen).toBe(false);
      expect(result.current.limitExceededInfo).toBe(null);
    });
  });

  describe('closeUnprocessedDialog', () => {
    it('should close the unprocessed dialog', async () => {
      (fetchJobSchema as jest.Mock).mockResolvedValue({
        schema: {},
        uiSchema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([
        {
          entityId: '2',
        },
      ]);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }, { id: '2' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(defaultJob);
      });

      await waitFor(() => {
        expect(result.current.unprocessedOpen).toBe(true);
      });

      act(() => {
        result.current.closeUnprocessedDialog();
      });

      expect(result.current.unprocessedOpen).toBe(false);
    });
  });

  describe('validateJob', () => {
    it('should validate the selected entities', async () => {
      const validationResult = [
        {
          entityId: '1',
          status: 'PASS',
          errors: [],
        },
      ];

      (validateBulkJob as jest.Mock).mockResolvedValue({
        results: validationResult,
      });

      (fetchJobSchema as jest.Mock).mockResolvedValue({
        schema: {},
        uiSchema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(defaultJob);
      });

      await waitFor(() => {
        expect(result.current.jobDialogOpen).toBe(true);
      });

      await act(async () => {
        await result.current.validateJob({});
      });

      expect(validateBulkJob).toHaveBeenCalledWith('/api', 'TEST_JOB', ['1'], {});

      expect(result.current.validationResults).toEqual(validationResult);
      expect(result.current.allValidated).toBe(true);
      expect(result.current.validating).toBe(false);
    });

    it('should return false for allValidated when there are validation errors', async () => {
      const validationResult = [
        {
          entityId: '1',
          status: 'ERROR',
          errors: ['Invalid record'],
        },
      ];

      (validateBulkJob as jest.Mock).mockResolvedValue({
        results: validationResult,
      });

      (fetchJobSchema as jest.Mock).mockResolvedValue({
        schema: {},
        uiSchema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(defaultJob);
      });

      await act(async () => {
        await result.current.validateJob({});
      });

      expect(result.current.validationResults).toEqual(validationResult);
      expect(result.current.allValidated).toBe(false);
    });

    it('should not validate when there is no active job', async () => {
      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.validateJob({});
      });

      expect(validateBulkJob).not.toHaveBeenCalled();
    });

    it('should clear validation results when validation returns a parameter error', async () => {
      (validateBulkJob as jest.Mock).mockResolvedValue({
        results: [],
        parameterError: {
          violations: [
            {
              propertyPath: 'test',
              message: 'Invalid value',
            },
          ],
        },
      });

      (fetchJobSchema as jest.Mock).mockResolvedValue({
        schema: {},
        uiSchema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useBulkActions({
          apiUrl: '/api',
          tableId: 'cases',
          mandatoryBulkActionCriterion: null,
          selectedEntities: [{ id: '1' }],
          rowIdKey: 'id',
        }),
      );

      await act(async () => {
        await result.current.openJobDialog(defaultJob);
      });

      await act(async () => {
        await result.current.validateJob({});
      });

      expect(result.current.validationResults).toBe(null);
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('submitJob', () => {
    it('should submit the bulk job and return the job reference id on success', async () => {
      const job = {
        code: 'CLAIM_TASK',
        uiEntityId: 'claim-task',
        entityCL: 'HUMAN_TASK',
      };

      (fetchJobSchema as jest.Mock).mockResolvedValue({
        uiSchema: {},
        schema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      (submitBulkJob as jest.Mock).mockResolvedValue({
        jobId: 'JOB-2001',
        results: null,
        parameterError: null,
      });

      const { result } = renderHook(() => useBulkActions(defaultProps));

      await act(async () => {
        await result.current.openJobDialog(job);
      });

      await waitFor(() => {
        expect(result.current.activeJob).toEqual(job);
      });

      await act(async () => {
        await result.current.submitJob({
          reason: 'test',
        });
      });

      expect(submitBulkJob).toHaveBeenCalledWith('/api', 'CLAIM_TASK', ['1', '2'], {
        reason: 'test',
      });

      await waitFor(() => {
        expect(result.current.submittedJobId).toBe('JOB-2001');
      });

      expect(mockClearSelections).toHaveBeenCalled();
    });

    it('should surface per-record errors when submission returns validation results', async () => {
      const job = {
        code: 'CLAIM_TASK',
        uiEntityId: 'claim-task',
        entityCL: 'HUMAN_TASK',
      };

      const submissionResults = [
        {
          entityId: '1',
          status: 'PASS',
          errors: [],
        },
        {
          entityId: '2',
          status: 'ERROR',
          errors: ['record can no longer be assigned'],
        },
      ];

      (fetchJobSchema as jest.Mock).mockResolvedValue({
        uiSchema: {},
        schema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      (submitBulkJob as jest.Mock).mockResolvedValue({
        jobId: null,
        results: submissionResults,
        parameterError: null,
      });

      const { result } = renderHook(() => useBulkActions(defaultProps));

      await act(async () => {
        await result.current.openJobDialog(job);
      });

      await waitFor(() => {
        expect(result.current.activeJob).toEqual(job);
      });

      await act(async () => {
        await result.current.submitJob({
          reason: 'test',
        });
      });

      expect(submitBulkJob).toHaveBeenCalledWith('/api', 'CLAIM_TASK', ['1', '2'], {
        reason: 'test',
      });

      expect(result.current.submittedJobId).toBe(null);
      expect(result.current.validationResults).toEqual(submissionResults);
    });

    it('should show the submit error dialog when the backend returns parameter errors', async () => {
      const job = {
        code: 'CLAIM_TASK',
        uiEntityId: 'claim-task',
        entityCL: 'HUMAN_TASK',
      };

      (fetchJobSchema as jest.Mock).mockResolvedValue({
        uiSchema: {},
        schema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      (submitBulkJob as jest.Mock).mockResolvedValue({
        jobId: null,
        results: null,
        parameterError: {
          violations: [
            {
              message: 'Record 2 cannot be assigned',
              rejectedValue: '2',
            },
          ],
        },
      });

      const { result } = renderHook(() => useBulkActions(defaultProps));

      await act(async () => {
        await result.current.openJobDialog(job);
      });

      await waitFor(() => {
        expect(result.current.activeJob).toEqual(job);
      });

      await act(async () => {
        await result.current.submitJob({
          reason: 'test',
        });
      });

      expect(result.current.submitErrorOpen).toBe(true);

      expect(result.current.submitErrorMessages).toEqual(['Record 2 cannot be assigned']);

      expect(mockSetExtraTableData).toHaveBeenCalledWith({
        submitErrorRowIds: ['2'],
      });

      expect(result.current.jobDialogOpen).toBe(false);
      expect(result.current.submittedJobId).toBe(null);
    });
  });

  describe('closeSubmitErrorDialog', () => {
    it('should close the submit error dialog and clear the error data', async () => {
      const job = {
        code: 'CLAIM_TASK',
        uiEntityId: 'claim-task',
        entityCL: 'HUMAN_TASK',
      };

      (fetchJobSchema as jest.Mock).mockResolvedValue({
        schema: {},
        uiSchema: {},
      });

      (fetchUnprocessedItems as jest.Mock).mockResolvedValue([]);

      (submitBulkJob as jest.Mock).mockResolvedValue({
        jobId: null,
        results: null,
        parameterError: {
          violations: [
            {
              message: 'Record 2 cannot be assigned',
              rejectedValue: '2',
            },
          ],
        },
      });

      const { result } = renderHook(() => useBulkActions(defaultProps));

      await act(async () => {
        await result.current.openJobDialog(job);
      });

      await act(async () => {
        await result.current.submitJob({
          reason: 'test',
        });
      });

      await waitFor(() => {
        expect(result.current.submitErrorOpen).toBe(true);
      });

      act(() => {
        result.current.closeSubmitErrorDialog();
      });

      expect(result.current.submitErrorOpen).toBe(false);
      expect(result.current.submitErrorMessages).toEqual([]);

      expect(mockSetExtraTableData).toHaveBeenCalledWith({
        submitErrorRowIds: [],
      });
    });
  });
});
