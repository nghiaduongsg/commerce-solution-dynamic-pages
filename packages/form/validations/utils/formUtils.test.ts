import axios from 'axios';
import {
  calculateGridSize,
  cleanDuplicatedData,
  copyTextToClipboard,
  createDisplayValue,
  downloadFile,
  getFormComponentTitle,
  replacePropToData,
  setAnnouncement,
  getArrayItemSchema,
  getArrayItemData,
  saveFileWithFileHandle,
} from './formUtils';
import customMock from '@_jestHelpers/customMock';

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('formUtils', () => {
  describe('replacePropToData', () => {
    it('should return data if pathToValue has no length', () => {
      const data = {
        id: 'd854fda1-b5bb-449d-9373-b87dc7b464c4',
        identificationLabel: 'John Unknown Doe TIN 123456789 TAXPAYRDM1 REV_TYPE_1 2021-05-14',
        partyRole: {
          id: 'john-doe-party-role-taxpayer-uuid-36',
          identificationLabel: 'John Unknown Doe TIN 123456789 TAXPAYRDM1',
        },
        revenueTypeCode: 'REV_TYPE_1',
        startDate: '2021-05-14',
        endDate: '2021-05-14',
        activationReason: 'Activated',
        deactivationReason: 'Deactivated',
        cancellationReason: null,
        statusCL: 'DEACTIVATED',
        calendars: [{ code: 'REV_CAL_1', effectiveDate: '2021-05-14' }],
      };
      const property = 'partyRole';
      const pathToValue = [];
      const result = replacePropToData(data, property, pathToValue);
      expect(result).toEqual(data);
    });
    it('should return data if pathToValue does not return any value', () => {
      const data = {
        id: 'd854fda1-b5bb-449d-9373-b87dc7b464c4',
        identificationLabel: 'John Unknown Doe TIN 123456789 TAXPAYRDM1 REV_TYPE_1 2021-05-14',
        partyRole: {
          id: 'john-doe-party-role-taxpayer-uuid-36',
          identificationLabel: 'John Unknown Doe TIN 123456789 TAXPAYRDM1',
        },
        revenueTypeCode: 'REV_TYPE_1',
        startDate: '2021-05-14',
        endDate: '2021-05-14',
        activationReason: 'Activated',
        deactivationReason: 'Deactivated',
        cancellationReason: null,
        statusCL: 'DEACTIVATED',
        calendars: [{ code: 'REV_CAL_1', effectiveDate: '2021-05-14' }],
      };
      const property = 'partyRole';
      const pathToValue = ['some', 'path'];
      const result = replacePropToData(data, property, pathToValue);
      expect(result).toEqual(data);
    });
    it('should return data if property not found in data keys', () => {
      const data = {
        id: 'd854fda1-b5bb-449d-9373-b87dc7b464c4',
        identificationLabel: 'John Unknown Doe TIN 123456789 TAXPAYRDM1 REV_TYPE_1 2021-05-14',
        partyRole: {
          id: 'john-doe-party-role-taxpayer-uuid-36',
          identificationLabel: 'John Unknown Doe TIN 123456789 TAXPAYRDM1',
        },
        revenueTypeCode: 'REV_TYPE_1',
        startDate: '2021-05-14',
        endDate: '2021-05-14',
        activationReason: 'Activated',
        deactivationReason: 'Deactivated',
        cancellationReason: null,
        statusCL: 'DEACTIVATED',
        calendars: [{ code: 'REV_CAL_1', effectiveDate: '2021-05-14' }],
      };
      const property = 'someRandomProp';
      const pathToValue = ['partyRole', 'id'];
      const result = replacePropToData(data, property, pathToValue);
      expect(result).toEqual(data);
    });
    it('should replace property to data with the value based on the pathToValue', () => {
      const data = {
        id: 'd854fda1-b5bb-449d-9373-b87dc7b464c4',
        identificationLabel: 'John Unknown Doe TIN 123456789 TAXPAYRDM1 REV_TYPE_1 2021-05-14',
        partyRole: {
          id: 'john-doe-party-role-taxpayer-uuid-36',
          identificationLabel: 'John Unknown Doe TIN 123456789 TAXPAYRDM1',
        },
        revenueTypeCode: 'REV_TYPE_1',
        startDate: '2021-05-14',
        endDate: '2021-05-14',
        activationReason: 'Activated',
        deactivationReason: 'Deactivated',
        cancellationReason: null,
        statusCL: 'DEACTIVATED',
        calendars: [{ code: 'REV_CAL_1', effectiveDate: '2021-05-14' }],
      };
      const property = 'partyRole';
      const pathToValue = ['partyRole', 'id'];
      const expected = {
        ...data,
        [property]: 'john-doe-party-role-taxpayer-uuid-36',
      };
      const result = replacePropToData(data, property, pathToValue);
      expect(result).toEqual(expected);
    });
  });
  describe('getFormComponentTitle', () => {
    it('should return only title with optional hint if no options are passed', () => {
      const result = getFormComponentTitle('title', 'optional');
      expect(result).toEqual('title - optional');
    });
    it('should return only title if field is required but omitValidationHints is true', () => {
      const result = getFormComponentTitle('title', 'optional', {
        required: false,
        omitValidationHints: true,
      });
      expect(result).toEqual('title ');
    });
    it('should return only title with optional hint if field is not required', () => {
      const result = getFormComponentTitle('title', 'optional', { required: false });
      expect(result).toEqual('title - optional');
    });
    it('should return only title with optional hint if field is not required and omitValidationHints is false', () => {
      const result = getFormComponentTitle('title', 'optional', {
        required: false,
        omitValidationHints: false,
      });
      expect(result).toEqual('title - optional');
    });
  });
  describe('createDisplayValue', () => {
    it('should return empty object if populated field is not defined', () => {
      const result = createDisplayValue({ property: 'value' }, { defaultFields: ['name'] });
      expect(result).toEqual({});
    });
    it('should return populated field', () => {
      const result = createDisplayValue({ property: 'value' }, { populatedField: 'populated' });
      expect(result).toEqual({ populated: 'value' });
    });
    it('should return populated field', () => {
      const result = createDisplayValue(
        {
          propertyA: 'valueA',
          propertyB: 'valueB',
          name: 'A',
          surname: 'B',
          isNice: true,
          isNotNice: false,
          __STATUS__: 'ADDED',
        },
        { populatedField: 'populated', defaultFields: ['name', 'surname'] },
      );
      expect(result).toEqual({ populated: 'valueA valueB' });
    });
  });
  describe('copyTextToClipboard', () => {
    beforeAll(() => {
      customMock(document, 'createElement', {
        innerHTML: '',
        style: {
          top: '',
          left: '',
          position: '',
        },
      });
      customMock(window, 'getSelection', {
        removeAllRanges: jest.fn(),
        addRange: jest.fn(),
        getRangeAt: jest.fn(() => ({
          selectNodeContents: jest.fn(),
          collapse: jest.fn(),
          cloneRange: jest.fn(),
          deleteContents: jest.fn(),
        })),
        rangeCount: 0,
      });
      customMock(document, 'createRange', { selectNodeContents: jest.fn() });
    });
    beforeEach(() => {
      Object.defineProperty(document, 'execCommand', {
        value: jest.fn().mockReturnValue(true),
        writable: true,
        configurable: true,
      });
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn() },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(document, 'body', {
        value: {
          appendChild: jest.fn(),
          removeChild: jest.fn(),
          insertBefore: jest.fn(),
          children: [],
          childNodes: [],
        },
        writable: true,
      });
    });
    afterEach(() => jest.clearAllMocks());
    afterAll(() => jest.resetModules());

    it('should invoke clipboard API call when navigator is present', () => {
      expect(copyTextToClipboard('testText')).toBe(true);
    });
    it('should invoke fallback function when navigator.clipboard is undefined', () => {
      const fallbackElement = {
        innerHTML: 'testText',
        style: { left: '0', position: 'fixed', top: '0' },
      };
      delete (navigator as any).clipboard;
      expect(copyTextToClipboard('testText')).toBe(true);
      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(document.body.appendChild).toHaveBeenCalledWith(fallbackElement);
      expect(document.body.removeChild as jest.Mock).toHaveBeenCalledWith(fallbackElement);
    });
    it('should return false and throw when execCommand fails', () => {
      delete (navigator as any).clipboard;
      (document.execCommand as jest.Mock).mockImplementation(() => {
        throw new Error('testThrow');
      });
      expect(copyTextToClipboard('testText')).toBe(false);
    });
  });
  describe('calculateGridSize', () => {
    it('should return 6 with 3 & 6 parameters', () => {
      expect(calculateGridSize(3, 6)).toEqual(6);
    });
    it('should return 12 with default size', () => {
      expect(calculateGridSize(3)).toEqual(12);
    });
  });
  describe('setAnnouncement', () => {
    let mockElement: any;
    let docSpy: jest.SpyInstance | undefined;

    beforeEach(() => {
      jest.useFakeTimers();
      mockElement = { innerHTML: '' };
      docSpy = jest.spyOn(document, 'getElementById').mockImplementation(() => mockElement);
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
      docSpy?.mockRestore();
    });

    const testId = 'test-alert';
    const testMessage = 'Test announcement message';
    it('should set innerHTML when element exists', () => {
      setAnnouncement(testId, testMessage);
      expect(document.getElementById).toHaveBeenCalledWith(testId);
      expect(mockElement.innerHTML).toBe(testMessage);
    });
    it('should clear innerHTML after 10 seconds', () => {
      setAnnouncement(testId, testMessage);
      jest.advanceTimersByTime(10000);
      expect(mockElement.innerHTML).toBe('');
    });
  });
  describe('cleanDuplicatedData', () => {
    it('should return {} if there are no data to delete', () => {
      expect(cleanDuplicatedData([''], {})).toEqual({});
    });
    it('should return the remaining key value pairs (object flow)', () => {
      const uniqueFields = ['user.email'];
      const startingData = {
        user: {
          name: 'John Doe',
          email: 'johndoe@gmail.com',
        },
      };
      const expectedData = { user: { name: 'John Doe' } };
      expect(cleanDuplicatedData(uniqueFields, startingData)).toEqual(expectedData);
    });
    it('should return the remaining keys (array flow)', () => {
      const uniqueFields = ['users.name'];
      const startingData = {
        users: [
          { id: 12345678, name: 'Jane Doe', email: 'janedoe@gmail.com' },
          { id: 87654321, name: 'John Doe', email: 'johndoe@gmail.com' },
        ],
      };
      const expectedData = {
        users: [
          { id: 12345678, email: 'janedoe@gmail.com' },
          { id: 87654321, email: 'johndoe@gmail.com' },
        ],
      };
      expect(cleanDuplicatedData(uniqueFields, startingData)).toEqual(expectedData);
    });
  });
  describe('downloadFile', () => {
    beforeAll(() => {
      customMock(window.URL, 'createObjectURL', 'blob:mock-url');
      (window.URL as any).createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      customMock(document, 'createElement', {
        href: 'blob:mock-url',
        setAttribute: jest.fn(),
        click: jest.fn(),
      });
    });
    beforeEach(() => {
      Object.defineProperty(document, 'body', {
        value: {
          appendChild: jest.fn(),
          removeChild: jest.fn(),
          insertBefore: jest.fn(),
          children: [],
          childNodes: [],
        },
        writable: true,
      });
    });
    afterEach(() => jest.clearAllMocks());
    afterAll(() => mockedAxios.mockRestore());

    it('should return empty url (catch)', async () => {
      expect(await downloadFile('codelists', 'folder', 'http://localhost:8080')).toEqual({
        url: '',
        error: expect.any(Error),
      });
    });
    it('should POST with data present', async () => {
      const mockResponse = {
        data: new Blob(['mock zip content'], { type: 'application/zip' }),
        headers: {
          'content-type': 'application/zip',
          'content-disposition': 'attachment; filename="report.txt"',
        },
      };
      mockedAxios.mockResolvedValueOnce(mockResponse);
      const result = await downloadFile('export-zip', 'report', 'localhost:8080', { status: 200 });
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'POST',
        responseType: 'blob',
        url: 'localhost:8080/export-zip',
        data: { status: 200 },
        validateStatus: expect.any(Function),
      });
      expect(result).toEqual({ url: 'blob:mock-url' });
    });
    it('should download a ZIP with GET', async () => {
      const mockResponse = {
        data: new Blob(['mock zip content'], { type: 'application/zip' }),
        headers: {
          'content-type': 'application/zip',
          'content-disposition': 'attachment; filename=report.zip',
        },
      };
      mockedAxios.mockResolvedValueOnce(mockResponse);
      const result = await downloadFile('export-zip', 'report', 'localhost:8080');
      expect(mockedAxios).toHaveBeenCalledWith({
        data: {},
        method: 'GET',
        responseType: 'blob',
        url: 'localhost:8080/export-zip',
        validateStatus: expect.any(Function),
      });
      expect(result).toEqual({ url: 'blob:mock-url' });
    });
    it('should download a PDF with GET', async () => {
      const mockResponse = {
        data: new Blob(['mock pdf content'], { type: 'application/pdf' }),
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="report.pdf"',
        },
      };
      mockedAxios.mockResolvedValueOnce(mockResponse);
      const result = await downloadFile('export-pdf', 'report', 'localhost:8080');
      expect(mockedAxios).toHaveBeenCalledWith({
        data: {},
        method: 'GET',
        responseType: 'blob',
        url: 'localhost:8080/export-pdf',
        validateStatus: expect.any(Function),
      });
      expect(result).toEqual({ url: 'blob:mock-url' });
    });
    it('should handle UTF-8 filename in Content-Disposition', async () => {
      const mockResponse = {
        data: new Blob(['mock pdf content'], { type: 'application/pdf' }),
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': "attachment; filename*=UTF-8''monthly%20report%202026.pdf",
        },
      };
      mockedAxios.mockResolvedValueOnce(mockResponse);
      const result = await downloadFile('export-pdf', 'report', 'localhost:8080');
      expect(mockedAxios).toHaveBeenCalledWith({
        data: {},
        method: 'GET',
        responseType: 'blob',
        url: 'localhost:8080/export-pdf',
        validateStatus: expect.any(Function),
      });
      expect(result).toEqual({ url: 'blob:mock-url' });
    });
    it('should use fileHandle when provided', async () => {
      const mockFileHandle = {
        createWritable: jest.fn().mockResolvedValue({
          write: jest.fn(),
          close: jest.fn(),
        }),
      };

      const mockResponse = {
        status: 200,
        data: new Blob(['file content']),
      };

      mockedAxios.mockResolvedValue(mockResponse);

      const result = await downloadFile(
        'export-pdf',
        'report',
        'localhost:8080',
        {},
        mockFileHandle,
      );

      expect(mockFileHandle.createWritable).toHaveBeenCalled();
      expect(result).toEqual({ url: '' });
    });
  });
  describe('saveFileWithFileHandle', () => {
    let mockFileHandle;
    let mockWritable;
    let mockBlob;

    beforeEach(() => {
      mockWritable = {
        write: jest.fn(),
        close: jest.fn(),
      };

      mockFileHandle = {
        createWritable: jest.fn().mockResolvedValue(mockWritable),
      };

      mockBlob = new Blob(['test content'], { type: 'text/plain' });
    });

    it('should successfully save file and return empty url', async () => {
      const result = await saveFileWithFileHandle(mockBlob, mockFileHandle);

      expect(mockFileHandle.createWritable).toHaveBeenCalledTimes(1);
      expect(mockWritable.write).toHaveBeenCalledWith(mockBlob);
      expect(mockWritable.close).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ url: '' });
    });

    it('should handle createWritable error', async () => {
      const error = new Error('Failed to create writable');
      mockFileHandle.createWritable.mockRejectedValue(error);

      const result = await saveFileWithFileHandle(mockBlob, mockFileHandle);

      expect(result).toEqual({ error });
    });
    it('should handle write error', async () => {
      const error = new Error('Failed to write');
      mockWritable.write.mockRejectedValue(error);

      const result = await saveFileWithFileHandle(mockBlob, mockFileHandle);
      expect(result).toEqual({ error });
    });

    it('should handle close error', async () => {
      const error = new Error('Failed to close');
      mockWritable.close.mockRejectedValue(error);

      const result = await saveFileWithFileHandle(mockBlob, mockFileHandle);

      expect(result).toEqual({ error });
    });
  });
  describe('getArrayItemData', () => {
    it('should return the value of the formData object', () => {
      expect(
        getArrayItemData({
          children: {
            props: { formData: 'TestFormData' },
          },
        }),
      ).toEqual('TestFormData');
    });
    it('should return an empty object when formData is falsy', () => {
      expect(getArrayItemData(undefined)).toEqual({});
    });
  });
  describe('getArrayItemSchema', () => {
    it('should return the value of the schema object', () => {
      expect(
        getArrayItemSchema({
          children: {
            props: { schema: 'TestSchema' },
          },
        }),
      ).toEqual('TestSchema');
    });
    it('should return an empty object when schema is falsy', () => {
      expect(getArrayItemSchema(undefined)).toEqual({});
    });
  });
});
