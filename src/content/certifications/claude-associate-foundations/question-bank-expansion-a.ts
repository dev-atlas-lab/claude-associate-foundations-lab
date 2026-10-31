import { questionSchema, type Question, type QuestionBankEntry } from "../../../domain";
import { reviewedEntry } from "./bank-helpers";

/**
 * Additional reviewed items for Domain 1 (prompting iteration and task-type
 * adaptation) and Domain 3 (product-feature and model selection).
 *
 * The items avoid naming a fixed public model lineup. Model names, prices, and
 * limits change; the durable exam skill is matching a task to a capability tier
 * and validating the choice with representative tests.
 */

const iterateOnEvidence: Question = questionSchema.parse({
  id: "prompting-iterate-evidence",
  type: "single-choice",
  stem: "A first draft of a customer FAQ is accurate but vague and does not match the support team's tone. What is the strongest next iteration?",
  choices: [
    {
      id: "diagnose-and-target",
      text: "Compare the draft with the success criteria, add the audience, tone examples, and must-answer questions, then rerun on the same input.",
      explanation:
        "Correct: diagnoses gaps relative to the rubric, provides missing constraints (audience, stylistic exemplars, mandatory questions), and reruns on identical input for controlled comparison.",
    },
    {
      id: "restart-randomly",
      text: "Delete the prompt and write a completely different one without checking why the first draft was weak.",
      explanation:
        "Incorrect: rewriting from scratch without diagnosing the failure mode obscures causality and fails to identify what was defective.",
    },
    {
      id: "make-it-longer",
      text: "Ask for a longer answer and assume more detail will fix the tone.",
      explanation:
        "Incorrect: output length does not resolve audience alignment or stylistic tone, and often adds unnecessary verbosity.",
    },
    {
      id: "accept-first",
      text: "Publish the first draft because it is factually accurate.",
      explanation:
        "Incorrect: factual accuracy is necessary but insufficient; the draft fails key audience tone and clarity criteria.",
    },
  ],
  correctChoiceIds: ["diagnose-and-target"],
  correctExplanation:
    "Effective prompt iteration compares outputs against predefined acceptance criteria rather than rewriting randomly. Once gaps in audience, tone, or mandatory questions are diagnosed, inject those specific constraints and evaluate against the same input to measure empirical progress.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});

const systematicIteration: Question = questionSchema.parse({
  id: "prompting-iterate-systematic",
  type: "multiple-response",
  stem: "Which three actions make prompt iteration systematic rather than trial and error? Select three.",
  choices: [
    {
      id: "baseline-same-cases",
      text: "Keep a baseline prompt and compare revisions on the same representative cases.",
      explanation:
        "Correct: maintaining a stable benchmark baseline across identical test cases isolates the impact of prompt revisions from random variance.",
    },
    {
      id: "one-change",
      text: "Change one meaningful variable at a time so its effect can be attributed.",
      explanation:
        "Correct: isolating single variables ensures causal attribution, confirming whether an adjustment improved or degraded output.",
    },
    {
      id: "record-failures",
      text: "Record which cases fail and classify the failure as instruction, context, or task decomposition.",
      explanation:
        "Correct: systematic failure classification drives targeted engineering fixes rather than vague prompt edits.",
    },
    {
      id: "change-everything",
      text: "Change the model, prompt, and output format at the same time to move faster.",
      explanation:
        "Incorrect: altering multiple variables simultaneously destroys causal attribution, making it impossible to determine what caused shifts.",
    },
    {
      id: "judge-fluency",
      text: "Use how fluent the answer sounds as the main success measure.",
      explanation:
        "Incorrect: fluency is an unreliable proxy that fails to measure factual accuracy, schema compliance, or task completeness.",
    },
    {
      id: "remove-edge-cases",
      text: "Remove the hardest test cases so the pass rate improves.",
      explanation:
        "Incorrect: pruning difficult edge cases creates artificial pass rates while blinding teams to production failure risks.",
    },
  ],
  correctChoiceIds: ["baseline-same-cases", "one-change", "record-failures"],
  correctExplanation:
    "Disciplined iteration relies on stable baselines, representative test suites, and structured defect taxonomies. Evaluating identical inputs, isolating single technical adjustments, and logging error archetypes transforms ad-hoc experimentation into repeatable engineering.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});

const analysisTaskStrategy: Question = questionSchema.parse({
  id: "prompting-analysis-task-strategy",
  type: "single-choice",
  stem: "A researcher must analyze 40 interview transcripts for recurring themes without losing traceability to the source. Which prompting strategy fits this task best?",
  choices: [
    {
      id: "structured-extraction",
      text: "Ask for structured extraction of themes with supporting quotes and transcript IDs, then synthesize the extracted evidence.",
      explanation:
        "Correct: structured extraction with verbatim quotes and transcript IDs preserves traceability, enabling downstream synthesis grounded in cited data.",
    },
    {
      id: "brainstorm-first",
      text: "Ask for a broad brainstorm of possible themes before reading the transcripts.",
      explanation:
        "Incorrect: brainstorming themes prior to data ingestion biases the analysis and fails to ground conclusions in empirical evidence.",
    },
    {
      id: "one-paragraph",
      text: "Ask for a single paragraph that summarizes all 40 transcripts.",
      explanation:
        "Incorrect: a single summary paragraph loses critical granular nuance, source attribution, and conflicting participant perspectives.",
    },
    {
      id: "creative-story",
      text: "Ask Claude to write a creative narrative that makes the findings more engaging.",
      explanation:
        "Incorrect: the research objective is auditable qualitative analysis; creative storytelling risks introducing ungrounded narrative details.",
    },
  ],
  correctChoiceIds: ["structured-extraction"],
  correctExplanation:
    "For multi-document qualitative analysis, decompose the workflow: extract recurring themes into structured tables with supporting quotes and transcript IDs before synthesizing overarching findings. This preserves rigorous provenance and enables verification.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});

const taskTypeAdaptation: Question = questionSchema.parse({
  id: "prompting-adapt-task-types",
  type: "multiple-response",
  stem: "Which three prompt adaptations fit the task type? Select three.",
  choices: [
    {
      id: "drafting-audience",
      text: "For drafting, specify the audience, tone, constraints, and a short example of the desired style.",
      explanation:
        "Correct: drafting requires explicit audience profiling, tone guidelines, and stylistic few-shot exemplars to hit target formatting.",
    },
    {
      id: "brainstorm-options",
      text: "For brainstorming, ask for many diverse options first and defer judgment until a later step.",
      explanation:
        "Correct: decoupling broad divergent ideation from critical filtering maximizes novelty and prevents premature convergence.",
    },
    {
      id: "analysis-criteria",
      text: "For analysis, define the comparison criteria and require evidence for each conclusion.",
      explanation:
        "Correct: explicit comparative criteria and mandatory empirical evidence make analytical evaluations objective and verifiable.",
    },
    {
      id: "research-memory-only",
      text: "For research, rely on the model's memory and skip source citations to save time.",
      explanation:
        "Incorrect: research demands external retrieval and verifiable source citations; relying solely on parametric memory risks stale data.",
    },
    {
      id: "drafting-no-audience",
      text: "For drafting, omit the audience so Claude can decide who should read it.",
      explanation:
        "Incorrect: omitting target audience parameters causes mismatched tone and erratic depth; audience specification is foundational.",
    },
    {
      id: "brainstorm-one-answer",
      text: "For brainstorming, ask for one safe answer so the team can decide quickly.",
      explanation:
        "Incorrect: restricting ideation to a single safe option defeats the fundamental purpose of brainstorming.",
    },
  ],
  correctChoiceIds: ["drafting-audience", "brainstorm-options", "analysis-criteria"],
  correctExplanation:
    "Tailor prompting strategies to operational archetypes: drafting requires audience framing and few-shot exemplars; brainstorming benefits from divergent ideation and deferred judgment; analysis demands structured comparative rubrics and grounded citations.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});

const recurringReportFeature: Question = questionSchema.parse({
  id: "product-feature-recurring-report",
  type: "single-choice",
  stem: "A team produces the same quarterly market report from a stable set of PDFs and a fixed template. Which Claude feature fits this work best?",
  choices: [
    {
      id: "project-knowledge-instructions",
      text: "A project that holds the PDFs in project knowledge and the template and house style in project instructions.",
      explanation:
        "Correct: recurring workflows with stable source documentation and consistent templates represent the ideal use case for Project Knowledge and Instructions.",
    },
    {
      id: "one-off-chat",
      text: "A new standalone chat for every quarter, with the PDFs pasted in manually.",
      explanation:
        "Incorrect: ad-hoc chats lack persistent workspace configuration, requiring redundant uploads each quarter and risking missing context.",
    },
    {
      id: "research-every-time",
      text: "Research mode every quarter, even though the source PDFs are already approved and stable.",
      explanation:
        "Incorrect: Research is designed for open-ended multi-source external searches; using it for approved internal PDFs adds unnecessary cost and variance.",
    },
    {
      id: "artifact-only",
      text: "An artifact with no project or source documents, rebuilt from memory each quarter.",
      explanation:
        "Incorrect: Artifacts are an output container, not a persistent repository; lacking reference files leads to ungrounded reporting.",
    },
  ],
  correctChoiceIds: ["project-knowledge-instructions"],
  correctExplanation:
    "Recurring reporting driven by approved source PDFs and standardized formatting belongs in Claude Projects: Project Knowledge maintains persistent reference assets while Project Instructions enforce formatting conventions and house style across all chats.",
  sourceIds: [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
    "anthropic-artifacts-doc",
  ],
});

const featureFitChoices: Question = questionSchema.parse({
  id: "product-feature-fit-choices",
  type: "multiple-response",
  stem: "Which three feature choices fit the described work? Select three.",
  choices: [
    {
      id: "research-current",
      text: "Research for a current multi-source briefing that needs citations and synthesis across the web and connected tools.",
      explanation:
        "Correct: Research executes sequential search queries across web connectors to produce cited multi-source syntheses.",
    },
    {
      id: "artifact-reusable",
      text: "An artifact for a document or code file that will be edited, iterated on, and reused.",
      explanation:
        "Correct: Artifacts are designed for substantial, self-contained deliverables (code, documents, diagrams) intended for iterative editing.",
    },
    {
      id: "project-recurring",
      text: "A project with knowledge and instructions for recurring work with stable source documents.",
      explanation:
        "Correct: Projects provide shared knowledge and custom instructions for collaborative, recurring workflows.",
    },
    {
      id: "chat-long-workspace",
      text: "A single long chat as the permanent workspace for a client across many months.",
      explanation:
        "Incorrect: prolonged chats suffer from context dilution, hit token limits, and lack modular configuration; Projects are the proper workspace.",
    },
    {
      id: "research-quick-fact",
      text: "Research for a single quick factual lookup that one short answer can resolve.",
      explanation:
        "Incorrect: simple factual lookups should use standard search or chat; initiating deep research introduces unnecessary overhead.",
    },
    {
      id: "artifact-status",
      text: "An artifact for a one-line status update in an ongoing chat.",
      explanation:
        "Incorrect: concise status messages belong inline; Artifacts are reserved for substantial, standalone deliverables.",
    },
  ],
  correctChoiceIds: ["research-current", "artifact-reusable", "project-recurring"],
  correctExplanation:
    "Align features with task structure: Research for multi-step external search with citations; Artifacts for substantial, editable deliverables; Projects for recurring team workflows with stable knowledge. Standard chat and inline replies remain optimal for concise, ephemeral queries.",
  sourceIds: [
    "anthropic-research-help",
    "anthropic-artifacts-doc",
    "anthropic-projects-overview",
  ],
});

const familySpeedCost: Question = questionSchema.parse({
  id: "model-family-speed-cost",
  type: "single-choice",
  stem: "A support team classifies thousands of short tickets each day. Accuracy matters, but latency and cost are tight. Which starting approach fits Anthropic's model-selection guidance?",
  choices: [
    {
      id: "efficiency-first",
      text: "Start with a faster, lower-cost model, test it on real tickets, and upgrade only if it misses the quality bar.",
      explanation:
        "Correct: the Efficiency-First approach begins with the fastest, most economical model (e.g., Haiku), benchmarked against ground truth, upgrading only when a capability deficit is demonstrated.",
    },
    {
      id: "largest-first",
      text: "Start with the largest, most expensive model and never evaluate a cheaper option.",
      explanation:
        "Incorrect: over-provisioning models for high-volume simple classification unnecessarily inflates costs and latency without empirical justification.",
    },
    {
      id: "newest-only",
      text: "Choose the newest model name regardless of the task or measured results.",
      explanation:
        "Incorrect: model recency does not guarantee fitness; empirical evaluation on representative workload data is required.",
    },
    {
      id: "random-choice",
      text: "Rotate models randomly each week to see which one feels better.",
      explanation:
        "Incorrect: rotating models ad-hoc eliminates stable baselines and prevents objective evaluation.",
    },
  ],
  correctChoiceIds: ["efficiency-first"],
  correctExplanation:
    "For high-volume, latency-sensitive tasks like ticket triage, the Efficiency-First strategy is recommended: evaluate the fastest, most cost-effective tier on representative tickets, upgrading to higher tiers only if empirical evaluations prove a capability gap.",
  sourceIds: [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ],
});

const familyTradeoffs: Question = questionSchema.parse({
  id: "model-family-tradeoffs",
  type: "multiple-response",
  stem: "Which three statements about Claude model families are defensible? Select three.",
  choices: [
    {
      id: "tradeoffs",
      text: "Families differ in the balance of capability, latency, and cost.",
      explanation:
        "Correct: model families represent distinct trade-off profiles across reasoning capability, latency, and pricing.",
    },
    {
      id: "check-current",
      text: "The current lineup, prices, and limits should be checked in official documentation because they change.",
      explanation:
        "Correct: model names, token pricing, rate limits, and context windows evolve over time; official documentation provides the current baseline.",
    },
    {
      id: "benchmark",
      text: "A model should be tested on real prompts and edge cases before the team standardizes on it.",
      explanation:
        "Correct: empirical evaluation against representative enterprise prompts and edge cases is required before architectural standardization.",
    },
    {
      id: "haiku-always-best",
      text: "The smallest family is always the most accurate choice.",
      explanation:
        "Incorrect: smaller models prioritize speed and cost efficiency, and may lack reasoning depth on complex multi-step tasks.",
    },
    {
      id: "opus-always-cheapest",
      text: "The largest family is always the cheapest per token.",
      explanation:
        "Incorrect: highest-tier models carry the highest token pricing due to superior reasoning capabilities.",
    },
    {
      id: "name-forever",
      text: "A model's family name guarantees its quality for every future task.",
      explanation:
        "Incorrect: quality depends on task fit, prompt structure, domain data, and model version; family labels do not guarantee performance.",
    },
  ],
  correctChoiceIds: ["tradeoffs", "check-current", "benchmark"],
  correctExplanation:
    "Model families embody distinct trade-offs across intelligence, speed, and cost. Pricing and limits evolve over time. Technical selection must be validated through internal benchmarks using representative task prompts and edge cases rather than marketing assertions.",
  sourceIds: [
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ],
});

const complexAnalysisModel: Question = questionSchema.parse({
  id: "model-task-fit-complex",
  type: "single-choice",
  stem: "A finance team needs a multi-step analysis of long contracts where errors are costly. Which model-selection approach is best?",
  choices: [
    {
      id: "capability-first",
      text: "Start with a capability-first model, evaluate it on representative contracts, then optimize cost and effort if quality allows.",
      explanation:
        "Correct: high-stakes, multi-step reasoning workflows warrant a Capability-First approach, adopting the highest-capability tier first and optimizing cost only after quality criteria are proven.",
    },
    {
      id: "cheapest-no-eval",
      text: "Choose the cheapest model immediately and skip evaluation to save budget.",
      explanation:
        "Incorrect: selecting the cheapest model without evaluation risks expensive downstream errors in financial and contract workflows.",
    },
    {
      id: "largest-no-eval",
      text: "Choose the largest model and never measure whether it meets the task's requirements.",
      explanation:
        "Incorrect: even top-tier models require evaluation on real contracts to identify prompt weaknesses and verify constraint adherence.",
    },
    {
      id: "marketing",
      text: "Choose based on a vendor marketing claim rather than the team's own test set.",
      explanation:
        "Incorrect: vendor claims cannot substitute for empirical benchmarking against the enterprise's own data and risk tolerances.",
    },
  ],
  correctChoiceIds: ["capability-first"],
  correctExplanation:
    "When error costs are severe and tasks demand deep multi-step reasoning, adopt a Capability-First strategy: begin with the most capable model tier, evaluate performance against representative complex contracts, and subsequently optimize latency or cost if quality comfortably exceeds thresholds.",
  sourceIds: [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ],
});

const modelSelectionPractices: Question = questionSchema.parse({
  id: "model-task-fit-practices",
  type: "multiple-response",
  stem: "Which three are sound model-selection practices? Select three.",
  choices: [
    {
      id: "criteria",
      text: "Define criteria for capability, speed, cost, and acceptable quality before comparing models.",
      explanation:
        "Correct: establishing objective rubrics across intelligence, latency, and cost enables rigorous, unbiased architectural comparisons.",
    },
    {
      id: "real-benchmarks",
      text: "Benchmark candidates on real prompts, including edge cases and failure modes.",
      explanation:
        "Correct: testing on representative domain data and adversarial edge cases reveals true production reliability.",
    },
    {
      id: "quality-cost",
      text: "Compare output quality and total cost before committing to a model.",
      explanation:
        "Correct: architectural decisions must balance output accuracy against total operational cost per successful outcome.",
    },
    {
      id: "always-newest",
      text: "Always select the newest model without running a local evaluation.",
      explanation:
        "Incorrect: recency does not guarantee task fit; empirical testing on your specific workload remains mandatory.",
    },
    {
      id: "cost-before-quality",
      text: "Optimize for the lowest cost first and only check quality if users complain.",
      explanation:
        "Incorrect: prioritizing cost reduction before verifying quality thresholds introduces undetected production failures.",
    },
    {
      id: "ignore-edge",
      text: "Exclude edge cases from the benchmark so the results look consistent.",
      explanation:
        "Incorrect: omitting edge cases distorts benchmark validity and leaves the system vulnerable to real-world failures.",
    },
  ],
  correctChoiceIds: ["criteria", "real-benchmarks", "quality-cost"],
  correctExplanation:
    "Sound model selection requires defining multidimensional criteria (capability, latency, cost), running empirical benchmarks against representative datasets including edge cases, and balancing output accuracy against total cost per successful outcome.",
  sourceIds: [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ],
});

export const promptingExpansionQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(iterateOnEvidence, "prompting-iterate", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(systematicIteration, "prompting-iterate", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(analysisTaskStrategy, "prompting-adapt-strategies", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(taskTypeAdaptation, "prompting-adapt-strategies", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
];

export const productSelectionExpansionQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(recurringReportFeature, "product-feature-selection", [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
    "anthropic-artifacts-doc",
  ]),
  reviewedEntry(featureFitChoices, "product-feature-selection", [
    "anthropic-research-help",
    "anthropic-artifacts-doc",
    "anthropic-projects-overview",
  ]),
  reviewedEntry(familySpeedCost, "model-family-selection", [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ]),
  reviewedEntry(familyTradeoffs, "model-family-selection", [
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ]),
  reviewedEntry(complexAnalysisModel, "model-task-fit", [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ]),
  reviewedEntry(modelSelectionPractices, "model-task-fit", [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ]),
];
