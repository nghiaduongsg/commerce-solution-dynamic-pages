import React, { useState } from 'react';
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
  // Resolve the customer's profile photo when one is supplied, falling back to
  // the coloured initials if it is missing or fails to load.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = conversation.avatar;
  const showImage = !!url && failedUrl !== url;
  return (
    <span
      className={`inbox-avatar ${small ? 'small' : ''}`}
      style={showImage ? undefined : { background: conversation.color }}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          className="inbox-avatar-img"
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(url || null)}
        />
      ) : (
        conversation.initials
      )}
    </span>
  );
}
