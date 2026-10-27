import { selectSaveFileLocation } from './exportUtils';

const mockShowSaveFilePicker = jest.fn();

Object.defineProperty(window, 'showSaveFilePicker', {
  value: mockShowSaveFilePicker,
  writable: true,
  configurable: true,
});

describe('selectSaveFileLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return file handle for csv file type', async () => {
    const mockHandle = { name: 'export.csv' };
    mockShowSaveFilePicker.mockResolvedValueOnce(mockHandle);

    const result = await selectSaveFileLocation('csv');

    expect(mockShowSaveFilePicker).toHaveBeenCalledWith({
      suggestedName: 'export.csv',
      types: [
        {
          description: 'csv Files',
          accept: { 'text/csv': ['.csv'] },
        },
      ],
    });
    expect(result).toBe(mockHandle);
  });

  it('should return file handle for xlsx file type', async () => {
    const mockHandle = { name: 'export.xlsx' };
    mockShowSaveFilePicker.mockResolvedValueOnce(mockHandle);

    const result = await selectSaveFileLocation('xlsx');

    expect(mockShowSaveFilePicker).toHaveBeenCalledWith({
      suggestedName: 'export.xlsx',
      types: [
        {
          description: 'xlsx Files',
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          },
        },
      ],
    });
    expect(result).toBe(mockHandle);
  });

  it('should return null when showSaveFilePicker is not supported', async () => {
    const originalShowSaveFilePicker = window.showSaveFilePicker;
    delete (window as any).showSaveFilePicker;

    const result = await selectSaveFileLocation('csv');

    expect(result).toBeNull();
    expect(mockShowSaveFilePicker).not.toHaveBeenCalled();

    if (originalShowSaveFilePicker) {
      window.showSaveFilePicker = originalShowSaveFilePicker;
    }
  });

  it('should return exportDuplicatedFailed error when file creation fails', async () => {
    const abortError = new DOMException('Failed to create or truncate file', 'AbortError');
    mockShowSaveFilePicker.mockRejectedValueOnce(abortError);

    const result = await selectSaveFileLocation('csv');

    expect(mockShowSaveFilePicker).toHaveBeenCalled();
    expect(result).toEqual({
      error: { message: 'exportDuplicatedFailed' },
    });
  });

  it('should return error with message when user cancels', async () => {
    const abortError = new DOMException('The user aborted a request.', 'AbortError');
    mockShowSaveFilePicker.mockRejectedValueOnce(abortError);

    const result = await selectSaveFileLocation('csv');

    expect(mockShowSaveFilePicker).toHaveBeenCalled();
    expect(result).toMatchObject({
      error: {
        message: abortError.message,
      },
    });
  });

  it('should throw error when showSaveFilePicker fails with non-AbortError', async () => {
    const mockError = new Error('Permission denied');
    mockShowSaveFilePicker.mockRejectedValueOnce(mockError);

    await expect(selectSaveFileLocation('csv')).rejects.toThrow('Permission denied');
    expect(mockShowSaveFilePicker).toHaveBeenCalled();
  });

  it('should handle different file handle objects', async () => {
    const mockHandle = {
      name: 'my-custom-export.csv',
      kind: 'file',
      createWritable: jest.fn(),
    };
    mockShowSaveFilePicker.mockResolvedValueOnce(mockHandle);

    const result = await selectSaveFileLocation('csv');

    expect(result).toEqual(mockHandle);
  });
});
