import { Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns-tz';

interface MessageBubbleProps {
  text: string;
  timestamp: Date;
  isUserMessage: boolean;
  status: 'sent' | 'delivered' | 'read' | 'received' | 'failed';
}

export const MessageBubble = ({ text, timestamp, isUserMessage, status }: MessageBubbleProps) => {
  const StatusIcon = () => {
    if (!isUserMessage) return null;
    if (status === 'read') return <CheckCheck size={16} className="text-blue-500" />;
    if (status === 'delivered' || status === 'received') return <CheckCheck size={16} />;
    return <Check size={16} />;
  };

  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-md ${
          isUserMessage ? 'bg-primary text-primary-foreground' : 'bg-secondary'
        }`}
      >
        <p className="break-words">{text}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <p className={`text-xs ${isUserMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {format(new Date(timestamp), 'p')}
          </p>
          <StatusIcon />
        </div>
      </div>
    </div>
  );
};