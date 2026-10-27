export type LoaderState = {
  isVisible: boolean;
};

export type UseLoaderType = {
  visible: boolean;
  showLoader: () => void;
  hideLoader: () => void;
};
