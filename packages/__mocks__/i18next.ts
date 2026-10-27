module.exports = {
  language: 'en',
  addResources: jest.fn().mockImplementationOnce(() => {
    return undefined;
  }),
};

export {};
