import { mockTranslationBundleHook } from '@_jestHelpers/useTranslationBundleHookMock';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import { FormContextSchema } from '@pkg-form/types';
import { mockSystemHook } from '@_jestHelpers/useSystemMock';
import { mockCheckFromHook } from '@_jestHelpers/useCheckFromMock';

describe('useWidgetUtils', () => {
  const formContext = {} as FormContextSchema;
  mockSystemHook();
  mockCheckFromHook(true);

  const { translateStub } = mockTranslationBundleHook();

  beforeEach(() => {
    jest.resetAllMocks();
    translateStub.mockClear();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('Read Only Label', () => {
    it('Translation key exists', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
      };

      const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);
      expect(readOnlyLabel).toBe('key');
    });
    it('Translation key is missing, Schema title exists', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          namespace: 'common2',
        },
      };

      const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);
      expect(readOnlyLabel).toBe('Title');
    });
    it('Translation Key is missing, Schema title is missing', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = {};
      const options = {
        translation: {
          namespace: 'common2',
        },
      };

      const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);
      expect(readOnlyLabel).toBe('');
    });
    it('Translation Key is missing, Schema is missing', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      let schema;
      const options = {
        translation: {
          namespace: 'common2',
        },
      };

      const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);
      expect(readOnlyLabel).toBe('');
    });
    it('Translation is missing', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {};

      const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);
      expect(readOnlyLabel).toBe('Title');
    });
  });

  describe('label', () => {
    it('omitValidationHints is true', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        omitValidationHints: true,
      };

      const { label } = useWidgetUtils(schema, options, formContext);
      expect(label).toBe('key');
    });
    it('omitValidationHints is false, validations required is true', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {
          required: true,
        },
        omitValidationHints: false,
      };

      const { label } = useWidgetUtils(schema, options, formContext);
      expect(label).toBe('key');
    });
    it('omitValidationHints is false, validations required is false', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {
          required: false,
        },
        omitValidationHints: false,
      };

      const { label } = useWidgetUtils(schema, options, formContext);
      expect(label).toBe('key');
    });
    it('omitValidationHints is false, validations required is missing', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {},
        omitValidationHints: false,
      };

      const { label } = useWidgetUtils(schema, options, formContext);
      expect(label).toBe('key');
    });
    it('omitValidationHints is false, validations is missing', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        omitValidationHints: false,
      };

      const { label } = useWidgetUtils(schema, options, formContext);
      expect(label).toBe('key');
    });
    it('omitValidationHints is missing, validations required is true', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {
          required: true,
        },
      };

      const { label } = useWidgetUtils(schema, options, formContext);
      expect(label).toBe('key');
    });
    it('omitValidationHints is missing, validations required is false', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {
          required: false,
        },
      };

      const { label } = useWidgetUtils(schema, options, formContext);
      expect(label).toBe('key');
    });
    it('omitValidationHints is missing, validations required is missing', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {},
      };

      const { label } = useWidgetUtils(schema, options, formContext);
      expect(label).toBe('key');
    });
    it('omitValidationHints is missing, validations is missing', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
      };

      const { label } = useWidgetUtils(schema, options, formContext);
      expect(label).toBe('key');
    });
  });

  describe('labelUppercase', () => {
    it('omitValidationHints is true', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        omitValidationHints: true,
      };

      const { labelUppercase } = useWidgetUtils(schema, options, formContext);
      expect(labelUppercase).toBe('KEY');
    });
    it('omitValidationHints is false, validations required is true', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {
          required: true,
        },
        omitValidationHints: false,
      };

      const { labelUppercase } = useWidgetUtils(schema, options, formContext);
      expect(labelUppercase).toBe('KEY');
    });
    it('omitValidationHints is false, validations required is false', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {
          required: false,
        },
        omitValidationHints: false,
      };

      const { labelUppercase } = useWidgetUtils(schema, options, formContext);
      expect(labelUppercase).toBe('KEY');
    });
    it('omitValidationHints is false, validations required is missing', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {},
        omitValidationHints: false,
      };

      const { labelUppercase } = useWidgetUtils(schema, options, formContext);
      expect(labelUppercase).toBe('KEY');
    });
    it('omitValidationHints is false, validations is missing', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        omitValidationHints: false,
      };

      const { labelUppercase } = useWidgetUtils(schema, options, formContext);
      expect(labelUppercase).toBe('KEY');
    });
    it('omitValidationHints is missing, validations required is true', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {
          required: true,
        },
      };

      const { labelUppercase } = useWidgetUtils(schema, options, formContext);
      expect(labelUppercase).toBe('KEY');
    });
    it('omitValidationHints is missing, validations required is false', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {
          required: false,
        },
      };

      const { labelUppercase } = useWidgetUtils(schema, options, formContext);
      expect(labelUppercase).toBe('KEY');
    });
    it('omitValidationHints is missing, validations required is missing', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
        validations: {},
      };

      const { labelUppercase } = useWidgetUtils(schema, options, formContext);
      expect(labelUppercase).toBe('KEY');
    });
    it('omitValidationHints is missing, validations is missing', () => {
      mockSystemHook();
      mockCheckFromHook(true);
      mockTranslationBundleHook();

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
      };

      const { labelUppercase } = useWidgetUtils(schema, options, formContext);
      expect(labelUppercase).toBe('KEY');
    });
  });

  describe('helpTextLabel', () => {
    it('Translation helpText existed', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
          helpText: 'Help Hint Text',
        },
      };

      const { helpText } = useWidgetUtils(schema, options, formContext);
      expect(helpText).toBe('Help Hint Text');
    });
    it('Translation helpText is missing', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {
        translation: {
          key: 'key',
          namespace: 'common2',
        },
      };

      const { helpText } = useWidgetUtils(schema, options, formContext);
      expect(helpText).toBe('');
    });
  });

  describe('omitValidationHints', () => {
    it('true if formContext has omitValidationHints = true', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = {};

      const { omitValidationHints } = useWidgetUtils(schema, options, {
        avoidDefaultLoad: false,
        formId: 'TEST',
        idKey: '',
        namespace: 'common',
        omitValidationHints: true,
      });
      expect(omitValidationHints).toBe(true);
    });

    it('true if options has omitValidationHints = true', () => {
      mockTranslationBundleHook();
      mockSystemHook();
      mockCheckFromHook(true);

      const schema = { title: 'Title' };
      const options = { omitValidationHints: true };

      const { omitValidationHints } = useWidgetUtils(schema, options, {
        avoidDefaultLoad: false,
        formId: 'TEST',
        idKey: '',
        namespace: 'common',
        omitValidationHints: false,
      });
      expect(omitValidationHints).toBe(true);
    });
  });
});
