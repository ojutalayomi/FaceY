/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setMessages, addMessage, updateMessage } from '@/redux/chatSlice';
import { Messages } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { createContext, Dispatch, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

type Sockett = typeof Socket;

const SocketContext = createContext<Sockett | null>(null);

export const DispatchContext = createContext<Dispatch<any>>(null!);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	  const dispatch = useDispatch();
    const { user, isLoaded } = useUser();
  	const socketChat = useSelector((state: RootState) => state.chat.messages);
    const [socket, setSocket] = useState<Sockett | null>(null);
  
    useEffect(() => {
      // Only initialize the socket if user is loaded
      if (isLoaded && !user?.id) return;
  
      // fetch(process.env.NEXT_PUBLIC_SOCKET_URL || '')
      const socketIo = io(process.env.NEXT_PUBLIC_SOCKET_URL || '');
  
      socketIo.on('connect', () => {
        console.log('Connected'); // Log the connection status message
        if (user?.id) {
          socketIo.emit('register', user.id); // Emit 'register' event with user's ID
          console.log('Registered with ID:', user.id);
        } else {
          console.log('User ID is not available for registration');
        }
      });

      socketIo.on('notice', (reason: any) => {
        console.log('Message:', reason);
      });

      socketIo.on('prevMessages', (msg: Messages[]) => {
        if(!msg) return;
        dispatch(setMessages(msg));
        // console.log('prevMessages:', msg);
      });

      socketIo.on('reply', (msg: Messages) => {
        // console.log('messages:', msg);
        dispatch(addMessage(msg));
      });
  
      socketIo.on('disconnect', (reason: any) => {
        console.log('Disconnected:', reason);
      });
  
      socketIo.on('connect_error', (err: any) => {
        console.error('Connection Error:', err);
        if(err.message.includes("P: websocket error at tt.onError") && user?.id){
          socketIo.emit('register', user.id); // Emit 'register' event with user's ID
          console.log('Registered with ID:', user.id);
        }
      });
  
      socketIo.on('error', (err: any) => {
        console.error('Socket Error:', err);
      });
  
      setSocket(socketIo);
  
      return () => {
        socketIo.off('notice');
        socketIo.off('preMessages');
        socketIo.off('reply');
        socketIo.disconnect(); // Ensure the socket is disconnected on cleanup
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, isLoaded, user]); // Add loading and user as dependencies
  
    return (
      <DispatchContext.Provider value={dispatch}>
        <SocketContext.Provider value={socket}>
          {children}
        </SocketContext.Provider>
      </DispatchContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
      throw new Error('useSocket must be used within a SocketProvider')
    }
    return context
};