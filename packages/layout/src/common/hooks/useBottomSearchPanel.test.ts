import { renderHook, act } from '@testing-library/react';
import useBottomSearchPanel from './useBottomSearchPanel';
describe('useBottomSearchPanel', () => {
  describe('initial state', () => {
    it('should initialize isBottomSearchPanelVisible with true', () => {
      const { result } = renderHook(() => useBottomSearchPanel());
      expect(result.current.isBottomSearchPanelVisible).toEqual(true);
    });
    it('should return hideBottomSearchPanel function', () => {
      const { result } = renderHook(() => useBottomSearchPanel());
      expect(typeof result.current.hideBottomSearchPanel).toBe('function');
    });
    it('should return showBottomSearchPanel function', () => {
      const { result } = renderHook(() => useBottomSearchPanel());
      expect(typeof result.current.showBottomSearchPanel).toBe('function');
    });
  });
  describe('hideBottomSearchPanel', () => {
    it('should hide bottom search panel', () => {
      const { result } = renderHook(() => useBottomSearchPanel());
      act(() => {
        result.current.hideBottomSearchPanel();
      });
      expect(result.current.isBottomSearchPanelVisible).toEqual(false);
    });
    it('should remain hidden after multiple calls', () => {
      const { result } = renderHook(() => useBottomSearchPanel());
      act(() => {
        result.current.hideBottomSearchPanel();
      });
      act(() => {
        result.current.hideBottomSearchPanel();
      });
      expect(result.current.isBottomSearchPanelVisible).toEqual(false);
    });
  });
  describe('showBottomSearchPanel', () => {
    it('should show bottom search panel', () => {
      const { result } = renderHook(() => useBottomSearchPanel());
      act(() => {
        result.current.hideBottomSearchPanel();
      });
      act(() => {
        result.current.showBottomSearchPanel();
      });
      expect(result.current.isBottomSearchPanelVisible).toEqual(true);
    });
    it('should remain visible after multiple calls', () => {
      const { result } = renderHook(() => useBottomSearchPanel());
      act(() => {
        result.current.showBottomSearchPanel();
      });
      act(() => {
        result.current.showBottomSearchPanel();
      });
      expect(result.current.isBottomSearchPanelVisible).toEqual(true);
    });
  });
  describe('state transitions', () => {
    it('should toggle between hidden and visible states', () => {
      const { result } = renderHook(() => useBottomSearchPanel());
      // Initial state: visible
      expect(result.current.isBottomSearchPanelVisible).toEqual(true);
      // Hide
      act(() => {
        result.current.hideBottomSearchPanel();
      });
      expect(result.current.isBottomSearchPanelVisible).toEqual(false);
      // Show
      act(() => {
        result.current.showBottomSearchPanel();
      });
      expect(result.current.isBottomSearchPanelVisible).toEqual(true);
    });
    it('should handle multiple rapid transitions', () => {
      const { result } = renderHook(() => useBottomSearchPanel());
      act(() => {
        result.current.hideBottomSearchPanel();
        result.current.showBottomSearchPanel();
        result.current.hideBottomSearchPanel();
      });
      expect(result.current.isBottomSearchPanelVisible).toEqual(false);
      act(() => {
        result.current.showBottomSearchPanel();
      });
      expect(result.current.isBottomSearchPanelVisible).toEqual(true);
    });
    it('should hide then show then hide again', () => {
      const { result } = renderHook(() => useBottomSearchPanel());
      // Start: visible
      expect(result.current.isBottomSearchPanelVisible).toEqual(true);
      // Hide
      act(() => {
        result.current.hideBottomSearchPanel();
      });
      expect(result.current.isBottomSearchPanelVisible).toEqual(false);
      // Show
      act(() => {
        result.current.showBottomSearchPanel();
      });
      expect(result.current.isBottomSearchPanelVisible).toEqual(true);
      // Hide again
      act(() => {
        result.current.hideBottomSearchPanel();
      });
      expect(result.current.isBottomSearchPanelVisible).toEqual(false);
    });
  });
  describe('callback stability', () => {
    it('should maintain stable reference for hideBottomSearchPanel', () => {
      const { result, rerender } = renderHook(() => useBottomSearchPanel());
      const firstHideRef = result.current.hideBottomSearchPanel;
      rerender();
      const secondHideRef = result.current.hideBottomSearchPanel;
      expect(firstHideRef).toBe(secondHideRef);
    });
    it('should maintain stable reference for showBottomSearchPanel', () => {
      const { result, rerender } = renderHook(() => useBottomSearchPanel());
      const firstShowRef = result.current.showBottomSearchPanel;
      rerender();
      const secondShowRef = result.current.showBottomSearchPanel;
      expect(firstShowRef).toBe(secondShowRef);
    });
    it('should maintain callback stability even after state changes', () => {
      const { result } = renderHook(() => useBottomSearchPanel());
      const hideRefBefore = result.current.hideBottomSearchPanel;
      const showRefBefore = result.current.showBottomSearchPanel;
      act(() => {
        result.current.hideBottomSearchPanel();
      });
      const hideRefAfter = result.current.hideBottomSearchPanel;
      const showRefAfter = result.current.showBottomSearchPanel;
      expect(hideRefBefore).toBe(hideRefAfter);
      expect(showRefBefore).toBe(showRefAfter);
    });
  });
});
