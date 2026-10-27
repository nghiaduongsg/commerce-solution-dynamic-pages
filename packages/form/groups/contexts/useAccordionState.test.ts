import { renderHook, act } from '@testing-library/react';
import useAccordionState from './useAccordionState';

describe('useAccordionState', () => {
  describe('initial state', () => {
    it('should initialize expanded with false', () => {
      const { result } = renderHook(() => useAccordionState());

      expect(result.current.areMostExpanded).toEqual(false);
    });
  });

  describe('toggleAll', () => {
    it('should toggle accordion state', () => {
      const { result } = renderHook(() => useAccordionState());

      act(() => {
        result.current.setAccordionState('accordion-1', true);
      });

      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.areMostExpanded).toEqual(false);
    });

    it('should toggle twice accordion state', () => {
      const { result } = renderHook(() => useAccordionState());

      act(() => {
        result.current.setAccordionState('accordion-1', true);
      });

      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.areMostExpanded).toEqual(false);

      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.areMostExpanded).toEqual(true);
    });
  });
});
