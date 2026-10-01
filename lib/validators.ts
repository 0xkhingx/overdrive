import { z } from "zod";

export const QuestionSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, "id must be kebab-case"),
  type: z.enum(["mcq", "flip"]),
  topic: z.enum(["swe", "ml"]),
  tags: z.array(z.string()).default([]),
  difficulty: z.number().int().min(1).max(3).default(1),
  prompt: z.string().min(1),
  options: z.array(z.string()).min(2).optional(),
  answer: z.string().min(1),
  explanation: z.string().default(""),
  source: z.string().default("self-authored"),
  license: z.string().default("CC-BY-SA-4.0"),
}).superRefine((q, ctx) => {
  if (q.type === "mcq") {
    if (!q.options || q.options.length < 2) {
      ctx.addIssue({ code: "custom", message: "mcq requires >=2 options" });
    } else if (!q.options.includes(q.answer)) {
      ctx.addIssue({ code: "custom", message: "answer must be one of options for mcq" });
    }
  }
});

export type QuestionInput = z.infer<typeof QuestionSchema>;

export const SettingsSchema = z.object({
  sessionSize: z.number().int().min(1).max(50).default(10),
  sweWeight: z.number().int().min(0).default(5),
  mlWeight: z.number().int().min(0).default(5),
  timeboxMin: z.number().int().min(5).max(60).default(15),
});
