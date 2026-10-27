import React, { ReactElement } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { isArray } from 'lodash';
import { InfoRounded } from '@mui/icons-material';
import { AnyType } from '@pkg-common/types';
import { getAccessibilityInfoId } from '@pkg-form/validations/utils/widgetUtils';
import DOMPurify from 'dompurify';

const HtmlMessage = ({ html }: { html: string }) => (
  <Box
    sx={{
      fontSize: '0.85rem',
      '& strong, & b': { fontWeight: 700 },
    }}
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
  />
);

const InfoTooltip = ({
  message,
  dataTestId,
  icon,
  id,
  allowHtml = false,
}: {
  message: string | Array<string> | Array<Array<string>>;
  dataTestId?: string;
  icon?: ReactElement;
  id: string;
  allowHtml?: boolean;
}) => {
  return (
    <Tooltip
      id={`${id}-tooltip-container`}
      title={
        <ul
          id={getAccessibilityInfoId(id)}
          style={{
            paddingRight: 12,
            paddingTop: 0,
            paddingBottom: 0,
          }}
        >
          {typeof message === 'string' &&
            (allowHtml ? (
              <HtmlMessage html={message} />
            ) : (
              <Typography variant={'body1'}>{message}</Typography>
            ))}
          {isArray(message) &&
            message.map((l: AnyType, i: number) => (
              <li key={`${id}-${i}`}>
                {allowHtml ? (
                  <HtmlMessage html={String(l)} />
                ) : (
                  <Typography variant={'body1'}>{l}</Typography>
                )}
              </li>
            ))}
        </ul>
      }
      color="primary"
      placement="top"
      arrow
    >
      <span data-testid={dataTestId} style={{ height: 25 }}>
        {icon || <InfoRounded color="primary" />}
      </span>
    </Tooltip>
  );
};

export default InfoTooltip;
