import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all four verified Domain 1 objectives.
 * It uses Anthropic's published prompting guidance and the evaluation guidance
 * for success criteria. Examples are original workplace scenarios; no official
 * exam item is reproduced.
 */
export const promptStructureLesson: Lesson = lessonSchema.parse({
  id: "prompt-structure",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 1,
  kind: "curriculum",
  contentStatus: "published",
  title: "Prompt structure: goal, context, constraints, and iteration",
  englishTitle: "Prompt structure: goal, context, constraints, and iteration",
  summary:
    "Master prompt engineering by articulating clear goals, rich context, negative constraints, and objective success criteria. Decompose complex workflows into verifiable intermediate artifacts and iterate systematically using evidence and baselines across analytical, research, drafting, and creative tasks.",
  level: "foundation",
  estimatedMinutes: 18,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Technical content aligned with Anthropic documentation on prompting best practices and evaluation criteria. Four objectives mapped from Exam Guide v1.0.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-prompting-best-practices",
      "anthropic-evaluation-docs",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "prompting-create-effective-prompts",
      "prompting-task-decomposition",
      "prompting-iterate",
      "prompting-adapt-strategies",
    ],
    note: "Lesson covers all four verified Domain 1 objectives in Exam Guide v1.0.",
  },
  objectives: [
    "Draft effective prompts specifying clear goal, audience, reference data, negative constraints, and output schema.",
    "Decompose complex, multifaceted requests into sequential stages or parallel components producing verifiable intermediate artifacts.",
    "Iterate systematically on prompt performance using test baselines, rigorous rubrics, and structured error categorization.",
    "Adapt prompting strategies according to task archetype: analysis, research, drafting, extraction, and brainstorming.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "A prompt is a task specification, not a magic incantation",
      paragraphs: [
        "Anthropic emphasizes that effective prompting requires clear, direct, and contextually rich instructions. A practical sanity check: hand your prompt to a human colleague who lacks deep familiarity with the project. If they find the instructions ambiguous or underspecified, Claude will similarly produce inconsistent output. This is especially prevalent in enterprise settings where implicit domain assumptions and unwritten quality standards fail to make it into the prompt.",
        "An effective prompt does not need to be excessively verbose, but it must definitively address six core questions: What exact objective must be accomplished? Who is the intended audience? What reference materials are permitted? What boundaries or negative constraints must never be violated? What exact output schema or format is expected? And what concrete rubric defines a failed response?",
      ],
    },
    {
      kind: "list",
      heading: "The six core components of an effective prompt",
      items: [
        "Goal: The concrete outcome required (avoid vague directives like 'write about topic X').",
        "Audience: The recipient profile, technical expertise level, and the specific decision they need to make.",
        "Context: Business background, source documentation, reference data, and explicit precedence rules if sources conflict.",
        "Constraints: Hard length boundaries, response language, negative constraints ('never assume...'), confidence thresholds, and fallback behavior when data is absent.",
        "Format: Prose, structured markdown table, typed JSON schema, checklist, or technical artifact; including XML delimiters and level of detail.",
        "Success Criteria: Objective acceptance criteria and definitions of unacceptable failure modes.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Provide context and rationale to enable accurate generalization",
      paragraphs: [
        "Anthropic highlights that providing the underlying rationale behind an instruction enables Claude to understand the operational intent and generalize correctly. For example, simply instructing “do not use ellipses (...)” is a superficial rule; clarifying that “do not use ellipses because the output is ingested by an automated Text-to-Speech (TTS) engine” allows the model to understand the constraint and appropriately handle similar formatting anomalies.",
        "Avoid cramming heterogeneous context into an unstructured block. For long reference documents, Anthropic's established standard is: place reference documentation near the beginning of the prompt, place specific execution instructions and questions at the very end, and encapsulate components within consistently named XML tags (`<context>`, `<guidelines>`, `<data>`). Clear structural delimiters prevent the model from conflating instructions with reference data.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Few-shot examples: structured diversity over single anecdotes",
      body: "Anthropic considers few-shot prompting one of the most reliable techniques for steering tone, formatting conventions, and reasoning patterns. However, examples must be strictly relevant, high-quality, and diverse. A single isolated example risks causing the model to overfit to incidental idiosyncrasies; provide 3–5 diverse exemplars that encompass representative edge cases.",
    },
    {
      kind: "diagram",
      heading: "Interactive Workbench: Anthropic Modular Prompt Architecture",
      diagramId: "prompt-layering-workbench",
      intro: "Toggle the five foundational structural prompt layers (System Role, XML Delimiters, Evaluation Rubric, Few-shot Exemplars, Output Prefill) to observe changes in clarity and hallucination resistance.",
    },
    {
      kind: "paragraphs",
      heading: "Task decomposition: splitting complex requests into verifiable stages",
      paragraphs: [
        "Complex prompts frequently fail because they conflate too many divergent objectives into a single turn: simultaneous data extraction, multi-variable analysis, synthesis, tone adaptation, and self-auditing. Task decomposition separates a monolithic workflow into discrete, bounded stages with deterministic handoffs, allowing each stage to be verified before passing downstream.",
        "Two architectural decomposition models are common: Sequential Pipelines (Extract → Validate → Analyze → Synthesize → Format) and Component Parallelization (Map-Reduce: independently auditing multiple documents or categories before aggregating findings). The critical requirement is that intermediate artifacts must be tangible and verifiable: markdown tables, keyed JSON payloads, or explicit source-linked claims.",
      ],
    },
    {
      kind: "list",
      heading: "When to apply task decomposition",
      items: [
        "When business requirements demand multiple complex output schemas or conflicting evaluation criteria.",
        "When processing voluminous multi-source documentation containing potentially contradictory data.",
        "When high-stakes decision points require qualified human-in-the-loop sign-off before proceeding.",
        "When errors in early analytical steps risk cascading compounding failures across downstream phases.",
        "When full audit traceability is mandated: requiring exact citation linkage between final claims and specific source passages.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Decompose intentionally: avoid excessive micro-steps that fragment context",
      body: "Over-decomposing tasks into dozens of tiny calls introduces cumulative latency, increases API token consumption, and risks losing broader conversational context. Decompose only at natural evaluation checkpoints, branch points, or tool integration boundaries. If two steps are tightly coupled and share identical context, keep them combined in a unified prompt.",
    },
    {
      kind: "paragraphs",
      heading: "Evidence-based prompt iteration using baselines and error analysis",
      paragraphs: [
        "Production-grade prompts rarely emerge fully formed in an initial draft. Systematic iteration begins by evaluating model outputs against predefined success criteria, diagnosing specific error archetypes, and modifying only the technical component responsible for the failure. If output hallucinates, ground it with XML-wrapped source quotes; if output violates schema, enforce strict JSON schemas or add few-shot exemplars; if edge cases are missed, expand the evaluation suite.",
        "Anthropic advocates establishing measurable, deterministic evaluation criteria and curating a representative test dataset reflecting production distributions and difficult edge cases. This is the cornerstone of empirical prompt iteration: maintain a stable baseline, run candidate prompts across the same test cases, modify a single variable at a time, and track shift in error rate rather than relying on subjective impression.",
      ],
    },
    {
      kind: "list",
      heading: "The prompt iteration loop",
      items: [
        "Define concrete success criteria and assemble a representative evaluation dataset containing standard and edge cases.",
        "Establish a benchmark baseline recording current output quality, cost, and latency.",
        "Categorize observed failures: goal ambiguity, missing context, absent exemplars, schema deviation, or missing pipeline stage.",
        "Introduce a single targeted prompt modification and rerun across the identical evaluation suite.",
        "Measure regressions and improvements; commit the prompt revision only if empirical metrics demonstrate net improvement.",
        "Document rationale, test results, and known failure modes to support team review and governance.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Select technical prompting strategies by task archetype",
      paragraphs: [
        "No single prompt pattern is universally optimal across all workloads. Analytical tasks demand rigorous evaluation rubrics, quantitative evidence, and source traceability. Research tasks require real-time search, disciplined citations, and explicit separation between verified facts and hypotheses. Drafting tasks prioritize audience empathy, voice consistency, stylistic exemplars, and length control. Brainstorming tasks require divergent ideation, suspending premature judgment during generation before filtering against criteria.",
        "For multi-document analysis, instruct Claude to extract themes with verbatim quotes and source identifiers prior to drawing comparative conclusions. For research, formulate precise research questions, mandate inline citations, and explicitly require the model to flag information gaps. For drafting, provide few-shot exemplars alongside persona constraints. For brainstorming, mandate diverse conceptual vectors before applying selection rubrics.",
      ],
    },
    {
      kind: "list",
      heading: "Technical strategy matrix by task type",
      items: [
        "Analysis: Define explicit comparative rubrics, mandate grounded textual evidence, and decouple facts from subjective interpretation.",
        "Research: Specify clear research queries, source credibility rubrics, mandatory verbatim citations, and conflicting data protocols.",
        "Drafting: Define target audience profile, stylistic tone, length bounds, few-shot exemplars, and core message invariants.",
        "Brainstorming: Encourage divergent conceptual vectors, delay strict filtering during ideation, then evaluate using structured rubrics.",
        "Extraction: Provide strict JSON schemas or formatted markdown tables, defining null handling and missing-field fallback behavior.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Isolate variables: avoid multi-factor changes",
      body: "Simultaneously altering the model family, prompt framing, output schema, and evaluation test cases destroys causal attribution. Preserve a controlled baseline and adjust only a single technical factor per test iteration to maintain clear empirical insights.",
    },
  ],
  keyTerms: [
    {
      en: "Prompt",
      vi: "Prompt (câu lệnh / chỉ dẫn đầu vào)",
      note: "The complete set of instructions, context, constraints, and exemplars provided to steer model generation.",
    },
    {
      en: "Context",
      vi: "Context (ngữ cảnh / tài liệu nền)",
      note: "Reference materials, domain data, examples, and operational background grounding the model's responses.",
    },
    {
      en: "Constraint",
      vi: "Constraint (ràng buộc / giới hạn)",
      note: "Explicit boundaries restricting length, language, permitted data sources, output formats, or prohibited behaviors.",
    },
    {
      en: "Task decomposition",
      vi: "Task decomposition (chia nhỏ tác vụ)",
      note: "Architectural practice of breaking monolithic workflows into bounded sub-stages producing verifiable intermediate artifacts.",
    },
    {
      en: "Success criteria",
      vi: "Success criteria (tiêu chí thành công)",
      note: "Objective, measurable standards defining acceptable quality and identifying failure modes.",
    },
    {
      en: "Baseline",
      vi: "Baseline (mốc đối chuẩn)",
      note: "Standardized reference performance against which prompt variations and model iterations are objectively measured.",
    },
    {
      en: "Few-shot examples",
      vi: "Few-shot examples (các ví dụ mẫu)",
      note: "High-quality, diverse demonstration pairs establishing target formatting, tone, and reasoning patterns.",
    },
    {
      en: "Edge case",
      vi: "Edge case (trường hợp biên / ca đặc biệt)",
      note: "Atypical, boundary, or adversarial inputs that frequently expose fragile prompting assumptions.",
    },
  ],
  scenario: {
    title: "Scenario: Executive Competitive Intelligence Brief",
    setup:
      "A corporate strategy team must compile an executive brief comparing three emerging market competitors from 12 internal documents, including older filings and one recent acquisition memo. The initial prompt produced a lengthy, generic summary that missed one competitor entirely, used vague citations, and failed to disclose critical unverified assumptions. The team has two days before the executive committee meeting.",
    steps: [
      "Reformulate goal: the brief must equip executive leadership to decide whether to adjust enterprise product positioning.",
      "Specify audience, length constraints, output format, and objective pass/fail success criteria including citation rigor.",
      "Decompose workflow: extract factual matrices per competitor before attempting cross-company comparison and strategic synthesis.",
      "Mandate that every extracted metric include document source and date; explicitly tag outdated or conflicting data points.",
      "Run initial baseline and classify failure modes: missing competitor coverage, weak citations, opaque assumptions.",
      "Implement targeted fixes: add competitor checklist, enforce quote-first citation rules, and create dedicated assumptions/risk sections.",
      "Rerun across identical document set and compare against baseline; test edge case of a competitor with only one source document.",
      "Select structured formats: comparison table for empirical metrics, concise prose for strategic recommendations, appendix for source citations.",
    ],
    takeaway:
      "Effective prompts operate as clear task specifications with testable criteria, structured context, and validation gates. When workflows are complex, decomposition and evidence-based iteration ensure steady, measurable quality improvements.",
  },
  questions: [
    {
      id: "prompt-structure-lesson-iteration",
      type: "single-choice",
      stem: "A team's prompt produces a competitor brief that is fluent but misses one competitor and cites sources only vaguely. What is the best next step?",
      choices: [
        {
          id: "diagnose-then-target",
          text: "Classify the failures as missing coverage and weak evidence, add a competitor checklist and a quote-first citation rule, then rerun on the same documents.",
          explanation:
            "Correct: identifies root cause failure modes and applies targeted remedies (checklist for coverage, quote-first for evidence) before retesting against the same baseline.",
        },
        {
          id: "rewrite-random",
          text: "Rewrite the entire prompt from scratch without checking which requirement failed.",
          explanation:
            "Incorrect: unguided rewrites obscure which adjustments solved the issue and risk regressing prompt components that were working well.",
        },
        {
          id: "longer-output",
          text: "Ask for a longer brief so the missing competitor and citations appear naturally.",
          explanation:
            "Incorrect: increasing output token length does not enforce coverage of omitted entities or improve grounding rigor without explicit constraints.",
        },
        {
          id: "change-model",
          text: "Switch to a different model before checking whether the prompt states the missing requirements.",
          explanation:
            "Incorrect: changing model tiers cannot resolve missing prompt specifications or absent grounding constraints; diagnose the prompt first.",
        },
      ],
      correctChoiceIds: ["diagnose-then-target"],
      correctExplanation:
        "The two flaws stem from distinct prompt deficiencies: missing a competitor represents incomplete coverage constraints, while vague citations indicate absent grounding rules. Adding a competitor checklist and enforcing a quote-first rule directly targets both defects, and re-evaluating on the identical document set provides clear empirical verification.",
      sourceIds: [
        "anthropic-prompting-best-practices",
        "anthropic-evaluation-docs",
      ],
    },
  ],
  relatedQuestionIds: [
    "prompting-specific-brief",
    "prompting-effective-prompt-additions",
    "prompting-decompose-steps",
    "prompting-decomposition-decision",
    "prompting-iterate-evidence",
    "prompting-iterate-systematic",
    "prompting-iterate-rubric-calibration",
    "prompting-analysis-task-strategy",
    "prompting-adapt-task-types",
    "prompting-multilingual-nuance-control",
  ],
  takeaways: [
    "Effective prompts explicitly define goal, audience, context, negative constraints, schema, and success criteria.",
    "Providing rationale and structured few-shot exemplars helps models generalize, but exemplars must be diverse and high-quality.",
    "Decompose complex workflows into sequential stages or parallel components producing verifiable intermediate artifacts.",
    "Drive prompt iteration using stable baselines, measurable rubrics, and systematic error taxonomy rather than superficial fluency.",
    "Tailor prompt strategies to task archetypes: analysis requires rubrics, research requires citations, drafting requires audience alignment, brainstorming requires diverse ideation.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});
