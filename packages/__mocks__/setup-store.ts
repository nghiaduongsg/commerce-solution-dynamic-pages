module.exports = () => {
  return {
    getState: jest.fn().mockImplementationOnce(() => {
      return {};
    }),
  };
};

export {};
