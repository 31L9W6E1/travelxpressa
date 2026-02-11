import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
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
import { Progress } from "@/components/ui/progress";
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
  const [creatingThread, setCreatingThread] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [progressDraft, setProgressDraft] = useState<ProgressDraft>(defaultDraft);
  const [sendingProgress, setSendingProgress] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "AGENT";
  const preferredUserId = searchParams.get("userId");
  const preferredThreadId = searchParams.get("threadId");

  const loadThreads = async () => {
    setLoadingThreads(true);
    try {
      const data = await fetchThreads();
      setThreads(data);

      if (!data.length) {
        setSelectedThreadId("");
        setSelectedThread(null);
        return;
      }

      const matchedByThreadId = preferredThreadId
        ? data.find((t) => t.id === preferredThreadId)
        : null;
      const matchedByUserId =
        isAdmin && preferredUserId
          ? data.find((t) => t.userId === preferredUserId)
          : null;
      const existingSelection = selectedThreadId
        ? data.find((t) => t.id === selectedThreadId)
        : null;

      const next = existingSelection || matchedByThreadId || matchedByUserId || data[0];
      if (next) setSelectedThreadId(next.id);
    } catch (error) {
      console.error("Failed to load support threads:", error);
      toast.error("Failed to load support threads");
    } finally {
      setLoadingThreads(false);
    }
  };

  const loadThreadDetail = async (threadId: string) => {
    if (!threadId) {
      setSelectedThread(null);
      return;
    }

    setLoadingThreadDetail(true);
    try {
      const detail = await fetchThreadById(threadId);
      setSelectedThread(detail);
    } catch (error) {
      console.error("Failed to load thread:", error);
      toast.error("Failed to load conversation");
    } finally {
      setLoadingThreadDetail(false);
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
    () => (preferredUserId ? threads.find((t) => t.userId === preferredUserId) : null),
    [preferredUserId, threads],
  );

  const latestProgress = getLatestProgress(selectedThread);

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

  const renderProgressSnapshot = (progress: ProgressUpdatePayload) => (
    <div className="rounded-lg border border-border p-3 bg-secondary/40 space-y-2">
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Link
          to={isAdmin ? "/admin/overview" : "/profile"}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAdmin ? "Back to Admin" : "Back to Profile"}
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold flex items-center gap-3">
              <MessageSquare className="w-7 h-7 text-primary" />
              {isAdmin ? "Support Inbox" : "Contact Support"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin
                ? "Message users directly and send live visa progress updates."
                : "Chat with our team and track live progress for your visa process."}
            </p>
          </div>
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
          {isAdmin && preferredUserId && !preferredUserThread && (
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
          <Card className="h-[78vh] flex flex-col bg-card/70 backdrop-blur-sm border-border/70 shadow-sm">
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
                <ScrollArea className="h-[calc(78vh-130px)] pr-2">
                  <div className="space-y-2">
                    {filteredThreads.map((thread) => (
                      <button
                        key={thread.id}
                        onClick={() => setSelectedThreadId(thread.id)}
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
                          <Badge variant="outline" className={threadStatusVariant(thread.status)}>
                            {thread.status}
                          </Badge>
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

          <Card className="h-[78vh] flex flex-col bg-card/70 backdrop-blur-sm border-border/70 shadow-sm">
            {!selectedThreadId ? (
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3" />
                  <p>Select a thread to start messaging.</p>
                </div>
              </CardContent>
            ) : loadingThreadDetail || !selectedThread ? (
              <CardContent className="h-full flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading conversation...
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between gap-3">
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
                    <div className="flex items-center gap-2">
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

                <CardContent className="space-y-4 py-4 border-b border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground mb-1">Appointment PDF</p>
                      <Progress value={latestProgress?.appointmentPdf || 0} />
                      <p className="text-xs mt-1">{latestProgress?.appointmentPdf || 0}%</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground mb-1">DS-160</p>
                      <Progress value={latestProgress?.ds160 || 0} />
                      <p className="text-xs mt-1">{latestProgress?.ds160 || 0}%</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground mb-1">Material Check</p>
                      <Progress value={latestProgress?.materialCheck || 0} />
                      <p className="text-xs mt-1">{latestProgress?.materialCheck || 0}%</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground mb-1">Visa Consultation</p>
                      <Progress value={latestProgress?.visaConsultation || 0} />
                      <p className="text-xs mt-1">{latestProgress?.visaConsultation || 0}%</p>
                    </div>
                  </div>
                  {latestProgress?.note && (
                    <p className="text-sm text-muted-foreground">
                      Latest note: {latestProgress.note}
                    </p>
                  )}

                  {isAdmin && selectedThread.status !== "CLOSED" && (
                    <div className="rounded-lg border border-border/70 p-3 space-y-3 bg-secondary/20 backdrop-blur-sm">
                      <p className="font-medium text-sm">Send Live Progress Update</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={progressDraft.appointmentPdf}
                          onChange={(e) =>
                            setProgressDraft((prev) => ({
                              ...prev,
                              appointmentPdf: clampPercent(Number(e.target.value || 0)),
                            }))
                          }
                          placeholder="Appointment %"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={progressDraft.ds160}
                          onChange={(e) =>
                            setProgressDraft((prev) => ({
                              ...prev,
                              ds160: clampPercent(Number(e.target.value || 0)),
                            }))
                          }
                          placeholder="DS-160 %"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={progressDraft.materialCheck}
                          onChange={(e) =>
                            setProgressDraft((prev) => ({
                              ...prev,
                              materialCheck: clampPercent(Number(e.target.value || 0)),
                            }))
                          }
                          placeholder="Material %"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={progressDraft.visaConsultation}
                          onChange={(e) =>
                            setProgressDraft((prev) => ({
                              ...prev,
                              visaConsultation: clampPercent(Number(e.target.value || 0)),
                            }))
                          }
                          placeholder="Consult %"
                        />
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
                  )}
                </CardContent>

                <CardContent className="flex-1 min-h-0">
                  <ScrollArea className="h-[calc(78vh-520px)] pr-2">
                    <div className="space-y-3 py-2">
                      {(selectedThread.messages || []).map((message) => {
                        const parsedProgress = decodeProgressUpdate(message.content);
                        if (parsedProgress) {
                          return (
                            <div key={message.id} className="max-w-full">
                              {renderProgressSnapshot(parsedProgress)}
                            </div>
                          );
                        }

                        const isMine =
                          message.senderId === user?.id ||
                          (isAdmin ? message.senderType === "ADMIN" : message.senderType === "USER");

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                isMine
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary/70 text-secondary-foreground border border-border/60"
                              }`}
                            >
                              {!isMine && isAdmin && (
                                <div className="text-[11px] opacity-80 mb-1 flex items-center gap-1">
                                  <UserCircle2 className="w-3 h-3" />
                                  {message.senderType}
                                </div>
                              )}
                              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                              <p className="text-[11px] mt-1 opacity-80">
                                {new Date(message.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>

                <CardContent className="border-t border-border">
                  <div className="flex gap-2">
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
