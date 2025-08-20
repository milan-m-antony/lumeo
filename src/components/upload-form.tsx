"use client";

import React, { useEffect, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

import { uploadFile, type FormState } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SubmitButton } from "./submit-button";

const initialState: FormState = {
  message: "",
  success: false,
};

export default function UploadForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, setIsPending] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    const result = await uploadFile(initialState, formData);
    setState(result);
    setIsPending(false);
  };
  
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Success!",
          description: state.message,
        });
        formRef.current?.reset();
        setState(initialState);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
        <CardDescription>
          Select a photo or video to send to your Telegram gallery.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <div className="flex items-center gap-4">
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <Input id="file" name="file" type="file" required accept="image/*,video/*" />
            </div>
            {state.errors?.file && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.file[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Input
              id="caption"
              name="caption"
              type="text"
              placeholder="e.g., A beautiful sunset"
            />
             {state.errors?.caption && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.caption[0]}
              </p>
            )}
          </div>
          <SubmitButton pending={isPending} />
        </form>
      </CardContent>
    </Card>
  );
}
