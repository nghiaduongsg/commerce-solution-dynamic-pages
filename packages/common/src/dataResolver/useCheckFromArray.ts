import useCheckFrom from './useCheckFrom';

const useCheckFromArray = (id: string, configs: any) => {
  return configs.map((config) => {
    return {
      config,
      hookResult: useCheckFrom(id, config.widgetOptions?.applyFrom),
    };
  });
};

export default useCheckFromArray;
