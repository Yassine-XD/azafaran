import { Response } from "express";

const clients = new Set<Response>();

export const sseClients = {
  add(res: Response) {
    clients.add(res);
  },

  remove(res: Response) {
    clients.delete(res);
  },

  emit(event: string, data: object) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
      res.write(payload);
    }
  },
};
