declare global {
  interface Window {
    DEPLOYMENT_ENVIRONMENT?: string;
    FORM?: string;
    ROW?: string;
    LIST?: string;
    getAssets?: (...args: any[]) => any;
    getExternalAssets?: (...args: any[]) => any;
    getTheme?: (...args: any[]) => any;
  }
}

declare module 'react' {
  interface HTMLAttributes<T> {
    [key: `data-${string}`]: any;
  }
  interface SVGAttributes<T> {
    [key: `data-${string}`]: any;
  }
}

export {};
