import { useCallback } from 'react';
import axios from 'axios';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import { useSystem } from '@pkg-setup/index';
import { useEntity } from '@pkg-entity/index';
import { AnyType } from '@pkg-common/types';

const useReviewDocument = (values?: AnyType) => {
  const { apiUrl } = useSystem();
  const { setTemporaryAttachment } = useEntity('ReviewDocument');
  const finalApi = useDynamicApi('ReviewDocument', values);
  const method = values?.method?.toUpperCase() || 'POST';

  const fetchReviewDocument = useCallback(async () => {
    try {
      const response = await axios({
        url: `${apiUrl}/${finalApi.url}`,
        method,
        responseType: 'blob',
        data: finalApi.data,
      });

      const contentType = String(response.headers?.['content-type'] || '');
      const url = globalThis.URL.createObjectURL(new Blob([response.data], { type: contentType }));

      setTemporaryAttachment(url);

      return url;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [apiUrl, finalApi, setTemporaryAttachment, method]);

  return { fetchReviewDocument };
};

export default useReviewDocument;
