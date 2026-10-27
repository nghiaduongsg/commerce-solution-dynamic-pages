import { useState, useCallback } from 'react';
import Axios from 'axios-observable';
import useSystem from '@pkg-setup/src/system/useSystem';

export type DssValidationStatus = 'TOTAL_PASSED' | 'TOTAL_FAILED' | 'INDETERMINATE' | 'NOT_SIGNED';

export interface DssValidationEntry {
  key: string;
  description: string;
}

export interface DssBuildingBlock {
  blockType: string;
  blockTitle: string;
  indication: string;
  subIndication: string | null;
  indicationDescription: string | null;
  subIndicationDescription: string | null;
  errors: DssValidationEntry[];
  warnings: DssValidationEntry[];
}

export interface DssValidationProcess {
  processType: string;
  errors: DssValidationEntry[];
  warnings: DssValidationEntry[];
}

export interface DssSignatureDetails {
  buildingBlocks: DssBuildingBlock[];
  validationProcesses: DssValidationProcess[];
}

export interface DssSignature {
  signatureId: string;
  indication: string;
  subIndication: string | null;
  indicationDescription: string;
  subIndicationDescription: string | null;
  signatureFormat: string;
  signerDn: string;
  issuerDn: string;
  claimedSigningTime: string;
  bestSigningTime: string;
  certificateNotExpired: boolean;
  revocationDataAvailable: boolean;
  timestampPresent: boolean;
  trustedChain: boolean;
  errors: DssValidationEntry[];
  warnings: DssValidationEntry[];
  details: DssSignatureDetails;
  signatureQualification: string;
}

export interface DssValidationResult {
  status: DssValidationStatus;
  signed: boolean;
  signatureCount: number;
  signatures: DssSignature[];
  validationTime: string;
  /** Server-side attachment ID, present when the result is stored in formData. */
  attachmentId?: string;
  /** Non-null when the server encountered an error processing the request. */
  errorMessage?: string | null;
}

export interface AttachmentValidationState {
  loading: boolean;
  result: DssValidationResult | null;
  error: string | null;
}

const DEFAULT_FILE_VALIDATION_URL = 'operational-report/signing/validate-upload';
const DEFAULT_ATTACHMENT_VALIDATION_URL = 'operational-report/signing/validate';
const ISS_FILE_VALIDATION_URL = 'iss-service-management/signing/validate-upload';
const ISS_ATTACHMENT_VALIDATION_URL = 'iss-service-management/signing/validate';

/**
 * Returns true if the file matches one of the allowed types.
 *
 * Each entry in `fileTypesToBeValidated` may be either:
 *  - A MIME type  (e.g. `"application/pdf"`)
 *  - A file extension with or without a leading dot (e.g. `".pdf"` or `"pdf"`)
 */
export const fileMatchesAllowedTypes = (file: File, fileTypesToBeValidated: string[]): boolean => {
  return fileTypesToBeValidated.some((t) => {
    if (file.type === t) return true;
    const ext = t.startsWith('.') ? t.toLowerCase() : `.${t.toLowerCase()}`;
    return file.name.toLowerCase().endsWith(ext);
  });
};

const mapSignature = (s: any): DssSignature => ({
  signatureId: s.signatureId ?? '',
  indication: s.indication ?? '',
  subIndication: s.subIndication ?? null,
  indicationDescription: s.indicationDescription ?? '',
  subIndicationDescription: s.subIndicationDescription ?? null,
  signatureFormat: s.signatureFormat ?? '',
  signerDn: s.signerDn ?? '',
  issuerDn: s.issuerDn ?? '',
  claimedSigningTime: s.claimedSigningTime ?? '',
  bestSigningTime: s.bestSigningTime ?? '',
  certificateNotExpired: s.certificateNotExpired ?? false,
  revocationDataAvailable: s.revocationDataAvailable ?? false,
  timestampPresent: s.timestampPresent ?? false,
  trustedChain: s.trustedChain ?? false,
  errors: s.errors ?? [],
  warnings: s.warnings ?? [],
  signatureQualification: s.signatureQualification ?? '',
  details: {
    buildingBlocks: (s.details?.buildingBlocks ?? []).map(
      (b: any): DssBuildingBlock => ({
        blockType: b.blockType ?? '',
        blockTitle: b.blockTitle ?? '',
        indication: b.indication ?? '',
        subIndication: b.subIndication ?? null,
        indicationDescription: b.indicationDescription ?? null,
        subIndicationDescription: b.subIndicationDescription ?? null,
        errors: b.errors ?? [],
        warnings: b.warnings ?? [],
      }),
    ),
    validationProcesses: (s.details?.validationProcesses ?? []).map(
      (vp: any): DssValidationProcess => ({
        processType: vp.processType ?? '',
        errors: vp.errors ?? [],
        warnings: vp.warnings ?? [],
      }),
    ),
  },
});

/**
 * Normalises a raw DSS API response (or a value parsed from a stringified
 * formData field) into a well-typed `DssValidationResult`.
 *
 * Handles the mismatch between the wire format and the internal type:
 * - `overallStatus`  → `status`
 * - building-block `indicationDescription` / `subIndicationDescription`
 * - top-level `attachmentId` and `errorMessage`
 *
 * Safe to call with `null` / `undefined` — returns `null` in that case.
 */
export const normaliseDssResponse = (data: any): DssValidationResult | null => {
  if (!data || typeof data !== 'object') return null;
  return {
    status: data.overallStatus ?? data.status ?? 'NOT_SIGNED',
    signed: data.signed ?? false,
    signatureCount: data.signatureCount ?? 0,
    signatures: (data.signatures ?? []).map(mapSignature),
    validationTime: data.validationTime ?? '',
    attachmentId: data.attachmentId ?? undefined,
    errorMessage: data.errorMessage ?? null,
  };
};

/**
 * Derives file and attachment validation endpoints from optional override URLs.
 *
 * `dssValidationUrl` overrides the file (pre-upload) validation endpoint.
 * `dssAttachmentReferenceValidationUrl` overrides the attachment-reference
 * (post-select) validation endpoint.
 *
 * Returns: `{ fileUrl, attachmentUrl }`
 */
const deriveValidationUrls = (
  application: string,
  dssValidationUrl?: string,
  dssAttachmentReferenceValidationUrl?: string,
) => {
  const isIss = application === 'ISS';
  const defaultFileUrl = isIss ? ISS_FILE_VALIDATION_URL : DEFAULT_FILE_VALIDATION_URL;
  const defaultAttachmentUrl = isIss
    ? ISS_ATTACHMENT_VALIDATION_URL
    : DEFAULT_ATTACHMENT_VALIDATION_URL;
  return {
    fileUrl: dssValidationUrl ?? defaultFileUrl,
    attachmentUrl: dssAttachmentReferenceValidationUrl ?? defaultAttachmentUrl,
  };
};

/**
 * Hook that provides two modes of DSS validation, sharing a single
 * `validationResults` map so `ValidationStatusBadge` can consume either.
 *
 * `validateFile(file)` – Pre-upload: POSTs the raw File as multipart
 * (`attachment` field) to the file validation endpoint.
 * Result is keyed by the file's name.
 * When `fileTypesToBeValidated` is provided and non-empty, only matching
 * files are validated; all others are silently skipped.
 *
 * `validateAttachment(attachmentId)` – Post-select: POSTs JSON
 * `{ attachmentId }` to the attachment validation endpoint.
 * Result is keyed by the attachmentId string.
 * Call with `null` / `undefined` to clear the entry (e.g. on deselect).
 *
 * @param fileTypesToBeValidated - Optional list of MIME types or file
 *   extensions (e.g. `['application/pdf', '.xml']`).
 * @param dssValidationUrl - Optional URL override for the file (pre-upload)
 *   validation endpoint. Replaces `DEFAULT_FILE_VALIDATION_URL` when provided.
 * @param dssAttachmentReferenceValidationUrl - Optional URL override for the
 *   attachment-reference (post-select) validation endpoint. Replaces
 *   `DEFAULT_ATTACHMENT_VALIDATION_URL` when provided.
 */
const useAttachmentValidation = (
  fileTypesToBeValidated?: string[],
  dssValidationUrl?: string,
  dssAttachmentReferenceValidationUrl?: string,
) => {
  const { apiUrl, application } = useSystem();
  const { fileUrl, attachmentUrl } = deriveValidationUrls(
    application,
    dssValidationUrl,
    dssAttachmentReferenceValidationUrl,
  );

  const [validationResults, setValidationResults] = useState<
    Record<string, AttachmentValidationState>
  >({});

  const validateFile = useCallback(
    (file: File) => {
      if (!file || !apiUrl) return;

      if (
        fileTypesToBeValidated &&
        fileTypesToBeValidated.length > 0 &&
        !fileMatchesAllowedTypes(file, fileTypesToBeValidated)
      ) {
        return;
      }

      const key = file.name;

      setValidationResults((prev) => ({
        ...prev,
        [key]: { loading: true, result: null, error: null },
      }));

      const formData = new FormData();
      formData.append('file', file, file.name);

      Axios.post(`${apiUrl}/${fileUrl}`, formData).subscribe({
        next: (response) => {
          const result = normaliseDssResponse(response?.data ?? {});
          setValidationResults((prev) => ({
            ...prev,
            [key]: { loading: false, result, error: null },
          }));
        },
        error: () => {
          setValidationResults((prev) => ({
            ...prev,
            [key]: { loading: false, result: null, error: 'dSSValidationGenericErrorMessage' },
          }));
        },
      });
    },
    [apiUrl, fileTypesToBeValidated, fileUrl],
  );

  /**
   * Validates an already-stored attachment by its server-side ID.
   * Passing null/undefined clears any existing entry for that ID.
   */
  const validateAttachment = useCallback(
    (attachmentId: string | null | undefined) => {
      if (!attachmentId) {
        // Clear stale state when the user deselects
        if (attachmentId === null || attachmentId === undefined) {
          setValidationResults((prev) => {
            const next = { ...prev };
            // Remove any key that looks like a UUID (attachment ID)
            Object.keys(next).forEach((k) => {
              if (/^[0-9a-f-]{36}$/i.test(k)) delete next[k];
            });
            return next;
          });
        }
        return;
      }

      if (!apiUrl) return;

      setValidationResults((prev) => ({
        ...prev,
        [attachmentId]: { loading: true, result: null, error: null },
      }));

      Axios.post(`${apiUrl}/${attachmentUrl}`, { attachmentId }).subscribe({
        next: (response) => {
          const result = normaliseDssResponse(response?.data ?? {});
          setValidationResults((prev) => ({
            ...prev,
            [attachmentId]: { loading: false, result, error: null },
          }));
        },
        error: () => {
          setValidationResults((prev) => ({
            ...prev,
            [attachmentId]: {
              loading: false,
              result: null,
              error: 'dSSValidationGenericErrorMessage',
            },
          }));
        },
      });
    },
    [apiUrl, attachmentUrl],
  );

  return { validationResults, validateFile, validateAttachment };
};

export default useAttachmentValidation;
