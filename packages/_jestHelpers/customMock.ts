export default function customMock(
  mod: any,
  method: string,
  options?: Record<any, any> | string,
): void {
  jest.clearAllMocks();
  if (!mod) {
    console.warn(`Module ${mod} is unavailable`);
    return;
  }
  if (typeof (mod as any)[method] !== 'function') {
    console.log(`Method ${method} does not exist on Module ${mod}`);
    return;
  }
  (mod as any)[method] = jest.fn().mockImplementation(() => options);
}
