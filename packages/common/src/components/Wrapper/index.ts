import { AnyType } from '@pkg-common/types';

function Wrapper({ children, wrapper, condition }: AnyType) {
  return condition ? wrapper(children) : children;
}

export default Wrapper;
