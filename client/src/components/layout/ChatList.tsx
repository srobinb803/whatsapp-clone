import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'; // Adjusted path
import { format } from 'date-fns';

interface ChatListItemProps {
  name?: string | null; // Explicitly allow string, null, or undefined
  lastMessage?: string | null;
  lastMessageTimestamp?: string | null;
  onClick: () => void;
  isSelected: boolean;
}

export const ChatListItem = ({
  name: contactName,
  lastMessage: lastMessageText,
  lastMessageTimestamp,
  onClick,
  isSelected,
}: ChatListItemProps) => {
  const formattedContactName = contactName ?? 'Unknown Contact';
  const initial = formattedContactName.charAt(0).toUpperCase();

  let formattedLastMessageText = lastMessageText ?? '...';
  let formattedLastMessageTime = '';

  if (lastMessageTimestamp) {
    try {
      formattedLastMessageTime = format(new Date(lastMessageTimestamp), 'p');
    } catch {
      formattedLastMessageTime = '--:--'; // Show a fallback time on error
    }
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-2 cursor-pointer rounded-lg transition-colors ${
        isSelected ? 'bg-secondary' : 'hover:bg-secondary/50'
      }`}
    >
      <Avatar className="h-12 w-12 mr-4">
        <AvatarImage
          src={`https://api.dicebear.com/8.x/initials/svg?seed=${formattedContactName}`}
          alt={formattedContactName}
        />
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold truncate">{formattedContactName}</h3>
          <p className="text-xs text-muted-foreground">{formattedLastMessageTime}</p>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {formattedLastMessageText}
        </p>
      </div>
    </div>
  );
};
