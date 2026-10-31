import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all four verified Domain 3 objectives.
 * It teaches product-surface selection, model-tier selection, task fit, and
 * context management from Anthropic's product documentation. Product details
 * are treated as time-sensitive; the lesson teaches the decision framework
 * rather than freezing current menus, model names, prices, or limits.
 */
export const productSelectionLesson: Lesson = lessonSchema.parse({
  id: "product-selection",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 5,
  kind: "curriculum",
  contentStatus: "published",
  title: "Product and model selection: surface fit, capability tiers, and context",
  englishTitle: "Product and model selection: surface fit, capability tiers, and context",
  summary:
    "Learn to select the right product surface (Chat, Projects, Research, Artifacts), choose models by capability tier rather than name recognition, and actively manage context by deciding when to retain, summarize, restart, or externalize state. Grounded in real-world workplace scenarios.",
  level: "foundation",
  estimatedMinutes: 20,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Technical content aligned with Anthropic documentation on Projects, Project RAG, Research, Artifacts, models, context windows, compaction, and context engineering. Four objectives mapped from Exam Guide v1.0.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-projects-overview",
      "anthropic-projects-manage",
      "anthropic-projects-rag",
      "anthropic-research-help",
      "anthropic-artifacts-doc",
      "anthropic-models-overview",
      "anthropic-choosing-model",
      "anthropic-context-windows-doc",
      "anthropic-compaction-doc",
      "anthropic-context-engineering-blog",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "product-feature-selection",
      "model-family-selection",
      "model-task-fit",
      "context-memory-management",
    ],
    note: "Lesson covers all four verified Domain 3 objectives in Exam Guide v1.0.",
  },
  objectives: [
    "Select the appropriate product surface for task requirements: Chat, Projects, Research, or Artifacts.",
    "Distinguish model families by capability tiers, throughput, and token economics rather than memorizing ephemeral model names.",
    "Evaluate model-to-task fit using prompt quality, representative data, and empirical edge-case testing.",
    "Manage context and working memory effectively by deciding when to preserve, summarize, restart, or persist critical state.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Select the product surface before choosing a model",
      paragraphs: [
        "A common pitfall is immediately asking “which model is strongest?”. In practical enterprise workflows, the foundational architectural question is: does this task require an ephemeral conversation, a persistent workspace with reusable domain knowledge, multi-source external research, or an iterative standalone deliverable? The product surface dictates what context persists and how outputs are utilized. Anthropic defines Projects as self-contained workspaces with dedicated chat history and shared knowledge; Research as a multi-step external search and synthesis process with citations; and Artifacts as standalone, substantial, editable outputs alongside the conversation.",
        "Only after determining the appropriate product surface should you evaluate which model tier provides sufficient capability for that workflow. A larger model cannot compensate for misplacing persistent knowledge or lacking verification checkpoints.",
      ],
    },
    {
      kind: "list",
      heading: "The four primary product surfaces and their indicators",
      items: [
        "Chat: Short, ad-hoc, exploratory queries where persistent setup is unnecessary. Best when setup overhead exceeds task value.",
        "Projects: Recurring workflows with stable reference documents, team-wide conventions, and standardized prompt templates. Project Knowledge maintains persistent reference docs, while Project Instructions enforce instructions across all chats in the project.",
        "Research: Complex queries requiring multi-source external retrieval, iterative synthesis, and explicit citations. Research executes consecutive search rounds across enabled connectors.",
        "Artifacts: Substantial, standalone, reusable deliverables such as codebases, detailed policy documents, architectural diagrams, or interactive tools. Artifacts are an output format, not a persistent knowledge store.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "A Project is not just a longer chat thread",
      body: "Anthropic clarifies that a new chat within a project does not inherit the transcript of previous chats. Project Knowledge and Instructions provide shared context; project memory retains select preferences but does not replace intentional configuration. Furthermore, project titles and descriptions are not passed to Claude as system prompts. If a constraint must be enforced, place it explicitly in Project Instructions or Knowledge.",
    },
    {
      kind: "paragraphs",
      heading: "Model families represent capability tiers, not static rankings",
      paragraphs: [
        "The CCAO-F Exam Guide references the Haiku, Sonnet, and Opus families. The most effective mental model is to view them as distinct trade-off profiles across reasoning capability, latency, and cost, rather than an immutable hierarchy. Anthropic structures models around differing positioning, TTFT (time-to-first-token), per-token pricing, context capacity, and output thresholds.",
        "Avoid memorizing rigid claims like “Model X is always best for Task Y”. Instead, master the core evaluation criteria: what reasoning depth does the task demand? How severe is the cost of a mistake? What latency SLA is acceptable? What is the cost per successful completion? And how large is the required context window?",
      ],
    },
    {
      kind: "list",
      heading: "Two model selection strategies",
      items: [
        "Efficiency-First: Begin with the fastest, most economical model (e.g., Haiku), benchmark against representative ground truth, and escalate to a higher tier only when a clear capability bottleneck is demonstrated. Ideal for high-volume, latency-sensitive operational triage.",
        "Capability-First: Begin with the highest-tier model capable of complex multi-step reasoning (e.g., Sonnet or Opus) for high-stakes or ambiguous tasks, evaluate on representative edge cases, and subsequently optimize for latency and cost if quality thresholds are comfortably exceeded.",
        "Under both strategies, final architectural adoption must be validated through internal evaluations with real prompts, data, and edge cases — not marketing claims or headline benchmarks.",
      ],
    },
    {
      kind: "diagram",
      heading: "Interactive Matrix: Model & Surface Selection by Workload Profile",
      diagramId: "model-selection-matrix",
      intro: "Compare Claude 3.5 model families across the three-dimensional trade-off matrix: Reasoning Capability, Token Economics, and Response Latency (TTFT).",
    },
    {
      kind: "paragraphs",
      heading: "Evaluate empirically by task, not intuition",
      paragraphs: [
        "Anthropic recommends carefully balancing capabilities, latency, cost, and developer effort. Often, targeted prompt enhancements — such as adding negative constraints, structuring inputs in XML, or providing few-shot exemplars — yield far greater accuracy gains than simply switching to a larger model. View prompt refinement and model tier selection as complementary levers.",
        "A disciplined evaluation loop: define clear acceptance criteria and pass/fail rubrics; select two candidate models; run both against identical evaluation sets including adversarial edge cases; quantify accuracy, latency, and cost; and standardize only once output reliability is proven.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Avoid anchoring to ephemeral product specifications",
      body: "Model names, token pricing, rate limits, UI menu labels, and context thresholds evolve over time. This curriculum emphasizes durable decision-making principles. Always verify latest production limits against official Anthropic documentation prior to architectural deployment.",
    },
    {
      kind: "paragraphs",
      heading: "Context and memory: what to keep, summarize, or persist",
      paragraphs: [
        "The context window encompasses all text referenced in a request: system prompts, message history, tool results, images, documents, tool declarations, generated output, and extended thinking tokens. Cached prefixes also occupy context capacity. As token counts escalate, attention resolution can degrade — known as context rot.",
        "Managing context effectively is not simply trimming tokens when hitting limits. It requires deciding what state must remain exact, what can be losslessly summarized, what should be persisted externally (e.g., in databases or Project Knowledge), and when to initiate a clean session.",
      ],
    },
    {
      kind: "list",
      heading: "Context management checklist",
      items: [
        "Isolate invariant state: confirmed facts, decisions, regulatory constraints, schema definitions, and ownership. Preserve these verbatim before summarizing.",
        "Decouple voluminous reference documents from chat turns: store in Project Knowledge or vector retrieval rather than pasting into every prompt.",
        "Summarize mature conversation turns once detailed debate is resolved, preserving agreed conclusions, edge cases, and open questions.",
        "Prune obsolete intermediate drafts, superseded code snippets, and verbose tool outputs that cause attention distraction.",
        "When opening a fresh chat session, provide a structured handoff brief rather than pasting the entire prior transcript.",
        "Validate integrity across context resets: confirm that prior decisions and behavioral constraints remain active in the new turn.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Project Knowledge is not unconditionally loaded into every prompt",
      body: "Project Knowledge leverages RAG (Retrieval-Augmented Generation) on large document sets, dynamically retrieving relevant chunks as knowledge scales toward context limits. Do not assume every uploaded document is exhaustively ingested into every response. Curate high-signal reference materials, utilize descriptive file naming, and verify retrieval accuracy.",
    },
  ],
  keyTerms: [
    {
      en: "Product surface",
      vi: "Giao diện & Phân hệ tương tác (Product surface)",
      note: "Modalities for interacting with Claude: standard Chat, Projects workspaces, Artifacts, or integrated APIs.",
    },
    {
      en: "Project",
      vi: "Claude Projects (không gian làm việc dự án)",
      note: "Dedicated team workspace integrating curated Project Knowledge and persistent Custom Instructions across all associated chats.",
    },
    {
      en: "Research",
      vi: "Deep Research (nghiên cứu đa bước có trích dẫn)",
      note: "Autonomous multi-step external search and synthesis capability providing cited real-time findings.",
    },
    {
      en: "Artifact",
      vi: "Artifact (kết quả hiển thị độc lập)",
      note: "Dedicated side-by-side UI container for substantial, standalone, editable deliverables such as code, documents, or diagrams.",
    },
    {
      en: "Model family",
      vi: "Model family (các dòng mô hình Claude: Haiku, Sonnet, Opus)",
      note: "Distinct model tiers engineered for specific trade-off balances across intelligence, speed, and cost.",
    },
    {
      en: "Capability tier",
      vi: "Capability tier (phân tầng năng lực mô hình)",
      note: "Framework for selecting models based on task complexity and error risk rather than defaulting to the largest model.",
    },
    {
      en: "Context window",
      vi: "Context window (vùng ngữ cảnh làm việc)",
      note: "Total token span referenced within a request, including system prompts, history, tool results, thinking, and generated output.",
    },
    {
      en: "Compaction",
      vi: "Compaction (cơ chế nén ngữ cảnh)",
      note: "Algorithmic summarization of earlier turns enabling continuous conversation as token usage nears context window limits.",
    },
    {
      en: "RAG",
      vi: "Retrieval-augmented generation (RAG)",
      note: "Retrieving relevant document excerpts dynamically rather than loading full repositories into prompt context.",
    },
    {
      en: "Baseline",
      vi: "Mốc so sánh (Baseline)",
      note: "Standardized benchmark performance against which model upgrades or prompt modifications are empirically evaluated.",
    },
  ],
  scenario: {
    title: "Scenario: Recurring Quarterly Market Intelligence Report",
    setup:
      "A strategic analysis team produces a quarterly market intelligence report using 20 approved corporate PDFs and a standardized output template. Each quarter also requires a concise summary of current breaking industry developments. The team's latest draft was created in a single raw chat where all PDFs were pasted manually, resulting in dropped documents and ungrounded news claims.",
    steps: [
      "Select product surface: create a Project for the 20 approved PDFs and standardized template because this represents a recurring workflow with stable knowledge.",
      "Upload approved PDFs into Project Knowledge; configure report formatting, voice, and citation mandates in Project Instructions.",
      "Leverage Research for the breaking market news section, requiring explicit source citations and flagging unverified claims.",
      "Adopt an Efficiency-First model selection approach for initial drafts, benchmarking against 5 prior verified reports and edge-case queries.",
      "If analytical depth falls short, escalate capability tier or refine prompt constraints before defaulting to the most expensive model.",
      "Manage context hygiene: capture confirmed metrics and decisions in structured handoff notes; summarize mature brainstorming; prune superseded drafts.",
      "Conduct pre-publication human review: verify numerical assertions against source PDFs and confirm all required sections are present.",
    ],
    takeaway:
      "Match product surfaces to workflow persistence and collaboration patterns; select models via empirical benchmarks; and manage context through structured handoffs rather than raw transcript bloating.",
  },
  questions: [
    {
      id: "product-selection-lesson-fit",
      type: "single-choice",
      stem: "A team produces a quarterly market report from a stable set of approved PDFs and a fixed template, but each quarter also needs a short update on current market news. Which combination fits best?",
      choices: [
        {
          id: "project-plus-research",
          text: "A project that holds the approved PDFs and template instructions, plus research with citation checks for the current-news update.",
          explanation:
            "Correct: Projects maintain persistent reference documents and standardized instructions, while Research conducts multi-step external search with source citations for current developments.",
        },
        {
          id: "new-chat-every-time",
          text: "A new standalone chat each quarter with every PDF pasted manually and no saved instructions.",
          explanation:
            "Incorrect: forces redundant configuration each quarter, risks document omission due to context limits, and fails to maintain consistent instructions.",
        },
        {
          id: "research-everything",
          text: "Research mode for the entire report, including the stable PDFs, so every quarter starts from scratch.",
          explanation:
            "Incorrect: Research is designed for open-ended external investigations; using it for stable internal PDFs introduces unnecessary latency, cost, and variability.",
        },
        {
          id: "artifact-only",
          text: "An artifact alone, rebuilt from memory each quarter without the source PDFs.",
          explanation:
            "Incorrect: Artifacts are an output container, not a persistent repository; lacking reference knowledge leads to ungrounded claims.",
        },
      ],
      correctChoiceIds: ["project-plus-research"],
      correctExplanation:
        "The workflow comprises two distinct phases: recurring synthesis from stable internal documents (best served by Project Knowledge and Instructions) and dynamic synthesis of current events (best served by Research with cited external sources). Artifacts may format the final deliverable, but do not replace persistent knowledge management.",
      sourceIds: [
        "anthropic-projects-overview",
        "anthropic-research-help",
        "anthropic-artifacts-doc",
      ],
    },
  ],
  relatedQuestionIds: [
    "product-feature-recurring-report",
    "product-feature-fit-choices",
    "model-family-speed-cost",
    "model-family-tradeoffs",
    "model-task-fit-complex",
    "model-task-fit-practices",
    "context-summarize-and-restart",
    "context-high-signal-practices",
  ],
  takeaways: [
    "Select product surfaces based on workflow lifecycle, collaboration needs, and artifact deliverables; do not start by picking a model name.",
    "Projects provide shared knowledge and instructions; new chats do not inherit raw transcripts, memory does not replace configuration, and project titles are not system prompts.",
    "Model families represent capability and trade-off profiles; verify current pricing, context limits, and throughput benchmarks in official documentation.",
    "Efficiency-first and capability-first provide structured evaluation paths for differing risk tolerances; empirical evaluation on representative data is decisive.",
    "Context management requires deliberate choices to preserve, summarize, restart, or externalize state rather than passive truncation.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-projects-overview",
    "anthropic-projects-manage",
    "anthropic-projects-rag",
    "anthropic-research-help",
    "anthropic-artifacts-doc",
    "anthropic-models-overview",
    "anthropic-choosing-model",
    "anthropic-context-windows-doc",
    "anthropic-compaction-doc",
    "anthropic-context-engineering-blog",
  ],
});
