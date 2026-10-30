import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardActionArea, CardContent, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { selectMainMenuItems } from '../../../setup/src/menu/selectors';
import { DashboardData } from './schemas/pageDefinitions';

/** Cards use the host's already-filtered navigation; no commerce session dependency. */
export default function Dashboard({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: DashboardData;
}) {
  const { t } = useTranslation('workspace');
  const navigate = useNavigate();
  const menu = useSelector(selectMainMenuItems);
  const allowed = new Set((menu || []).map((item) => item.id || item.code));
  return (
    <Box sx={{ p: { xs: 4, md: 8 }, mt: 20 }}>
      <Typography variant="h1" sx={{ mb: 3 }}>
        {t(title)}
      </Typography>
      <Typography sx={{ mb: 6 }}>{description ? t(description) : null}</Typography>
      <Grid container spacing={4}>
        {data.cards
          .filter((card) => allowed.has(card.id))
          .map((card) => (
            <Grid key={card.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card variant="outlined">
                <CardActionArea onClick={() => navigate(card.path)}>
                  <CardContent sx={{ p: 6 }}>
                    <Typography variant="h4">{t(card.title)}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                      {t(card.description)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}
