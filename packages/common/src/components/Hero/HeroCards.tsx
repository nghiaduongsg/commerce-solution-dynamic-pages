import React from 'react';
import { Box } from '@mui/material';
import DynamicHeroCard from './DynamicHeroCard';
import DefaultValueHeroCard from './DefaultValueHeroCard';
import { HeroCardsProps } from './HeroCards.d';

function HeroCards({ heroCards: cards, namespaces }: HeroCardsProps) {
  if (!cards.length) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', padding: 4, flexDirection: 'row' }}>
      {cards.map((card, index) => {
        return card.apiValues ? (
          <Box sx={{ margin: 2, display: 'flex' }}>
            <DynamicHeroCard
              key={index}
              id={`hero-card-${index}`}
              title={card.translation?.key ?? ''}
              apiValues={card.apiValues}
              valueType={card.valueType}
              namespaces={namespaces}
              propertyName={card.property ?? ''}
              propertyValue={card.propertyValue ?? ''}
            />
          </Box>
        ) : (
          <Box sx={{ margin: 2, display: 'flex' }}>
            <DefaultValueHeroCard
              key={index}
              id={`hero-card-${index}`}
              title={card.translation?.key ?? ''}
              namespaces={namespaces}
              defaultValueFrom={card.defaultValueFrom}
              valueType={card.valueType}
            />
          </Box>
        );
      })}
    </Box>
  );
}

export default React.memo(HeroCards, (prev, next) => {
  return (
    JSON.stringify(prev.heroCards) === JSON.stringify(next.heroCards) &&
    JSON.stringify(prev.namespaces) === JSON.stringify(next.namespaces)
  );
});
