import { QuestionSchema, type QuestionInput } from "./validators";

export interface ImportResult {
  valid: QuestionInput[];
  errors: { index: number; id?: string; message: string }[];
}

export function validateQuestions(raw: unknown[]): ImportResult {
  const valid: QuestionInput[] = [];
  const errors: ImportResult["errors"] = [];
  const seen = new Set<string>();
  raw.forEach((item, index) => {
    const parsed = QuestionSchema.safeParse(item);
    if (!parsed.success) {
      errors.push({ index, id: (item as { id?: string })?.id, message: parsed.error.issues.map((i) => i.message).join("; ") });
      return;
    }
    if (seen.has(parsed.data.id)) {
      errors.push({ index, id: parsed.data.id, message: "duplicate id in file" });
      return;
    }
    seen.add(parsed.data.id);
    valid.push(parsed.data);
  });
  return { valid, errors };
}
