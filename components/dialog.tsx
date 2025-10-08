import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function NewPostDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ New Post</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Compose</DialogTitle>
        </DialogHeader>
        {/* composer fields go here */}
      </DialogContent>
    </Dialog>
  );
}
