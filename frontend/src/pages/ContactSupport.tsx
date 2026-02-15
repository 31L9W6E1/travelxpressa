import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  UserCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChatThread,
  ProgressUpdatePayload,
  closeThread,
  clampPercent,
  createThread,
  decodeProgressUpdate,
  encodeProgressUpdate,
  fetchThreadById,
  fetchThreads,
  sendThreadMessage,
} from "@/api/chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type ProgressDraft = {
  appointmentPdf: number;
  ds160: number;
  materialCheck: number;
  visaConsultation: number;
  note: string;
};

const defaultDraft: ProgressDraft = {
  appointmentPdf: 0,
  ds160: 0,
  materialCheck: 0,
  visaConsultation: 0,
  note: "",
};

const threadStatusVariant = (status: string) => {
  switch (status) {
    case "OPEN":
      return "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30";
    case "CLOSED":
      return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
    case "PENDING":
      return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
};

type MessageIdentity = {
  isMine: boolean;
  isSystem: boolean;
  senderLabel: string;
  senderRoleLabel: string;
};

const getLatestProgress = (
  thread: ChatThread | null,
): ProgressUpdatePayload | null => {
  if (!thread?.messages?.length) return null;
  for (let i = thread.messages.length - 1; i >= 0; i -= 1) {
    const parsed = decodeProgressUpdate(thread.messages[i].content);
    if (parsed) return parsed;
  }
  return null;
};

const ContactSupport = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>("");
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingThreadDetail, setLoadingThreadDetail] = useState(false);
  const [threadDetailError, setThreadDetailError] = useState<string | null>(null);
  const [creatingThread, setCreatingThread] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [progressDraft, setProgressDraft] = useState<ProgressDraft>(defaultDraft);
  const [sendingProgress, setSendingProgress] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "AGENT";
  const preferredUserId = searchParams.get("userId");
  const preferredThreadId = searchParams.get("threadId");

  const loadThreads = async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoadingThreads(true);
    try {
      const data = await fetchThreads();
      setThreads(data);

      if (!data.length) {
        setSelectedThreadId("");
        setSelectedThread(null);
        setThreadDetailError(null);
        return;
      }

      const matchedByThreadId = preferredThreadId
        ? data.find((t) => t.id === preferredThreadId)
        : null;
      const matchedByUserId =
        isAdmin && preferredUserId
          ? data.find((t) => t.userId === preferredUserId && t.status === "OPEN") ||
            data.find((t) => t.userId === preferredUserId)
          : null;
      const existingSelection = selectedThreadId
        ? data.find((t) => t.id === selectedThreadId)
        : null;

      const next = existingSelection || matchedByThreadId || matchedByUserId || data[0];
      if (next) setSelectedThreadId(next.id);
    } catch (error) {
      console.error("Failed to load support threads:", error);
      if (!options?.silent) {
        toast.error("Failed to load support threads");
      }
    } finally {
      if (!options?.silent) setLoadingThreads(false);
    }
  };

  const loadThreadDetail = async (threadId: string, options?: { silent?: boolean }) => {
    if (!threadId) {
      setSelectedThread(null);
      setThreadDetailError(null);
      return;
    }

    if (!options?.silent) {
      setLoadingThreadDetail(true);
      setThreadDetailError(null);
    }
    try {
      const detail = await fetchThreadById(threadId);
      setSelectedThread(detail);
      setThreadDetailError(null);
    } catch (error) {
      console.error("Failed to load thread:", error);
      if (!options?.silent) {
        setSelectedThread(null);
        setThreadDetailError("Failed to load conversation");
        toast.error("Failed to load conversation");
      }
    } finally {
      if (!options?.silent) setLoadingThreadDetail(false);
    }
  };

  useEffect(() => {
    void loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedThreadId) return;
    void loadThreadDetail(selectedThreadId);
  }, [selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId) return;

    const intervalId = window.setInterval(() => {
      void loadThreadDetail(selectedThreadId, { silent: true });
      void loadThreads({ silent: true });
    }, 8_000);

    return () => {
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThreadId]);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    // Allow layout to settle so Radix ScrollArea viewport can measure correctly.
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
    shouldAutoScrollRef.current = false;
  }, [selectedThreadId, selectedThread?.messages?.length]);

  useEffect(() => {
    const latest = getLatestProgress(selectedThread);
    if (!latest) {
      setProgressDraft(defaultDraft);
      return;
    }
    setProgressDraft({
      appointmentPdf: latest.appointmentPdf,
      ds160: latest.ds160,
      materialCheck: latest.materialCheck,
      visaConsultation: latest.visaConsultation,
      note: latest.note || "",
    });
  }, [selectedThread]);

  const filteredThreads = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return threads;
    return threads.filter((thread) => {
      const userName = thread.user?.name?.toLowerCase() || "";
      const userEmail = thread.user?.email?.toLowerCase() || "";
      const subject = thread.subject?.toLowerCase() || "";
      const application = thread.applicationId?.toLowerCase() || "";
      return (
        userName.includes(query) ||
        userEmail.includes(query) ||
        subject.includes(query) ||
        application.includes(query)
      );
    });
  }, [searchText, threads]);

  const preferredUserThread = useMemo(
    () =>
      preferredUserId
        ? threads.find((t) => t.userId === preferredUserId && t.status === "OPEN") ||
          threads.find((t) => t.userId === preferredUserId)
        : null,
    [preferredUserId, threads],
  );

  const setProgressField = (
    field: keyof Omit<ProgressDraft, "note">,
    value: number,
  ) => {
    setProgressDraft((prev) => ({
      ...prev,
      [field]: clampPercent(value),
    }));
  };

  const resolveMessageIdentity = (message: NonNullable<ChatThread["messages"]>[number]): MessageIdentity => {
    const senderType = String(message.senderType || "").toUpperCase();
    const isSystem = senderType === "SYSTEM";
    const isTelegram = senderType === "TELEGRAM";
    const isFromCurrentUser = Boolean(user?.id && message.senderId && message.senderId === user.id);
    const senderIdMissing = !message.senderId;

    const isMine =
      !isSystem &&
      (isFromCurrentUser ||
        (senderIdMissing && !isAdmin && senderType === "USER") ||
        false);

    if (isMine) {
      return {
        isMine: true,
        isSystem: false,
        senderLabel: "You",
        senderRoleLabel: isAdmin ? "Admin" : "Client",
      };
    }

    if (isSystem) {
      return {
        isMine: false,
        isSystem: true,
        senderLabel: "System",
        senderRoleLabel: "System",
      };
    }

    if (isTelegram) {
      return {
        isMine: false,
        isSystem: false,
        senderLabel: "Telegram",
        senderRoleLabel: "Integration",
      };
    }

    if (senderType === "USER") {
      return {
        isMine: false,
        isSystem: false,
        senderLabel:
          selectedThread?.user?.name || selectedThread?.user?.email || "Client",
        senderRoleLabel: "Client",
      };
    }

    if (senderType === "ADMIN") {
      return {
        isMine: false,
        isSystem: false,
        senderLabel: "Support Team",
        senderRoleLabel: "Admin",
      };
    }

    return {
      isMine: false,
      isSystem: false,
      senderLabel: senderType || "Message",
      senderRoleLabel: "Unknown",
    };
  };

  const handleCreateThread = async () => {
    setCreatingThread(true);
    try {
      const thread = await createThread({
        subject: "Application Support",
      });
      toast.success("Support chat is ready");
      await loadThreads();
      setSelectedThreadId(thread.id);
    } catch (error) {
      console.error("Failed to create support thread:", error);
      toast.error("Failed to start support chat");
    } finally {
      setCreatingThread(false);
    }
  };

  const handleCreateThreadForUser = async (targetUserId: string) => {
    setCreatingThread(true);
    try {
      const thread = await createThread({
        userId: targetUserId,
        subject: "Admin Support Thread",
      });
      toast.success("Support thread created");
      await loadThreads();
      setSelectedThreadId(thread.id);
    } catch (error) {
      console.error("Failed to create user thread:", error);
      toast.error("Failed to create thread for user");
    } finally {
      setCreatingThread(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedThread || !messageText.trim()) return;
    setSendingMessage(true);
    try {
      await sendThreadMessage(selectedThread.id, messageText.trim());
      setMessageText("");
      shouldAutoScrollRef.current = true;
      await loadThreadDetail(selectedThread.id);
      await loadThreads();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendProgress = async () => {
    if (!isAdmin || !selectedThread) return;
    setSendingProgress(true);
    try {
      const payload: ProgressUpdatePayload = {
        type: "PROGRESS_UPDATE",
        applicationId: selectedThread.applicationId || undefined,
        appointmentPdf: clampPercent(progressDraft.appointmentPdf),
        ds160: clampPercent(progressDraft.ds160),
        materialCheck: clampPercent(progressDraft.materialCheck),
        visaConsultation: clampPercent(progressDraft.visaConsultation),
        note: progressDraft.note.trim() || undefined,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.name || user?.email || "Admin",
      };
      await sendThreadMessage(selectedThread.id, encodeProgressUpdate(payload), "SYSTEM");
      toast.success("Progress update sent to user inbox");
      shouldAutoScrollRef.current = true;
      await loadThreadDetail(selectedThread.id);
      await loadThreads();
    } catch (error) {
      console.error("Failed to send progress update:", error);
      toast.error("Failed to send progress update");
    } finally {
      setSendingProgress(false);
    }
  };

  const handleCloseThread = async () => {
    if (!selectedThread) return;
    try {
      await closeThread(selectedThread.id);
      toast.success("Thread closed");
      await loadThreads();
      await loadThreadDetail(selectedThread.id);
    } catch (error) {
      console.error("Failed to close thread:", error);
      toast.error("Failed to close thread");
    }
  };

  const renderProgressSnapshot = (progress: ProgressUpdatePayload, messageIdentity: MessageIdentity, createdAt: string) => (
    <div
      className={`rounded-lg border p-3 space-y-2 ${
        messageIdentity.isMine
          ? "bg-primary/10 border-primary/25"
          : "bg-secondary/50 border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-foreground">
          {messageIdentity.senderLabel} · {messageIdentity.senderRoleLabel}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {new Date(createdAt).toLocaleString()}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Progress updated {new Date(progress.updatedAt).toLocaleString()}
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Appointment PDF</p>
          <p className="font-medium">{progress.appointmentPdf}%</p>
        </div>
        <div>
          <p className="text-muted-foreground">DS-160</p>
          <p className="font-medium">{progress.ds160}%</p>
        </div>
        <div>
          <p className="text-muted-foreground">Material Check</p>
          <p className="font-medium">{progress.materialCheck}%</p>
        </div>
        <div>
          <p className="text-muted-foreground">Consultation</p>
          <p className="font-medium">{progress.visaConsultation}%</p>
        </div>
      </div>
      {progress.note && <p className="text-sm">{progress.note}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-8 space-y-6">
        <Link
          to={isAdmin ? "/admin/overview" : "/profile"}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAdmin ? "Back to Admin" : "Back to Profile"}
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-3">
              <MessageSquare className="w-7 h-7 text-primary" />
              {isAdmin ? "Support Inbox" : "Contact Support"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin
                ? "Message users directly and send live visa progress updates."
                : "Chat with our team and track live progress for your visa process."}
            </p>
          </div>
          {selectedThreadId && (
            <Button
                      variant="outline"
                      onClick={() => {
                        if (!selectedThreadId) return;
                        void loadThreadDetail(selectedThreadId);
                        void loadThreads();
                      }}
                    >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
          {!isAdmin && (
            <Button onClick={() => void handleCreateThread()} disabled={creatingThread}>
              {creatingThread ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              {threads.length ? "Open Support Chat" : "Start Support Chat"}
            </Button>
          )}
          {isAdmin && preferredUserId && (!preferredUserThread || preferredUserThread.status === "CLOSED") && (
            <Button
              onClick={() => void handleCreateThreadForUser(preferredUserId)}
              disabled={creatingThread}
            >
              {creatingThread ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              Create Thread For User
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
          <Card className="h-[42vh] md:h-[78vh] flex flex-col bg-card/70 backdrop-blur-sm border-border/70 shadow-sm">
            <CardHeader className="space-y-3">
              <CardTitle>{isAdmin ? "User Threads" : "Your Threads"}</CardTitle>
              <Input
                placeholder={isAdmin ? "Search by user/email/application" : "Search threads"}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              {loadingThreads ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading...
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="h-full rounded-lg border border-dashed border-border p-6 flex flex-col items-center justify-center text-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isAdmin
                      ? "No support threads yet."
                      : "No active support thread. Click Start Support Chat to create one."}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(42vh-130px)] md:h-[calc(78vh-130px)] pr-2">
                  <div className="space-y-2">
                    {filteredThreads.map((thread) => (
                      <button
                        key={thread.id}
                        onClick={() => {
                          shouldAutoScrollRef.current = true;
                          setSelectedThreadId(thread.id);
                        }}
                        className={`w-full text-left rounded-lg border p-3 transition-colors ${
                          selectedThreadId === thread.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-secondary/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">
                            {isAdmin
                              ? thread.user?.name || thread.user?.email || "User"
                              : thread.subject || "Support Request"}
                          </p>
                          <div className="flex items-center gap-2">
                            {Number(thread?._count?.messages || 0) > 0 && (
                              <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] leading-5 text-center">
                                {Number(thread?._count?.messages || 0) > 9 ? "9+" : Number(thread?._count?.messages || 0)}
                              </span>
                            )}
                            <Badge variant="outline" className={threadStatusVariant(thread.status)}>
                              {thread.status}
                            </Badge>
                          </div>
                        </div>
                        {isAdmin && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {thread.user?.email}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {thread.applicationId
                            ? `Application: ${thread.applicationId}`
                            : thread.subject || "General support"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(thread.updatedAt).toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="min-h-[60vh] md:h-[78vh] flex flex-col bg-card/70 backdrop-blur-sm border-border/70 shadow-sm">
            {!selectedThreadId ? (
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3" />
                  <p>Select a thread to start messaging.</p>
                </div>
              </CardContent>
            ) : loadingThreadDetail ? (
              <CardContent className="h-full flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading conversation...
              </CardContent>
            ) : threadDetailError ? (
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground space-y-3">
                  <XCircle className="w-10 h-10 mx-auto text-destructive" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{threadDetailError}</p>
                    <p className="text-sm text-muted-foreground">
                      Please try again. If this keeps happening, refresh the page.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!selectedThreadId) return;
                      void loadThreadDetail(selectedThreadId);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            ) : !selectedThread ? (
              <CardContent className="h-full flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading conversation...
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate">
                        {isAdmin
                          ? selectedThread.user?.name || selectedThread.user?.email || "User"
                          : selectedThread.subject || "Support Request"}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {selectedThread.applicationId
                          ? `Application ID: ${selectedThread.applicationId}`
                          : "General support thread"}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={threadStatusVariant(selectedThread.status)}>
                        {selectedThread.status}
                      </Badge>
                      {selectedThread.status !== "CLOSED" && (
                        <Button variant="outline" size="sm" onClick={handleCloseThread}>
                          <XCircle className="w-4 h-4 mr-1" />
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isAdmin && selectedThread.status !== "CLOSED" && (
                  <CardContent className="py-4 border-b border-border">
                    <div className="rounded-lg border border-border/70 p-4 space-y-4 bg-secondary/20 backdrop-blur-sm">
                      <p className="font-medium text-sm">Live Progress Controls</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Appointment PDF</span>
                            <span className="font-medium">{progressDraft.appointmentPdf}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={progressDraft.appointmentPdf}
                            onChange={(e) => setProgressField("appointmentPdf", Number(e.target.value))}
                            className="w-full accent-primary cursor-pointer"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>DS-160</span>
                            <span className="font-medium">{progressDraft.ds160}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={progressDraft.ds160}
                            onChange={(e) => setProgressField("ds160", Number(e.target.value))}
                            className="w-full accent-primary cursor-pointer"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Material Check</span>
                            <span className="font-medium">{progressDraft.materialCheck}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={progressDraft.materialCheck}
                            onChange={(e) => setProgressField("materialCheck", Number(e.target.value))}
                            className="w-full accent-primary cursor-pointer"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Visa Consultation</span>
                            <span className="font-medium">{progressDraft.visaConsultation}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={progressDraft.visaConsultation}
                            onChange={(e) => setProgressField("visaConsultation", Number(e.target.value))}
                            className="w-full accent-primary cursor-pointer"
                          />
                        </div>
                      </div>
                      <Textarea
                        value={progressDraft.note}
                        onChange={(e) =>
                          setProgressDraft((prev) => ({ ...prev, note: e.target.value }))
                        }
                        placeholder="Optional note for the user..."
                        rows={2}
                      />
                      <Button onClick={handleSendProgress} disabled={sendingProgress}>
                        {sendingProgress ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Send Progress Update
                      </Button>
                    </div>
                  </CardContent>
                )}

                <CardContent className="flex-1 min-h-0">
                  <ScrollArea className="h-full pr-2">
                    <div className="space-y-3 py-2">
                      {(selectedThread.messages || []).map((message) => {
                        const identity = resolveMessageIdentity(message);
                        const parsedProgress = decodeProgressUpdate(message.content);
                        if (parsedProgress) {
                          return (
                            <div key={message.id} className="max-w-full">
                              <div
                                className={`flex ${
                                  identity.isSystem
                                    ? "justify-center"
                                    : identity.isMine
                                      ? "justify-end"
                                      : "justify-start"
                                }`}
                              >
                                <div className={`w-full ${identity.isSystem ? "max-w-[92%]" : "max-w-[86%] md:max-w-[74%]"}`}>
                                  {renderProgressSnapshot(parsedProgress, identity, message.createdAt)}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              identity.isSystem ? "justify-center" : identity.isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[86%] md:max-w-[74%] rounded-xl px-3 py-2.5 border ${
                                identity.isSystem
                                  ? "bg-muted/60 border-border text-foreground"
                                  : identity.isMine
                                    ? "bg-primary text-primary-foreground border-primary/30 shadow-sm"
                                    : "bg-card/90 text-foreground border-border/70"
                              }`}
                            >
                              <div className={`text-[11px] mb-1 flex items-center gap-1 ${identity.isMine ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                                <UserCircle2 className="w-3 h-3" />
                                <span className="font-medium">{identity.senderLabel}</span>
                                <span>·</span>
                                <span>{identity.senderRoleLabel}</span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                              <p className={`text-[11px] mt-1 ${identity.isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                {new Date(message.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                <CardContent className="border-t border-border">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={
                        selectedThread.status === "CLOSED"
                          ? "Thread is closed"
                          : "Type your message..."
                      }
                      rows={2}
                      disabled={selectedThread.status === "CLOSED"}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={
                        sendingMessage ||
                        selectedThread.status === "CLOSED" ||
                        !messageText.trim()
                      }
                    >
                      {sendingMessage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
