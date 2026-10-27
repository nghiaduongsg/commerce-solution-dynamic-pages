import { AnyType } from '@pkg-common/types';
import { shouldBeApplied } from '@pkg-common/dataResolver/utils';
import { ButtonKeySource } from './types';

export const isVisible = (
  actions: AnyType,
  id: string,
  extraData: { user: string; state: AnyType; routeParams: AnyType; routerData: AnyType },
) => {
  return (actions || [])
    .map((action) => shouldBeApplied(action?.visibilityFrom, id, extraData, action?.source))
    .some((action) => action);
};

const keysList: Array<keyof ButtonKeySource> = [
  'id',
  'code',
  'notificationId',
  'attachmentId',
  'candidateId',
]; // add more if needed...

export const getButtonKey = (source: ButtonKeySource | null | undefined) => {
  for (const key of keysList) {
    if (source?.[key]) {
      return source[key];
    }
  }

  // TODO: We should handle final return with something other than a new date stamp
  // and we should add checks for all necessery fields that we are using
  // e.g checking for source.ftId but not liailityId
  // could return ftId___undefined
  if (source?.ftId) {
    return `${source.ftId}___${source?.liabilityId}`;
  } else if (source?.exceptionCalendar) {
    return `${source.exceptionCalendar?.code}___${source?.resourceCalendar?.code}`;
  } else if (source?.user) {
    return `${source.user?.id}___${source?.calendarCd}`;
  }

  return source?.__INDEX__;
};
export const getButtonFinalId = (
  apiDataId: string,
  widgetId: string,
  title: string = '',
  resourceId?: string,
  source?: AnyType,
) => {
  const extraId = source ? getButtonKey(source) : '';

  return resourceId && !source ? resourceId : `${apiDataId}_${widgetId}_${title}_${extraId}`;
};
