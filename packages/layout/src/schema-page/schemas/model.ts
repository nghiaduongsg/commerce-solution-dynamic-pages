export type Channel = 'Instagram' | 'Messenger';
export type Message = {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  attachments?: { name: string; url: string; kind: string }[];
};
export type Conversation = {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatar?: string;
  channel: Channel;
  handle: string;
  topic: string;
  unread: boolean;
  resolved: boolean;
  intent: string;
  summary: string;
  draft: string;
  messages: Message[];
  preview?: Message;
};

export type InboxSource = {
  mode: 'demo' | 'api';
  url: string;
  pageSize: number;
  messagePageSize: number;
};
export type InboxData = { workspace: string; conversations?: Conversation[]; source?: InboxSource };
