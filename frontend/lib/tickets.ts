import { api, apiForm, API_HOST } from "./api";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_user"
  | "resolved"
  | "closed";

export type TicketCategory =
  | "order"
  | "payment"
  | "delivery"
  | "product"
  | "account"
  | "other";

export type TicketPriority = "low" | "normal" | "high" | "urgent";

export type TicketAttachment = {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

export type TicketMessage = {
  id: string;
  ticket_id: string;
  sender_type: "user" | "admin";
  sender_id: string;
  body: string;
  created_at: string;
  attachments: TicketAttachment[];
};

export type Ticket = {
  id: string;
  user_id: string;
  ticket_number: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  last_message_at: string;
  unread_for_admin: boolean;
  unread_for_user: boolean;
  created_at: string;
  updated_at: string;
  last_message?: string;
  messages?: TicketMessage[];
};

export type LocalAttachment = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
};

export function attachmentUrl(att: TicketAttachment): string {
  if (att.file_url.startsWith("http")) return att.file_url;
  return `${API_HOST}${att.file_url}`;
}

export function isImage(att: TicketAttachment | { mimeType: string }): boolean {
  const mime = "mime_type" in att ? att.mime_type : att.mimeType;
  return mime.startsWith("image/");
}

export async function fetchTickets(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return api.get<Ticket[]>(`/tickets${qs}`);
}

export async function fetchTicket(id: string) {
  return api.get<Ticket>(`/tickets/${id}`);
}

function appendAttachments(formData: FormData, files: LocalAttachment[]) {
  files.forEach((f) => {
    formData.append("files", {
      uri: f.uri,
      name: f.name,
      type: f.mimeType,
    } as any);
  });
}

export async function createTicket(input: {
  subject: string;
  category: TicketCategory;
  body: string;
  files: LocalAttachment[];
}) {
  const fd = new FormData();
  fd.append("subject", input.subject);
  fd.append("category", input.category);
  fd.append("body", input.body);
  appendAttachments(fd, input.files);
  return apiForm<Ticket>("/tickets", fd);
}

export async function postMessage(
  ticketId: string,
  body: string,
  files: LocalAttachment[],
) {
  const fd = new FormData();
  fd.append("body", body);
  appendAttachments(fd, files);
  return apiForm<Ticket>(`/tickets/${ticketId}/messages`, fd);
}
