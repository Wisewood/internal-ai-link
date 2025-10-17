import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { toast } from "sonner";

interface SettingsDialogProps {
  webhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
}

const SettingsDialog = ({ webhookUrl, onWebhookUrlChange }: SettingsDialogProps) => {
  const [tempUrl, setTempUrl] = useState(webhookUrl);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTempUrl(webhookUrl);
  }, [webhookUrl]);

  const handleSave = () => {
    if (!tempUrl.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }
    onWebhookUrlChange(tempUrl);
    toast.success("Webhook URL saved successfully");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your n8n webhook URL to connect your chat to the backend.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">n8n Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://your-n8n-instance.com/webhook/..."
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the webhook URL from your n8n workflow. The chat will send messages to this endpoint.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
