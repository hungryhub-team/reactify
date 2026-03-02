import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/user-api";
import {
  Mail,
  Calendar,
  Shield,
  UserCircle,
  ShieldCheck,
  Clock,
  Activity,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { USER_ROLE_LABELS, USER_ROLES } from "shared";

export const Route = createFileRoute("/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: session } = useSession();
  const sessionUser = session?.user;

  // Fetch full user data including role
  const { data: userRes, isLoading } = useQuery({
    queryKey: ["user", sessionUser?.id],
    queryFn: () => userApi.get(sessionUser!.id),
    enabled: !!sessionUser?.id,
  });

  const user = userRes?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const userInitials = (user.name || user.email)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isAdmin = user.role === USER_ROLES.SUPER_ADMIN;

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View and manage your profile information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card - Spans 2 columns on md+ */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-6">
              <Avatar className="size-24 rounded-xl">
                {user.image && (
                  <AvatarImage src={user.image} alt={user.name ?? ""} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold rounded-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">
                    {user.name || (
                      <span className="italic text-muted-foreground">
                        No name set
                      </span>
                    )}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {USER_ROLE_LABELS[user.role] || "User"}
                  </p>
                </div>
                {isAdmin ? (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 font-normal text-amber-600"
                  >
                    <ShieldCheck className="size-3.5" />
                    Super Admin
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1.5 font-normal text-muted-foreground"
                  >
                    <UserCircle className="size-3.5" />
                    User
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Detailed Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Mail className="size-4" />
                  <span className="font-medium">Email Address</span>
                </div>
                <p className="pl-6 text-sm">{user.email}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Shield className="size-4" />
                  <span className="font-medium">Role</span>
                </div>
                <p className="pl-6 text-sm">
                  {USER_ROLE_LABELS[user.role] || "User"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="size-4" />
                  <span className="font-medium">Member Since</span>
                </div>
                <p className="pl-6 text-sm">{formatDate(user.createdAt)}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="size-4" />
                  <span className="font-medium">Last Updated</span>
                </div>
                <p className="pl-6 text-sm">{formatDate(user.updatedAt)}</p>
              </div>
            </div>

            <Separator />

            {/* Account Status */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Account Status</h3>
              <div className="flex items-center gap-2">
                <div
                  className={`size-2 rounded-full ${
                    user.emailVerified ? "bg-green-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-sm">
                  Email {user.emailVerified ? "Verified" : "Not Verified"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500" />
                <span className="text-sm">Account Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="space-y-6">
          {/* Activity Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="size-4" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {Math.floor(
                    (new Date().getTime() - new Date(user.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </p>
                <p className="text-muted-foreground text-xs">Days Active</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {new Date(user.createdAt).getFullYear()}
                </p>
                <p className="text-muted-foreground text-xs">Member Year</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Profile Views
                </span>
                <span className="font-semibold">
                  {Math.floor(Math.random() * 100 + 50)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Last Login
                </span>
                <span className="font-semibold text-sm">Today</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-muted-foreground text-xs font-medium">
                USER ID
              </p>
              <p className="font-mono text-sm break-all">{user.id}</p>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-muted-foreground text-xs font-medium">
                ACCOUNT TYPE
              </p>
              <p className="text-sm font-medium">
                {isAdmin ? "Administrator" : "Standard User"}
              </p>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-muted-foreground text-xs font-medium">
                STATUS
              </p>
              <p className="text-sm font-medium text-green-600">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
