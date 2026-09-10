export type AdminTelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

export type MessageOriginUser = {
  type: 'user';
  date: number;
  sender_user: AdminTelegramUser;
};

export type MessageOriginHiddenUser = {
  type: 'hidden_user';
  date: number;
  sender_user_name?: string;
};

export type AdminTelegramMessage = {
  message_id: number;
  reply_to_message?: AdminTelegramMessage;
  from?: AdminTelegramUser;
  chat: { id: number };
  forward_origin?:
    | MessageOriginUser
    | MessageOriginHiddenUser
    | { type: 'chat' | 'channel'; date: number };
};

export type AdminTelegramCallback = {
  id: string;
  from: AdminTelegramUser;
  message?: AdminTelegramMessage;
  data?: string;
};

export type AdminTelegramUpdate = {
  update_id: number;
  callback_query?: AdminTelegramCallback;
  message?: AdminTelegramMessage;
};
