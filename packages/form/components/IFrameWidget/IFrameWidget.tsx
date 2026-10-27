import React, { useEffect, useMemo, useState } from 'react';
import { FormWidgetOptions, FormWidgetProps } from '@pkg-form/types';
import useFormData from '@pkg-common/dataResolver/useFormData';
import { DataSourceSchema } from '@pkg-common/types';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useNotifiers from '@pkg-common/notifier/useNotifiers';
import Wrapper from '@pkg-common/components/Wrapper';
import useNotificationsManager from '@pkg-setup/src/serverEvents/useNotificationsManager';

type SandboxOptionKey = 'allow-scripts' | 'allow-forms' | 'allow-same-origin' | 'allow-popups';

type SandboxOptions = Partial<Record<SandboxOptionKey, boolean>>;

type IFrameWidgetOptions = FormWidgetOptions & {
  sandboxOptions?: SandboxOptions;
  source?: DataSourceSchema;
  modalEnabled?: boolean;
  width?: string;
  height?: string;
};

const IFrameWidget = ({
  id,
  options,
  formContext,
}: FormWidgetProps & { options: IFrameWidgetOptions }) => {
  const {
    source,
    sandboxOptions,
    modalEnabled = false,
    width = '100%',
    height = '600px',
  } = options || {};

  const { value: src } = useFormData(id, source);
  const isBlobUrl = src?.startsWith('blob:');
  const [iframe, setIframe] = useState(false);
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY, formContext?.namespace]);
  const { enqueueSnackbar } = useNotifiers();

  const sandbox = useMemo(() => {
    if (!sandboxOptions) return '';

    const allowed = [
      sandboxOptions['allow-scripts'] ? 'allow-scripts' : '',
      sandboxOptions['allow-forms'] ? 'allow-forms' : '',
      sandboxOptions['allow-same-origin'] ? 'allow-same-origin' : '',
      sandboxOptions['allow-popups'] ? 'allow-popups' : '',
    ];

    return allowed.filter(Boolean).join(' ');
  }, [sandboxOptions]);

  useEffect(() => {
    src && setIframe(true);
  }, [src]);

  useNotificationsManager('', false, true);

  useEffect(() => {
    const handleSuccess = (_event: CustomEvent) => {
      setIframe(false);
      enqueueSnackbar({
        key: new Date().getTime().toString(),
        message: 'success',
        severity: 'dark',
        namespace: COMMON,
      });
    };
    const handleFail = (_event: CustomEvent) => {
      setIframe(false);
      enqueueSnackbar({
        key: new Date().getTime().toString(),
        message: 'fail',
        severity: 'error',
        namespace: COMMON,
      });
    };

    window.addEventListener('success', handleSuccess as EventListener);
    window.addEventListener('fail', handleFail as EventListener);

    return () => {
      window.removeEventListener('success', handleSuccess as EventListener);
      window.removeEventListener('fail', handleFail as EventListener);
    };
  }, []);

  return (
    <Wrapper
      condition={modalEnabled}
      wrapper={(children) => (
        <SimpleDialog
          id={`${id}_dialog`}
          open={iframe}
          onClose={() => setIframe(false)}
          title={translate(id, { ns: formContext?.namespace })}
          size="xl"
        >
          {children}
        </SimpleDialog>
      )}
    >
      {iframe && (
        <iframe
          id={`${id}_EmbeddedContent`}
          src={src}
          title={`${id}_EmbeddedContent`}
          {...(!isBlobUrl && sandbox ? { sandbox } : {})}
          allowFullScreen={true}
          style={{
            border: 'none',
            width,
            height,
          }}
        />
      )}
    </Wrapper>
  );
};

export default IFrameWidget;
