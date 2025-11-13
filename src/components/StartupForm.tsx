"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useActionState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { clientFormSchema as formSchema } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { createPitch } from "@/lib/actions";

type FormState = { error: string; status: "INITIAL" | "SUCCESS" | "ERROR" };

const StartupForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleFormSubmit = async (prevState: FormState, formData: FormData): Promise<FormState & { _id?: string }> => {
    try {
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        link: formData.get("link") as string,
        pitch,
      };

      await formSchema.parseAsync(formValues);

      const result = await createPitch(prevState, formData, pitch);

      if (result.status === "SUCCESS") {
        setErrors({});
        setPitch("");
        toast({
          title: "Success",
          description: "Your startup pitch has been created successfully",
        });

        router.push(`/startup/${result._id}`);
      }

      return result as FormState & { _id?: string };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const normalized = error.issues.reduce((acc, issue) => {
          const key = (issue.path?.[0] ?? "") as string;
          if (key) acc[key] = issue.message;
          return acc;
        }, {} as Record<string, string>);
        setErrors(normalized);

        toast({
          title: "Error",
          description: "Please check your inputs and try again",
          variant: "destructive",
        });

        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }

      toast({
        title: "Error",
        description: "An unexpected error has occurred",
        variant: "destructive",
      });

      return {
        ...prevState,
        error: "An unexpected error has occurred",
        status: "ERROR",
      };
    }
  };

  const [_state, formAction, isPending] = useActionState<FormState, FormData>(
    handleFormSubmit,
    {
      error: "",
      status: "INITIAL",
    },
  );

  return (
    <form action={formAction} className="startup-form">
      <div>
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Startup Title"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "error-title" : undefined}
        />

        {errors.title && (
          <p id="error-title" className="startup-form_error">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_textarea"
          required
          placeholder="Startup Description"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "error-description" : undefined}
        />

        {errors.description && (
          <p id="error-description" className="startup-form_error">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Input
          id="category"
          name="category"
          className="startup-form_input"
          required
          placeholder="Startup Category (Tech, Health, Education...)"
          aria-invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? "error-category" : undefined}
        />

        {errors.category && (
          <p id="error-category" className="startup-form_error">{errors.category}</p>
        )}
      </div>

      <div>
        <label htmlFor="link" className="startup-form_label">
          Image URL
        </label>
        <Input
          id="link"
          name="link"
          className="startup-form_input"
          required
          placeholder="Startup Image URL"
          type="url"
          inputMode="url"
          aria-invalid={Boolean(errors.link)}
          aria-describedby={errors.link ? "error-link" : undefined}
        />

        {errors.link && <p id="error-link" className="startup-form_error">{errors.link}</p>}
      </div>

      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>

        <MDEditor
          value={pitch}
          onChange={(value) => setPitch(value as string)}
          id="pitch"
          preview="edit"
          height={300}
          style={{ borderRadius: 20, overflow: "hidden" }}
          textareaProps={{
            placeholder:
              "Briefly describe your idea and what problem it solves",
            disabled: isPending,
            readOnly: isPending,
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
          data-disable-transition
        />

        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>

      <Button
        type="submit"
        className="startup-form_btn text-white"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit Your Pitch"}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
};

export default StartupForm;