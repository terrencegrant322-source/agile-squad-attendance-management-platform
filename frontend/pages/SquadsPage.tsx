import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import type { Squad, SquadMember } from "~backend/squad/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Users } from "lucide-react";

export function SquadsPage() {
  const backend = useBackend();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: squadsData } = useQuery({
    queryKey: ["squads"],
    queryFn: () => backend.squad.list(),
  });

  const { data: membersData } = useQuery({
    queryKey: ["squad-members", selectedSquad?.id],
    queryFn: () => backend.squad.listMembers({ squadId: selectedSquad!.id }),
    enabled: !!selectedSquad,
  });

  const createSquad = useMutation({
    mutationFn: (data: { name: string; description?: string; timezone: string }) =>
      backend.squad.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["squads"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Squad created successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to create squad:", error);
      toast({
        title: "Error",
        description: "Failed to create squad",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createSquad.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      timezone: formData.get("timezone") as string || "UTC",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Squads</h1>
          <p className="text-muted-foreground mt-1">Manage your agile squads</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Squad
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {squadsData?.squads.map((squad) => (
          <Card
            key={squad.id}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setSelectedSquad(squad)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {squad.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {squad.description || "No description"}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{squad.timezone}</span>
                <span>•</span>
                <span>{squad.workdays.join(", ")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Squad</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Squad Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" name="timezone" defaultValue="UTC" />
            </div>
            <Button type="submit" className="w-full">
              Create Squad
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedSquad} onOpenChange={() => setSelectedSquad(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSquad?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Details</h3>
              <p className="text-sm text-muted-foreground">
                {selectedSquad?.description || "No description"}
              </p>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Timezone:</span>{" "}
                {selectedSquad?.timezone}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Members</h3>
              {membersData?.members && membersData.members.length > 0 ? (
                <div className="space-y-2">
                  {membersData.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 border border-border rounded"
                    >
                      <div>
                        <div className="font-medium">{member.userName}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.userEmail}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.role}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No members yet</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
