import { renderHook } from '@testing-library/react';
import useInfiniteScroll from './useInfiniteScroll';

describe('useInfiniteScroll', () => {
  let observeMock: jest.Mock;
  let disconnectMock: jest.Mock;
  let observerInstances: Array<{
    callback: IntersectionObserverCallback;
    options?: IntersectionObserverInit;
  }>;

  beforeEach(() => {
    observeMock = jest.fn();
    disconnectMock = jest.fn();
    observerInstances = [];

    (globalThis as any).IntersectionObserver = jest.fn((callback, options) => {
      observerInstances.push({ callback, options });
      return { observe: observeMock, disconnect: disconnectMock, unobserve: jest.fn() };
    });

    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  const addTargetElement = (id: string) => {
    const el = document.createElement('div');
    el.id = id;
    document.body.appendChild(el);
    return el;
  };

  const getItemId = (i: number) => `widget-option-${i + 1}`;

  it('does nothing when disabled', () => {
    // targetIndex = floor(10 * 0.75) - 1 = 6, getItemId(6) = widget-option-7
    addTargetElement('widget-option-7');
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        enabled: false,
        itemCount: 20,
        visibleCount: 10,
        getItemId,
        onLoadMore,
      }),
    );
    expect(globalThis.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('uses default configuration values (loadThreshold=0.75, rootMargin="300px 0px")', () => {
    // targetIndex = floor(10 * 0.75) - 1 = 6, getItemId(6) = widget-option-7
    addTargetElement('widget-option-7');
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        itemCount: 20,
        visibleCount: 10,
        getItemId,
        onLoadMore,
      }),
    );
    expect(observerInstances[0].options).toMatchObject({
      rootMargin: '300px 0px',
      threshold: 0,
    });
    expect(observeMock).toHaveBeenCalled();
  });

  it('calls onLoadMore for the next batch when the target item intersects', () => {
    // targetIndex = floor(10 * 0.75) - 1 = 6, getItemId(6) = widget-option-7
    addTargetElement('widget-option-7');
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        itemCount: 20,
        visibleCount: 10,
        getItemId,
        onLoadMore,
      }),
    );
    const { callback } = observerInstances[0];
    callback([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('does not call onLoadMore when the target item is not intersecting', () => {
    addTargetElement('widget-option-7');
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        itemCount: 20,
        visibleCount: 10,
        getItemId,
        onLoadMore,
      }),
    );
    const { callback } = observerInstances[0];
    callback(
      [{ isIntersecting: false }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not observe anything once all items are loaded (visibleCount >= itemCount)', () => {
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        itemCount: 10,
        visibleCount: 10,
        getItemId,
        onLoadMore,
      }),
    );
    expect(globalThis.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('disconnects the observer on cleanup / unmount', () => {
    // targetIndex = floor(10 * 0.75) - 1 = 6, getItemId(6) = widget-option-7
    addTargetElement('widget-option-7');
    const { unmount } = renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        itemCount: 20,
        visibleCount: 10,
        getItemId,
        onLoadMore: jest.fn(),
      }),
    );
    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('re-observes a new target when the filtered item list (itemCount) changes', () => {
    // targetIndex for visibleCount=10, threshold=0.75 => 6, getItemId(6) = widget-option-7
    addTargetElement('widget-option-7');
    // When itemCount drops to 5, visibleCount(10) >= itemCount(5), so observer disconnects
    const onLoadMore = jest.fn();
    const { rerender } = renderHook(
      ({ itemCount }) =>
        useInfiniteScroll({
          enabled: true,
          itemCount,
          visibleCount: 10,
          getItemId,
          onLoadMore,
        }),
      { initialProps: { itemCount: 20 } },
    );
    expect(disconnectMock).not.toHaveBeenCalled();
    rerender({ itemCount: 5 });
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('does not create duplicate observers when re-rendered with the same props', () => {
    addTargetElement('widget-option-7');
    const { rerender } = renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        itemCount: 20,
        visibleCount: 10,
        getItemId,
        onLoadMore: jest.fn(),
      }),
    );
    rerender();
    expect(globalThis.IntersectionObserver).toHaveBeenCalledTimes(1);
  });

  it('is safe when the target element does not exist yet', () => {
    const onLoadMore = jest.fn();
    expect(() =>
      renderHook(() =>
        useInfiniteScroll({
          enabled: true,
          itemCount: 20,
          visibleCount: 10,
          getItemId,
          onLoadMore,
        }),
      ),
    ).not.toThrow();
    expect(observeMock).not.toHaveBeenCalled();
  });

  it('uses custom loadThreshold when provided', () => {
    // targetIndex = floor(10 * 0.5) - 1 = 4, getItemId(4) = widget-option-5
    addTargetElement('widget-option-5');
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        itemCount: 20,
        visibleCount: 10,
        loadThreshold: 0.5,
        getItemId,
        onLoadMore,
      }),
    );
    expect(observeMock).toHaveBeenCalled();
  });

  it('uses custom rootMargin when provided', () => {
    addTargetElement('widget-option-7');
    const onLoadMore = jest.fn();
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        itemCount: 20,
        visibleCount: 10,
        rootMargin: '500px 0px',
        getItemId,
        onLoadMore,
      }),
    );
    expect(observerInstances[0].options).toMatchObject({
      rootMargin: '500px 0px',
    });
  });
});
