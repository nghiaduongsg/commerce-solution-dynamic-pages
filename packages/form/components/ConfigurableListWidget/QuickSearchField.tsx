import React, { useState, useCallback, useMemo } from 'react';
import { SEARCH_FORM } from '@pkg-constants/screenTypeIds';
import { AnyType } from '@pkg-common/types';
import SchemasController from '@pkg-core/schemas/SchemasController';
import { hasValue } from '@pkg-common/utils/utils';
import useSystem from '@pkg-setup/src/system/useSystem';
import axios from 'axios';
import { InputBase } from '@mui/material';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';

type QuickSearchTextProps = {
  parentId: string;
  testId: string;
  url: string;
  onPasteComplete: (data: any) => void;
  onPasteError: (error: string) => void;
  onPasteInitiated: (loading: boolean) => void;
  configuration?: AnyType;
  searchIdParam?: string;
};
const QuickSearchField = ({
  parentId = '',
  onPasteComplete,
  onPasteError,
  onPasteInitiated,
  entitySourceId,
  configuration,
  dataTestId,
  searchIdParam,
}) => {
  const [schemas, setSchemas] = useState<AnyType>(null);

  const setAllSchemas = useCallback((schemas) => {
    setSchemas(schemas);
  }, []);

  const apiUrl = useMemo(() => {
    const c = configuration ?? schemas?.configuration ?? {};
    return c?.url || c?.apiValues?.url;
  }, [configuration, schemas?.configuration]);

  if (hasValue(configuration)) {
    return (
      <QuickSearchText
        parentId={parentId}
        testId={`${dataTestId}-quick-search-text`}
        url={apiUrl}
        onPasteComplete={onPasteComplete}
        onPasteError={onPasteError}
        onPasteInitiated={onPasteInitiated}
        searchIdParam={searchIdParam}
      />
    );
  }

  return (
    <SchemasController
      pageId={entitySourceId}
      screenType={SEARCH_FORM}
      onSchemasReady={setAllSchemas}
    >
      <QuickSearchText
        parentId={parentId}
        testId={`${dataTestId}-quick-search-text`}
        url={apiUrl}
        onPasteComplete={onPasteComplete}
        onPasteError={onPasteError}
        onPasteInitiated={onPasteInitiated}
        searchIdParam={searchIdParam}
      />
    </SchemasController>
  );
};
export default QuickSearchField;

const QuickSearchText: React.FC<QuickSearchTextProps> = ({
  parentId,
  testId,
  url,
  onPasteComplete,
  onPasteError,
  onPasteInitiated,
  searchIdParam,
}) => {
  const { apiUrl, selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  const [_, setPastedId] = useState<string | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleEnter = (value: string) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      onPasteId(value);
    }, 300);
    setTypingTimeout(timeout);
  };
  const onPasteId = (pastedId: string) => {
    if (!pastedId) {
      return;
    }

    onPasteInitiated(true);
    setPastedId(pastedId);

    const endpoint = `${apiUrl}/${url}`;
    const isQueryUrl = url?.includes('queries');

    let request;

    if (isQueryUrl && searchIdParam) {
      // 1) queries + searchIdParam → POST
      request = axios.post(endpoint, {
        [searchIdParam]: pastedId,
      });
    } else if (!isQueryUrl && searchIdParam) {
      // 2) no queries + searchIdParam → GET with query param
      request = axios.get(endpoint, {
        params: { [searchIdParam]: pastedId },
      });
    } else {
      // 3) no searchIdParam at all or queries → GET /{id}
      request = axios.get(`${endpoint}/${pastedId}`);
    }

    return request
      .then((response) => {
        let data = response?.data;

        // Case 1: content array (queries POST or GET with pagination)
        if (Array.isArray(data?.content)) {
          if (data.content.length > 0) {
            onPasteComplete(data.content[0]);
          } else {
            onPasteError(
              translate('noEntityFoundForGivenId', {
                ns: COMMON,
                lng: selectedLanguage,
              }),
            );
          }
          return;
        }

        // Case 2: simple object (GET by id)
        if (!data) {
          onPasteError(
            translate('noEntityFoundForGivenId', {
              ns: COMMON,
              lng: selectedLanguage,
            }),
          );
          return;
        }

        // Success: return simple object
        onPasteComplete(data);
      })
      .catch((e) => {
        console.log(e);
        onPasteError(
          e?.message ??
            translate('noEntityFoundForGivenId', {
              ns: COMMON,
              lng: selectedLanguage,
            }),
        );
      });
  };

  return (
    <InputBase
      id={`${parentId}-description-input`}
      fullWidth
      placeholder={translate('clickToChooseOrPaste', {
        ns: COMMON,
        lng: selectedLanguage,
      })}
      disabled={false}
      slotProps={{
        input: {
          'data-testid': testId,
          'aria-label': 'ss',
          'aria-required': false,
          'aria-disabled': false,
          onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
            const currentValue = (e.target as HTMLInputElement).value.trim();
            if (currentValue) {
              handleEnter(currentValue);
            }
          },
        },
        root: {
          sx: { padding: 0 },
        },
      }}
      onPaste={async (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedValue = e.clipboardData.getData('text').trim();
        onPasteId(pastedValue);
      }}
    />
  );
};
