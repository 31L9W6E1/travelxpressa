import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  deleteAdminInquiry,
  fetchAdminInquiries,
  type InquiryItem,
  type InquiryStatus,
  updateAdminInquiryStatus,
} from "@/api/inquiries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const statusOptions: InquiryStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
];

const getBadgeClass = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/15 text-amber-700 border-amber-500/30";
    case "IN_PROGRESS":
      return "bg-blue-500/15 text-blue-700 border-blue-500/30";
    case "APPROVED":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
    case "COMPLETED":
      return "bg-green-500/15 text-green-700 border-green-500/30";
    case "REJECTED":
      return "bg-red-500/15 text-red-700 border-red-500/30";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
};

const parseMessageLines = (message: string) => {
  const lines = message.split("\n");
  const fields: Record<string, string> = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) continue;
    fields[key.trim().toLowerCase()] = rest.join(":").trim();
  }
  return fields;
};

type UploadedFile = {
  label: string;
  url: string;
};

const extractUrls = (value: string): string[] => {
  const matches = value.match(/https?:\/\/[^\s)]+/gi);
  const urls = matches ? [...matches] : [];
  const relativeMatches = value.match(/\/uploads\/[^\s)]+/gi);
  if (relativeMatches) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    for (const relative of relativeMatches) {
      urls.push(origin ? `${origin}${relative}` : relative);
    }
  }
  return urls;
};

const parseUploadedFileLine = (line: string): UploadedFile | null => {
  const urls = extractUrls(line);
  if (!urls.length) return null;
  const url = urls[0];
  const label = line.replace(url, "").replace(/:\s*$/, "").trim();
  return {
    label: label || "Uploaded file",
    url,
  };
};

const extractUploadedFiles = (message: string): UploadedFile[] => {
  const lines = message.split("\n");
  const files: UploadedFile[] = [];
  let inUploadedFilesSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const lower = line.toLowerCase();

    if (lower.startsWith("uploaded files:")) {
      inUploadedFilesSection = true;
      const inline = line.slice("uploaded files:".length).trim();
      if (inline && inline !== "-") {
        const parsed = parseUploadedFileLine(inline);
        if (parsed) files.push(parsed);
      }
      continue;
    }

    if (inUploadedFilesSection && /^[a-z][\w\s-]*:/i.test(line) && !line.startsWith("-")) {
      break;
    }

    if (!inUploadedFilesSection || !line || line === "-") continue;

    const normalizedLine = line.startsWith("-") ? line.slice(1).trim() : line;
    const parsed = parseUploadedFileLine(normalizedLine);
    if (parsed) {
      files.push(parsed);
    }
  }

  return files;
};

const TranslationRequestsPanel = () => {
  const [requests, setRequests] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Record<string, { status: string; notes: string }>>({});
  const [collapsedById, setCollapsedById] = useState<Record<string, boolean>>({});
  const [savingId, setSavingId] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string>("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminInquiries({
        page: 1,
        limit: 100,
        sortOrder: "desc",
        serviceType: "TRANSLATION_SERVICE",
        status: statusFilter === "all" ? undefined : (statusFilter as InquiryStatus),
      });
      setRequests(res.data);
      setEditing((prev) => {
        const next = { ...prev };
        for (const row of res.data) {
          if (!next[row.id]) {
            next[row.id] = { status: row.status, notes: row.adminNotes || "" };
          }
        }
        return next;
      });
      setCollapsedById((prev) => {
        const next = { ...prev };
        for (const row of res.data) {
          if (typeof next[row.id] === "undefined") {
            next[row.id] = row.status === "COMPLETED";
          }
        }
        return next;
      });
    } catch (error) {
      console.error("Failed to load translation requests", error);
      toast.error("Failed to load translation requests");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const saveStatus = async (request: InquiryItem) => {
    const row = editing[request.id];
    if (!row) return;
    setSavingId(request.id);
    try {
      await updateAdminInquiryStatus(request.id, {
        status: row.status,
        adminNotes: row.notes,
      });
      toast.success("Request updated");
      await loadRequests();
    } catch (error) {
      console.error("Failed to update translation request", error);
      toast.error("Failed to update request");
    } finally {
      setSavingId("");
    }
  };

  const setCollapsed = (id: string, collapsed: boolean) => {
    setCollapsedById((prev) => ({ ...prev, [id]: collapsed }));
  };

  const markCompleted = async (request: InquiryItem, notes: string) => {
    setEditing((prev) => ({
      ...prev,
      [request.id]: {
        status: "COMPLETED",
        notes: prev[request.id]?.notes || request.adminNotes || "",
      },
    }));

    setSavingId(request.id);
    try {
      await updateAdminInquiryStatus(request.id, {
        status: "COMPLETED",
        adminNotes: notes,
      });
      setCollapsed(request.id, true);
      toast.success("Request marked as completed");
      await loadRequests();
    } catch (error) {
      console.error("Failed to mark translation request completed", error);
      toast.error("Failed to update request");
    } finally {
      setSavingId("");
    }
  };

  const removeRequest = async (request: InquiryItem) => {
    const confirmed = window.confirm(
      `Delete translation request from ${request.name} (${request.email})? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(request.id);
    try {
      await deleteAdminInquiry(request.id);
      toast.success("Translation request removed");
      setRequests((prev) => prev.filter((item) => item.id !== request.id));
      setEditing((prev) => {
        const next = { ...prev };
        delete next[request.id];
        return next;
      });
      setCollapsedById((prev) => {
        const next = { ...prev };
        delete next[request.id];
        return next;
      });
    } catch (error) {
      console.error("Failed to delete translation request", error);
      toast.error("Failed to remove request");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Translation Requests
            </CardTitle>
            <CardDescription>
              User-linked requests for document translation (25,000-40,000 MNT per page)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => void loadRequests()}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading translation requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center border rounded-lg">
            No translation requests found.
          </div>
        ) : (
          requests.map((request) => {
            const parsed = parseMessageLines(request.message || "");
            const uploadedFiles = extractUploadedFiles(request.message || "");
            const manualFileLinks = extractUrls(parsed["file links"] || "");
            const row = editing[request.id] || { status: request.status, notes: request.adminNotes || "" };
            const isCollapsed = collapsedById[request.id] ?? request.status === "COMPLETED";

            return (
              <div key={request.id} className="border rounded-xl p-4 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{request.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{request.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getBadgeClass(request.status)}>{request.status}</Badge>
                    {request.status !== "COMPLETED" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void markCompleted(request, row.notes)}
                        disabled={savingId === request.id}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    ) : null}
                    {request.user?.id ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/contactsupport?userId=${request.user.id}`}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Open Chat
                        </Link>
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCollapsed(request.id, !isCollapsed)}
                    >
                      {isCollapsed ? (
                        <>
                          <ChevronRight className="w-4 h-4 mr-1" />
                          Expand
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Collapse
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => void removeRequest(request)}
                      disabled={deletingId === request.id}
                    >
                      {deletingId === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {isCollapsed ? (
                  <p className="text-sm text-muted-foreground">
                    Completed request is collapsed. Click <span className="font-medium">Expand</span> to view details.
                  </p>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="rounded-lg border p-2">
                        <p className="text-xs text-muted-foreground">Source</p>
                        <p className="font-medium">{parsed["source language"] || "-"}</p>
                      </div>
                      <div className="rounded-lg border p-2">
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="font-medium">{parsed["target language"] || "-"}</p>
                      </div>
                      <div className="rounded-lg border p-2">
                        <p className="text-xs text-muted-foreground">Pages</p>
                        <p className="font-medium">{parsed["pages"] || "-"}</p>
                      </div>
                      <div className="rounded-lg border p-2">
                        <p className="text-xs text-muted-foreground">Estimated Fee</p>
                        <p className="font-medium">{parsed["estimated fee"] || "-"}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Uploaded Files</Label>
                      {uploadedFiles.length > 0 ? (
                        <div className="space-y-1">
                          {uploadedFiles.map((file, index) => (
                            <a
                              key={`${request.id}-uploaded-${index}`}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-primary hover:underline break-all"
                            >
                              {file.label}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm break-all">-</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">File Links</Label>
                      {manualFileLinks.length > 0 ? (
                        <div className="space-y-1">
                          {manualFileLinks.map((url, index) => (
                            <a
                              key={`${request.id}-manual-${index}`}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-primary hover:underline break-all"
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm break-all">{parsed["file links"] || "-"}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-3 items-end">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={row.status}
                          onValueChange={(value) =>
                            setEditing((prev) => ({ ...prev, [request.id]: { ...row, status: value } }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Admin Notes</Label>
                        <Textarea
                          rows={2}
                          value={row.notes}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [request.id]: { ...row, notes: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <Button
                        onClick={() => void saveStatus(request)}
                        disabled={savingId === request.id}
                      >
                        {savingId === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationRequestsPanel;
