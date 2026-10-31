import {
  questionSchema,
  type Question,
  type QuestionBankEntry,
} from "../../../domain";
import { reviewedEntry } from "./bank-helpers";

/* ── Domain 1: Prompting and Task Execution ───────────────────────────── */

/**
 * Domain 1 - Objective: prompting-create-effective-prompts (few-shot distributional diversity)
 */
const promptingFewShotDistributionalDiversity: Question = questionSchema.parse({
  id: "prompting-few-shot-distributional-diversity",
  type: "single-choice",
  stem: "An enterprise support team is designing few-shot examples to teach Claude how to classify customer tickets into four urgency categories. During testing, Claude persistently over-assigns the 'Critical' label. Which few-shot design correction best follows Anthropic best practices?",
  choices: [
    {
      id: "add-all-critical",
      text: "Provide ten consecutive examples of 'Critical' tickets so Claude learns all edge cases of urgent issues.",
      explanation:
        "Incorrect: providing exclusively Critical examples introduces severe distributional skew, exacerbating the model's bias toward the Critical label.",
    },
    {
      id: "balanced-representative-distribution",
      text: "Ensure the few-shot set has a balanced, representative distribution across all four categories, including subtle boundary cases and negative examples.",
      explanation:
        "Correct: Anthropic recommends that few-shot exemplars reflect the expected real-world distribution and include subtle boundary edge cases to teach precise classification boundaries.",
    },
    {
      id: "remove-all-few-shots",
      text: "Remove all few-shot examples and rely entirely on increasing the model temperature to 1.0.",
      explanation:
        "Incorrect: increasing temperature increases output randomness and instability; it cannot resolve systemic classification bias.",
    },
    {
      id: "caps-instruction-only",
      text: "Write 'DO NOT OVERUSE CRITICAL' in capital letters in the user prompt.",
      explanation:
        "Incorrect: capitalized negative directives provide far weaker behavioral conditioning than balanced, representative few-shot demonstration pairs.",
    },
  ],
  correctChoiceIds: ["balanced-representative-distribution"],
  correctExplanation:
    "Models learn inductively from few-shot exemplars; an exemplar set disproportionately skewed toward one category induces systemic labeling bias. A production few-shot suite must balance representation across all target classes and include subtle boundary examples to calibrate decision thresholds.",
  sourceIds: ["anthropic-prompting-best-practices"],
});

/**
 * Domain 1 - Objective: prompting-iterate (chain-of-thought XML separation)
 */
const promptingCotXmlThinkingSeparation: Question = questionSchema.parse({
  id: "prompting-cot-xml-thinking-separation",
  type: "multiple-response",
  stem: "A financial analyst prompts Claude to perform multi-step tax calculations and output a clean JSON response for downstream API processing. However, when Claude reasons step-by-step inline, the JSON parser breaks. Which two prompt engineering techniques resolve this issue? Select two.",
  choices: [
    {
      id: "separate-thinking-tags",
      text: "Instruct Claude to execute its step-by-step mathematical reasoning inside `<thinking>` tags before delivering the JSON inside `<output>` tags.",
      explanation:
        "Correct: isolating chain-of-thought reasoning inside designated `<thinking>` tags enables downstream parsers to extract pure JSON from `<output>` without sacrificing multi-step mathematical accuracy.",
    },
    {
      id: "disable-cot-completely",
      text: "Forbid Claude from reasoning step-by-step and force immediate raw JSON generation.",
      explanation:
        "Incorrect: forcing the model to omit step-by-step reasoning on complex multi-step financial calculations significantly degrades calculation accuracy.",
    },
    {
      id: "prefill-output-opening-tag",
      text: "Prefill the assistant response with `<output>` or `{` to guide the model directly into structured output syntax.",
      explanation:
        "Correct: prefilling the assistant turn anchors output generation directly into the required schema syntax, eliminating conversational conversational filler that breaks parsers.",
    },
    {
      id: "switch-to-unstructured-markdown",
      text: "Abandon JSON and request freeform narrative markdown instead.",
      explanation:
        "Incorrect: downstream API integrations require deterministic machine-readable schemas and cannot parse freeform prose.",
    },
  ],
  correctChoiceIds: ["separate-thinking-tags", "prefill-output-opening-tag"],
  correctExplanation:
    "Anthropic advocates two key techniques when combining deep reasoning with rigid machine schemas: (1) encapsulate chain-of-thought scratchpads within `<thinking>` tags decoupled from designated `<output>` envelopes, and (2) prefill the assistant turn with opening syntax (`<output>` or `{`) to guarantee clean parsing.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-structured-outputs-doc",
  ],
});

/* ── Domain 2: Output Evaluation and Validation ───────────────────────── */

/**
 * Domain 2 - Objective: output-human-review (automated vs human eval trade-off)
 */
const outputAutomatedVsHumanEvalTradeoff: Question = questionSchema.parse({
  id: "output-automated-vs-human-eval-tradeoff",
  type: "single-choice",
  stem: "An enterprise is setting up an evaluation pipeline for a customer-facing medical triage assistant. Which evaluation approach best balances scalability with high-stakes risk governance according to Anthropic principles?",
  choices: [
    {
      id: "pure-automated-metrics",
      text: "Rely solely on automated keyword matching and latency metrics to evaluate 10,000 queries per day without human review.",
      explanation:
        "Incorrect: keyword matching cannot evaluate clinical safety, medical nuances, or lethal dosage hallucinations in high-stakes healthcare.",
    },
    {
      id: "hybrid-automated-screening-expert-sampling",
      text: "Use automated model-graded rubrics to screen high-volume traffic, and mandate expert human review (clinicians) for all borderline scores and high-risk flagged cases.",
      explanation:
        "Correct: a layered evaluation architecture combines automated model-graded rubrics for scalable triage with mandatory expert clinician review on high-risk or borderline cases.",
    },
    {
      id: "manual-review-all-queries",
      text: "Hire clinicians to manually inspect every single trivial query such as clinic address lookups.",
      explanation:
        "Incorrect: manually inspecting 100% of routine informational queries creates an unsustainable operational bottleneck and fails to utilize automated screening.",
    },
    {
      id: "user-thumbs-up-only",
      text: "Rely exclusively on end-user thumbs-up/thumbs-down ratings collected on the mobile interface.",
      explanation:
        "Incorrect: lay patient feedback cannot reliably audit clinical accuracy or regulatory medical compliance.",
    },
  ],
  correctChoiceIds: ["hybrid-automated-screening-expert-sampling"],
  correctExplanation:
    "Anthropic's evaluation architecture advocates layered screening: automate high-volume evaluation using deterministic rubrics and model-graded evaluators, while routing high-stakes, safety-sensitive, or borderline cases to qualified human domain experts (clinicians).",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-reduce-hallucinations-doc"],
});

/**
 * Domain 2 - Objective: output-identify-hallucinations (adversarial counterfactual probe)
 */
const outputAdversarialCounterfactualProbe: Question = questionSchema.parse({
  id: "output-adversarial-counterfactual-probe",
  type: "multiple-response",
  stem: "A quality assurance engineer wants to test whether Claude will hallucinate when asked about internal corporate policies that do not exist. Which two testing practices represent sound adversarial evaluation? Select two.",
  choices: [
    {
      id: "negative-constraint-probing",
      text: "Submit questions with false premises (e.g., 'Summarize our 2025 Mars relocation policy') and verify that Claude explicitly acknowledges that no such policy exists rather than fabricating details.",
      explanation:
        "Correct: counterfactual and negative probing tests whether the model truthfully acknowledges missing context rather than inventing plausible fabrications.",
    },
    {
      id: "evaluate-groundedness-citation-matching",
      text: "Provide an authentic handbook and test whether Claude invents clause numbers or non-existent section titles when answering specific compliance questions.",
      explanation:
        "Correct: auditing citation provenance and detecting fabricated authority/statutory clauses is a primary vector in hallucination evaluation.",
    },
    {
      id: "test-only-with-existing-faqs",
      text: "Test exclusively with questions taken verbatim from existing published FAQs that Claude has seen repeatedly.",
      explanation:
        "Incorrect: testing solely with familiar published FAQs fails to evaluate model behavior when encountering unknown data or false premises.",
    },
    {
      id: "benchmark-only-by-output-length",
      text: "Measure only the total token count and consider any answer above 500 words as hallucination-free.",
      explanation:
        "Incorrect: token length has no correlation with factual accuracy; lengthy prose can easily be entirely fabricated.",
    },
  ],
  correctChoiceIds: [
    "negative-constraint-probing",
    "evaluate-groundedness-citation-matching",
  ],
  correctExplanation:
    "Rigorous hallucination evaluation requires: (1) false premise probing to verify that Claude appropriately admits absence of information, and (2) citation verification to identify fabricated statutory sections, clause numbers, or external authorities.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-reduce-hallucinations-doc"],
});

/**
 * Domain 2 - Objective: output-format-selection (markdown table schema fidelity)
 */
const outputMarkdownTableSchemaFidelity: Question = questionSchema.parse({
  id: "output-markdown-table-schema-fidelity",
  type: "single-choice",
  stem: "An operations team needs Claude to extract data from logistics invoices and produce a table for an executive summary report. Which prompt constraint ensures the highest structural reliability and data fidelity?",
  choices: [
    {
      id: "ask-for-pretty-table",
      text: "Ask Claude to 'make a nice clean table with whatever columns look good'.",
      explanation:
        "Incorrect: open-ended requests lacking explicit column schemas cause Claude to guess field names, leading to inconsistent tabular structures across runs.",
    },
    {
      id: "explicit-columns-and-null-handling",
      text: "Define the exact column headers required, specify markdown table format, and instruct Claude on how to handle missing data (e.g., write 'N/A' rather than omitting cells or inventing values).",
      explanation:
        "Correct: specifying explicit column names, required table syntax, and deterministic null-handling rules (e.g., emit 'N/A') prevents schema misalignment and hallucinated values.",
    },
    {
      id: "request-latex-matrix-only",
      text: "Require output in raw LaTeX matrix notation for executive reporting.",
      explanation:
        "Incorrect: LaTeX matrices are unsuitable for business executive reporting and add unnecessary parsing friction.",
    },
    {
      id: "post-process-with-regex-only",
      text: "Let Claude write paragraphs and instruct downstream human analysts to parse the numbers manually.",
      explanation:
        "Incorrect: shifts structural extraction entirely to manual labor, failing to utilize Claude's formatting capabilities.",
    },
  ],
  correctChoiceIds: ["explicit-columns-and-null-handling"],
  correctExplanation:
    "Anthropic guidelines indicate that generating reliable tabular data requires explicit schema definitions: mandate exact column headers, dictate formatting conventions, and specify null-handling rules (e.g., write 'N/A' for missing cells) to avoid dropped columns or invented values.",
  sourceIds: ["anthropic-prompting-best-practices"],
});

/* ── Domain 3: Context and Retrieval ──────────────────────────────────── */

/**
 * Domain 3 - Objective: model-task-fit (hybrid routing cost latency)
 */
const productModelHybridRoutingCostLatency: Question = questionSchema.parse({
  id: "product-model-hybrid-routing-cost-latency",
  type: "single-choice",
  stem: "An enterprise SaaS platform handles 2,000,000 incoming support queries daily. 85% of queries are routine FAQ checks (e.g., reset password, store hours), while 15% involve complex technical debugging of distributed cloud architectures. Which architecture satisfies performance SLAs while minimizing operational costs?",
  choices: [
    {
      id: "route-all-to-opus",
      text: "Route 100% of all queries to Claude 3 Opus to ensure maximum possible intelligence for every request.",
      explanation:
        "Incorrect: routing routine FAQs to top-tier reasoning models creates massive financial waste and unacceptable latency overhead.",
    },
    {
      id: "route-all-to-haiku",
      text: "Route 100% of all queries to Claude 3.5 Haiku to minimize latency and token expenditure across the board.",
      explanation:
        "Incorrect: Haiku may struggle to resolve the deep multi-step distributed system debugging required in the complex 15% cohort.",
    },
    {
      id: "intelligent-router-haiku-sonnet",
      text: "Implement a lightweight classifier using Claude 3.5 Haiku to route routine FAQ requests to Haiku, and escalate complex technical debugging to Claude 3.5 Sonnet.",
      explanation:
        "Correct: the Router Pattern leverages Claude 3.5 Haiku for sub-second, low-cost triage on 85% of traffic, escalating the 15% complex technical workload to Claude 3.5 Sonnet.",
    },
    {
      id: "manual-triage-queue",
      text: "Hold all incoming requests in a manual human review queue before sending any prompt to Claude.",
      explanation:
        "Incorrect: manual human triage is physically infeasible at 2,000,000 requests per day.",
    },
  ],
  correctChoiceIds: ["intelligent-router-haiku-sonnet"],
  correctExplanation:
    "Anthropic advocates the Router Pattern to balance capability, latency, and cost: deploy Claude 3.5 Haiku as an ultra-fast, low-cost classifier dispatching high-volume routine queries to Haiku while escalating complex technical workloads to Claude 3.5 Sonnet.",
  sourceIds: ["anthropic-choosing-model", "anthropic-building-effective-agents"],
});

/**
 * Domain 3 - Objective: context-memory-management (long-context retrieval needle)
 */
const contextMemoryLongContextRetrievalNeedle: Question = questionSchema.parse({
  id: "context-memory-long-context-retrieval-needle",
  type: "multiple-response",
  stem: "A research team needs Claude to analyze a 180,000-token legal repository containing 40 interrelated contracts. Which two practices optimize retrieval accuracy and minimize needle-in-a-haystack degradation? Select two.",
  choices: [
    {
      id: "place-question-at-the-end",
      text: "Place the core query and instruction at the very end of the prompt, after the full repository context.",
      explanation:
        "Correct: Anthropic long-context research demonstrates that placing specific instructions and queries at the end of the prompt maximizes attention recency on the retrieval objective.",
    },
    {
      id: "structure-with-xml-metadata",
      text: "Structure each document inside individual `<document id='...'>` tags with explicit title and section metadata.",
      explanation:
        "Correct: encapsulating documents inside labeled XML tags with explicit metadata enables precise referencing and prevents boundary confusion across massive context spans.",
    },
    {
      id: "place-question-at-the-start-only",
      text: "Put the question only at the top of the prompt and leave the end with raw unformatted text.",
      explanation:
        "Incorrect: placing queries solely at the top of a 180,000-token prompt increases the risk of attention fade across massive context spans.",
    },
    {
      id: "shuffle-chunks-randomly",
      text: "Randomly split and shuffle document paragraphs to prevent Claude from developing positional bias.",
      explanation:
        "Incorrect: randomly shuffling legal text destroys semantic coherence and cross-clause legal dependencies, severely degrading analysis.",
    },
  ],
  correctChoiceIds: [
    "place-question-at-the-end",
    "structure-with-xml-metadata",
  ],
  correctExplanation:
    "Anthropic Long Context Best Practices establish two fundamental rules: (1) encapsulate documents within structured XML envelopes (`<document id='...'>`) with metadata attributes, and (2) place the operational query and execution instructions at the bottom of the prompt following the context.",
  sourceIds: ["anthropic-context-windows-doc", "anthropic-prompting-best-practices"],
});

/* ── Domain 4: Claude Models, Tool Use, and Workflows ─────────────────── */

/**
 * Domain 4 - Objective: workflow-solution-design (tool use error handling fallback)
 */
const workflowToolUseErrorHandlingFallback: Question = questionSchema.parse({
  id: "workflow-tool-use-error-handling-fallback",
  type: "single-choice",
  stem: "An agentic workflow calls a third-party weather API tool, but the external server intermittently returns HTTP 503 Service Unavailable. How should the workflow orchestrator be designed to handle this failure robustly?",
  choices: [
    {
      id: "crash-and-terminate-session",
      text: "Crash the entire application immediately and display an unhandled exception stack trace to the user.",
      explanation:
        "Incorrect: crashing the application damages user experience and violates basic principles of resilient system design.",
    },
    {
      id: "feed-error-back-to-claude-with-retry",
      text: "Return a structured tool error response back into the conversation context (e.g., status 503, retry-after), allowing Claude to inform the user gracefully or try an alternate data source.",
      explanation:
        "Correct: Anthropic Tool Use guidelines specify returning structured error payloads (`is_error: true` or descriptive status messages) into the conversation, enabling Claude to gracefully explain issues or execute fallback tools.",
    },
    {
      id: "invent-synthetic-weather-data",
      text: "Instruct the tool executor to invent realistic-looking sunny weather data so Claude does not notice the downtime.",
      explanation:
        "Incorrect: fabricating synthetic data violates factual integrity and introduces severe safety hazards.",
    },
    {
      id: "infinite-blocking-loop",
      text: "Freeze the user thread in an infinite blocking sleep loop until the third-party server recovers.",
      explanation:
        "Incorrect: blocking threads indefinitely exhausts system resources and violates application timeouts.",
    },
  ],
  correctChoiceIds: ["feed-error-back-to-claude-with-retry"],
  correctExplanation:
    "Under Anthropic's 'Building Effective Agents' framework, tool execution failures should return structured error objects back into the conversation turn. This equips Claude to interpret the failure, provide an informative response to the user, or invoke alternate fallback tools.",
  sourceIds: ["anthropic-building-effective-agents"],
});

/**
 * Domain 4 - Objective: workflow-research-planning (evaluator-optimizer stopping criterion)
 */
const workflowEvaluatorOptimizerStoppingCriterion: Question = questionSchema.parse({
  id: "workflow-evaluator-optimizer-stopping-criterion",
  type: "multiple-response",
  stem: "A software engineering team is implementing an Evaluator-Optimizer loop where Claude writes code and an evaluator LLM inspects it against a rubric. Which two design guardrails are essential to prevent infinite loops and runaway API costs? Select two.",
  choices: [
    {
      id: "maximum-iteration-ceiling",
      text: "Enforce a strict maximum iteration limit (e.g., max 3 or 4 revision cycles) that triggers escalation if the rubric threshold is not met.",
      explanation:
        "Correct: a hard iteration ceiling is mandatory to bound recursion, prevent infinite execution loops, and control API expenditures.",
    },
    {
      id: "quantitative-satisfaction-threshold",
      text: "Define explicit, measurable rubric criteria (e.g., all unit tests pass, zero security vulnerabilities) as the deterministic exit condition.",
      explanation:
        "Correct: objective, measurable satisfaction criteria provide a deterministic stopping condition, exiting the loop the instant output meets quality bars.",
    },
    {
      id: "run-forever-until-perfection",
      text: "Allow the loop to run indefinitely until the code achieves 100% aesthetic perfection according to arbitrary subjective criteria.",
      explanation:
        "Incorrect: unconstrained loops governed by subjective standards cause oscillation and exhaust token budgets.",
    },
    {
      id: "disable-evaluator-feedback-context",
      text: "Omit previous critique history so the generator LLM starts from scratch on each loop.",
      explanation:
        "Incorrect: omitting prior critique history prevents progressive refinement, causing the generator to repeat previous mistakes.",
    },
  ],
  correctChoiceIds: [
    "maximum-iteration-ceiling",
    "quantitative-satisfaction-threshold",
  ],
  correctExplanation:
    "Anthropic specifies that Evaluator-Optimizer architectures must incorporate two core guardrails: (1) deterministic stopping conditions defined by quantitative rubrics, and (2) a strict maximum iteration ceiling to prevent runaway costs and infinite loops.",
  sourceIds: ["anthropic-building-effective-agents"],
});

/* ── Domain 5: Configuration and Knowledge Management ─────────────────── */

/**
 * Domain 5 - Objective: config-project-instructions (workspace sharing conflict resolution)
 */
const configWorkspaceSharingConflictResolution: Question = questionSchema.parse({
  id: "config-workspace-sharing-conflict-resolution",
  type: "single-choice",
  stem: "A cross-functional product team shares a Claude Enterprise Project. The design team adds instructions demanding 'vibrant, emotive narrative prose', while the engineering team adds instructions demanding 'concise, technical bullet points with no adjectives'. Claude produces erratic, inconsistent outputs. How should the project configuration be restructured?",
  choices: [
    {
      id: "leave-both-and-let-claude-guess",
      text: "Keep both sets of instructions in the project brief and let Claude guess which style to use based on the user's name.",
      explanation:
        "Incorrect: conflicting directives within Project Instructions create attention interference and unpredictable outputs.",
    },
    {
      id: "split-into-dedicated-projects",
      text: "Split the workspace into two dedicated Projects ('Product Design Studio' and 'Engineering Specs'), each with focused Project Knowledge and aligned custom instructions.",
      explanation:
        "Correct: Anthropic recommends separating workspaces into dedicated Projects when functional teams hold divergent personas, conflicting style rules, or distinct knowledge assets.",
    },
    {
      id: "write-5000-word-compromise",
      text: "Write a 5,000-word instruction attempting to blend emotive prose with strict technical syntax in every single sentence.",
      explanation:
        "Incorrect: attempting to force antithetical writing styles into a single prompt creates unnatural, confusing outputs.",
    },
    {
      id: "disable-project-instructions-completely",
      text: "Delete all Project instructions and require every user to type full company context from scratch in every chat.",
      explanation:
        "Incorrect: removing Project Instructions forfeits the primary value of shared workspace configuration.",
    },
  ],
  correctChoiceIds: ["split-into-dedicated-projects"],
  correctExplanation:
    "Claude Project Instructions should maintain a coherent, unified persona and objective. When separate teams demand mutually exclusive writing styles and constraints, the correct architectural remedy is decomposing into dedicated Projects tailored to each group's domain.",
  sourceIds: ["anthropic-projects-overview", "anthropic-projects-manage"],
});

/**
 * Domain 5 - Objective: config-knowledge-connectors (connector sync staleness alert)
 */
const configConnectorSyncStalenessAlert: Question = questionSchema.parse({
  id: "config-connector-sync-staleness-alert",
  type: "multiple-response",
  stem: "An enterprise deploys a Claude Knowledge Connector linked to their Google Drive repository. Employees report that Claude is referencing an expired travel expense policy that was superseded yesterday. Which two administrative factors explain this behavior? Select two.",
  choices: [
    {
      id: "sync-latency-or-interval",
      text: "The connector index operates on a periodic sync schedule or sync queue, meaning updates to the remote drive are not instantaneous.",
      explanation:
        "Correct: Knowledge Connectors synchronize indices on periodic schedules; updates to remote storage require indexing cycles to complete before appearing in context.",
    },
    {
      id: "duplicate-unarchived-files",
      text: "The superseded document remains in the shared Drive folder and was not archived or removed from the connector's indexing scope.",
      explanation:
        "Correct: if outdated documents remain in the indexed folder, vector search will continue retrieving them alongside new files.",
    },
    {
      id: "claude-memorizes-forever",
      text: "Claude permanently bakes all indexed files into its neural network weights, making deletion impossible.",
      explanation:
        "Incorrect: Knowledge Connectors leverage runtime RAG retrieval; they do not fine-tune or bake documents into model weights.",
    },
    {
      id: "google-drive-unsupported",
      text: "Google Drive is unsupported by Claude connectors.",
      explanation:
        "Incorrect: Google Workspace/Drive is an officially supported connector in Claude Enterprise workspaces.",
    },
  ],
  correctChoiceIds: ["sync-latency-or-interval", "duplicate-unarchived-files"],
  correctExplanation:
    "Data staleness in Knowledge Connectors typically stems from: (1) periodic synchronization latency where new remote revisions are pending index queues, and (2) poor document lifecycle hygiene where superseded files remain in indexed folders without archiving.",
  sourceIds: [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
    "anthropic-projects-rag",
  ],
});

/* ── Domain 6: Governance, Security, and Responsible AI ───────────────── */

/**
 * Domain 6 - Objective: governance-data-privacy (PII redaction pre-processing guardrail)
 */
const governancePiiRedactionPreProcessingGuardrail: Question = questionSchema.parse({
  id: "governance-pii-redaction-pre-processing-guardrail",
  type: "single-choice",
  stem: "A banking application uses Claude to summarize customer loan inquiry transcripts. Under banking secrecy laws, customer National ID numbers and credit card CVVs must never reach third-party external LLM APIs. What is the most reliable governance architecture?",
  choices: [
    {
      id: "prompt-only-please-do-not-read",
      text: "Include a system prompt asking Claude: 'Please ignore any National ID numbers or CVVs you happen to see in the prompt'.",
      explanation:
        "Incorrect: instructing the model to ignore PII still transmits sensitive data across the network to external APIs, violating banking secrecy mandates.",
    },
    {
      id: "client-side-pii-tokenization-scrubber",
      text: "Implement a deterministic, automated PII redaction/tokenization scrubber in the local pre-processing pipeline before the payload is sent to the Claude API.",
      explanation:
        "Correct: defense-in-depth architecture requires redacting or tokenizing PII on local on-premise infrastructure before payloads cross network boundaries to third-party APIs.",
    },
    {
      id: "encrypt-prompt-with-aes",
      text: "Encrypt the entire prompt with AES-256 and ask Claude to decrypt it in its neural activations without the key.",
      explanation:
        "Incorrect: language models cannot process raw ciphertext without cryptographic keys; the resulting text is unreadable.",
    },
    {
      id: "trust-post-processing-only",
      text: "Send the raw data to Claude and redact the PII only from the final generated output.",
      explanation:
        "Incorrect: post-processing output redaction does not prevent restricted data from being transmitted in prompt inputs.",
    },
  ],
  correctChoiceIds: ["client-side-pii-tokenization-scrubber"],
  correctExplanation:
    "Under Anthropic Data Governance guidelines, safeguarding highly regulated identifiers (National IDs, CVVs) requires client-side pre-processing scrubbers that redact or tokenize sensitive data on local infrastructure prior to transmitting payloads to external LLM APIs.",
  sourceIds: ["anthropic-privacy-policy", "anthropic-claude-constitution"],
});

/**
 * Domain 6 - Objective: governance-ethics (jailbreak refusal neutrality)
 */
const governanceJailbreakRefusalNeutrality: Question = questionSchema.parse({
  id: "governance-jailbreak-refusal-neutrality",
  type: "multiple-response",
  stem: "A malicious actor attempts a 'roleplay jailbreak' by instructing Claude to act as an unconstrained villain and generate ransomware code. When Claude safely declines, what two characteristics define a compliant refusal according to Claude's Constitution? Select two.",
  choices: [
    {
      id: "objective-neutral-tone",
      text: "The refusal is delivered in an objective, neutral, and matter-of-fact tone without moralizing, lecturing, or scolding the user.",
      explanation:
        "Correct: Claude's Constitution emphasizes that safety refusals must maintain an objective, dispassionate tone, avoiding moralizing lectures or preachy rebukes.",
    },
    {
      id: "clear-transparent-boundary",
      text: "The refusal clearly states what Claude cannot do (e.g., cannot generate malware or exploit code) while offering safe, educational alternatives if applicable.",
      explanation:
        "Correct: compliant refusals articulate clear technical boundaries (cannot generate exploit payloads) while offering safe defensive cybersecurity alternatives where appropriate.",
    },
    {
      id: "aggressive-user-shaming",
      text: "Claude berates the user for violating ethical standards and threatens to report them to law enforcement.",
      explanation:
        "Incorrect: Claude is trained to avoid scolding, shaming, or threatening users; anti-preachiness is a core Constitutional tenet.",
    },
    {
      id: "silent-infinite-hang",
      text: "The model returns an empty HTTP 200 response without explaining why the request was not fulfilled.",
      explanation:
        "Incorrect: returning silent empty responses obscures system state and degrades integration observability.",
    },
  ],
  correctChoiceIds: ["objective-neutral-tone", "clear-transparent-boundary"],
  correctExplanation:
    "Claude's Constitution governs principled refusals: (1) maintain a neutral, objective, non-preachy tone without lecturing users, and (2) state technical/policy boundaries transparently while offering safe educational alternatives where appropriate.",
  sourceIds: ["anthropic-claude-constitution", "anthropic-usage-policy"],
});

/* ── Domain 7: Troubleshooting and Optimization ───────────────────────── */

/**
 * Domain 7 - Objective: optimize-workflows (streaming TTFT bottleneck)
 */
const troubleshootStreamingTimeToFirstTokenBottleneck: Question = questionSchema.parse({
  id: "troubleshoot-streaming-time-to-first-token-bottleneck",
  type: "single-choice",
  stem: "A customer-facing chat application experiences a frustrating 6-second delay before users see the first word of Claude's response. The development team has already enabled Server-Sent Events (SSE) streaming. Investigation reveals the prompt includes a 12,000-token un-cached conversation history followed by an instruction to write a 1,000-word CoT before replying. What is the primary architectural remedy to reduce Time to First Token (TTFT)?",
  choices: [
    {
      id: "enable-prompt-caching-on-static-history",
      text: "Enable Prompt Caching on the static conversation history and trim unnecessary CoT requirements for simple customer conversational turns.",
      explanation:
        "Correct: Prompt Caching reduces input prefill latency by over 80% on long static history (>1,024 tokens), while pruning excessive chain-of-thought scratchpads allows immediate response streaming.",
    },
    {
      id: "switch-from-streaming-to-blocking",
      text: "Disable streaming and wait for the entire 1,000-word response to finish before sending it to the client.",
      explanation:
        "Incorrect: disabling streaming forces users to wait for the entire completion, dramatically worsening perceived latency.",
    },
    {
      id: "increase-max-tokens-to-8192",
      text: "Increase `max_tokens` parameter from 1000 to 8192.",
      explanation:
        "Incorrect: increasing `max_tokens` alters the generation ceiling; it does not accelerate Time to First Token.",
    },
    {
      id: "compress-client-browser-font",
      text: "Compress the CSS font family loaded on the user's web browser.",
      explanation:
        "Incorrect: client-side web fonts have no relation to backend LLM prefill and generation latency.",
    },
  ],
  correctChoiceIds: ["enable-prompt-caching-on-static-history"],
  correctExplanation:
    "Under Anthropic latency optimization guidelines, TTFT is primarily driven by input context prefill time. Caching static history prefixes (>1,024 tokens) slashes prefill processing times by up to 80%+, while eliminating verbose internal reasoning on routine conversational turns ensures immediate output generation.",
  sourceIds: ["anthropic-context-windows-doc", "anthropic-choosing-model"],
});

/**
 * Domain 7 - Objective: troubleshoot-diagnose (prompt caching break investigation)
 */
const troubleshootPromptCachingBreakInvestigation: Question = questionSchema.parse({
  id: "troubleshoot-prompt-caching-break-investigation",
  type: "multiple-response",
  stem: "A developer notices that their API bill spiked because Claude's Prompt Caching hit rate suddenly dropped from 95% to 0%, even though the 50-page system prompt has not changed. Which two dynamic modifications at the beginning of the API request payload explain this cache invalidation? Select two.",
  choices: [
    {
      id: "dynamic-timestamp-in-system-prompt",
      text: "Injecting the current dynamic timestamp (e.g., `Current time: 2026-10-29 14:02:11`) at the very top of the system prompt prefix.",
      explanation:
        "Correct: Prompt Caching requires exact byte-for-byte prefix matching. Inserting dynamic timestamps at the beginning of the prefix invalidates the cache hash for all subsequent tokens.",
    },
    {
      id: "random-unique-session-id-prefix",
      text: "Inserting a newly generated UUID tracking id before the static system guidelines.",
      explanation:
        "Correct: prepending unique request UUIDs destroys prefix continuity, guaranteeing a 0% cache hit rate.",
    },
    {
      id: "keeping-system-prompt-identical",
      text: "Keeping the system prompt completely byte-identical across calls.",
      explanation:
        "Incorrect: maintaining byte-identical prefixes promotes cache hits rather than invalidating them.",
    },
    {
      id: "placing-dynamic-user-input-at-the-end",
      text: "Placing dynamic user queries after the cached system breakpoint.",
      explanation:
        "Incorrect: placing dynamic variables after the cache breakpoint is the correct design pattern for preserving cache hits.",
    },
  ],
  correctChoiceIds: [
    "dynamic-timestamp-in-system-prompt",
    "random-unique-session-id-prefix",
  ],
  correctExplanation:
    "Anthropic Prompt Caching operates on strict prefix equality. Any dynamic variables (timestamps, session UUIDs, randomized headers) placed prior to static instructions invalidate all subsequent cached tokens. Dynamic inputs must always be appended after the cache breakpoint.",
  sourceIds: ["anthropic-context-windows-doc", "anthropic-prompting-best-practices"],
});

/* ── Export Expansion D Bank Entries ───────────────────────────────────── */

export const expansionDQuestionBank: QuestionBankEntry[] = [
  // Domain 1 (2 items)
  reviewedEntry(promptingFewShotDistributionalDiversity, "prompting-create-effective-prompts", [
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(promptingCotXmlThinkingSeparation, "prompting-iterate", [
    "anthropic-prompting-best-practices",
    "anthropic-structured-outputs-doc",
  ]),

  // Domain 2 (3 items)
  reviewedEntry(outputAutomatedVsHumanEvalTradeoff, "output-evaluate-accuracy", [
    "anthropic-evaluation-docs",
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(outputAdversarialCounterfactualProbe, "output-edit-adapt", [
    "anthropic-evaluation-docs",
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(outputMarkdownTableSchemaFidelity, "output-format-selection", [
    "anthropic-prompting-best-practices",
  ]),

  // Domain 3 (2 items)
  reviewedEntry(productModelHybridRoutingCostLatency, "model-task-fit", [
    "anthropic-choosing-model",
    "anthropic-building-effective-agents",
  ]),
  reviewedEntry(contextMemoryLongContextRetrievalNeedle, "context-memory-management", [
    "anthropic-context-windows-doc",
    "anthropic-prompting-best-practices",
  ]),

  // Domain 4 (2 items)
  reviewedEntry(workflowToolUseErrorHandlingFallback, "workflow-solution-design", [
    "anthropic-building-effective-agents",
  ]),
  reviewedEntry(workflowEvaluatorOptimizerStoppingCriterion, "workflow-research-planning", [
    "anthropic-building-effective-agents",
  ]),

  // Domain 5 (2 items)
  reviewedEntry(configWorkspaceSharingConflictResolution, "config-project-instructions", [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
  ]),
  reviewedEntry(configConnectorSyncStalenessAlert, "config-knowledge-connectors", [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
    "anthropic-projects-rag",
  ]),

  // Domain 6 (2 items)
  reviewedEntry(governancePiiRedactionPreProcessingGuardrail, "governance-data-privacy", [
    "anthropic-privacy-policy",
    "anthropic-claude-constitution",
  ]),
  reviewedEntry(governanceJailbreakRefusalNeutrality, "governance-ethics", [
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ]),

  // Domain 7 (2 items)
  reviewedEntry(troubleshootStreamingTimeToFirstTokenBottleneck, "optimize-workflows", [
    "anthropic-context-windows-doc",
    "anthropic-choosing-model",
  ]),
  reviewedEntry(troubleshootPromptCachingBreakInvestigation, "troubleshoot-diagnose", [
    "anthropic-context-windows-doc",
    "anthropic-prompting-best-practices",
  ]),
];
