import { getButtonKey, isVisible, getButtonFinalId } from './utils';
import { mockDataResolverShouldBeApplied } from '@_jestHelpers/dataResolverMock';

describe('getButtonKey', () => {
  describe('KeysList with priority order', () => {
    it('should return id when it exists and is truthy', () => {
      const source = { id: '123' };
      const result = getButtonKey(source);
      expect(result).toBe('123');
    });

    it('should skip falsy id and return code instead', () => {
      const source = { id: '', code: '123' };
      const result = getButtonKey(source);
      expect(result).toBe('123');
    });

    it('should return notificationId when id and code are missing', () => {
      const source = { notificationId: 'notif-123' };
      const result = getButtonKey(source);
      expect(result).toBe('notif-123');
    });

    it('should return attachmentId when previous keys are missing', () => {
      const source = { attachmentId: 'attach-123' };
      const result = getButtonKey(source);
      expect(result).toBe('attach-123');
    });

    it('should return candidateId when all previous keys are missing', () => {
      const source = { candidateId: 'candidate-123' };
      const result = getButtonKey(source);
      expect(result).toBe('candidate-123');
    });

    it('should respect priority: id > code > notificationId > attachmentId > candidateId', () => {
      const source = {
        candidateId: 'cand-last',
        attachmentId: 'attach-4th',
        notificationId: 'notif-3rd',
        code: 'code-2nd',
        id: 'id-first',
      };
      const result = getButtonKey(source);
      expect(result).toBe('id-first');
    });
  });

  it('should return ftId concatenation with liabilityId', () => {
    const source = {
      id: '',
      code: '',
      ftId: 'ft-123',
      liabilityId: 'liability-123',
    };
    const result = getButtonKey(source);
    expect(result).toBe('ft-123___liability-123');
  });

  it('should handle ftId without liabilityId', () => {
    const source = {
      ftId: 'ft-solo',
    };
    const result = getButtonKey(source);
    expect(result).toBe('ft-solo___undefined');
  });

  it('should prioritize keysList over ftId if keysList value exists', () => {
    const source = {
      code: 'CODE-PRIORITY',
      ftId: 'ft-ignored',
      liabilityId: 'liability-ignored',
    };
    const result = getButtonKey(source);
    expect(result).toBe('CODE-PRIORITY');
  });

  it('should return exceptionCalendar concatenation when previous conditions not met', () => {
    const source = {
      exceptionCalendar: { code: 'exc-123' },
      resourceCalendar: { code: 'res-456' },
    };
    const result = getButtonKey(source);
    expect(result).toBe('exc-123___res-456');
  });

  it('should handle exceptionCalendar without resourceCalendar', () => {
    const source = {
      exceptionCalendar: { code: 'exc-only' },
    };
    const result = getButtonKey(source);
    expect(result).toBe('exc-only___undefined');
  });

  it('should prioritize ftId over exceptionCalendar', () => {
    const source = {
      ftId: 'ft-first',
      liabilityId: 'liability-first',
      exceptionCalendar: { code: 'exc-ignored' },
      resourceCalendar: { code: 'res-ignored' },
    };
    const result = getButtonKey(source);
    expect(result).toBe('ft-first___liability-first');
  });

  it('should reach exceptionCalendar when ftId is falsy', () => {
    const source = {
      ftId: '',
      exceptionCalendar: { code: 'exc-fallback' },
      resourceCalendar: { code: 'res-fallback' },
    };
    const result = getButtonKey(source);
    expect(result).toBe('exc-fallback___res-fallback');
  });

  it('should prioritize keysList over exceptionCalendar', () => {
    const source = {
      candidateId: 'cand-priority',
      exceptionCalendar: { code: 'exc-ignored' },
    };
    const result = getButtonKey(source);
    expect(result).toBe('cand-priority');
  });

  it('should return user concatenation when previous conditions not met', () => {
    const source = {
      user: { id: 'user-123' },
      calendarCd: 'cal-456',
    };
    const result = getButtonKey(source);
    expect(result).toBe('user-123___cal-456');
  });

  it('should handle user without calendarCd', () => {
    const source = {
      user: { id: 'user-solo' },
    };
    const result = getButtonKey(source);
    expect(result).toBe('user-solo___undefined');
  });

  it('should prioritize exceptionCalendar over user', () => {
    const source = {
      exceptionCalendar: { code: 'exc-first' },
      resourceCalendar: { code: 'res-first' },
      user: { id: 'user-ignored' },
      calendarCd: 'cal-ignored',
    };
    const result = getButtonKey(source);
    expect(result).toBe('exc-first___res-first');
  });

  it('should handle when there is no code inside exceptionCalendar and resourceCalendar', () => {
    const source = {
      exceptionCalendar: {}, // Missing code property
    };
    const result = getButtonKey(source);
    expect(result).toBe('undefined___undefined');
  });

  it('should handle user without id property', () => {
    const source = {
      user: {}, // Missing id property
      calendarCd: 'cal-123',
    };
    const result = getButtonKey(source);
    expect(result).toBe('undefined___cal-123');
  });
  it('should return index when source key is null', () => {
    const source = {
      billSegment: {
        id: 'd48114ab-fff5-4789-845b-7c8671a66658',
        identificationLabel:
          'Failure to File Penalty (Manual), Euro, Amount: 8,00€, Effective Date: 2025-03-13, Frozen',
      },
      originalLiabilityAmount: 8,
      __INDEX__: 2,
    };
    const result = getButtonKey(source);
    expect(result).toBe(2);
  });
  it('should handle user calendar object', () => {
    const source = {
      user: { id: 'user-admin-01' },
      calendarCd: 'CAL-EXECUTIVE',
    };
    const result = getButtonKey(source);
    expect(result).toBe('user-admin-01___CAL-EXECUTIVE');
  });
});

describe('isVisible', () => {
  it('should return true if at least one action is visible', () => {
    mockDataResolverShouldBeApplied([true, false, false]);
    const actions = [{ title: 'a' }, { title: 'b' }, { type: 'c' }];
    const id = 'test';
    const extraData = {
      user: { id: 'userId' },
      state: {},
      routeParams: { id: '123' },
      routerData: {},
    };
    // @ts-ignore
    const result = isVisible(actions, id, extraData);
    expect(result).toEqual(true);
  });

  it('should return false if at all actions are not visible', () => {
    mockDataResolverShouldBeApplied([false, false, false]);
    const actions = [{ title: 'a' }, { title: 'b' }, { type: 'c' }];
    const id = 'test';
    const extraData = {
      user: { id: 'userId' },
      state: {},
      routeParams: { id: '123' },
      routerData: {},
    };
    // @ts-ignore
    const result = isVisible(actions, id, extraData);
    expect(result).toEqual(false);
  });

  it('should return false if no actions parameter is provided', () => {
    mockDataResolverShouldBeApplied([false, false, false]);
    const actions = undefined;
    const id = 'test';
    const extraData = {
      user: 'userId',
      state: {},
      routeParams: { id: '123' },
      routerData: {},
    };

    const result = isVisible(actions, id, extraData);
    expect(result).toEqual(false);
  });
});

describe('getButtonFinalId', () => {
  it('should return resourceId if it exists and there is no source', () => {
    const apiDataId = 'apiDataId';
    const widgetId = 'widgetId';
    const title = 'title';
    const resourceId = 'resourceId';
    const source = null;

    const result = getButtonFinalId(apiDataId, widgetId, title, resourceId, source);
    expect(result).toEqual(resourceId);
  });

  it('should return extraId if there is source', () => {
    const apiDataId = 'apiDataId';
    const widgetId = 'widgetId';
    const title = 'title';
    const resourceId = 'resourceId';
    const source = { id: 'extraId' };

    const result = getButtonFinalId(apiDataId, widgetId, title, resourceId, source);
    expect(result).toEqual(`${apiDataId}_${widgetId}_${title}_${'extraId'}`);
  });
});
