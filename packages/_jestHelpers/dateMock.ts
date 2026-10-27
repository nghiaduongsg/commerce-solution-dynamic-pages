export const mockDate = (date: string | number | Date, dateToSet = 0) => {
  jest.resetAllMocks();

  jest.spyOn(globalThis, 'Date' as any).mockImplementation(() => {
    const mockInstance = {
      getTime: () => date,
      getDate: () => date,
      setDate: function (_: number) {
        // Return 'this' to allow chaining, but use dateToSet for getTime
        this.getTime = () => dateToSet;
        return dateToSet;
      },
      setHours: function () {
        return this;
      },
      toISOString: () => date,
    };

    return mockInstance;
  });

  Date.now = () => (typeof date === 'number' ? date : new Date(date).getTime());
};
