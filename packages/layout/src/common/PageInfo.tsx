import React, { useMemo } from 'react';
import { SxProps } from '@mui/system';
import { useParams } from 'react-router';
import BannerInformation from '@pkg-common/components/BannerInformation/BannerInformation';
import usePage from '@pkg-layout/src/common/hooks/usePage';

const PageInfo = ({ sx = {} }: { sx?: SxProps }) => {
  const routeParams = useParams<{ category?: string; idKey?: string }>();

  const pageId = useMemo(() => {
    return routeParams?.category || '';
  }, [routeParams]);

  const uiSchema = usePage();

  const bannerId = React.useMemo(() => {
    return uiSchema?.['ui:page']?.id ?? pageId;
  }, [uiSchema, pageId]);

  return <BannerInformation id={bannerId} uiSchema={uiSchema} sx={sx} />;
};

export default PageInfo;
