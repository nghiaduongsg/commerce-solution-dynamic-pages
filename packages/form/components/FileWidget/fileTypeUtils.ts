export const DEFAULT_DSS_VALIDATION_FILE_TYPES = ['.pdf', '.zip'];
export const DEFAULT_ATTACHMENT_REFERENCE_DSS_VALIDATION_FILE_TYPES = ['.pdf', '.zip'];

export function getEffectiveFileTypesToBeValidated(
  fileTypesToBeValidated: string[] | undefined,
  dssValidation: boolean,
): string[] | undefined {
  const hasValidFileTypes = fileTypesToBeValidated && fileTypesToBeValidated.length > 0;

  if (!dssValidation) {
    return fileTypesToBeValidated;
  }

  return hasValidFileTypes ? fileTypesToBeValidated : DEFAULT_DSS_VALIDATION_FILE_TYPES;
}

/**
 * Returns the effective file types for attachment-reference DSS validation.
 * Falls back to `DEFAULT_ATTACHMENT_REFERENCE_DSS_VALIDATION_FILE_TYPES` when
 * `dssValidation` is true and no explicit list is configured.
 */
export function getEffectiveAttachmentReferenceFileTypesToBeValidated(
  attachmentReferenceFileTypesToBeValidated: string[] | undefined,
  dssValidation: boolean,
): string[] | undefined {
  const hasValidFileTypes =
    attachmentReferenceFileTypesToBeValidated &&
    attachmentReferenceFileTypesToBeValidated.length > 0;

  if (!dssValidation) {
    return attachmentReferenceFileTypesToBeValidated;
  }

  return hasValidFileTypes
    ? attachmentReferenceFileTypesToBeValidated
    : DEFAULT_ATTACHMENT_REFERENCE_DSS_VALIDATION_FILE_TYPES;
}

/**
 * Returns true if the file name extension matches one of the allowed types.
 * Each entry in `fileTypesToBeValidated` may be either a MIME type or a file
 * extension with or without a leading dot.
 */
export const fileNameMatchesAllowedTypes = (
  fileName: string | undefined,
  fileTypesToBeValidated: string[],
): boolean => {
  if (!fileName) return false;
  const lowerName = fileName.toLowerCase();
  return fileTypesToBeValidated.some((t) => {
    if (t.includes('/')) return false;
    const ext = t.startsWith('.') ? t.toLowerCase() : `.${t.toLowerCase()}`;
    return lowerName.endsWith(ext);
  });
};
