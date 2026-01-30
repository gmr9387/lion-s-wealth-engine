import { useState } from "react";
import { Shield, Check, X, Clock, AlertTriangle, Crown, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAdminApprovals } from "@/hooks/useAdminApprovals";
import { cn } from "@/lib/utils";

export default function Admin() {
  const {
    approvals,
    disputes,
    loading,
    approving,
    fetchApprovals,
    approveItem,
    rejectItem,
  } = useAdminApprovals();

  const [notes, setNotes] = useState<Record<string, string>>({});

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const pendingDisputes = disputes.filter((d) => d.status === "pending_review");

  const handleApprove = async (id: string, type: "approval" | "dispute") => {
    await approveItem(id, type, notes[id]);
    setNotes((prev) => ({ ...prev, [id]: "" }));
  };

  const handleReject = async (id: string, type: "approval" | "dispute") => {
    await rejectItem(id, type, notes[id]);
    setNotes((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve pending requests
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchApprovals} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-warning" />
              <span className="text-2xl font-bold">{pendingApprovals.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disputes to Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{pendingDisputes.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-2xl font-bold">
                {pendingApprovals.length + pendingDisputes.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals" className="gap-2">
            <Crown className="w-4 h-4" />
            Million Mode Requests
            {pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="disputes" className="gap-2">
            <FileText className="w-4 h-4" />
            Dispute Reviews
            {pendingDisputes.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingDisputes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading approvals...
              </CardContent>
            </Card>
          ) : pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Check className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">No pending Million Mode requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingApprovals.map((approval) => (
              <Card key={approval.id} className="border-warning/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-warning" />
                        Million Mode Activation
                      </CardTitle>
                      <CardDescription>
                        Requested {new Date(approval.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-warning text-warning">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">User ID:</span>
                      <p className="font-mono text-xs mt-1">{approval.requested_by}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Action ID:</span>
                      <p className="font-mono text-xs mt-1">{approval.action_id || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Admin Notes (optional)
                    </label>
                    <Textarea
                      placeholder="Add notes about this decision..."
                      value={notes[approval.id] || ""}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [approval.id]: e.target.value }))
                      }
                      className="resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => handleApprove(approval.id, "approval")}
                      disabled={approving === approval.id}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(approval.id, "approval")}
                      disabled={approving === approval.id}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading disputes...
              </CardContent>
            </Card>
          ) : pendingDisputes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Check className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">No disputes awaiting review</p>
              </CardContent>
            </Card>
          ) : (
            pendingDisputes.map((dispute) => (
              <Card key={dispute.id} className="border-primary/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Dispute Review
                      </CardTitle>
                      <CardDescription>
                        {dispute.bureau.toUpperCase()} • {dispute.reason}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">User ID:</span>
                      <p className="font-mono text-xs mt-1">{dispute.user_id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p className="mt-1">{new Date(dispute.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {dispute.letter_content && (
                    <div>
                      <span className="text-sm text-muted-foreground mb-2 block">
                        Dispute Letter Preview
                      </span>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm max-h-32 overflow-y-auto">
                        {dispute.letter_content.substring(0, 300)}...
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Admin Notes (optional)
                    </label>
                    <Textarea
                      placeholder="Add notes about this decision..."
                      value={notes[dispute.id] || ""}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [dispute.id]: e.target.value }))
                      }
                      className="resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => handleApprove(dispute.id, "dispute")}
                      disabled={approving === dispute.id}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve & Submit
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(dispute.id, "dispute")}
                      disabled={approving === dispute.id}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
