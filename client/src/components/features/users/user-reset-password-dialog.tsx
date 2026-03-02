import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DEFAULT_USER_PASSWORD } from "shared";

type UserResetPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isResetting: boolean;
  userName?: string;
};

export function UserResetPasswordDialog({
  open,
  onOpenChange,
  onConfirm,
  isResetting,
  userName,
}: UserResetPasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Are you sure you want to reset the password for{" "}
            <span className="font-medium text-foreground">
              "{userName}"
            </span>
            ? The password will be set to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
              {DEFAULT_USER_PASSWORD}
            </code>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isResetting}>
            {isResetting && <Loader2 className="size-4 animate-spin" />}
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
