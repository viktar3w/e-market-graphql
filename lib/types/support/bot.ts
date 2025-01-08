export type BotStructure<T> = {
  client: T;
  sendMessage: (chatId: number | string, text: string) => Promise<Response>;
};
