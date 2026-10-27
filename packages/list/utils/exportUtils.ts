const FILE_TYPES = {
  csv: {
    extension: '.csv',
    mimeType: 'text/csv',
  },
  xlsx: {
    extension: '.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
} as const;

export const selectSaveFileLocation = async (fileType) => {
  try {
    const fileTypeConfig = FILE_TYPES[fileType];
    if (!fileTypeConfig) {
      return null;
    }
    const { extension, mimeType } = fileTypeConfig;

    const handle =
      'showSaveFilePicker' in window
        ? await window.showSaveFilePicker({
            suggestedName: `export${extension}`,
            types: [
              {
                description: `${fileType} Files`,
                accept: { [mimeType]: [extension] },
              },
            ],
          })
        : null;
    return handle;
  } catch (e: any) {
    if (e.name === 'AbortError') {
      if (e.message.includes('Failed to create or truncate file')) {
        return { error: { message: 'exportDuplicatedFailed' } };
      }
      return { error: { message: e.message } };
    }

    throw e;
  }
};
