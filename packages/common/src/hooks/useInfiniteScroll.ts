import { useEffect, useRef } from 'react';

export type UseInfiniteScrollOptions = {
  enabled?: boolean;
  itemCount: number;
  visibleCount: number;
  batchSize?: number;
  loadThreshold?: number;
  root?: HTMLElement | null;
  rootMargin?: string;
  getItemId: (index: number) => string;
  onLoadMore: () => void;
};

export const DEFAULT_INFINITE_SCROLL_BATCH_SIZE = 10;
export const DEFAULT_INFINITE_SCROLL_LOAD_THRESHOLD = 0.75;
export const DEFAULT_INFINITE_SCROLL_ROOT_MARGIN = '300px 0px';

/**
 * Observes a "target" item within a dynamically rendered, windowed list and calls
 * `onLoadMore` once that item scrolls into `root`'s viewport (plus `rootMargin`).
 * The target item is picked at `visibleCount * loadThreshold`, so the next batch
 * starts loading before the user reaches the end of the currently rendered items.
 *
 * Does nothing when `enabled` is false or there are no more items to load
 * (`visibleCount >= itemCount`).
 */
const useInfiniteScroll = ({
  enabled = false,
  itemCount,
  visibleCount,
  batchSize = DEFAULT_INFINITE_SCROLL_BATCH_SIZE,
  loadThreshold = DEFAULT_INFINITE_SCROLL_LOAD_THRESHOLD,
  root = null,
  rootMargin = DEFAULT_INFINITE_SCROLL_ROOT_MARGIN,
  getItemId,
  onLoadMore,
}: UseInfiniteScrollOptions) => {
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (!enabled || visibleCount >= itemCount) {
      return;
    }
    const targetIndex = Math.max(0, Math.floor(visibleCount * loadThreshold) - 1);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current();
        }
      },
      { root, rootMargin, threshold: 0 },
    );

    for (let i = targetIndex; i < visibleCount; ++i) {
      const targetElement = document.getElementById(getItemId(i));
      if (!targetElement) {
        continue;
      }
      observer.observe(targetElement);
    }

    return () => observer.disconnect();
  }, [enabled, itemCount, visibleCount, batchSize, loadThreshold, root, rootMargin, getItemId]);
};

export default useInfiniteScroll;
