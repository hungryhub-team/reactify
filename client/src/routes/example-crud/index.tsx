import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CalendarDays,
  Loader2,
  ClipboardList,
} from "lucide-react";
import type { Task, TaskCreate } from "shared";
import { taskApi } from "@/lib/task-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaskFormDialog } from "@/components/features/tasks/task-form-dialog";
import { TaskDeleteDialog } from "@/components/features/tasks/task-delete-dialog";

export const Route = createFileRoute("/example-crud/")({
  component: ExampleCrudPage,
});

function ExampleCrudPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Fetch tasks
  const {
    data: tasksRes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks", searchQuery],
    queryFn: () => taskApi.list(searchQuery),
  });

  const tasks = tasksRes?.data ?? [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TaskCreate) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setFormOpen(false);
      toast.success("Task created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create task", { description: error.message });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskCreate }) =>
      taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTask(null);
      toast.success("Task updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update task", { description: error.message });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setDeletingTask(null);
      toast.success("Task deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete task", { description: error.message });
    },
  });

  function handleCreate(data: TaskCreate) {
    createMutation.mutate(data);
  }

  function handleUpdate(data: TaskCreate) {
    if (!editingTask) return;
    updateMutation.mutate({ id: editingTask.id, data });
  }

  function handleDelete() {
    if (!deletingTask) return;
    deleteMutation.mutate(deletingTask.id);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Example CRUD</h1>
          <p className="text-muted-foreground">
            Manage your tasks — create, read, update, and delete.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Add Task
        </Button>
      </div>

      {/* Search */}
      <div className="flex w-full items-center space-x-2 my-2 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearchQuery(searchValue);
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setSearchQuery(searchValue)}>
          Search
        </Button>
      </div>

      {/* Info */}
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{tasks.length}</span>{" "}
        task{tasks.length === 1 ? "" : "s"}
      </p>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load tasks: {(error as Error).message}
          </p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ClipboardList className="size-12 mb-3 opacity-40" />
          <p className="text-sm font-medium">No tasks found</p>
          <p className="text-xs">
            {!searchQuery
              ? 'Click "Add Task" to create your first task.'
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Title</TableHead>
                <TableHead className="w-[30%]">Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {task.description || (
                      <span className="italic opacity-50">No description</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <CalendarDays className="size-3" />
                      {formatDate(task.date)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setEditingTask(task);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeletingTask(task)}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Dialog */}
      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <TaskFormDialog
        open={!!editingTask}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null);
        }}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
        task={editingTask}
      />

      {/* Delete Dialog */}
      <TaskDeleteDialog
        open={!!deletingTask}
        onOpenChange={(open) => {
          if (!open) setDeletingTask(null);
        }}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        taskTitle={deletingTask?.title}
      />
    </div>
  );
}
