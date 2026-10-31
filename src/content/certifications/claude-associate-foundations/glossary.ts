import { z } from "zod";
import { glossaryEntrySchema, type GlossaryEntry } from "../../../domain";

/**
 * General study notes, not official exam wording. The glossary is deliberately
 * certification-neutral in shape so another provider can ship its own entries.
 */
export const glossaryEntries: GlossaryEntry[] = z
  .array(glossaryEntrySchema)
  .parse([
    {
      id: "token",
      term: "Token",
      vi: "Token (đơn vị từ tố)",
      definition:
        "The atomic unit of text that a model processes. Tokens do not map 1:1 with words, and token counts vary across languages and formats.",
      category: "Core concepts",
    },
    {
      id: "context-window",
      term: "Context window",
      vi: "Context window (vùng ngữ cảnh làm việc)",
      definition:
        "The total token budget a model can reference in a single request, including system instructions, message history, retrieved documents, tool schemas, and generated output.",
      category: "Core concepts",
    },
    {
      id: "context-rot",
      term: "Context rot",
      vi: "Context rot (suy giảm độ tập trung ngữ cảnh)",
      definition:
        "The degradation in accuracy, recall, and attention as token volume in the context window increases. Distracting or irrelevant tokens amplify this degradation.",
      category: "Core concepts",
    },
    {
      id: "prompt",
      term: "Prompt",
      vi: "Prompt (câu lệnh / chỉ dẫn)",
      definition:
        "The input provided to the model: goals, context, constraints, reference material, and expected output format.",
      category: "Core concepts",
    },
    {
      id: "system-prompt",
      term: "System prompt",
      vi: "System prompt (chỉ dẫn hệ thống)",
      definition:
        "Top-level instructions set before conversation turns, establishing Claude's role, behavioral boundaries, and persistent operational rules.",
      category: "Prompting",
    },
    {
      id: "temperature",
      term: "Temperature",
      vi: "Temperature (tham số độ ngẫu nhiên)",
      definition:
        "A parameter controlling sampling randomness in output generation. Lower values yield more deterministic, repeatable answers; higher values produce greater variation.",
      category: "Prompting",
    },
    {
      id: "few-shot-examples",
      term: "Few-shot examples",
      vi: "Ví dụ mẫu",
      definition:
        "Providing sample input-output pairs in the prompt to demonstrate expected formatting, reasoning style, and edge-case handling.",
      category: "Prompting",
    },
    {
      id: "hallucination",
      term: "Hallucination",
      vi: "Ảo giác",
      definition:
        "Factual inaccuracies, fabricated details, or claims ungrounded in the provided context, often presented with high confidence. Must be mitigated with grounding, citations, and human review.",
      category: "Safety",
    },
    {
      id: "prompt-injection",
      term: "Prompt injection",
      vi: "Chèn lệnh vào prompt",
      definition:
        "An adversarial attack attempting to override system instructions by embedding malicious directives inside user-supplied or retrieved content. Mitigated by separating data from instructions.",
      category: "Safety",
    },
    {
      id: "grounding",
      term: "Grounding",
      vi: "Neo thông tin vào nguồn",
      definition:
        "Restricting model responses to verify and cite explicitly provided source material rather than relying on ungrounded pretraining memory.",
      category: "Safety",
    },
    {
      id: "rag",
      term: "RAG",
      expansion: "Retrieval-Augmented Generation",
      vi: "RAG (sinh văn bản kèm truy xuất)",
      definition:
        "Retrieval-Augmented Generation: retrieving relevant document chunks from external knowledge sources into the context window before generation, minimizing hallucinations and saving tokens.",
      category: "Operations",
    },
    {
      id: "evaluation",
      term: "Evaluation",
      expansion: "eval",
      vi: "Đánh giá",
      definition:
        "Systematic testing against structured rubrics and representative test cases to measure output quality, accuracy, and latency reliably.",
      category: "Operations",
    },
    {
      id: "tool-use",
      term: "Tool use",
      vi: "Sử dụng công cụ",
      definition:
        "Enabling the model to invoke external APIs, databases, or functions and consume structured return payloads to complete real-world tasks.",
      category: "Operations",
    },
    {
      id: "compaction",
      term: "Compaction",
      vi: "Compaction (nén ngữ cảnh hội thoại)",
      definition:
        "An automated or structured technique that summarizes earlier turns in a conversation to maintain task continuity when approaching context limits.",
      category: "Operations",
    },
    {
      id: "latency",
      term: "Latency",
      vi: "Độ trễ",
      definition:
        "The end-to-end turnaround time from request dispatch to final response completion, influenced by prompt length, generation tokens, and sequential tool round-trips.",
      category: "Operations",
    },
  ]);

export const glossaryCategories: string[] = [
  "Core concepts",
  "Prompting",
  "Safety",
  "Operations",
];
