import { LoaderState } from './types.d';

export const selectLoaderVisibility = (state: { Loader: LoaderState }) => state.Loader.isVisible;
