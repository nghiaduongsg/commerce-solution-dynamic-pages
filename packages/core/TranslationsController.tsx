import React, { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LoadingBackdrop from '@pkg-common/components/LoadingBackdrop/LoadingBackdrop';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useLocation, useParams } from 'react-router';
import { ACCESSIBILITY, VALIDATIONS } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useMenu } from '@pkg-setup/index';
import useUserSettings from '@pkg-setup/src/userSettings/useUserSettings';
import { AnyType } from '@pkg-common/types';
import usePartyRole from '@pkg-setup/src/partyRole/usePartyRole';
import useUser from '@pkg-setup/src/partyRole/usePartyRole';
import usePageAnnounce from '@pkg-layout/src/common/hooks/usePageAnnounce';

const getTitleKey = (pageId: string, pathname: string, idKey?: string) => {
  if (pathname.includes('/accessibility')) {
    return 'accessibility';
  } else if (pathname.includes('/compare')) {
    return 'FormDefinition_compare_list';
  } else if (pathname.includes('compare')) {
    return 'FormDefinition_compare';
  } else if (pathname.includes('/versions')) {
    return 'FormDefinition_versions_list';
  } else if (idKey) {
    return `${pageId}_edit`;
  } else if (pathname.includes('/list')) {
    return `${pageId}_list`;
  } else {
    return `${pageId}_add`;
  }
};

const TranslationsController = ({
  pageId = '',
  children,
  namespace,
  filterNamespace = '',
  codelists = {},
  onLoading,
}: {
  pageId?: string;
  namespace: string;
  filterNamespace?: string;
  children?: ReactElement | Array<ReactElement | null>;
  codelists?: AnyType;
  onLoading?: ReactElement;
}) => {
  const htmlElement = useRef<HTMLElement | null>(null);
  const { loadMainMenu } = useMenu();
  // This is the language selected on the fly by the user
  const { selectedLanguage, application, update } = useSystem();

  // This is the language saved within user preferences.
  const { language, changeLanguage } = useUserSettings();

  const { partyRoleId } = useUser();
  const { fetchPartyRoleDetails } = usePartyRole();

  const hasRequiredResourceBundles = useCallback(() => {
    return (
      i18n.hasResourceBundle(selectedLanguage, namespace) &&
      (!filterNamespace ||
        namespace === filterNamespace ||
        i18n.hasResourceBundle(selectedLanguage, filterNamespace))
    );
  }, [i18n, selectedLanguage, namespace, filterNamespace]);

  const [translationsLoaded, setTranslationsLoaded] = useState(() => hasRequiredResourceBundles());
  const { t: translate } = useTranslation([ACCESSIBILITY, VALIDATIONS, namespace, filterNamespace]);
  const routeParams = useParams();
  const location = useLocation();
  const idKey = useMemo(() => {
    return routeParams?.idKey;
  }, [routeParams]);

  const intervalRef = useRef<AnyType>(null);

  useEffect(() => {
    htmlElement.current = document.getElementById(`root_${application?.toLowerCase()}`);
  }, [application]);

  useEffect(() => {
    if (
      selectedLanguage &&
      language &&
      selectedLanguage !== language &&
      translationsLoaded &&
      pageId
    ) {
      i18n.services.resourceStore.data[selectedLanguage] = {};
      i18n.language = selectedLanguage;
      i18n.changeLanguage(selectedLanguage);
      htmlElement?.current?.setAttribute('lang', selectedLanguage.toLowerCase());

      loadMainMenu();

      if (partyRoleId && application === 'ISS') {
        fetchPartyRoleDetails();
      }

      changeLanguage(selectedLanguage);
      if (codelists?.lists?.length) {
        update({
          codelists,
        });
      }

      setTranslationsLoaded(false);
    }
  }, [selectedLanguage, language, translationsLoaded, pageId, partyRoleId, fetchPartyRoleDetails]);

  useEffect(() => {
    if (hasRequiredResourceBundles() && !pageId) {
      setTranslationsLoaded(false);
    }
  }, [pageId, namespace, filterNamespace, selectedLanguage]);

  useEffect(() => {
    if (!translationsLoaded) {
      intervalRef.current = setInterval(() => {
        if (hasRequiredResourceBundles()) {
          setTranslationsLoaded(true);

          clearInterval(intervalRef.current);
        }
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedLanguage, namespace, filterNamespace, translationsLoaded]);

  const translatedTitle = useMemo(() => {
    if (!pageId || !translationsLoaded) return '';
    const translationKey = getTitleKey(pageId, location?.pathname, idKey);
    return (
      translate(translationKey, {
        ns: ACCESSIBILITY,
        lng: selectedLanguage,
        code: idKey,
      }) || 'Revenue Management'
    ).replace(/"/g, '');
  }, [pageId, idKey, selectedLanguage, translationsLoaded, translate, location.pathname]);

  usePageAnnounce(translatedTitle);

  if (!translationsLoaded && !onLoading) {
    return <LoadingBackdrop open />;
  }
  if (!translationsLoaded && onLoading) {
    return onLoading;
  }
  return children;
};

export default TranslationsController;
