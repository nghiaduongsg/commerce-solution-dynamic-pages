import { hasValue } from '@pkg-common/utils';
import md5 from 'md5';

export const setCookie = (cname: string, cvalue: string, exdays = 0) => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = exdays ? `expires=${d.toUTCString()};` : '';
  document.cookie = `${cname}=${cvalue};${expires}path=/`;
};

export const getCookie = (cname: string) => {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

export const getFilterCookieName = (tableId: string, user: string) => {
  const encryptedUser = md5(user || {});
  return `${tableId}_filters_${encryptedUser}`;
};

export const getFilterCookies = (user: string, tableId: string) => {
  const cookie = getFilterCookieName(tableId, user);
  const savedFilter = getCookie(cookie);
  if (!savedFilter) {
    return {};
  }

  try {
    return JSON.parse(savedFilter) || {};
  } catch (error) {
    console.error('Error parsing saved filter:', error);
    return {};
  }
};

export const saveFilterCookies = (user, criteria, tableId: string) => {
  const cookie = getFilterCookieName(tableId, user);
  if (hasValue(criteria)) {
    setCookie(cookie, JSON.stringify(criteria), 365);
  } else {
    setCookie(cookie, '', -1);
  }
};

export const clearFilterCookies = (user: string, tableId: string) => {
  const cookie = getFilterCookieName(tableId, user);
  setCookie(cookie, '', -1);
};

export const checkForCodelistInCookies = (
  user: string = '',
  fieldName: string,
  tableId: string,
) => {
  if (!user) {
    return false;
  }
  const savedFilter = getFilterCookies(user, tableId);

  if (!hasValue(savedFilter)) {
    return false;
  }

  return !!savedFilter[fieldName];
};
