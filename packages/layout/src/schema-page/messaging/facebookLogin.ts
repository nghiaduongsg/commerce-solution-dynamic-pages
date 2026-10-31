export type FacebookConfig = { app_id: string; config_id?: string; version: string };
type LoginResponse = { authResponse?: { accessToken: string } };
type FacebookSDK = {
  init: (options: Record<string, unknown>) => void;
  login: (callback: (response: LoginResponse) => void, options: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    FB?: FacebookSDK;
  }
}
let loading: Promise<void> | undefined;
export async function prepareFacebook(config: FacebookConfig): Promise<void> {
  if (!window.FB) {
    if (!loading)
      loading = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        const timer = window.setTimeout(() => {
          script.remove();
          loading = undefined;
          reject(new Error('sdk_timeout'));
        }, 15000);
        script.onload = () => {
          window.clearTimeout(timer);
          resolve();
        };
        script.onerror = () => {
          window.clearTimeout(timer);
          script.remove();
          loading = undefined;
          reject(new Error('sdk_unavailable'));
        };
        document.head.appendChild(script);
      });
    await loading;
  }
  if (!window.FB) throw new Error('sdk_unavailable');
  window.FB.init({
    appId: config.app_id,
    version: config.version,
    cookie: false,
    xfbml: false,
    status: false,
  });
}
// Call directly from the click handler: browsers block popups after an awaited request.
export function loginFacebook(config: FacebookConfig): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error('sdk_unavailable'));
      return;
    }
    window.FB.login(
      (response) => {
        const token = response.authResponse?.accessToken;
        if (token) resolve(token);
        else reject(new Error('login_cancelled'));
      },
      config.config_id
        ? { config_id: config.config_id }
        : {
            scope: 'pages_show_list,pages_messaging,pages_read_engagement,pages_manage_metadata',
            auth_type: 'rerequest',
            return_scopes: true,
          },
    );
  });
}
