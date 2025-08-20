"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubmitButton({ pending }: { pending: boolean }) {

  return (
    <Button type="submit" disabled={pending} className="w-full bg-primary hover:bg-primary/90">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </>
      ) : (
        "Upload to Gallery"
      )}
    </Button>
  );
}
