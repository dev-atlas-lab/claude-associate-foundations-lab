import { questionSchema, type Question, type QuestionBankEntry } from "../../../domain";
import { reviewedEntry } from "./bank-helpers";

/**
 * Depth pass for the eight objectives that previously had only one reviewed
 * item. Each addition tests a different decision from the existing item:
 * diagnosing a prompt, deciding when to decompose, producing requirements
 * artifacts, choosing a first integration point, triaging a high-risk use case,
 * applying ethical safeguards, reading diagnostic evidence, and handling a
 * regression.
 *
 * Items stay at the objective level and avoid volatile model names, prices, or
 * limits. Multi-response items have exactly three correct choices, matching the
 * existing bank convention.
 */

/* ── Domain 1: Prompting and Task Execution ───────────────────────────── */

const effectivePromptAdditions: Question = questionSchema.parse({
  id: "prompting-effective-prompt-additions",
  type: "multiple-response",
  stem: "A team is rewriting a vague request for a technical runbook: \"Explain how to deploy the service.\" Which three additions are most likely to produce a usable runbook? Select three.",
  choices: [
    {
      id: "audience-and-environment",
      text: "State the audience, the target environment, and the deployment prerequisites.",
      explanation:
        "Correct: specifying audience profile, deployment environment, and prerequisites establishes operational context and required depth.",
    },
    {
      id: "success-and-format",
      text: "Define the required sections, command format, and what counts as a successful deployment.",
      explanation:
        "Correct: defining section schemas, command line formats, and objective verification criteria transforms vague prompts into auditable instructions.",
    },
    {
      id: "approved-example",
      text: "Include a short approved example and the constraints the runbook must respect.",
      explanation:
        "Correct: supplying approved few-shot exemplars and explicit operational constraints guides structural formatting and prevents hallucinated steps.",
    },
    {
      id: "role-only",
      text: "Tell Claude to act as a senior engineer without providing system details.",
      explanation:
        "Incorrect: role declarations alone cannot substitute for missing technical specifications, environment details, or deployment procedures.",
    },
    {
      id: "longer-answer",
      text: "Ask for a longer answer so that no step is missed.",
      explanation:
        "Incorrect: requesting greater token length does not guarantee missing technical steps are correctly populated and risks adding verbose filler.",
    },
    {
      id: "more-randomness",
      text: "Increase randomness so the runbook covers unusual cases.",
      explanation:
        "Incorrect: increasing randomness destabilizes output reliability and does not supply unstated infrastructure context.",
    },
  ],
  correctChoiceIds: ["audience-and-environment", "success-and-format", "approved-example"],
  correctExplanation:
    "Production-grade technical prompts articulate target audience, operating environment, prerequisites, schema format, success criteria, and approved few-shot exemplars. Vague role declarations or increased randomness cannot compensate for absent architectural context.",
  sourceIds: ["anthropic-prompting-best-practices"],
});

const decompositionDecision: Question = questionSchema.parse({
  id: "prompting-decomposition-decision",
  type: "single-choice",
  stem: "A request asks Claude to read 30 vendor contracts, compare liability terms, and produce a board summary. Which approach best applies task decomposition?",
  choices: [
    {
      id: "extract-compare-summarize",
      text: "Extract liability terms per contract into a structured table, compare the extracted terms, then draft and verify the board summary.",
      explanation:
        "Correct: decomposes the workflow into extraction, structured comparison, and executive synthesis; each sub-stage produces verifiable intermediate artifacts.",
    },
    {
      id: "summary-first",
      text: "Ask for the board summary first, then ask Claude to explain how it reached its conclusions.",
      explanation:
        "Incorrect: attempting synthesis before structured extraction encourages ungrounded hallucinations and makes auditing individual contract terms difficult.",
    },
    {
      id: "one-pass",
      text: "Put all 30 contracts in one prompt and ask for the best possible answer in one pass.",
      explanation:
        "Incorrect: ingesting 30 complex legal contracts in a single turn risks attention dilution, context rot, and dropped legal clauses.",
    },
    {
      id: "rank-before-reading",
      text: "Ask Claude to rank the contracts by risk before reading any contract text.",
      explanation:
        "Incorrect: ranking contracts before ingesting their text forces ungrounded speculation.",
    },
  ],
  correctChoiceIds: ["extract-compare-summarize"],
  correctExplanation:
    "Complex multi-document workflows demand task decomposition: extract clauses into structured tables with contract IDs, compare extracted terms across standardized dimensions, and synthesize findings into an executive brief. This preserves provenance and prevents attention loss.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-building-effective-agents",
  ],
});

/* ── Domain 4: Workflow Integration and Solution Design ───────────────── */

const requirementsArtifacts: Question = questionSchema.parse({
  id: "workflow-requirements-artifacts",
  type: "multiple-response",
  stem: "You are using Claude to analyze stakeholder notes for a new approval workflow. Which three outputs are appropriate before solution design? Select three.",
  choices: [
    {
      id: "traceable-requirements",
      text: "A traceable list of actors, goals, constraints, exceptions, and open questions, each linked to the notes.",
      explanation:
        "Correct: core requirements artifact articulating testable actors, goals, boundaries, and exceptions with source traceability.",
    },
    {
      id: "conflicts-and-gaps",
      text: "A list of conflicts and ambiguities that stakeholders must resolve.",
      explanation:
        "Correct: surfacing conflicting stakeholder expectations and data gaps prevents designing architectures on unverified assumptions.",
    },
    {
      id: "requirements-vs-solutions",
      text: "A clear separation between confirmed requirements and proposed solution ideas.",
      explanation:
        "Correct: decoupling confirmed business requirements from tentative technical solutions ensures problems are fully understood before committing to design.",
    },
    {
      id: "complete-final-design",
      text: "A complete final workflow design with no open questions.",
      explanation:
        "Incorrect: locking in a final architecture prior to resolving stakeholder ambiguities represents premature convergence.",
    },
    {
      id: "invented-requirements",
      text: "Invented requirements that fill gaps so the document looks complete.",
      explanation:
        "Incorrect: fabricating requirements to cover data gaps represents hallucination and invalidates engineering assumptions.",
    },
    {
      id: "senior-only-summary",
      text: "A summary of only the most senior stakeholder's requests.",
      explanation:
        "Incorrect: ignoring front-line operators and compliance officers omits critical edge cases and operational constraints.",
    },
  ],
  correctChoiceIds: ["traceable-requirements", "conflicts-and-gaps", "requirements-vs-solutions"],
  correctExplanation:
    "Prior to solution design, Claude should assist in structuring requirements into traceable actors/goals/constraints, cataloging stakeholder ambiguities, and rigorously decoupling confirmed requirements from tentative solution ideas.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-prompting-best-practices"],
});

const firstIntegrationPoint: Question = questionSchema.parse({
  id: "workflow-integration-first-pilot",
  type: "single-choice",
  stem: "A department wants to add Claude to an existing invoice-review workflow. Which first integration point is most defensible?",
  choices: [
    {
      id: "bounded-review-step",
      text: "A bounded, reversible review step with clear acceptance criteria, a human checkpoint, and a baseline for quality and cycle time.",
      explanation:
        "Correct: a bounded, reversible sub-task with pre-existing baselines and human review minimizes operational risk while validating empirical accuracy.",
    },
    {
      id: "final-payment-approval",
      text: "The final payment-approval decision, because it offers the largest time saving.",
      explanation:
        "Incorrect: final payment authorization carries irreversible financial liability; piloting on irreversible high-stakes gates without prior validation is unsafe.",
    },
    {
      id: "all-steps",
      text: "Every step at once so the team can learn quickly.",
      explanation:
        "Incorrect: full-workflow automation without component validation amplifies errors and obscures root causes.",
    },
    {
      id: "visible-step-no-baseline",
      text: "The most visible customer-facing step, without measuring the current process.",
      explanation:
        "Incorrect: deploying customer-facing changes without baseline metrics prevents objective assessment of whether quality improved or degraded.",
    },
  ],
  correctChoiceIds: ["bounded-review-step"],
  correctExplanation:
    "Initial pilot integrations must be bounded, reversible, and governed by explicit acceptance criteria and qualified human checkpoints. Pre-existing baselines are required to evaluate performance. Anthropic recommends starting with simple, measurable workflows and escalating complexity only as empirical improvements are proven.",
  sourceIds: [
    "anthropic-building-effective-agents",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
  ],
});

/* ── Domain 6: Governance, Risk, and Responsible Use ──────────────────── */

const highRiskUseCase: Question = questionSchema.parse({
  id: "governance-use-case-triage",
  type: "single-choice",
  stem: "A team proposes using Claude to automatically deny insurance claims above a threshold without human review. What is the most appropriate response?",
  choices: [
    {
      id: "pause-and-control",
      text: "Do not launch as proposed; treat it as a high-risk use that requires policy review, a qualified human in the loop, and disclosure.",
      explanation:
        "Correct: insurance claim determinations represent High-Risk Decisions under Anthropic's Usage Policy, requiring qualified human review and AI transparency.",
    },
    {
      id: "launch-for-speed",
      text: "Launch it because Claude can process claims faster and more consistently.",
      explanation:
        "Incorrect: operational velocity and consistency cannot waive safety policies or eliminate human accountability in consequential insurance denials.",
    },
    {
      id: "disclaimer-only",
      text: "Launch it with a disclaimer in the denial letter.",
      explanation:
        "Incorrect: passive disclaimers do not substitute for mandatory qualified human review on consequential legal and financial determinations.",
    },
    {
      id: "logging-only",
      text: "Launch it if every decision is logged, even without human review.",
      explanation:
        "Incorrect: audit logging provides traceability, but does not fulfill the requirement of qualified human sign-off on high-risk outcomes.",
    },
  ],
  correctChoiceIds: ["pause-and-control"],
  correctExplanation:
    "Insurance adjudication is classified as a High-Risk Decision under Anthropic's Usage Policy. Fully autonomous claim denials directly impact policyholder rights, necessitating formal compliance reviews, transparent AI disclosure, and mandatory qualified human sign-off. Logging and disclaimers alone cannot replace human oversight.",
  sourceIds: ["anthropic-usage-policy", "anthropic-claude-constitution"],
});

const ethicsSafeguards: Question = questionSchema.parse({
  id: "governance-ethics-considerations",
  type: "multiple-response",
  stem: "Which three considerations are ethical requirements for a Claude-assisted employee performance review? Select three.",
  choices: [
    {
      id: "disclose-and-accountable",
      text: "Disclose how AI is used and keep a human accountable for the final decision.",
      explanation:
        "Correct: ethical AI governance mandates transparency regarding AI involvement and retains ultimate human accountability for employment evaluations.",
    },
    {
      id: "check-unequal-treatment",
      text: "Check for unequal treatment and avoid decisions based on protected characteristics.",
      explanation:
        "Correct: systems must actively prevent disparate impact, bias, or discriminatory criteria across protected demographic classes.",
    },
    {
      id: "job-relevant-traceable",
      text: "Use job-relevant evidence and keep the reasoning traceable for human review.",
      explanation:
        "Correct: employment decisions must rely on verifiable, job-relevant performance data with auditable reasoning trails.",
    },
    {
      id: "hide-ai",
      text: "Maximize engagement by hiding that AI contributed to the review.",
      explanation:
        "Incorrect: concealing AI involvement in consequential employment evaluations breaches transparency ethics and provider policies.",
    },
    {
      id: "speed-over-transparency",
      text: "Optimize for speed even if the employee cannot see the evidence.",
      explanation:
        "Incorrect: prioritizing evaluation speed over evidence transparency undermines procedural fairness and employee rights.",
    },
    {
      id: "remove-human-review",
      text: "Remove human review because the model is consistent.",
      explanation:
        "Incorrect: model consistency does not guarantee fairness or correctness; human management must own final performance determinations.",
    },
  ],
  correctChoiceIds: ["disclose-and-accountable", "check-unequal-treatment", "job-relevant-traceable"],
  correctExplanation:
    "Employee performance evaluation is a high-risk employment workflow. Ethical governance demands: AI transparency, designated human accountability, active audits for disparate treatment, and job-relevant evidence traceability. Concealing AI or eliminating human review violates Anthropic's ethical framework.",
  sourceIds: [
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
    "anthropic-evaluation-docs",
  ],
});

/* ── Domain 7: Troubleshooting and Optimization ───────────────────────── */

const diagnosticEvidence: Question = questionSchema.parse({
  id: "troubleshoot-diagnose-evidence",
  type: "multiple-response",
  stem: "A prompt fails on a required field in a recurring report. Which three observations would most strongly indicate a prompt or context problem rather than a model-capability problem? Select three.",
  choices: [
    {
      id: "systematic-missing-field",
      text: "The same field is missing across repeated runs and different inputs.",
      explanation:
        "Correct: consistent, systematic omissions indicate missing prompt specifications or absent schema constraints rather than random variance.",
    },
    {
      id: "undefined-field",
      text: "The prompt never defines the field, its format, or an example.",
      explanation:
        "Correct: omitting field definitions, formatting instructions, or exemplars directly prevents the model from generating the required output.",
    },
    {
      id: "outdated-example",
      text: "The supplied example shows an older format that omits the field.",
      explanation:
        "Correct: providing conflicting or outdated few-shot exemplars conditions the model to omit the required field.",
    },
    {
      id: "latency-changed",
      text: "Latency increased after the last deployment.",
      explanation:
        "Incorrect: network or server latency does not explain why a specific semantic field was omitted in the completion.",
    },
    {
      id: "price-changed",
      text: "The model's price changed.",
      explanation:
        "Incorrect: model API pricing changes have no correlation with output completeness or prompt defects.",
    },
    {
      id: "one-off-wording",
      text: "One unusual input produced different wording in an unrelated section.",
      explanation:
        "Incorrect: isolated stylistic variation in an unrelated section does not indicate systemic field omission.",
    },
  ],
  correctChoiceIds: ["systematic-missing-field", "undefined-field", "outdated-example"],
  correctExplanation:
    "Systematic field omission across inputs, absent schema definitions, and outdated few-shot exemplars strongly point to prompt and context defects. Latency, pricing, and isolated stylistic variations do not account for missing structural fields. Refine prompt instructions and exemplars first.",
  sourceIds: ["anthropic-prompting-best-practices", "anthropic-evaluation-docs"],
});

const regressionAdjustment: Question = questionSchema.parse({
  id: "troubleshoot-adjust-regression",
  type: "single-choice",
  stem: "A revised prompt raises the average quality score but causes a critical edge case to fail. What is the best adjustment?",
  choices: [
    {
      id: "inspect-and-rerun",
      text: "Keep the baseline, inspect the regression, refine or revert the change, and rerun the full test set including the edge case.",
      explanation:
        "Correct: aggregate averages can mask critical regressions; engineers must inspect the failing edge case, adjust constraints, and rerun the complete evaluation suite.",
    },
    {
      id: "ship-average",
      text: "Ship the revision because the average score improved.",
      explanation:
        "Incorrect: deploying regressions on mission-critical edge cases compromises production safety regardless of average score gains.",
    },
    {
      id: "remove-edge-case",
      text: "Remove the failing edge case from the test set so the average stays high.",
      explanation:
        "Incorrect: deleting difficult edge cases creates artificial scores while concealing real-world vulnerabilities.",
    },
    {
      id: "larger-model-same-prompt",
      text: "Switch to a larger model and keep the same prompt and test set.",
      explanation:
        "Incorrect: escalating model tiers does not resolve underlying constraint conflicts and increases operating costs.",
    },
  ],
  correctChoiceIds: ["inspect-and-rerun"],
  correctExplanation:
    "An intervention that raises aggregate average scores while breaking a critical edge case represents an active regression. Retain the stable baseline, analyze the regression diff, refine the prompt constraint, and rerun the full benchmark suite.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-prompting-best-practices"],
});

const rubricCalibration: Question = questionSchema.parse({
  id: "prompting-iterate-rubric-calibration",
  type: "single-choice",
  stem: "A team is iterating on a prompt for customer escalation summaries, and two reviewers disagree on whether a revised prompt improved quality. What should the team establish before running another iteration?",
  choices: [
    {
      id: "explicit-rubric-and-test-set",
      text: "Define an explicit grading rubric with representative test cases and score both the baseline and revised outputs against the same criteria.",
      explanation:
        "Correct: establishing objective rubrics and scoring baseline vs. revised outputs across identical representative test sets resolves reviewer disagreement with empirical evidence.",
    },
    {
      id: "prefer-longer-draft",
      text: "Adopt whichever prompt produces the longer summary on the most recent ticket.",
      explanation:
        "Incorrect: token length on an isolated ticket does not correlate with factual accuracy, conciseness, or generalization.",
    },
    {
      id: "rewrite-until-both-like-style",
      text: "Keep rewriting the prompt informally until both reviewers like the tone of a single sample.",
      explanation:
        "Incorrect: unguided informal revisions based on subjective aesthetic impressions lead to endless trial-and-error cycles.",
    },
    {
      id: "average-two-models",
      text: "Switch models immediately so the team does not need to agree on evaluation criteria.",
      explanation:
        "Incorrect: switching model tiers cannot resolve absent evaluation criteria; clear rubrics remain mandatory.",
    },
  ],
  correctChoiceIds: ["explicit-rubric-and-test-set"],
  correctExplanation:
    "When evaluators disagree on whether a prompt revision represents progress, the root cause is absent evaluation rubrics. Defining explicit scoring criteria and benchmarking both versions against the same representative test suite grounds iteration in evidence rather than subjective impression.",
  sourceIds: ["anthropic-prompting-best-practices", "anthropic-evaluation-docs"],
});

const solutionHandoffControls: Question = questionSchema.parse({
  id: "workflow-solution-handoff-controls",
  type: "multiple-response",
  stem: "An operations team is designing a multi-step document-triage solution where Claude classifies incoming requests and drafts routing notes for human coordinators. Which three design practices keep the workflow reliable and auditable? Select three.",
  choices: [
    {
      id: "structured-intermediate-outputs",
      text: "Define structured intermediate outputs between classification and routing-note drafting so each stage can be inspected.",
      explanation:
        "Correct: inspectable intermediate data structures enable verification of whether an error originated during classification or during draft synthesis.",
    },
    {
      id: "ambiguous-case-escalation",
      text: "Route low-confidence or ambiguous requests to a human review queue with the supporting source excerpts attached.",
      explanation:
        "Correct: escalating ambiguous tickets with grounding excerpts to human review queues mitigates misrouting risks.",
    },
    {
      id: "edge-case-validation",
      text: "Test the workflow against edge cases and malformed inputs before expanding beyond the initial pilot.",
      explanation:
        "Correct: evaluating pipelines against adversarial edge cases and malformed inputs prior to rollout uncovers structural failure points.",
    },
    {
      id: "hide-intermediate-classification",
      text: "Hide intermediate classification fields so coordinators only see the final routing recommendation.",
      explanation:
        "Incorrect: concealing intermediate steps degrades observability and prevents coordinators from identifying classification errors.",
    },
    {
      id: "auto-close-unclassified",
      text: "Automatically close requests that do not match a standard category.",
      explanation:
        "Incorrect: auto-closing unclassified exceptions without human review drops critical, sensitive, or novel customer requests.",
    },
    {
      id: "skip-pilot-metrics",
      text: "Roll out to all request types immediately and define success metrics after full deployment.",
      explanation:
        "Incorrect: full rollout without baseline metrics and pilot validation amplifies operational error risks.",
    },
  ],
  correctChoiceIds: [
    "structured-intermediate-outputs",
    "ambiguous-case-escalation",
    "edge-case-validation",
  ],
  correctExplanation:
    "Reliable multi-step workflows feature inspectable intermediate schemas, human escalation queues for ambiguous cases with supporting excerpts, and thorough pre-deployment edge-case testing. Concealing intermediate data or auto-closing unclassified exceptions undermines auditability.",
  sourceIds: [
    "anthropic-building-effective-agents",
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
  ],
});

const policyExceptionEscalation: Question = questionSchema.parse({
  id: "governance-policy-exception-escalation",
  type: "single-choice",
  stem: "A project team wants to use Claude on a new internal dataset that is not yet covered by the organization's approved AI use-case register. What is the appropriate action under organizational AI governance?",
  choices: [
    {
      id: "pause-and-submit-governance-review",
      text: "Pause deployment on the unapproved dataset, submit the use case and data classification through the organization's governance review process, and proceed only after approval and required controls are documented.",
      explanation:
        "Correct: when datasets fall outside pre-approved registers, teams must pause, conduct formal data classification, submit for governance review, and implement required controls prior to processing.",
    },
    {
      id: "run-in-personal-chat",
      text: "Test the dataset in a personal account first so the organization's workspace logs stay clean.",
      explanation:
        "Incorrect: ingesting enterprise data into personal accounts breaches access controls, confidentiality policies, and data security standards.",
    },
    {
      id: "proceed-and-notify-later",
      text: "Process the dataset immediately to meet the deadline and notify the governance team after the report is delivered.",
      explanation:
        "Incorrect: processing unauthorized data before review risks irreversible exposure of sensitive or regulated records.",
    },
    {
      id: "strip-headers-only",
      text: "Remove column headers from the file and upload it without checking data sensitivity or policy scope.",
      explanation:
        "Incorrect: removing column headers does not anonymize sensitive record data or waive compliance review mandates.",
    },
  ],
  correctChoiceIds: ["pause-and-submit-governance-review"],
  correctExplanation:
    "Under organizational AI governance, ingesting unvetted datasets requires pausing deployment, classifying data sensitivity, and securing formal approval through established compliance channels. Teams must never use personal accounts or bypass governance reviews.",
  sourceIds: [
    "anthropic-usage-policy",
    "anthropic-claude-constitution",
    "anthropic-privacy-policy",
  ],
});

const workflowCostLatencyControls: Question = questionSchema.parse({
  id: "optimize-workflow-cost-latency-controls",
  type: "multiple-response",
  stem: "After establishing a quality baseline for a recurring compliance-summary workflow, a team wants to reduce latency and token cost without degrading accuracy on critical cases. Which three actions follow sound optimization practice? Select three.",
  choices: [
    {
      id: "trim-redundant-context",
      text: "Trim redundant instructions and stale reference text so only high-signal context is sent on each run.",
      explanation:
        "Correct: eliminating redundant instructions and outdated reference files reduces prompt tokens, lowers latency, and preserves attention focus.",
    },
    {
      id: "benchmark-faster-tier",
      text: "Benchmark a faster, lower-cost model tier on the same representative evaluation set before switching production traffic.",
      explanation:
        "Correct: benchmarking faster model tiers on the established evaluation set verifies that quality thresholds remain satisfied before migrating traffic.",
    },
    {
      id: "track-per-case-regressions",
      text: "Track per-case quality alongside latency and cost after each change so critical edge-case regressions are caught immediately.",
      explanation:
        "Correct: monitoring per-case quality metrics prevents cost or latency optimizations from silently damaging compliance-critical edge cases.",
    },
    {
      id: "drop-source-grounding",
      text: "Remove source excerpts from the prompt so the model generates summaries from general memory.",
      explanation:
        "Incorrect: removing reference context in compliance workflows directly induces hallucinations and factual errors.",
    },
    {
      id: "skip-regression-checks",
      text: "Stop running the evaluation suite once latency drops below the target threshold.",
      explanation:
        "Incorrect: optimizing solely for latency while abandoning quality evaluations allows critical errors to escape into production.",
    },
    {
      id: "change-all-variables-together",
      text: "Change the prompt structure, context window contents, and model tier simultaneously without intermediate measurement.",
      explanation:
        "Incorrect: modifying multiple variables simultaneously destroys causal attribution, making it impossible to diagnose what caused gains or regressions.",
    },
  ],
  correctChoiceIds: [
    "trim-redundant-context",
    "benchmark-faster-tier",
    "track-per-case-regressions",
  ],
  correctExplanation:
    "Disciplined cost and latency optimization maintains evaluation baselines: eliminate low-value context, benchmark faster model tiers against identical evaluation suites, and monitor per-case quality to prevent speed optimizations from compromising accuracy.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-choosing-model",
  ],
});

const multilingualNuanceControl: Question = questionSchema.parse({
  id: "prompting-multilingual-nuance-control",
  type: "single-choice",
  stem: "A multinational team prompts Claude to localize technical compliance guidelines into Vietnamese and Japanese for regional branches. Early drafts showed inconsistent translation of regulatory terms and an overly informal tone for executive leadership. Which prompt enhancement best resolves both issues?",
  choices: [
    {
      id: "glossary-and-examples",
      text: "Provide an approved regulatory glossary in structured XML tags, define the formal executive audience and tone constraints in the system prompt, and supply two vetted few-shot examples.",
      explanation:
        "Correct: providing a standardized glossary inside XML tags, defining formal executive audience constraints, and including vetted few-shot exemplars anchors terminology and tone consistently.",
    },
    {
      id: "raise-temperature",
      text: "Raise temperature to 0.9 so Claude invents culturally engaging phrasings for legal clauses.",
      explanation:
        "Incorrect: raising temperature increases randomness and output variance, which is unacceptable for technical compliance translations.",
    },
    {
      id: "open-ended-instruction",
      text: "Add an instruction saying “translate as naturally as possible” without supplying canonical bilingual term definitions.",
      explanation:
        "Incorrect: open-ended directives fail to standardize specialized technical vocabulary or enforce formal corporate hierarchy.",
    },
    {
      id: "split-isolated-prompts",
      text: "Translate each sentence in separate isolated requests without sharing previously approved definitions.",
      explanation:
        "Incorrect: isolated sentence-by-sentence translation loses contextual cohesion and exacerbates terminology inconsistency.",
    },
  ],
  correctChoiceIds: ["glossary-and-examples"],
  correctExplanation:
    "Under Anthropic Prompting Best Practices, technical translation and localization quality is controlled by: (1) supplying canonical terminology glossaries inside structured XML tags, (2) explicitly defining audience and register, and (3) providing high-quality bilingual few-shot exemplars.",
  sourceIds: ["anthropic-prompting-best-practices"],
});

const hallucinationAuditPlan: Question = questionSchema.parse({
  id: "output-evaluation-hallucination-audit-plan",
  type: "multiple-response",
  stem: "A risk analyst is validating a 40-page technical risk assessment drafted by Claude from raw operational incident transcripts. Which three audit procedures are most effective for detecting and eliminating hallucinations before distribution? Select three.",
  choices: [
    {
      id: "isolate-verifiable-claims",
      text: "Isolate all quantitative metrics, dates, and causal conclusions into an audit table and require direct word-for-word citations from the transcripts.",
      explanation:
        "Correct: decomposing quantitative claims and causal statements into audit tables with verbatim transcript citations provides rigorous empirical verification.",
    },
    {
      id: "flag-unsupported-claims",
      text: "Explicitly qualify or delete any claim that cannot be corroborated by evidence in the provided source transcripts.",
      explanation:
        "Correct: core fact-checking methodology mandates retracting or downgrading confidence on claims lacking ground-truth evidence.",
    },
    {
      id: "cross-check-inconsistencies",
      text: "Cross-check for internal contradictions between different sections of the report analyzing related operational incidents.",
      explanation:
        "Correct: cross-checking related sections surfaces internal inconsistencies where the model made contradictory deductions.",
    },
    {
      id: "rely-on-fluency",
      text: "Accept statements that sound highly confident and use polished corporate prose as inherently verified.",
      explanation:
        "Incorrect: confidence and polished fluency are common characteristics of persuasive hallucinations; they do not indicate truth.",
    },
    {
      id: "re-prompt-multiple-times",
      text: "Re-run the prompt five times and accept the majority response as ground truth without consulting source transcripts.",
      explanation:
        "Incorrect: majority sampling (Best-of-N) identifies inconsistency, but cannot detect shared hallucinations without consulting ground-truth source text.",
    },
    {
      id: "remove-source-constraints",
      text: "Remove source document boundaries so Claude can fill informational gaps from broad internet training memory.",
      explanation:
        "Incorrect: removing source boundaries encourages open-ended speculation and sharply increases hallucination rates in technical risk reports.",
    },
  ],
  correctChoiceIds: [
    "isolate-verifiable-claims",
    "flag-unsupported-claims",
    "cross-check-inconsistencies",
  ],
  correctExplanation:
    "Rigorous hallucination auditing isolates discrete claims for word-for-word source verification, actively deletes or qualifies uncorroborated assertions, and audits cross-section internal consistency. Never rely on superficial fluency, majority sampling, or unconstrained parametric memory.",
  sourceIds: [
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
  ],
});

const routingIntentClassification: Question = questionSchema.parse({
  id: "workflow-routing-intent-classification",
  type: "single-choice",
  stem: "An enterprise customer service architecture receives 100,000 requests per day. 80% are straightforward order status inquiries, while 20% involve nuanced legal or contractual disputes requiring multi-step reasoning. Which architecture best balances responsiveness, cost, and analytical rigor?",
  choices: [
    {
      id: "routing-tier-pattern",
      text: "Implement an upfront routing classifier using a fast, low-cost model to fulfill status lookups directly and escalate complex dispute requests to a higher-capability model tier.",
      explanation:
        "Correct: the Routing Pattern assigns low-cost, fast models (Haiku) to high-volume simple lookups, reserving capable reasoning tiers (Sonnet) for complex contractual disputes.",
    },
    {
      id: "all-opus-chain",
      text: "Route 100% of incoming inquiries through a multi-agent chain powered exclusively by the largest model tier.",
      explanation:
        "Incorrect: routing all 100,000 daily requests to top-tier reasoning models introduces massive unnecessary token expenses and high latency.",
    },
    {
      id: "single-haiku-only",
      text: "Enforce a single fast model across all requests without any escalation path for multi-step contractual analysis.",
      explanation:
        "Incorrect: smaller models lack the analytical reasoning depth required to resolve complex legal and contractual disputes accurately.",
    },
    {
      id: "unsupervised-agent",
      text: "Deploy an unconstrained autonomous agent that browses internal databases indefinitely for every inquiry without a stopping condition.",
      explanation:
        "Incorrect: unconstrained autonomous loops without stopping criteria risk runaway token costs and infinite recursion.",
    },
  ],
  correctChoiceIds: ["routing-tier-pattern"],
  correctExplanation:
    "Anthropic's 'Building Effective Agents' documentation identifies the Routing pattern as fundamental for heterogeneous workloads: a lightweight classifier triages routine queries to fast, economical models while routing complex reasoning requests to capable tiers.",
  sourceIds: [
    "anthropic-building-effective-agents",
    "anthropic-choosing-model",
  ],
});

const projectPermissionRevocation: Question = questionSchema.parse({
  id: "configuration-project-permission-revocation",
  type: "single-choice",
  stem: "A project administrator learns that an external consultant has completed their engagement but still possesses access to a shared Claude Project containing proprietary financial strategies. Which administrative action properly secures the Project environment?",
  choices: [
    {
      id: "remove-member-audit-knowledge",
      text: "Remove the consultant from the Project and organization workspace, rotate any shared connector credentials they handled, and audit Project knowledge files to ensure access is fully terminated.",
      explanation:
        "Correct: access revocation must occur at the workspace and Project membership levels, paired with rotating credentials on shared connectors to prevent unauthorized access.",
    },
    {
      id: "archive-project-only",
      text: "Archive the Project, assuming that archiving automatically revokes member permissions and disconnects shared tools.",
      explanation:
        "Incorrect: archiving a Project hides it from active views but preserves member rosters, permissions, and tool connections; it does not revoke access.",
    },
    {
      id: "prompt-ignore-contractor",
      text: "Add a Project instruction telling Claude to decline questions submitted by that specific consultant's name.",
      explanation:
        "Incorrect: prompt instructions cannot enforce access control and do not prevent the consultant from reading uploaded Project Knowledge files.",
    },
    {
      id: "delete-single-file-only",
      text: "Delete one financial strategy document from Project knowledge while leaving the consultant's Project membership active.",
      explanation:
        "Incorrect: deleting an isolated file leaves all other confidential assets, shared chats, and connectors accessible to the former consultant.",
    },
  ],
  correctChoiceIds: ["remove-member-audit-knowledge"],
  correctExplanation:
    "Securing enterprise workspaces requires formal identity access management: remove departed members from the organization and Project workspace, rotate shared connector credentials, and audit Knowledge assets. Archiving projects or adding prompt directives does not enforce access control.",
  sourceIds: [
    "anthropic-projects-manage",
    "anthropic-usage-policy",
  ],
});

const regressionPromptPinning: Question = questionSchema.parse({
  id: "troubleshoot-regression-prompt-pinning",
  type: "multiple-response",
  stem: "After modifying a customer support prompt to incorporate newly announced product return policies, the team observes that accuracy on handling legacy warranty claims dropped from 94% to 78%. Which three diagnostic actions should the team take to address this regression? Select three.",
  choices: [
    {
      id: "run-baseline-eval-suite",
      text: "Evaluate the modified prompt against the entire regression test suite representing both legacy warranty cases and new return scenarios.",
      explanation:
        "Correct: rerunning the comprehensive evaluation suite across both legacy and new scenarios quantifies the exact scope and severity of the regression.",
    },
    {
      id: "diff-prompt-changes",
      text: "Inspect the diff between the previous baseline prompt and the updated version to locate overlapping or conflicting constraints.",
      explanation:
        "Correct: inspecting prompt diffs pinpoints where newly added constraints conflict with or supersede legacy warranty rules.",
    },
    {
      id: "categorize-failure-modes",
      text: "Categorize the failed legacy test cases to determine whether errors stem from ambiguous instructions, missing context, or overly restrictive return rules.",
      explanation:
        "Correct: classifying root-cause error modes enables targeted prompt engineering rather than random trial-and-error editing.",
    },
    {
      id: "switch-models-immediately",
      text: "Immediately migrate to a different model family in production without investigating the prompt wording differences.",
      explanation:
        "Incorrect: switching models changes multiple variables at once and fails to resolve logical instruction conflicts in the prompt.",
    },
    {
      id: "delete-legacy-eval-cases",
      text: "Delete legacy warranty cases from the evaluation dataset so the pass rate reflects only the new return policy.",
      explanation:
        "Incorrect: deleting difficult test cases distorts metrics and blinds the team to production regressions.",
    },
    {
      id: "double-max-tokens",
      text: "Double max_tokens in production in hopes that generating longer answers will naturally reconcile conflicting warranty rules.",
      explanation:
        "Incorrect: increasing `max_tokens` lengthens completions without resolving conflicting behavioral constraints in the prompt.",
    },
  ],
  correctChoiceIds: [
    "run-baseline-eval-suite",
    "diff-prompt-changes",
    "categorize-failure-modes",
  ],
  correctExplanation:
    "Systematic regression diagnosis requires rerunning the full evaluation suite across legacy and new scenarios, analyzing prompt diffs for conflicting constraints, and categorizing failure modes. Never delete evaluation cases, escalate models prematurely, or expand token ceilings blindly.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});

export const coverageDepthQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(effectivePromptAdditions, "prompting-create-effective-prompts", [
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(multilingualNuanceControl, "prompting-create-effective-prompts", [
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(decompositionDecision, "prompting-task-decomposition", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-building-effective-agents",
  ]),
  reviewedEntry(rubricCalibration, "prompting-iterate", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(hallucinationAuditPlan, "output-identify-hallucinations", [
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(requirementsArtifacts, "workflow-requirements-analysis", [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(firstIntegrationPoint, "workflow-integrate", [
    "anthropic-building-effective-agents",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
  ]),
  reviewedEntry(solutionHandoffControls, "workflow-solution-design", [
    "anthropic-building-effective-agents",
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(routingIntentClassification, "workflow-solution-design", [
    "anthropic-building-effective-agents",
    "anthropic-choosing-model",
  ]),
  reviewedEntry(projectPermissionRevocation, "config-maintain", [
    "anthropic-projects-manage",
    "anthropic-usage-policy",
  ]),
  reviewedEntry(highRiskUseCase, "governance-use-case-fit", [
    "anthropic-usage-policy",
    "anthropic-claude-constitution",
  ]),
  reviewedEntry(ethicsSafeguards, "governance-ethics", [
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(policyExceptionEscalation, "governance-policies", [
    "anthropic-usage-policy",
    "anthropic-claude-constitution",
    "anthropic-privacy-policy",
  ]),
  reviewedEntry(diagnosticEvidence, "troubleshoot-diagnose", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(regressionPromptPinning, "troubleshoot-diagnose", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(regressionAdjustment, "troubleshoot-adjust", [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(workflowCostLatencyControls, "optimize-workflows", [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-choosing-model",
  ]),
];
