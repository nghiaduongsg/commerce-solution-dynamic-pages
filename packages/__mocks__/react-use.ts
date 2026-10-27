import { AnyType } from '@pkg-common/types';

module.exports = {
  usePrevious: () => jest.fn(),
  // @ts-ignore
  useDebounce: (fn: () => void, ms?: number, deps?: Array<AnyType>) => [() => true, () => 0],
};

export {};
