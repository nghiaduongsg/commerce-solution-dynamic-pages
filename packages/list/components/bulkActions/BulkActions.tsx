import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Alert,
  Box,
  Divider,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Check,
  CheckCircle,
  Close,
  ErrorOutlineRounded,
  PlaylistAddCheck,
  TrackChanges,
  WarningAmberRounded,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import { TRANSITION_FORM } from '@pkg-constants/formIds';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { hasValue } from '@pkg-common/utils';
import { AnyType } from '@pkg-common/types';
import useTable from '@pkg-list/hooks/useTable';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { SetFormServerErrors, ClearFormServerErrors } from '@pkg-form/validations/redux/reducers';
import {
  getBEValidations,
  getBEValidationTypes,
} from '@pkg-form/validations/utils/validationUtils';
import {
  BulkJobType,
  JobSchemas,
  RecordValidationResult,
  UnprocessedItem,
  fetchBulkJobTypes,
  fetchJobSchema,
  fetchUnprocessedItems,
  validateBulkJob,
  submitBulkJob,
  getJobTypeDescription,
  getJobTypeLabel,
} from '../../utils/bulkActions';
import { useSystem } from '@pkg-setup/index';
import { TableColumnConfiguration } from '@pkg-list/src/types';
import { getBulkActionsStyles } from './styles';
import GenericCard from '@pkg-common/atomics/GenericCard/GenericCard';

const VALIDATION_STATUS_COLUMN: TableColumnConfiguration = {
  type: 'statusBadge',
  name: 'validationStatus',
  accessors: ['validationStatus'],
  align: 'left',
  visible: true,
  statusField: 'validationStatus',
  errorsField: 'validationErrors',
};

const BULK_JOB_DETAILS_URL = '/page/BulkJob';

export function useBulkActions({
  apiUrl,
  tableId,
  mandatoryBulkActionCriterion,
  selectedEntities,
  rowIdKey,
}: {
  apiUrl: string;
  tableId: string;
  mandatoryBulkActionCriterion: string | null | undefined;
  selectedEntities: AnyType[];
  rowIdKey: string;
}) {
  const [bulkActionMode, setBulkActionMode] = useState(true);
  const [jobs, setJobs] = useState<BulkJobType[]>([]);
  const [jobSchemas, setJobSchemas] = useState<JobSchemas | null>(null);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<BulkJobType | null>(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedJobId, setSubmittedJobId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<RecordValidationResult[] | null>(null);
  const [limitExceededOpen, setLimitExceededOpen] = useState(false);
  const [limitExceededInfo, setLimitExceededInfo] = useState<{
    selectedCount: number;
    maxEntries: number;
    excess: number;
  } | null>(null);
  const [unprocessedOpen, setUnprocessedOpen] = useState(false);
  const [unprocessedItems, setUnprocessedItems] = useState<UnprocessedItem[]>([]);
  const [submitErrorOpen, setSubmitErrorOpen] = useState(false);
  const [submitErrorMessages, setSubmitErrorMessages] = useState<string[]>([]);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const dispatch = useDispatch();
  const { t } = useTranslation([COMMON]);
  const { selectedLanguage } = useSystem();
  const { criteria, clearSelections, setMaxLimit, setExtraTableData } = useTable(tableId);
  const { setEntityFormData, clearEntityFormData, formData } = useEntityFormData(TRANSITION_FORM);
  const jobFormDataCache = useRef<Record<string, AnyType>>({});
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  useEffect(() => {
    fetchBulkJobTypes(apiUrl, tableId).then((data) => setJobs(data));
  }, [apiUrl, tableId]);

  useEffect(() => {
    if (!mandatoryBulkActionCriterion) {
      setBulkActionMode(true);
    } else if (hasValue(criteria[mandatoryBulkActionCriterion])) {
      setBulkActionMode(true);
      clearSelections();
      setValidationResults(null);
      setSubmittedJobId(null);
    } else {
      setBulkActionMode(false);
      clearSelections();
      setValidationResults(null);
      setSubmittedJobId(null);
    }
    setUnprocessedItems([]);
    setUnprocessedOpen(false);
    setSubmitStatus('idle');
    setExtraTableData({ unprocessedRowIds: [] });
    jobFormDataCache.current = {};
  }, [criteria, mandatoryBulkActionCriterion, clearSelections, setExtraTableData]);

  const openJobDialog = useCallback(
    (job: BulkJobType) => {
      if (!job.uiEntityId) {
        return;
      }
      const selectedEntityIds = (selectedEntities ?? [])
        .map((row) => row?.[rowIdKey])
        .filter((id) => hasValue(id));

      if (job.maxEntries && selectedEntityIds.length > job.maxEntries) {
        const excess = selectedEntityIds.length - job.maxEntries;
        setLimitExceededInfo({
          selectedCount: selectedEntityIds.length,
          maxEntries: job.maxEntries,
          excess,
        });
        setLimitExceededOpen(true);
        return;
      }

      if (job.maxEntries) {
        setMaxLimit(job.maxEntries);
      }

      return Promise.all([
        fetchJobSchema(apiUrl, job.uiEntityId),
        fetchUnprocessedItems(apiUrl, selectedEntityIds, tableId, job.code),
      ]).then(([fetchedSchemas, unprocessedItems]) => {
        if (!fetchedSchemas) {
          return;
        }

        const foundUnprocessed = (unprocessedItems ?? []).filter(
          (item) => hasValue(item?.entityId) && selectedEntityIds.includes(item.entityId),
        );

        if (foundUnprocessed.length) {
          setExtraTableData({ unprocessedRowIds: foundUnprocessed.map((item) => item.entityId) });
          setUnprocessedItems(foundUnprocessed);
          setUnprocessedOpen(true);
          return;
        }

        setJobSchemas(fetchedSchemas);
        setActiveJob(job);
        setValidationResults(null);
        setSubmittedJobId(null);
        setJobDialogOpen(true);
        const cachedData = jobFormDataCache.current[job.code];
        setEntityFormData({
          ...cachedData,
          ...(criteria[mandatoryBulkActionCriterion ?? 'humanTaskTypeCode'] !== undefined && {
            [mandatoryBulkActionCriterion ?? 'humanTaskTypeCode']:
              criteria[mandatoryBulkActionCriterion ?? 'humanTaskTypeCode'],
          }),
        });
        setJobDialogOpen(true);
      });
    },
    [
      apiUrl,
      tableId,
      selectedEntities,
      rowIdKey,
      setMaxLimit,
      t,
      selectedLanguage,
      criteria,
      mandatoryBulkActionCriterion,
      setEntityFormData,
    ],
  );

  const closeJobDialog = useCallback(() => {
    if (activeJob && formDataRef.current) {
      jobFormDataCache.current[activeJob.code] = formDataRef.current;
    }
    setJobDialogOpen(false);
    setActiveJob(null);
    setSubmittedJobId(null);
    clearEntityFormData();
    dispatch(ClearFormServerErrors());
  }, [clearEntityFormData, dispatch, activeJob]);

  const closeLimitExceededDialog = useCallback(() => {
    setLimitExceededOpen(false);
    setLimitExceededInfo(null);
  }, []);

  const closeUnprocessedDialog = useCallback(() => {
    setUnprocessedOpen(false);
  }, []);

  const validateJob = useCallback(
    async (parameters: AnyType) => {
      if (!activeJob) return;
      const selectedEntityIds = (selectedEntities ?? [])
        .map((row) => row?.[rowIdKey])
        .filter((id) => hasValue(id));

      setValidating(true);
      setSubmittedJobId(null);
      dispatch(ClearFormServerErrors());
      let params = parameters;
      const { results, parameterError: paramErr } = await validateBulkJob(
        apiUrl,
        activeJob.code,
        selectedEntityIds,
        params,
      );

      setValidating(false);

      if (paramErr) {
        const violations = paramErr.violations ?? [];
        if (violations.length) {
          dispatch(
            SetFormServerErrors({
              errors: getBEValidations(TRANSITION_FORM, violations),
              errorTypes: getBEValidationTypes(TRANSITION_FORM, violations),
            }),
          );
        }
        setValidationResults(null);
        return;
      }

      const validationResults = results ?? [];

      setValidationResults(validationResults);
    },
    [apiUrl, activeJob, selectedEntities, rowIdKey, dispatch],
  );

  const submitJob = useCallback(
    async (parameters: AnyType) => {
      if (!activeJob) return;
      const selectedEntityIds = (selectedEntities ?? [])
        .map((row) => row?.[rowIdKey])
        .filter((id) => hasValue(id));

      setSubmitting(true);
      setSubmittedJobId(null);
      dispatch(ClearFormServerErrors());

      const {
        jobId,
        results,
        parameterError: paramErr,
      } = await submitBulkJob(apiUrl, activeJob.code, selectedEntityIds, parameters);

      setSubmitting(false);

      if (paramErr) {
        const violations = paramErr.violations ?? [];
        const messages = violations.map((v) => v.message).filter((m): m is string => !!m);
        const failedIds = violations.map((v) => v.rejectedValue).filter((id): id is string => !!id);

        if (failedIds.length) {
          setExtraTableData({ submitErrorRowIds: failedIds });
        }
        setSubmitErrorMessages(messages);
        setSubmitErrorOpen(true);
        setSubmitStatus('error');
        setJobDialogOpen(false);
        setValidationResults(null);
        return;
      }

      if (results?.length) {
        setValidationResults(results);
        return;
      }

      if (jobId) {
        setSubmittedJobId(jobId);
        setSubmitStatus('success');
        clearSelections();
        if (activeJob) {
          delete jobFormDataCache.current[activeJob.code];
        }
      }
    },
    [apiUrl, activeJob, selectedEntities, rowIdKey, dispatch, clearSelections, setExtraTableData],
  );

  const allValidated = validationResults?.every((r) => r.status === 'PASS') ?? false;

  const closeSubmitErrorDialog = useCallback(() => {
    setSubmitErrorOpen(false);
    setSubmitErrorMessages([]);
    setExtraTableData({ submitErrorRowIds: [] });
  }, [setExtraTableData]);

  return {
    bulkActionMode,
    jobs,
    jobSchemas,
    jobDialogOpen,
    activeJob,
    validating,
    submitting,
    submittedJobId,
    validationResults,
    allValidated,
    openJobDialog,
    closeJobDialog,
    validateJob,
    submitJob,
    limitExceededOpen,
    limitExceededInfo,
    closeLimitExceededDialog,
    unprocessedOpen,
    unprocessedItems,
    closeUnprocessedDialog,
    submitErrorOpen,
    submitErrorMessages,
    closeSubmitErrorDialog,
    submitStatus,
  };
}

export function BulkActionsMenu({
  pageId,
  jobs,
  selectedLanguage,
  onSelect,
  disabled = false,
}: Readonly<{
  pageId: string;
  jobs: BulkJobType[];
  selectedLanguage: string;
  onSelect: (job: BulkJobType) => void;
  disabled?: boolean;
}>) {
  const theme = useTheme();
  const s = getBulkActionsStyles(theme);
  const { t } = useTranslation([COMMON]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (!jobs.length) {
    return null;
  }

  return (
    <>
      <GenericButton
        id={`${pageId}-bulk-actions-btn`}
        variant="contained"
        disabled={disabled}
        startIcon={<PlaylistAddCheck />}
        label={t('bulkActions', { ns: COMMON, lng: selectedLanguage })}
        ariaHasPopup="menu"
        ariaControls={anchor ? `${pageId}-bulk-actions-menu` : undefined}
        onClick={(e) => setAnchor(e.currentTarget)}
      />
      <Menu
        id={`${pageId}-bulk-actions-menu`}
        elevation={0}
        keepMounted
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: s.menuPaper,
          },
        }}
      >
        <Box sx={s.menuHeader}>
          <Typography variant="subtitle2" sx={s.menuHeaderTitle}>
            {t('bulkActions', { ns: COMMON, lng: selectedLanguage })}
          </Typography>
          <Typography variant="body2" sx={s.menuHeaderDescription}>
            {t('bulkActionsMenuDescription', { ns: COMMON, lng: selectedLanguage })}
          </Typography>
        </Box>
        <Divider sx={s.menuDivider} />
        {jobs.map((job) => {
          const label = getJobTypeLabel(job, selectedLanguage);
          const description = getJobTypeDescription(job, selectedLanguage);
          return (
            <MenuItem
              key={job.code}
              onClick={() => {
                setAnchor(null);
                onSelect(job);
              }}
              sx={s.menuItem}
            >
              <Box sx={s.menuItemIcon}>
                <PlaylistAddCheck fontSize="small" />
              </Box>
              <Box sx={s.menuItemContent}>
                <Typography variant="subtitle2" sx={s.menuItemLabel}>
                  {label}
                </Typography>
                {description ? (
                  <Typography variant="body2" sx={s.menuItemDescription}>
                    {description}
                  </Typography>
                ) : null}
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

export function BulkActionsStepper({
  tableId,
  mandatoryBulkActionCriterion,
  filterSchema,
  filterUiSchema,
  inlineFilter = false,
}: Readonly<{
  tableId: string;
  mandatoryBulkActionCriterion?: {
    criterion: string;
    namespace: string;
  };
  filterSchema?: AnyType;
  filterUiSchema?: AnyType;
  inlineFilter?: boolean;
}>) {
  const theme = useTheme();
  const s = getBulkActionsStyles(theme);
  const { criterion: mandatoryCriterion = '', namespace: filterNamespace } =
    mandatoryBulkActionCriterion ?? {};
  const { t } = useTranslation([filterNamespace ?? '', COMMON]);
  const { apiUrl, selectedLanguage } = useSystem();
  const [isStepperOpen, setIsStepperOpen] = useState(false);

  const {
    criteria,
    selectedRowsNumber,
    selectedEntities,
    rowIdKey,
    tableData,
    setTableData,
    columns,
    setColumnData,
    applyCriteria,
    setFilterData,
  } = useTable(tableId);

  const inlineFilterSchema = useMemo(() => {
    if (!inlineFilter || !filterSchema?.properties?.[mandatoryCriterion]) return null;
    return {
      type: 'object',
      properties: {
        [mandatoryCriterion]: filterSchema.properties[mandatoryCriterion],
      },
    };
  }, [inlineFilter, filterSchema, mandatoryCriterion]);

  const inlineFilterUiSchema = useMemo(() => {
    if (!inlineFilter || !filterUiSchema?.[mandatoryCriterion]) return null;
    return {
      'ui:labels': filterUiSchema['ui:labels'],
      [mandatoryCriterion]: filterUiSchema[mandatoryCriterion],
    };
  }, [inlineFilter, filterUiSchema, mandatoryCriterion]);
  const handleInlineFilterChange = useCallback(
    (formData: AnyType) => {
      setFilterData(formData);
      applyCriteria(formData);
    },
    [setFilterData, applyCriteria],
  );

  const {
    jobs,
    jobSchemas,
    jobDialogOpen,
    validating,
    submitting,
    submittedJobId,
    validationResults,
    allValidated,
    openJobDialog,
    closeJobDialog,
    validateJob,
    submitJob,
    limitExceededOpen,
    limitExceededInfo,
    closeLimitExceededDialog,
    unprocessedOpen,
    unprocessedItems,
    closeUnprocessedDialog,
    submitErrorOpen,
    submitErrorMessages,
    closeSubmitErrorDialog,
    submitStatus,
  } = useBulkActions({
    apiUrl,
    tableId,
    mandatoryBulkActionCriterion: mandatoryCriterion,
    selectedEntities,
    rowIdKey,
  });

  const step1Done = !!criteria[mandatoryCriterion] || submitStatus !== 'idle';
  const step2Done = selectedRowsNumber >= 2 || submitStatus !== 'idle';

  const step3Done =
    (!!validationResults?.length && !validationResults.some((r) => r.status === 'ERROR')) ||
    submitStatus === 'success';

  const step3Error = !!validationResults?.some((r) => r.status === 'ERROR');

  const step4Done = submitStatus === 'success';
  const step4Error = submitStatus === 'error';

  const criterionLabel = useMemo(() => {
    if (!mandatoryCriterion) {
      return '';
    }

    return t(mandatoryCriterion, {
      ns: filterNamespace || COMMON,
      lng: selectedLanguage,
    });
  }, [mandatoryCriterion, filterNamespace, selectedLanguage, t]);

  const steps = [
    {
      id: 'selectCriterion',
      label: t('bulkActionsSelectCriterion', {
        ns: COMMON,
        lng: selectedLanguage,
        criterionLabel,
      }),
      description: t('bulkActionsSelectCriterionDescription', {
        ns: COMMON,
        lng: selectedLanguage,
        criterionLabel,
      }),
      done: step1Done,
    },
    {
      id: 'selectItems',
      label: t('bulkActionsSelectItems', { ns: COMMON, lng: selectedLanguage }),
      description: t('bulkActionsSelectItemsDescription', { ns: COMMON, lng: selectedLanguage }),
      done: step2Done,
    },
    {
      id: 'validate',
      label: t('validate', { ns: COMMON, lng: selectedLanguage }),
      description: t('bulkActionsValidateDescription', { ns: COMMON, lng: selectedLanguage }),
      done: step3Done,
    },
    {
      id: 'apply',
      label: t('bulkActionsApply', { ns: COMMON, lng: selectedLanguage }),
      description: t('bulkActionsApplyDescription', { ns: COMMON, lng: selectedLanguage }),
      done: step4Done,
    },
  ];

  const activeStepIndex = (() => {
    const idx = steps.findIndex((step) => !step.done);
    return idx === -1 ? steps.length - 1 : idx;
  })();

  const appliedValidationRef = useRef<RecordValidationResult[] | null>(null);
  const appliedUnprocessedRef = useRef<UnprocessedItem[] | null>(null);

  useEffect(() => {
    if (!columns?.length) return;

    const hasValidationResults = !!validationResults?.length;
    const hasUnprocessed = !!unprocessedItems?.length;
    const hasStatusToShow = hasValidationResults || hasUnprocessed;
    const hasValidationCol = columns.some((col) => col.name === 'validationStatus');

    if (hasStatusToShow && !hasValidationCol) {
      setColumnData({
        data: [...columns, VALIDATION_STATUS_COLUMN],
      });
    } else if (!hasStatusToShow && hasValidationCol) {
      setColumnData({
        data: columns.filter((col) => col.name !== 'validationStatus'),
      });
    }

    if (
      hasStatusToShow &&
      tableData?.length &&
      rowIdKey &&
      (appliedValidationRef.current !== validationResults ||
        appliedUnprocessedRef.current !== unprocessedItems)
    ) {
      const validationMap = new Map((validationResults ?? []).map((r) => [r.entityId, r]));
      const unprocessedMap = new Map((unprocessedItems ?? []).map((i) => [i.entityId, i]));
      setTableData({
        data: tableData.map((row) => {
          const rowId = row[rowIdKey];
          const validation = validationMap.get(rowId);
          const unprocessed = unprocessedMap.get(rowId);
          return {
            ...row,
            validationStatus: validation?.status ?? (unprocessed ? 'UNPROCESSED' : null),
            validationErrors: validation?.errors ?? null,
          };
        }),
      });
      appliedValidationRef.current = validationResults;
      appliedUnprocessedRef.current = unprocessedItems;
    }
  }, [
    validationResults,
    unprocessedItems,
    columns,
    tableData,
    rowIdKey,
    setColumnData,
    setTableData,
  ]);

  if (!jobs?.length) {
    return null;
  }

  return (
    <>
      <GenericCard
        id={'bulk-actions-info-card'}
        title={t('bulkActions', { ns: COMMON, lng: selectedLanguage })}
        collapsible={true}
        expanded={isStepperOpen}
        onExpanded={() => setIsStepperOpen((prev) => !prev)}
        icon={'PlaylistAddCheck'}
      >
        <Box sx={s.stepperContainer}>
          <Box sx={s.stepsRow}>
            {steps.map((step, index) => {
              let state: 'done' | 'active' | 'locked';
              if (index < activeStepIndex) {
                state = 'done';
              } else if (index === activeStepIndex) {
                state = 'active';
              } else {
                state = 'locked';
              }

              return (
                <React.Fragment key={step.id}>
                  {index > 0 && <Box sx={s.stepConnector(steps[index - 1].done)} />}
                  <Box sx={s.stepItem}>
                    {(step.id === 'validate' && step3Error) ||
                    (step.id === 'apply' && step4Error) ? (
                      <Box sx={s.stepErrorBadge}>
                        <Close sx={{ fontSize: 16 }} />
                      </Box>
                    ) : (
                      <Box sx={s.stepBadge(state)}>
                        {state === 'done' ? <Check fontSize="small" /> : index + 1}
                      </Box>
                    )}
                    <Typography variant="subtitle2" sx={s.stepLabel(state)}>
                      {step.label}
                    </Typography>
                  </Box>
                </React.Fragment>
              );
            })}
          </Box>
          <Box sx={s.stepperBottomRow}>
            <Typography variant="body2" sx={s.stepperDescription}>
              {steps[activeStepIndex].description}
            </Typography>

            {activeStepIndex < 2 && inlineFilter && inlineFilterSchema && inlineFilterUiSchema && (
              <Box sx={{ ...s.stepperAction, minWidth: 280 }}>
                <DynamicForm
                  id={`${tableId}-bulk-filters`}
                  schema={inlineFilterSchema}
                  uiSchema={inlineFilterUiSchema}
                  data={{ [mandatoryCriterion]: criteria[mandatoryCriterion] }}
                  onChange={handleInlineFilterChange}
                  formContext={{ hideButtons: true, mechanism: 'DEFAULT' }}
                />
              </Box>
            )}
            {activeStepIndex >= 2 && (
              <Box sx={s.stepperAction}>
                <BulkActionsMenu
                  pageId={tableId}
                  jobs={jobs}
                  selectedLanguage={selectedLanguage}
                  onSelect={openJobDialog}
                  disabled={selectedRowsNumber < 2}
                />
              </Box>
            )}
          </Box>
        </Box>
      </GenericCard>

      <BulkActionsJobDialog
        pageId={tableId}
        open={jobDialogOpen}
        jobSchemas={jobSchemas}
        selectedLanguage={selectedLanguage}
        onClose={closeJobDialog}
        validating={validating}
        submitting={submitting}
        submittedJobId={submittedJobId}
        validationResults={validationResults}
        allValidated={allValidated}
        onValidate={validateJob}
        onSubmit={submitJob}
      />

      <SimpleDialog
        id="bulk-actions-limit-exceeded-dialog"
        title={t('bulkActionLimitExceededTitle', { ns: COMMON, lng: selectedLanguage })}
        open={limitExceededOpen}
        onClose={closeLimitExceededDialog}
        size="sm"
        buttons={
          <GenericButton
            id="bulk-actions-limit-close-btn"
            variant="contained"
            size="medium"
            label={t('ok', { ns: COMMON, lng: selectedLanguage })}
            onClick={closeLimitExceededDialog}
          />
        }
      >
        <Box sx={s.dialogPadding}>
          <Box sx={s.dialogCenteredHeaderCompact}>
            <Box sx={s.warningIconCircle}>
              <WarningAmberRounded sx={s.warningIcon} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              {t('bulkActionLimitExceededMessage', {
                ns: COMMON,
                lng: selectedLanguage,
                maxEntries: limitExceededInfo?.maxEntries,
                selectedCount: limitExceededInfo?.selectedCount,
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('bulkActionLimitExceededDeselect', {
                ns: COMMON,
                lng: selectedLanguage,
                count: limitExceededInfo?.excess,
              })}
            </Typography>
          </Box>
        </Box>
      </SimpleDialog>

      <SimpleDialog
        id="bulk-actions-unprocessed-dialog"
        title={t('bulkActionUnprocessedTitle', { ns: COMMON, lng: selectedLanguage })}
        open={unprocessedOpen}
        onClose={closeUnprocessedDialog}
        size="md"
        buttons={
          <GenericButton
            id="bulk-actions-unprocessed-close-btn"
            variant="contained"
            size="medium"
            label={t('ok', { ns: COMMON, lng: selectedLanguage })}
            onClick={closeUnprocessedDialog}
          />
        }
      >
        <Box sx={s.dialogPadding}>
          <Box sx={s.dialogCenteredHeader}>
            <Box sx={s.warningIconCircle}>
              <WarningAmberRounded sx={s.warningIcon} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {t('bulkActionUnprocessedMessage', {
                ns: COMMON,
                lng: selectedLanguage,
                count: unprocessedItems.length,
              })}
            </Typography>
          </Box>
        </Box>
      </SimpleDialog>

      <SimpleDialog
        id="bulk-actions-submit-error-dialog"
        title={t('bulkActionUnprocessedTitle', { ns: COMMON, lng: selectedLanguage })}
        open={submitErrorOpen}
        onClose={closeSubmitErrorDialog}
        size="md"
        buttons={
          <GenericButton
            id="bulk-actions-submit-error-close-btn"
            variant="contained"
            size="medium"
            label={t('ok', { ns: COMMON, lng: selectedLanguage })}
            onClick={closeSubmitErrorDialog}
          />
        }
      >
        <Box sx={s.dialogPadding}>
          <Box sx={s.dialogCenteredHeader}>
            <Box sx={s.warningIconCircle}>
              <WarningAmberRounded sx={s.warningIcon} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {t('bulkActionUnprocessedMessage', {
                ns: COMMON,
                lng: selectedLanguage,
                count: submitErrorMessages.length,
              })}
            </Typography>
          </Box>
        </Box>
      </SimpleDialog>
    </>
  );
}

export function BulkActionsJobDialog({
  pageId,
  open,
  jobSchemas,
  selectedLanguage,
  onClose,
  validating,
  submitting,
  submittedJobId,
  validationResults,
  allValidated,
  onValidate,
  onSubmit,
}: Readonly<{
  pageId: string;
  open: boolean;
  jobSchemas: JobSchemas | null;
  selectedLanguage: string;
  onClose: () => void;
  validating: boolean;
  submitting: boolean;
  submittedJobId: string | null;
  validationResults: RecordValidationResult[] | null;
  allValidated: boolean;
  onValidate: (parameters: AnyType) => void;
  onSubmit: (parameters: AnyType) => void;
}>) {
  const theme = useTheme();
  const s = getBulkActionsStyles(theme);
  const { t } = useTranslation([COMMON]);
  const { formData } = useEntityFormData(TRANSITION_FORM);
  const navigate = useNavigate();

  const errorCount = validationResults?.filter((r) => r.status === 'ERROR').length ?? 0;
  const passCount = validationResults?.filter((r) => r.status === 'PASS').length ?? 0;
  const hasFormFields = Object.keys(jobSchemas?.schema?.properties ?? {}).length > 0;

  if (submittedJobId) {
    return (
      <SimpleDialog
        open={open}
        title={t('bulkActionSubmittedTitle', { ns: COMMON, lng: selectedLanguage })}
        onClose={onClose}
        buttons={
          <Stack direction="row" spacing={2}>
            <GenericButton
              id={`${pageId}-bulk-job-close-btn`}
              variant="outlined"
              label={t('close', { ns: COMMON, lng: selectedLanguage })}
              onClick={onClose}
            />
            <GenericButton
              id={`${pageId}-bulk-job-view-job-btn`}
              variant="contained"
              startIcon={<TrackChanges />}
              label={t('bulkActionViewJob', { ns: COMMON, lng: selectedLanguage })}
              onClick={() => navigate(`${BULK_JOB_DETAILS_URL}/${submittedJobId}`)}
            />
          </Stack>
        }
      >
        <Box sx={s.dialogContent}>
          <Alert severity="success" icon={<CheckCircle />}>
            <Typography variant="body2" component="div" fontWeight={600}>
              {t('bulkActionSubmittedMessage', {
                ns: COMMON,
                lng: selectedLanguage,
                jobId: submittedJobId,
              })}
            </Typography>
          </Alert>
        </Box>
      </SimpleDialog>
    );
  }

  return (
    <SimpleDialog
      open={open}
      title={t('bulkActionDialogTitle', { ns: COMMON, lng: selectedLanguage, pageId })}
      onClose={onClose}
      buttons={
        <Stack direction="row" spacing={2}>
          <GenericButton
            id={`${pageId}-bulk-job-validate-btn`}
            variant="outlined"
            label={t('validate', { ns: COMMON, lng: selectedLanguage })}
            disabled={validating || submitting}
            onClick={() => onValidate(formData ?? {})}
          />
          <GenericButton
            id={`${pageId}-bulk-job-submit-btn`}
            variant="contained"
            label={t('submit', { ns: COMMON, lng: selectedLanguage })}
            disabled={!allValidated || submitting}
            onClick={() => onSubmit(formData ?? {})}
          />
        </Stack>
      }
    >
      <Box sx={s.dialogContent}>
        {validating && <LinearProgress sx={{ mb: 2 }} />}
        {!validationResults && (
          <Alert severity="info">
            {hasFormFields
              ? t('bulkActionCompleteFormHint', { ns: COMMON, lng: selectedLanguage })
              : t('bulkActionValidateOnlyHint', { ns: COMMON, lng: selectedLanguage })}
          </Alert>
        )}

        {validationResults && errorCount === 0 && (
          <Alert severity="success">
            {t('bulkActionValidationSuccess', {
              ns: COMMON,
              lng: selectedLanguage,
              count: passCount,
            })}
          </Alert>
        )}

        {validationResults && errorCount > 0 && (
          <Alert severity="error">
            <Typography variant="body2" component="div" fontWeight={600}>
              {t('bulkActionValidationFailed', {
                ns: COMMON,
                lng: selectedLanguage,
                passCount,
                errorCount,
              })}
            </Typography>
            <Stack spacing={0.5} sx={s.dialogErrorList}>
              {validationResults
                .filter((r) => r.status === 'ERROR')
                .map((r) => (
                  <Typography key={r.entityId} variant="body2" component="div">
                    {r.entityId}: {r.errors.join('; ')}
                  </Typography>
                ))}
            </Stack>
          </Alert>
        )}

        <DynamicForm
          id={TRANSITION_FORM}
          schema={jobSchemas?.schema ?? {}}
          uiSchema={jobSchemas?.uiSchema ?? {}}
          formContext={{ hideServerErrors: true }}
        />
      </Box>
    </SimpleDialog>
  );
}
