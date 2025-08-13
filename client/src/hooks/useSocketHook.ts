import { useEffect } from 'react';
import { socket } from '@/api/socket';
import { type IClientMessage } from '@/types';

interface SocketEventHandlers {
  handleNewMessage: (data: { wa_id: string; message: IClientMessage }) => void;
  handleStatusUpdate: (data: { wa_id: string; message_id: string; status: 'sent' | 'delivered' | 'read' | 'failed' }) => void;
  handleContactDetails: (data: { wa_id: string; name: string }) => void;
}

export const useSocketEvents = ({ handleNewMessage, handleStatusUpdate, handleContactDetails }: SocketEventHandlers) => {
  useEffect(() => {
    // Listener for new messages
    socket.on('message', handleNewMessage);

    // Listener for status updates
    socket.on('statusUpdate', handleStatusUpdate);

    socket.on('contact:details', handleContactDetails);

    // Cleanup listeners when the component unmounts
    return () => {
      socket.off('message', handleNewMessage);
      socket.off('statusUpdate', handleStatusUpdate);
       socket.off('contact:details', handleContactDetails);
    };
  }, [handleNewMessage, handleStatusUpdate, handleContactDetails]);
};