import React, { useEffect, useId, useRef, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useFormAccordionContext } from '@pkg-form/groups/contexts/FormAccordionContext';
import { useTheme } from '@mui/material/styles';

export interface StackedAccordionProps {
  groupKey: string;
  index: number;
  label: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const getStyles = (theme) => {
  return {
    summaryInner: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: 1,
    },
    iconBox: (expanded: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      borderRadius: '10px',
      background: theme.palette.common.white,
      border: '1px solid #E5E7EB',
      flexShrink: 0,
      color: '#6B7280',
      transition: 'all 0.2s ease',
      ...(expanded && {
        background: theme.palette.primary.main,
        color: theme.palette.common.white,
        boxShadow: '0px 4px 6px -1px rgba(21,93,252,0.3)',
      }),
    }),
    chevron: {
      color: '#6A7282',
    },
    label: (expanded: boolean) => ({
      fontSize: 12,
      lineHeight: '16px',
      textTransform: 'uppercase',
      color: expanded ? '#1447E6' : '#1E2939',
    }),
    expandIcon: {
      color: '#9CA3AF',
      transition: 'color 0.2s ease',
      '&.expanded': { color: theme.palette.primary.main },
    },
  };
};

const StackedAccordion = ({
  groupKey,
  index,
  label,
  icon,
  defaultExpanded = false,
  children,
}: StackedAccordionProps) => {
  const styles = getStyles(useTheme());
  const { areMostExpanded, setAccordionState } = useFormAccordionContext();
  const headerId = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isFirstRender.current) {
      setExpanded(areMostExpanded);
    } else {
      isFirstRender.current = false;
    }
  }, [areMostExpanded]);

  useEffect(() => {
    setAccordionState(groupKey, expanded);
  }, [expanded, groupKey]);

  return (
    <Accordion
      expanded={expanded}
      disableGutters
      id={`accordion-container-${groupKey}`}
      data-testid={`accordion-container-${groupKey}`}
      aria-labelledby={headerId}
      aria-expanded={expanded}
      onChange={() => {
        setExpanded((prev) => !prev);
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={18} aria-hidden="true" style={styles.chevron} />}
        aria-controls={`accordion-content-${groupKey}`}
        id={headerId}
        data-testid={`accordion-header-${groupKey}`}
      >
        <Box sx={styles.summaryInner}>
          <Box aria-hidden="true" sx={styles.iconBox(expanded)}>
            {icon}
          </Box>

          <Typography component="span" sx={styles.label(expanded)}>
            {index}. {label}
          </Typography>
        </Box>
      </AccordionSummary>

      {(expanded || !isFirstRender.current) && (
        <AccordionDetails
          id={`accordion-content-${groupKey}`}
          role="region"
          data-testid={`accordion-content-${groupKey}`}
          aria-labelledby={headerId}
        >
          {children}
        </AccordionDetails>
      )}
    </Accordion>
  );
};

export default StackedAccordion;
