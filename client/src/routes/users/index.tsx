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
  Loader2,
  Users,
  Mail,
  ShieldCheck,
  UserCircle,
  KeyRound,
} from "lucide-react";
import type { User, UserCreate, UserUpdate } from "shared";
import { USER_ROLE_LABELS, USER_ROLES } from "shared";
import { userApi } from "@/lib/user-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { UserFormDialog } from "@/components/features/users/user-form-dialog";
import { UserDeleteDialog } from "@/components/features/users/user-delete-dialog";
import { UserResetPasswordDialog } from "@/components/features/users/user-reset-password-dialog";

export const Route = createFileRoute("/users/")({
  component: UsersPage,
});

function UsersPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilterValue, setRoleFilterValue] = useState<string | undefined>(undefined);
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  // Fetch users
  const {
    data: usersRes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", searchQuery, roleFilter, currentPage, pageSize],
    queryFn: () => {
      const role = roleFilter && roleFilter !== "all" ? Number.parseInt(roleFilter) : undefined;
      return userApi.list(searchQuery, role, currentPage, pageSize);
    },
  });

  const users = usersRes?.data ?? [];
  const pagination = usersRes?.pagination;

  // Handler untuk button Search
  function handleSearch() {
    setSearchQuery(searchValue);
    setRoleFilter(roleFilterValue);
    setCurrentPage(1); // Reset to page 1 when searching
  }

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: UserCreate) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setFormOpen(false);
      toast.success("User created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create user", { description: error.message });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate }) =>
      userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      toast.success("User updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update user", { description: error.message });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeletingUser(null);
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete user", { description: error.message });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => userApi.resetPassword(id),
    onSuccess: () => {
      setResettingUser(null);
      toast.success("Password reset to default");
    },
    onError: (error) => {
      toast.error("Failed to reset password", { description: error.message });
    },
  });

  function handleCreate(data: UserCreate) {
    createMutation.mutate(data);
  }

  function handleUpdate(data: UserCreate) {
    if (!editingUser) return;
    updateMutation.mutate({
      id: editingUser.id,
      data: { name: data.name, role: data.role },
    });
  }

  function handleDelete() {
    if (!deletingUser) return;
    deleteMutation.mutate(deletingUser.id);
  }

  function handleResetPassword() {
    if (!resettingUser) return;
    resetPasswordMutation.mutate(resettingUser.id);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getUserInitials(user: User) {
    const name = user.name || user.email;
    return name
      .split(/[\s@]/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts — create, view, update, and delete.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Add User
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex w-full items-center gap-2 my-2 max-w-2xl mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="pl-9"
          />
        </div>
        <Select value={roleFilterValue} onValueChange={setRoleFilterValue}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value={USER_ROLES.SUPER_ADMIN.toString()}>
              {USER_ROLE_LABELS[USER_ROLES.SUPER_ADMIN]}
            </SelectItem>
            <SelectItem value={USER_ROLES.USER.toString()}>
              {USER_ROLE_LABELS[USER_ROLES.USER]}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load users: {(error as Error).message}
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Users className="size-12 mb-3 opacity-40" />
          <p className="text-sm font-medium">No users found</p>
          <p className="text-xs">
            {!searchQuery
              ? 'Click "Add User" to create your first user.'
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableHead className="w-[30%]">User</TableHead>
              <TableHead className="w-[25%]">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        {user.image && (
                          <AvatarImage src={user.image} alt={user.name ?? ""} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {user.name || (
                          <span className="italic text-muted-foreground opacity-50">
                            No name
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="size-3.5" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === 1 ? (
                      <Badge
                        variant="secondary"
                        className="gap-1 font-normal text-amber-600"
                      >
                        <ShieldCheck className="size-3" />
                        {USER_ROLE_LABELS[user.role]}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 font-normal text-muted-foreground"
                      >
                        <UserCircle className="size-3" />
                        {USER_ROLE_LABELS[user.role] ?? "Unknown"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditingUser(user)}
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
                            onClick={() => setResettingUser(user)}
                          >
                            <KeyRound className="size-3.5 text-amber-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reset Password</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeletingUser(user)}
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>
            {" - "}
            <span className="font-medium text-foreground">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>
            {" of "}
            <span className="font-medium text-foreground">{pagination.total}</span>
            {" user"}
            {pagination.total === 1 ? "" : "s"}
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Create Dialog */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <UserFormDialog
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
        user={editingUser}
      />

      {/* Delete Dialog */}
      <UserDeleteDialog
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        userName={deletingUser?.name || deletingUser?.email}
      />

      {/* Reset Password Dialog */}
      <UserResetPasswordDialog
        open={!!resettingUser}
        onOpenChange={(open) => {
          if (!open) setResettingUser(null);
        }}
        onConfirm={handleResetPassword}
        isResetting={resetPasswordMutation.isPending}
        userName={resettingUser?.name || resettingUser?.email}
      />
    </div>
  );
}
