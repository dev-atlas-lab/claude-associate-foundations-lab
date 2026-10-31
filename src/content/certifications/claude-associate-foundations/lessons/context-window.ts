import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Design-vertical-slice sample lesson refined for the Associate audience.
 * The technical content is checked against Anthropic documentation for both
 * workspace workflows (Projects, chat history, uploaded files) and underlying
 * context-window mechanics, while remaining explicitly unmapped (`kind: "sample"`)
 * alongside the seven whole-domain curriculum lessons.
 */
export const contextWindowLesson: Lesson = lessonSchema.parse({
  id: "context-window",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 8,
  kind: "sample",
  contentStatus: "published",
  title: "Context window and context budgeting",
  englishTitle: "Context window and context budgeting",
  summary:
    "Understand the context window as Claude's working memory across chat interfaces, Projects, and API workflows. Identify components that consume token capacity and proactively budget context rather than overloading documents.",
  level: "foundation",
  estimatedMinutes: 11,
  verification: {
    status: "verified",
    checkedAt: "2026-10-29",
    note: "Technical content aligned with Anthropic documentation on context windows, token counting, compaction, context engineering, and Claude Projects management (reviewed for Associate audience). Unmapped sample lesson.",
    sourceIds: [
      "anthropic-context-windows-doc",
      "anthropic-token-counting-doc",
      "anthropic-compaction-doc",
      "anthropic-context-engineering-blog",
      "anthropic-projects-manage",
    ],
  },
  examMapping: {
    status: "unmapped",
    objectiveIds: [],
    note: "Foundation sample lesson for Associate candidates illustrating context window mechanics prior to Domain 3 (product-selection).",
  },
  objectives: [
    "Explain what a context window is and why it bounds the amount of information Claude can process in a single conversation turn or API request.",
    "Identify components sharing context window capacity across Claude chat, Projects, and API workflows (system instructions, conversation history, attachments/retrieved docs, and generated output).",
    "Select appropriate context optimization strategies (starting fresh chats, curating Project knowledge, or applying compaction) when discussions become long and fragmented.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "What is a context window?",
      paragraphs: [
        "The context window is the entire span of text that the model can reference when generating a response — including the output being produced. Anthropic describes it as the model's “working memory”: not a permanent store of trained knowledge, but the active context space reserved for the current request or session.",
        "Whether using Claude through chat/Projects or an integrated API workflow, all information provided in a call shares this working memory: system prompts or Project instructions, full conversation message history (including tool results, images, and attachments), retrieved excerpts from Project knowledge, and the generated response. Extended thinking tokens also count against this context window.",
        "At the API level, every response returns a usage object detailing prompt tokens and completion tokens, while the token counting API allows exact measurement prior to dispatch. For day-to-day users, prolonged chats covering too many disparate topics or containing massive raw documents rapidly exhaust available context budget.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "More context does not guarantee better answers",
      body: "As token volume increases substantially, model attention and adherence to core constraints can degrade — a phenomenon Anthropic terms context rot. Curating concise, highly relevant excerpts or summarizing key decisions into a fresh conversation yields higher accuracy than stuffing additional documents into a diluted thread.",
    },
    {
      kind: "paragraphs",
      heading: "Tokens are not words",
      paragraphs: [
        "Tokens are the fundamental units of text processed by language models, not a 1:1 mapping with words. Non-English text, structured tabular data, code, JSON, and long numeric sequences typically consume more tokens per character than plain English prose.",
        "Consequently, never estimate context budget purely based on page count or word count. In Claude Projects or chat, prioritize clean, high-signal reference materials over redundant drafts; in automated workflows, measure exact payload size with the token counting API.",
      ],
    },
    {
      kind: "list",
      heading: "Strategies for lean, high-signal context",
      items: [
        "Define persistent rules and persona in Project instructions or system prompts instead of repeating them across user turns.",
        "When shifting to a new task or after extensive trial-and-error, summarize established decisions and open a fresh chat.",
        "Provide only strictly relevant documents or passages (retrieval / curated Project knowledge) rather than attaching entire repositories to each turn.",
        "For long-running agents or conversational flows, employ structured summarization, compaction, or context editing to prune obsolete history.",
        "Always budget for output: input and output share the same context window, so overly large inputs or excessive max_tokens limits constrain available response room.",
      ],
    },
    {
      kind: "diagram",
      heading: "Context budget allocation within a request",
      diagramId: "context-budget",
      intro:
        "A typical request shares a single context window across input and output. Select each segment to inspect why it consumes capacity and how to optimize it. Percentages shown are illustrative benchmarks, not fixed Anthropic constraints.",
    },
  ],
  keyTerms: [
    {
      en: "Context window",
      vi: "Context window (vùng ngữ cảnh làm việc)",
      note: "Total token capacity the model can reference in a single request, including generated output.",
    },
    {
      en: "Token",
      vi: "Token (đơn vị xử lý văn bản)",
      note: "Fundamental text chunk processed by LLMs. Does not map 1:1 to words and varies by language and syntax.",
    },
    {
      en: "System prompt",
      vi: "System prompt (chỉ dẫn hệ thống)",
      note: "Instructions positioned at the session start: defining role, knowledge boundaries, and invariant behavioral rules.",
    },
    {
      en: "Prompt caching",
      vi: "Prompt caching (bộ nhớ đệm prompt)",
      note: "Reusing previously processed prefix tokens to reduce cost and latency; cached tokens still occupy context window capacity.",
    },
    {
      en: "Compaction",
      vi: "Compaction (cơ chế nén ngữ cảnh)",
      note: "Automated summarization of historical turns enabling continuous conversation as the context window approaches its ceiling.",
    },
    {
      en: "Context rot",
      vi: "Context rot (suy giảm độ tập trung do ngữ cảnh quá dài)",
      note: "Degradation in accuracy and instruction recall when the context becomes bloated with irrelevant or conflicting information.",
    },
  ],
  scenario: {
    title: "Scenario: Customer Support Assistant",
    setup:
      "An internal assistant answers employee policy inquiries. On every turn, it receives the complete 60-page handbook, three days of conversation history, and the system prompt. Recently, responses have slowed down and occasionally violate the rule 'never promise a refund timeline'.",
    steps: [
      "Measure token consumption per component: system prompt, history, policy docs, and current query.",
      "Identify that raw policy documentation consumes the majority of the token budget, even though each query only requires a few paragraphs.",
      "Replace full handbook loading with targeted retrieval of 2–3 relevant sections matching the user's inquiry.",
      "Summarize past conversation history into concise notes while keeping system instructions intact.",
      "Reserve sufficient headroom for output and verify length using the token counting API prior to dispatch.",
    ],
    takeaway:
      "When model responses begin ignoring longstanding instructions, the root cause is usually context pollution rather than random failure.",
  },
  questions: [
    {
      id: "context-window-root-cause",
      type: "single-choice",
      stem: "A support assistant receives the entire policy handbook, three days of chat history, and the system prompt on every turn. Replies are slower, and the assistant sometimes ignores the rule “never promise a refund timeline”. Which change addresses the root cause?",
      choices: [
        {
          id: "a",
          text: "Raise the temperature so the assistant explores more phrasings.",
          explanation:
            "Temperature modulates output randomness; it does not reduce input token size nor restore instructions drowned in excess context.",
        },
        {
          id: "b",
          text: "Retrieve only the relevant policy sections and summarize older turns, keeping the system prompt intact.",
          explanation:
            "Correct: directly mitigates context pollution, stabilizes critical instructions, and frees headroom for output.",
        },
        {
          id: "c",
          text: "Move the system prompt to the end of every user message so it appears last.",
          explanation:
            "Duplicating instructions across user messages inflates tokens and risks contradiction. System rules belong in a stable system prompt.",
        },
        {
          id: "d",
          text: "Increase max_tokens so the model has more room to answer.",
          explanation:
            "Increasing max_tokens only raises the upper ceiling for output length; it does not trim bloated inputs.",
        },
      ],
      correctChoiceIds: ["b"],
      correctExplanation:
        "The root cause is an oversized, polluted input: critical instructions are diluted, and token budget is monopolized by irrelevant documentation. Trimming input via retrieval and maintaining a stable system prompt targets the fundamental issue.",
      sourceIds: [
        "anthropic-context-windows-doc",
        "anthropic-context-engineering-blog",
      ],
    },
  ],
  takeaways: [
    "The context window is working memory: system prompts, messages, tools, documents, and output all draw from a single token budget.",
    "Measure tokens before sending payloads; never estimate based on page or word count.",
    "Curating concise, high-signal context consistently outperforms brute-force document stuffing.",
  ],
  sourceIds: [
    "anthropic-context-windows-doc",
    "anthropic-token-counting-doc",
    "anthropic-compaction-doc",
    "anthropic-context-engineering-blog",
    "anthropic-projects-manage",
  ],
});
