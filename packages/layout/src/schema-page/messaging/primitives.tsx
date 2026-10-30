import React from 'react';
import { Camera, MessageCircle } from 'lucide-react';
import { Conversation } from '../schemas/model';
export function ChannelIcon({ channel, size = 15 }: { channel: string; size?: number }) {
  return channel === 'Instagram' ? <Camera size={size} /> : <MessageCircle size={size} />;
}
export function Avatar({
  conversation,
  small = false,
}: {
  conversation: Conversation;
  small?: boolean;
}) {
  return (
    <span
      className={`inbox-avatar ${small ? 'small' : ''}`}
      style={{ background: conversation.color }}
    >
      {conversation.initials}
    </span>
  );
}
