import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Messages } from '@/lib/types';

interface ChatState {
  messages: Messages[];
}

const initialState: ChatState = {
  messages: [
    {
      id: '',
      content: '',
      room: '',
      sender: { dp: '', name: '', username: '' },
      time: ''
    }
  ],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Messages>) => {
      if (!state.messages?.some(message => message.id === action.payload.id)) state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Messages[]>) => {
      state.messages = state.messages ? [...state.messages, ...action.payload] : action.payload;
    },
    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<Messages> }>) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = { ...state.messages[index], ...action.payload.updates };
      }
    },
  },
});

export const { addMessage, setMessages, updateMessage } = chatSlice.actions;

export default chatSlice.reducer;

