import { mockFormDataHook } from '@_jestHelpers/useFormDataMock';
import useFieldApplicability from '@pkg-form/hooks/useFieldApplicability';

describe('useFieldApplicability', () => {
  const filterFrom = {
    attribute: 'attr',
    codelist: '',
    source: {
      code: 'entity-code',
      jsonPath: ['some', 'path'],
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return applicable false if value is empty string', () => {
    mockFormDataHook('');

    const { applicable } = useFieldApplicability('fieldId', filterFrom);
    expect(applicable).toEqual(false);
  });

  it('should return applicable false if value is empty array', () => {
    mockFormDataHook([]);

    const { applicable } = useFieldApplicability('fieldId', filterFrom);
    expect(applicable).toEqual(false);
  });

  it('should return applicable false if value is undefined', () => {
    mockFormDataHook(undefined);

    const { applicable } = useFieldApplicability('fieldId', filterFrom);
    expect(applicable).toEqual(false);
  });

  it('should return applicable false if value is null', () => {
    mockFormDataHook(null);

    const { applicable } = useFieldApplicability('fieldId', filterFrom);
    expect(applicable).toEqual(false);
  });

  it('should return applicable true if value is number 0', () => {
    mockFormDataHook(0);

    const { applicable } = useFieldApplicability('fieldId', filterFrom);
    expect(applicable).toEqual(true);
  });

  it('should return applicable true if value is number 29', () => {
    mockFormDataHook(29);

    const { applicable } = useFieldApplicability('fieldId', filterFrom);
    expect(applicable).toEqual(true);
  });

  it('should return applicable true if value is text "abc"', () => {
    mockFormDataHook('abc');

    const { applicable } = useFieldApplicability('fieldId', filterFrom);
    expect(applicable).toEqual(true);
  });

  it('should return applicable true if value is array [1, 2, 3]', () => {
    mockFormDataHook([1, 2, 3]);

    const { applicable } = useFieldApplicability('fieldId', filterFrom);
    expect(applicable).toEqual(true);
  });

  it('should return applicable true if value is object {}', () => {
    mockFormDataHook({});

    const { applicable } = useFieldApplicability('fieldId', filterFrom);
    expect(applicable).toEqual(true);
  });

  it('should return applicable true if no filterForm is defined', () => {
    mockFormDataHook({});

    const { applicable } = useFieldApplicability('fieldId', undefined);
    expect(applicable).toEqual(true);
  });

  it('should return applicable true if no source is defined', () => {
    mockFormDataHook({});

    const { applicable } = useFieldApplicability('fieldId', null);
    expect(applicable).toEqual(true);
  });
});
