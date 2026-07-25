import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Save, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { resultApi } from "@/services/resultApi";
import type { GradeBoundary } from "@/services/resultApi";

function AdminGradeBoundariesComponent() {
  const queryClient = useQueryClient();
  const [boundaries, setBoundaries] = useState<GradeBoundary[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "grade-boundaries"],
    queryFn: () => resultApi.getGradeBoundaries(),
  });

  useEffect(() => {
    if (data) setBoundaries(data);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (data: GradeBoundary[]) => resultApi.updateGradeBoundaries(data),
    onSuccess: () => {
      toast.success("Grade boundaries updated");
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "grade-boundaries"] });
    },
    onError: () => toast.error("Failed to update grade boundaries"),
  });

  const updateBoundary = (index: number, field: keyof GradeBoundary, value: string | number | boolean) => {
    const updated = [...boundaries];
    (updated[index] as any)[field] = value;
    setBoundaries(updated);
    setHasChanges(true);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh] text-destructive gap-2"><AlertCircle className="h-5 w-5" />Failed to load grade boundaries</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Grade Boundaries</h2>
          <p className="text-sm text-muted-foreground">Configure grade ranges, points, and pass/fail criteria</p>
        </div>
        <Button className="bg-gradient-brand border-0" disabled={!hasChanges || updateMutation.isPending} onClick={() => updateMutation.mutate(boundaries)}>
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Min %</TableHead>
                <TableHead>Max %</TableHead>
                <TableHead>Grade Point</TableHead>
                <TableHead>Pass</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boundaries.map((b, i) => (
                <TableRow key={b.id || i}>
                  <TableCell>
                    <Input
                      value={b.name}
                      onChange={(e) => updateBoundary(i, "name", e.target.value)}
                      className="h-8 w-16 font-bold"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={b.min_percentage}
                      onChange={(e) => updateBoundary(i, "min_percentage", parseFloat(e.target.value) || 0)}
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={b.max_percentage}
                      onChange={(e) => updateBoundary(i, "max_percentage", parseFloat(e.target.value) || 0)}
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={b.grade_point}
                      onChange={(e) => updateBoundary(i, "grade_point", parseFloat(e.target.value) || 0)}
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={b.is_pass ? "text-success" : "text-destructive"}
                      onClick={() => updateBoundary(i, "is_pass", !b.is_pass)}
                    >
                      {b.is_pass ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={b.remarks}
                      onChange={(e) => updateBoundary(i, "remarks", e.target.value)}
                      className="h-8 w-32"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes. Click "Save Changes" to apply them.
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Grade Boundary Preview</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {boundaries.sort((a, b) => b.max_percentage - a.max_percentage).map((b) => (
              <Badge key={b.name} variant={b.is_pass ? "default" : "destructive"} className="text-xs px-3 py-1">
                {b.name} ({b.min_percentage}-{b.max_percentage}%) — {b.grade_point} GP
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/admin/results/grade-boundaries")({
  head: () => ({ meta: [{ title: "Grade Boundaries — Admin" }] }),
  component: AdminGradeBoundariesComponent,
});