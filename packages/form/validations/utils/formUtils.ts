import jp from 'jsonpath';
import axios from 'axios';
import { AnyType } from '@pkg-common/types';
import { jpValue } from '@pkg-common/dataResolver/utils';
import { isBoolean } from 'lodash';

const UTF8_FILENAME_REGEX = /filename\*\s*=\s*UTF-8''([^;]+)/i;
const ASCII_FILENAME_REGEX = /filename\s*=\s*"?([^";]+)"?/i;

export const replacePropToData = (data: AnyType, property: string, pathToValue: Array<string>) => {
  if (data && property && Object.keys(data).includes(property) && pathToValue.length) {
    const value = jpValue(data, pathToValue);

    if (value) {
      const clonedData = JSON.parse(JSON.stringify(data));
      clonedData[property] = value;
      return clonedData;
    }
  }
  return data;
};

const fallbackCopyTextToClipboard = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';
  document.body.appendChild(textArea);

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(textArea);
  selection?.removeAllRanges();
  selection?.addRange(range);

  try {
    // @ts-nocheck
    document.execCommand('copy');
    document.body.removeChild(textArea);

    return true;
  } catch (err) {
    document.body.removeChild(textArea);
    return false;
  }
};

export const copyTextToClipboard = (text: string) => {
  if (!navigator.clipboard) {
    return fallbackCopyTextToClipboard(text);
  }

  navigator.clipboard.writeText(text);

  return true;
};

export const getFormComponentTitle = (
  title: string,
  optionalHint: string,
  options?: { required?: boolean; omitValidationHints?: boolean },
) => {
  const { required = false, omitValidationHints = false } = options || {};
  const optionalFlag = required || omitValidationHints ? '' : `- ${optionalHint}`;
  return `${title} ${optionalFlag}`;
};

export const getArrayItemData = (item: AnyType /* CardArrayItemType */) => {
  return item?.children?.props?.formData || {};
};
export const getArrayItemSchema = (item: AnyType /* CardArrayItemType */) => {
  return item?.children?.props?.schema || {};
};

type definitions = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export const calculateGridSize = (length: number, size = 12): definitions => {
  return (12 - size * (length % (12 / size))) as definitions;
};

export const createDisplayValue = (changedData: Record<string, unknown>, subform) => {
  const { defaultFields = [], populatedField } = subform || {};
  if (!populatedField) {
    return {};
  }

  const extraData = { ...changedData, __STATUS__: '' };

  defaultFields.forEach((field) => delete extraData[field]);
  return {
    [populatedField]: Object.values(extraData)
      .filter((v) => v && !isBoolean(v))
      .join(' '),
  };
};

export const cleanDuplicatedData = (uniqueFields: Array<string>, data: AnyType = {}) => {
  const duplicatedData = JSON.parse(JSON.stringify(data));
  (uniqueFields || []).forEach((property) => {
    // split on the last "." occurrence
    const [objPath, keyToDelete] = property.split(/\.(?=[^.]+$)/);
    if (keyToDelete) {
      jp.apply(duplicatedData, `${objPath}`, function (obj: object | any[]) {
        if (Array.isArray(obj)) {
          obj.forEach((o) => delete o[keyToDelete]);
        } else {
          delete obj[keyToDelete];
        }
        return obj;
      });
    } else {
      delete duplicatedData[property];
    }
  });
  return duplicatedData;
};

export const downloadFile = async (
  api: string,
  fileName: any,
  apiUrl: string,
  data = {},
  fileHandle?,
  selectedFileType?: string,
) => {
  try {
    const response = await axios({
      url: `${apiUrl}/${api}`,
      method: Object.keys(data).length ? 'POST' : 'GET',
      responseType: 'blob',
      validateStatus: function (status) {
        return status < 400 || status === 401 || status === 403;
      },
      data,
    });

    if (response?.status === 401) {
      return { url: '', error: { status: 401 } };
    }

    if (response?.status === 403) {
      return { url: '', error: { status: 403 } };
    }

    if (fileHandle) {
      return saveFileWithFileHandle(new Blob([response.data]), fileHandle);
    } else {
      const contentType = response?.headers?.['content-type']?.toLocaleString();
      const contentDisposition =
        response?.headers?.['content-disposition'] ?? response?.headers?.['Content-Disposition'];

      const fileType = getFileTypeFromContentDisposition(contentDisposition);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        fileType ? `${fileName}.${fileType}` : `${fileName}.${selectedFileType}`,
      );
      document.body.appendChild(link);
      link.click();
      return { url };
    }
  } catch (error) {
    if (error instanceof Blob) {
      try {
        const text = await error.text();
        const parsed = JSON.parse(text);
        return { url: '', error: parsed };
      } catch {
        return { url: '', error };
      }
    }
    return { url: '', error };
  }
};

export const saveFileWithFileHandle = async (fileBlob: Blob, fileHandle) => {
  try {
    const writable = await fileHandle.createWritable();
    await writable.write(fileBlob);
    await writable.close();
    return { url: '' };
  } catch (e) {
    return { error: e };
  }
};

export const setAnnouncement = (id: string, msg: string) => {
  const helpTextAlertElement = document.getElementById(id);
  if (helpTextAlertElement) {
    helpTextAlertElement.innerHTML = msg;
    setTimeout(() => {
      helpTextAlertElement.innerHTML = '';
    }, 10000);
  }
};

function getFileTypeFromContentDisposition(contentDisposition?: string): string | null {
  if (!contentDisposition) return null;

  let filename: string | null = null;

  // filename*=UTF-8''file.ext
  const utf8Match = UTF8_FILENAME_REGEX.exec(contentDisposition);
  if (utf8Match) {
    filename = decodeURIComponent(utf8Match[1]);
  } else {
    // filename="file.ext" OR filename=file.ext
    const asciiMatch = ASCII_FILENAME_REGEX.exec(contentDisposition);
    filename = asciiMatch ? asciiMatch[1] : null;
  }

  if (!filename) return null;

  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex + 1) : null;
}
