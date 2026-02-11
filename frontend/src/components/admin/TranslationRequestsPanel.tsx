import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FileText, Loader2, MessageSquare, RefreshCw } from "lucide-react";
import {
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

const TranslationRequestsPanel = () => {
  const [requests, setRequests] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Record<string, { status: string; notes: string }>>({});
  const [savingId, setSavingId] = useState<string>("");

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
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
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
            const row = editing[request.id] || { status: request.status, notes: request.adminNotes || "" };
            return (
              <div key={request.id} className="border rounded-xl p-4 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{request.name}</p>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getBadgeClass(request.status)}>{request.status}</Badge>
                    {request.user?.id && (
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/contactsupport?userId=${request.user.id}`}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Open Chat
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

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
                  <Label className="text-xs text-muted-foreground">File Links</Label>
                  <p className="text-sm break-all">{parsed["file links"] || "-"}</p>
                </div>

                <div className="grid md:grid-cols-[220px_1fr_auto] gap-3 items-end">
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
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationRequestsPanel;
