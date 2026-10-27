export type NotifierState = {
  notifications: Array<Notification>;
};

export type Notification = {
  key: string | number;
  message: string;
  severity?: 'dark' | 'error';
  dismissed?: boolean;
  namespace?: string;
  successUpdateMessageKey?: string;
};
