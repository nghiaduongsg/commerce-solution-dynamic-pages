import { getBanner, getHomeImage, getLogo } from './themeUtils';

describe('themeUtils', () => {
  describe('getLogo()', () => {
    it('should default when no property of window[LOGO]', () => {
      expect(getLogo()).toBeNull();
    });
    it('should return the window[LOGO] property', () => {
      global.LOGO = 'testLogo';
      expect(getLogo()).toStrictEqual('testLogo');
      delete global.LOGO;
    });
  });
  describe('getHomeImage()', () => {
    it('should default when no property of window[HOME]', () => {
      expect(getHomeImage()).toBeNull();
    });
    it('should return the window[HOME] property', () => {
      global.HOME = 'testHomeString';
      expect(getHomeImage()).toStrictEqual('testHomeString');
      delete global.HOME;
    });
  });
  describe('getBanner()', () => {
    it('should default when no property of window[BANNER]', () => {
      expect(getBanner()).toBeNull();
    });
    it('should return the window[BANNER] property', () => {
      global.BANNER = 'testBanner';
      expect(getBanner()).toStrictEqual('testBanner');
      delete global.BANNER;
    });
  });
});
