import api from "./client";

export interface ChatUser {
  id: string;
  name: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  content: string;
  messageType: string;
  senderId?: string | null;
  senderType: "USER" | "ADMIN" | "SYSTEM" | "TELEGRAM" | string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  userId: string;
  applicationId?: string | null;
  subject?: string | null;
  status: "OPEN" | "CLOSED" | "PENDING" | string;
  createdAt: string;
  updatedAt: string;
  user?: ChatUser;
  messages?: ChatMessage[];
  _count?: {
    messages?: number;
  };
}

export interface ProgressUpdatePayload {
  type: "PROGRESS_UPDATE";
  applicationId?: string;
  appointmentPdf: number;
  ds160: number;
  materialCheck: number;
  visaConsultation: number;
  note?: string;
  updatedAt: string;
  updatedBy?: string;
}

export const PROGRESS_UPDATE_PREFIX = "PROGRESS_UPDATE::";

export const clampPercent = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));

export const encodeProgressUpdate = (payload: ProgressUpdatePayload): string =>
  `${PROGRESS_UPDATE_PREFIX}${JSON.stringify(payload)}`;

export const decodeProgressUpdate = (
  content: string,
): ProgressUpdatePayload | null => {
  if (!content || !content.startsWith(PROGRESS_UPDATE_PREFIX)) return null;
  const raw = content.slice(PROGRESS_UPDATE_PREFIX.length);
  try {
    const parsed = JSON.parse(raw) as ProgressUpdatePayload;
    if (parsed?.type !== "PROGRESS_UPDATE") return null;
    return {
      ...parsed,
      appointmentPdf: clampPercent(parsed.appointmentPdf ?? 0),
      ds160: clampPercent(parsed.ds160 ?? 0),
      materialCheck: clampPercent(parsed.materialCheck ?? 0),
      visaConsultation: clampPercent(parsed.visaConsultation ?? 0),
    };
  } catch {
    return null;
  }
};

export const fetchThreads = async (): Promise<ChatThread[]> => {
  const res = await api.get("/api/chat/threads");
  return (res.data?.data || []) as ChatThread[];
};

export const fetchThreadById = async (threadId: string): Promise<ChatThread> => {
  const res = await api.get(`/api/chat/threads/${threadId}`);
  return res.data?.data as ChatThread;
};

export const createThread = async (input?: {
  subject?: string;
  applicationId?: string;
  userId?: string;
}): Promise<ChatThread> => {
  const res = await api.post("/api/chat/threads", input || {});
  return res.data?.data as ChatThread;
};

export const sendThreadMessage = async (
  threadId: string,
  content: string,
  messageType = "TEXT",
): Promise<ChatMessage> => {
  const res = await api.post(`/api/chat/threads/${threadId}/messages`, {
    content,
    messageType,
  });
  return res.data?.data as ChatMessage;
};

export const closeThread = async (threadId: string): Promise<ChatThread> => {
  const res = await api.patch(`/api/chat/threads/${threadId}/close`);
  return res.data?.data as ChatThread;
};
