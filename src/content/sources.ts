import type { Source } from "../domain";

/**
 * Source registry for the Claude Associate – Foundations content pack.
 * Every claim-bearing object references these ids so a reviewer can trace
 * what was checked, where, and when.
 */
export const sources: Source[] = [
  {
    id: "ccao-f-exam-guide-v1",
    title: "Claude Certified Associate – Foundations Exam Guide, Version 1.0",
    publisher: "Anthropic",
    url: "https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf",
    kind: "official-exam-guide",
    accessedAt: "2026-10-26",
    supports: [
      "Credential name and exam code CCAO-F",
      "60 items, 120 minutes, multiple-choice and multiple-response format",
      "Passing scaled score of 720 on a 100–1,000 scale",
      "Seven domains with weights of 14%, 21%, 12%, 16%, 12%, 15%, and 10%",
      "The detailed objectives for each domain",
      "Intended audience, recommended experience, and no mandatory prerequisites",
      "Guide version 1.0, effective July 2026",
      "Retake, NDA, recertification, and exam-day policies",
    ],
  },
  {
    id: "anthropic-partner-certifications",
    title: "Earn your Claude certification",
    publisher: "Anthropic Partner Academy",
    url: "https://anthropic-partners.skilljar.com/page/partner-certifications",
    kind: "official-certification-page",
    accessedAt: "2026-10-26",
    supports: [
      "Four Claude certifications and their list prices",
      "CCAO-F is listed at $99 USD before partner-tier discounts",
      "The page links the official CCAO-F exam guide PDF",
      "The Associate credential does not count toward Claude Partner Network tier eligibility",
    ],
  },
  {
    id: "anthropic-certification-faq",
    title: "Certification FAQ",
    publisher: "Anthropic Partner Academy",
    url: "https://anthropic-partners.skilljar.com/page/faq-certifications",
    kind: "official-faq",
    accessedAt: "2026-10-26",
    supports: [
      "Certification exams use multiple-choice and scenario-based multiple-response questions",
      "120 minutes of testing and about 135 minutes of total seat time",
      "Results use a scaled score of 100–1,000 with a minimum passing score of 720",
      "No full practice exam is available; the exam guide contains sample questions",
      "Credentials are valid for 12 months; on-time renewal uses a free non-proctored assessment",
      "Retake waiting periods of 14, 30, and 90 days, with a maximum of four attempts per rolling 12 months",
      "Certification is limited to people at Claude Partner Network organizations; candidates must be 18 or older",
    ],
  },
  {
    id: "anthropic-associate-certification",
    title: "Claude Certified Associate – Foundations Certification",
    publisher: "Anthropic Partner Academy",
    url: "https://anthropic-partners.skilljar.com/claude-certified-associate-foundations-certification",
    kind: "official-certification-page",
    accessedAt: "2026-10-26",
    supports: [
      "The CCAO-F registration page lists a $99 purchase price",
      "The page directs candidates to the certification page for exam details, guides, and policies",
    ],
  },
  {
    id: "anthropic-associate-prep-course",
    title: "Claude Certified Associate – Foundations Prep Course",
    publisher: "Anthropic Partner Academy",
    url: "https://anthropic-partners.skilljar.com/path/claude-certified-associate-foundations",
    kind: "official-prep-course",
    accessedAt: "2026-10-26",
    supports: [
      "Official prep path with modules aligned to the seven blueprint domains",
      "Recommended preparation courses are Claude 101, AI Fluency, and AI Capabilities and Limitations",
      "The prep path is a study resource, not a required course or an official practice exam",
    ],
  },
  {
    id: "pearson-anthropic-program",
    title: "Claude Certification Program by Anthropic — Pearson VUE",
    publisher: "Pearson VUE",
    url: "https://www.pearsonvue.com/us/en/anthropic.html",
    kind: "official-certification-page",
    accessedAt: "2026-10-26",
    accessNote:
      "The live page returned HTTP 504 on 2026-10-26. A search-engine snippet indicated a 2026-12-07 content update and 2026-11-17 guides; that scheduling notice is recorded as partially verified until the page is reachable again. Delivery, listing, and retake facts on this page are not independently re-verified from this check; the guide and FAQ support them.",
    supports: [
      "Official Pearson VUE landing page for the Claude Certification Program",
    ],
  },
  {
    id: "anthropic-context-windows-doc",
    title: "Context windows",
    publisher: "Anthropic",
    url: "https://platform.claude.com/docs/en/build-with-claude/context-windows",
    kind: "official-provider-documentation",
    accessedAt: "2026-10-26",
    supports: [
      "The context window is all the text the model can reference, including the response itself",
      "The system prompt, every message, tool results, images, documents, tool definitions, output, and thinking count toward the window",
      "Usage fields report token consumption, including cache read and cache creation counts",
      "Cached prompt prefixes still occupy the context window",
      "Accuracy and recall can degrade as token count grows (context rot)",
      "Compaction and context editing manage conversations that approach the limit",
    ],
  },
  {
    id: "anthropic-token-counting-doc",
    title: "Token counting",
    publisher: "Anthropic",
    url: "https://platform.claude.com/docs/en/build-with-claude/token-counting",
    kind: "official-provider-documentation",
    accessedAt: "2026-10-26",
    supports: [
      "Token counting estimates the tokens in a request before sending it",
      "The returned token count is an estimate and can differ slightly from the actual request",
      "Token counts depend on the tokenizer used by the selected model",
    ],
  },
  {
    id: "anthropic-compaction-doc",
    title: "Compaction",
    publisher: "Anthropic",
    url: "https://platform.claude.com/docs/en/build-with-claude/compaction",
    kind: "official-provider-documentation",
    accessedAt: "2026-10-26",
    supports: [
      "Server-side compaction summarizes earlier conversation so a long-running conversation can continue",
    ],
  },
  {
    id: "anthropic-context-engineering-blog",
    title: "Effective context engineering for AI agents",
    publisher: "Anthropic Engineering",
    url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents",
    kind: "official-engineering-blog",
    accessedAt: "2026-10-26",
    supports: [
      "Context rot describes the loss of recall accuracy as the number of tokens in context increases",
      "Effective context engineering curates the smallest set of high-signal tokens",
      "Compaction summarizes a conversation nearing the limit and restarts with the summary",
    ],
  },
];
