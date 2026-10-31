import { questionSchema, type Question, type QuestionBankEntry } from "../../../domain";
import { reviewedEntry } from "./bank-helpers";

/**
 * Additional reviewed items for Domain 4 (research, solution design, and
 * stakeholder communication), Domain 6 (privacy and policy governance), and
 * Domain 7 (workflow optimization).
 *
 * Governance items teach review principles, not legal advice. Claims about
 * privacy, retention, and high-risk use are limited to the cited Anthropic
 * policies and help-center articles and should be re-checked against the
 * organization's own policy.
 */

const currentMarketResearch: Question = questionSchema.parse({
  id: "workflow-research-current-scan",
  type: "single-choice",
  stem: "A strategy team needs a current competitor scan with citations before a planning workshop. What is the best use of Claude?",
  choices: [
    {
      id: "research-and-verify",
      text: "Run research over current sources, ask for a cited synthesis, then verify the cited claims before the workshop.",
      explanation:
        "Correct: Research is engineered to retrieve and synthesize multi-source web data with citations; citations must still be audited before strategic decision-making.",
    },
    {
      id: "rely-on-memory",
      text: "Ask Claude to answer from its training knowledge and skip current sources because the market moves slowly.",
      explanation:
        "Incorrect: parametric training data has a knowledge cutoff and cannot guarantee reflection of current market dynamics.",
    },
    {
      id: "one-paragraph",
      text: "Request a single paragraph without citations so the brief is easy to read.",
      explanation:
        "Incorrect: an uncited paragraph prevents factual auditing and conceals critical evidentiary gaps.",
    },
    {
      id: "confident-recommendation",
      text: "Ask for a confident recommendation and treat it as final to save review time.",
      explanation:
        "Incorrect: model confidence is not empirical evidence; recommendations must be verified against ground truth by accountable professionals.",
    },
  ],
  correctChoiceIds: ["research-and-verify"],
  correctExplanation:
    "Claude Research conducts multi-step searches across web sources and connectors to synthesize structured briefs with citations. However, human verification remains essential: the goal is to supply verified evidence to the workshop rather than substituting verification with assertive prose.",
  sourceIds: [
    "anthropic-research-help",
    "anthropic-evaluation-docs",
  ],
});

const researchPlanningPractices: Question = questionSchema.parse({
  id: "workflow-research-planning-practices",
  type: "multiple-response",
  stem: "Which three practices improve research and planning with Claude? Select three.",
  choices: [
    {
      id: "define-questions",
      text: "Define the research questions, source criteria, and deadline before asking for a synthesis.",
      explanation:
        "Correct: clear research questions and source credibility rubrics focus the search and minimize ingestion of irrelevant data.",
    },
    {
      id: "citations-gaps",
      text: "Require citations and explicitly flag gaps, conflicting sources, and assumptions.",
      explanation:
        "Correct: inline citations and explicit gap analysis clarify which findings are grounded and which remain unresolved.",
    },
    {
      id: "separate-facts",
      text: "Separate verified facts from recommendations, and review the assumptions behind each option.",
      explanation:
        "Correct: decoupling empirical facts from recommendations prevents unverified assumptions from masquerading as conclusions.",
    },
    {
      id: "first-answer",
      text: "Accept the first synthesized answer as the plan so the team can move quickly.",
      explanation:
        "Incorrect: initial syntheses frequently miss nuances or misinterpret edge-case requirements; audit prior to adoption.",
    },
    {
      id: "single-source",
      text: "Use one source to keep the research simple and avoid conflicting information.",
      explanation:
        "Incorrect: relying on an isolated source prevents detection of contradictions and creates brittle analytical blind spots.",
    },
    {
      id: "skip-validation",
      text: "Skip validation because research mode already provides citations.",
      explanation:
        "Incorrect: citations can hallucinate or misquote context; human verification of cited sources remains mandatory.",
    },
  ],
  correctChoiceIds: ["define-questions", "citations-gaps", "separate-facts"],
  correctExplanation:
    "Rigorous research and planning demands structured inputs, verifiable evidence, and decoupling facts from recommendations. Formulating research questions upfront, mandating citations, and testing underlying assumptions builds far more resilient operational plans.",
  sourceIds: [
    "anthropic-research-help",
    "anthropic-evaluation-docs",
  ],
});

const approvalWorkflowDesign: Question = questionSchema.parse({
  id: "workflow-solution-options",
  type: "single-choice",
  stem: "A team is designing a new internal approval workflow. How should Claude be used?",
  choices: [
    {
      id: "options-assumptions-human-decision",
      text: "Draft several workflow options with explicit assumptions, constraints, and risks, then have the accountable team choose and pilot one.",
      explanation:
        "Correct: Claude assists in exploring architectural options and surfacing trade-offs, while human leadership retains decision-making accountability and pilot governance.",
    },
    {
      id: "auto-deploy",
      text: "Let Claude select and deploy the workflow automatically to avoid a long design review.",
      explanation:
        "Incorrect: deploying operational approval workflows autonomously bypasses stakeholder consensus, compliance checks, and human accountability.",
    },
    {
      id: "final-decision",
      text: "Ask Claude for the final decision and implement it without stakeholder input.",
      explanation:
        "Incorrect: models assist with analysis but cannot assume organizational accountability for operational decisions.",
    },
    {
      id: "skip-stakeholders",
      text: "Skip stakeholder review because the model can infer what each team needs.",
      explanation:
        "Incorrect: models lack visibility into organizational politics, informal boundaries, and operational constraints; omitting stakeholders leads to failed adoption.",
    },
  ],
  correctChoiceIds: ["options-assumptions-human-decision"],
  correctExplanation:
    "In solution design, Claude excels at expanding option spaces, articulating assumptions, and surfacing hidden failure modes. Final architectural selection, stakeholder sign-off, and pilot governance must remain with accountable human teams.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-building-effective-agents",
  ],
});

const solutionDesignIteration: Question = questionSchema.parse({
  id: "workflow-solution-iteration",
  type: "multiple-response",
  stem: "Which three practices support solution design and iteration with Claude? Select three.",
  choices: [
    {
      id: "prototype-assumptions",
      text: "Prototype several options and state the assumptions and trade-offs behind each.",
      explanation:
        "Correct: comparing multiple prototypes with explicit assumptions prevents premature convergence on a brittle architecture.",
    },
    {
      id: "stakeholder-feedback",
      text: "Review prototypes with stakeholders and incorporate feedback into the next iteration.",
      explanation:
        "Correct: stakeholder reviews uncover practical constraints and failure modes that models cannot predict.",
    },
    {
      id: "test-requirements",
      text: "Test each iteration against requirements, edge cases, and failure modes.",
      explanation:
        "Correct: benchmarking iterations against edge cases validates that designs perform reliably beyond happy-path examples.",
    },
    {
      id: "first-final",
      text: "Treat the first proposal as final because it sounds coherent.",
      explanation:
        "Incorrect: fluency and coherence do not prove operational viability; iterative testing is required.",
    },
    {
      id: "hide-tradeoffs",
      text: "Hide trade-offs so stakeholders can focus on the recommended option.",
      explanation:
        "Incorrect: concealing trade-offs undermines decision transparency and obscures critical technical risks.",
    },
    {
      id: "skip-pilot",
      text: "Skip the pilot and roll out to every team at once.",
      explanation:
        "Incorrect: bypassing small-scale pilots dramatically amplifies the operational blast radius of undiscovered design flaws.",
    },
  ],
  correctChoiceIds: ["prototype-assumptions", "stakeholder-feedback", "test-requirements"],
  correctExplanation:
    "Solution design is an iterative loop: formulate options with clear trade-offs, gather stakeholder feedback, and evaluate prototypes against edge cases and failure modes. Maintaining transparent trade-offs and piloting before full-scale deployment mitigates operational risk.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-building-effective-agents",
  ],
});

const stakeholderBrief: Question = questionSchema.parse({
  id: "workflow-stakeholder-brief",
  type: "single-choice",
  stem: "An executive asks whether Claude can replace part of the claims intake team. Which response communicates value and limitations responsibly?",
  choices: [
    {
      id: "scope-evidence-limits",
      text: "Describe the tested scope, measured results, known failure modes, required human review, and a bounded next step.",
      explanation:
        "Correct: responsibly articulates verified scope, empirical test metrics, known failure modes, human-in-the-loop requirements, and a controlled roadmap.",
    },
    {
      id: "guarantee-replacement",
      text: "Guarantee that Claude can replace the team and cut headcount immediately.",
      explanation:
        "Incorrect: unsubstantiated claims of labor replacement ignore operational boundaries, error rates, and necessary human oversight.",
    },
    {
      id: "no-review-needed",
      text: "Say that AI removes the need for human review because the model is consistent.",
      explanation:
        "Incorrect: model consistency does not equal factual correctness; high-stakes claims intake demands qualified human review.",
    },
    {
      id: "demo-only",
      text: "Show an impressive demo and avoid discussing failure cases or operating constraints.",
      explanation:
        "Incorrect: cherry-picked demos misrepresent production reliability; omitting known failure modes is deceptive.",
    },
  ],
  correctChoiceIds: ["scope-evidence-limits"],
  correctExplanation:
    "Communicating Claude's enterprise value requires transparent articulation of scope and boundaries: what was evaluated, measured accuracy, discovered error modes, mandatory human checkpoints, and phased rollout steps. Promising full automation or dismissing human review violates ethical and engineering standards.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ],
});

const stakeholderEvidence: Question = questionSchema.parse({
  id: "workflow-stakeholder-evidence",
  type: "multiple-response",
  stem: "Which three statements communicate Claude's value and limitations responsibly? Select three.",
  choices: [
    {
      id: "measured-outcomes",
      text: "Quantify only outcomes the team actually measured, and state the test conditions.",
      explanation:
        "Correct: reporting only empirically measured outcomes under defined test parameters prevents misleading overgeneralization.",
    },
    {
      id: "review-accountability",
      text: "Disclose where verification, escalation, and human accountability remain necessary.",
      explanation:
        "Correct: explicitly identifying required human review gates and escalation pathways preserves institutional accountability.",
    },
    {
      id: "scope-failures",
      text: "State the scope, assumptions, and known failure modes alongside the benefits.",
      explanation:
        "Correct: presenting known failure modes and boundary assumptions alongside benefits provides an honest technical assessment.",
    },
    {
      id: "perfect-accuracy",
      text: "Claim 100% accuracy because the demo produced no errors.",
      explanation:
        "Incorrect: a flaw-free demo does not establish perfect accuracy; asserting zero errors is an ungrounded exaggeration.",
    },
    {
      id: "hide-failures",
      text: "Hide pilot failures so stakeholders stay enthusiastic.",
      explanation:
        "Incorrect: concealing pilot failures blinds leadership to operational risks and breaches governance ethics.",
    },
    {
      id: "promise-headcount",
      text: "Promise headcount reduction before measuring productivity or quality.",
      explanation:
        "Incorrect: promising labor cuts prior to empirical pilot measurement is speculative and ungrounded.",
    },
  ],
  correctChoiceIds: ["measured-outcomes", "review-accountability", "scope-failures"],
  correctExplanation:
    "Responsible stakeholder communication centers on empirical evidence, explicit operational boundaries, and disclosed failure modes while clarifying the ongoing necessity of human review. Reject absolute accuracy claims or speculative business promises lacking baseline data.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ],
});

const confidentialContract: Question = questionSchema.parse({
  id: "governance-privacy-confidential-upload",
  type: "single-choice",
  stem: "An employee wants to paste a confidential client contract into a personal Claude account to summarize it. What is the best action?",
  choices: [
    {
      id: "policy-approved-minimize",
      text: "Follow the organization's data policy, use an approved workspace or project, and minimize or redact unnecessary sensitive details before uploading.",
      explanation:
        "Correct: requires consulting enterprise data policy, utilizing approved corporate workspaces, and redacting unnecessary sensitive PII or commercial terms.",
    },
    {
      id: "paste-anyway",
      text: "Paste the full contract because summarization is a legitimate business task.",
      explanation:
        "Incorrect: legitimate business intent does not supersede client confidentiality obligations or organizational data governance policies.",
    },
    {
      id: "redact-names",
      text: "Remove the client's name only and assume the rest of the contract is safe to upload.",
      explanation:
        "Incorrect: contracts contain pricing terms, proprietary covenants, and identifiable context; redacting names alone is insufficient sanitization.",
    },
    {
      id: "personal-account",
      text: "Use a personal account so the organization's retention settings do not apply.",
      explanation:
        "Incorrect: processing enterprise client data in personal accounts constitutes unauthorized exfiltration and breaches compliance agreements.",
    },
  ],
  correctChoiceIds: ["policy-approved-minimize"],
  correctExplanation:
    "Confidential data handling must strictly follow organizational governance rather than individual discretion. Utilizing approved enterprise workspaces with appropriate training opt-out guarantees, practicing data minimization, and redacting unnecessary PII are mandatory safeguards.",
  sourceIds: [
    "anthropic-privacy-policy",
    "anthropic-google-workspace-connectors",
    "anthropic-usage-policy",
  ],
});

const privacyControls: Question = questionSchema.parse({
  id: "governance-privacy-controls",
  type: "multiple-response",
  stem: "Which three practices reduce privacy risk when using Claude? Select three.",
  choices: [
    {
      id: "classify",
      text: "Classify the sensitivity of data before deciding whether and where to upload it.",
      explanation:
        "Correct: data classification determines applicable protective controls and prevents ingesting restricted data into unapproved workspaces.",
    },
    {
      id: "least-privilege",
      text: "Use approved accounts and grant connectors the least access needed for the task.",
      explanation:
        "Correct: approved corporate accounts and least-privilege connector permissions restrict the blast radius of data exposure.",
    },
    {
      id: "minimize-retention",
      text: "Minimize or redact unnecessary details and check retention and training settings.",
      explanation:
        "Correct: minimizing input data and verifying enterprise training/retention configurations preserves lifecycle data privacy.",
    },
    {
      id: "delete-assumption",
      text: "Assume deleting a chat immediately removes every copy from all systems and third parties.",
      explanation:
        "Incorrect: deleting chats removes user-facing history, but enterprise archival backups and third-party connector systems follow separate retention policies.",
    },
    {
      id: "personal-drive",
      text: "Connect a personal Drive account to a work project to make files easier to find.",
      explanation:
        "Incorrect: connecting personal storage to corporate workspaces bypasses organizational security governance.",
    },
    {
      id: "upload-everything",
      text: "Upload the full dataset by default so Claude never lacks context.",
      explanation:
        "Incorrect: uploading full datasets violates data minimization principles and increases context rot and exposure risk.",
    },
  ],
  correctChoiceIds: ["classify", "least-privilege", "minimize-retention"],
  correctExplanation:
    "Privacy risk mitigation combines formal data classification, least-privilege connector permissions, and proactive data minimization. Understand enterprise training settings and retention lifecycles rather than assuming instantaneous deletion across all integrated services.",
  sourceIds: [
    "anthropic-privacy-policy",
    "anthropic-google-workspace-connectors",
    "anthropic-usage-policy",
  ],
});

const thirdPartyConnectorGovernance: Question = questionSchema.parse({
  id: "governance-privacy-third-party-connector",
  type: "single-choice",
  stem: "A customer-ops team wants to connect a shared Google Drive folder containing support transcripts to a Claude Project. How should data privacy and permissions be governed before enabling the integration?",
  choices: [
    {
      id: "verify-rights-permissions-and-terms",
      text: "Confirm the team has permission to use the transcripts, verify workspace retention and training settings, account for the third-party service's own privacy terms, and restrict connector write actions to least privilege.",
      explanation:
        "Correct: users must hold legal authorization to process the data, audit enterprise retention/training terms, account for third-party privacy policies, and restrict connector actions under least privilege.",
    },
    {
      id: "provider-policy-overrides-drive",
      text: "Enable the connector immediately because Anthropic's Privacy Policy automatically overrides Google Drive's terms and restricts folder access to read-only.",
      explanation:
        "Incorrect: Anthropic's policies cannot override third-party service terms, and connectors inherit user permissions unless explicitly constrained.",
    },
    {
      id: "connector-grants-extra-access",
      text: "Use the connector so team members without Drive access can read restricted transcripts inside the Project.",
      explanation:
        "Incorrect: connectors inherit native source permissions and must never be used to circumvent organizational access control boundaries.",
    },
    {
      id: "skip-classification-for-internal-drive",
      text: "Skip data classification and redaction because files stored in a company Drive folder are already approved for any AI workflow.",
      explanation:
        "Incorrect: internal storage files may contain sensitive PII or restricted customer data requiring classification and minimization before AI ingestion.",
    },
  ],
  correctChoiceIds: ["verify-rights-permissions-and-terms"],
  correctExplanation:
    "Under Anthropic's Privacy Policy and connector documentation, customers are responsible for holding proper authorization prior to uploading or integrating data; third-party integrations process data under their respective privacy terms; and connectors inherit native source ACLs while allowing administrators to restrict write actions under least privilege.",
  sourceIds: [
    "anthropic-privacy-policy",
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ],
});

const hiringScreeningPolicy: Question = questionSchema.parse({
  id: "governance-policy-hiring-screening",
  type: "single-choice",
  stem: "A manager wants Claude to screen job applications and rank candidates. What should happen first?",
  choices: [
    {
      id: "policy-high-risk-review",
      text: "Check the organization's policy and the provider's high-risk use requirements, including qualified human review and disclosure, before any use.",
      explanation:
        "Correct: employment screening is explicitly classified as a High-Risk Decision; verifying organizational policy, qualified human oversight, and AI disclosure is mandatory.",
    },
    {
      id: "proceed-accuracy",
      text: "Proceed because the model is accurate and the ranking saves time.",
      explanation:
        "Incorrect: perceived accuracy and time savings do not waive legal, regulatory, and human accountability requirements in high-stakes hiring.",
    },
    {
      id: "add-disclaimer",
      text: "Add a disclaimer to the rejection email and let the model decide the ranking.",
      explanation:
        "Incorrect: disclaimers are insufficient; high-risk employment decisions require qualified human oversight and auditable review gates.",
    },
    {
      id: "ask-claude-policy",
      text: "Ask Claude whether the use is allowed and follow its answer as legal advice.",
      explanation:
        "Incorrect: Claude cannot provide legal counsel or authoritatively determine organizational compliance.",
    },
  ],
  correctChoiceIds: ["policy-high-risk-review"],
  correctExplanation:
    "Employment screening and candidate evaluation represent High-Risk Decisions under Anthropic's Usage Policy. Prior to implementation, organizations must verify compliance policies, establish qualified human oversight, ensure AI transparency, and provide formal review channels. This constitutes operational governance, not legal advice.",
  sourceIds: [
    "anthropic-usage-policy",
    "anthropic-claude-constitution",
    "anthropic-privacy-policy",
  ],
});

const governanceOperations: Question = questionSchema.parse({
  id: "governance-policy-operations",
  type: "multiple-response",
  stem: "Which three are appropriate governance practices for Claude use? Select three.",
  choices: [
    {
      id: "map-policy",
      text: "Map each use case to the organization's policy and required approval before launch.",
      explanation:
        "Correct: mapping use cases to organizational policy and formal approval gates identifies legal and operational risks prior to deployment.",
    },
    {
      id: "document-review",
      text: "Document human review, escalation paths, and the evidence used for important decisions.",
      explanation:
        "Correct: documenting review gates and escalation trails ensures institutional accountability and enables post-incident audits.",
    },
    {
      id: "review-updates",
      text: "Review policy and vendor changes on a schedule and train users on the current rules.",
      explanation:
        "Correct: policies and model capabilities evolve; scheduled reviews and user training maintain compliance over time.",
    },
    {
      id: "vendor-only",
      text: "Rely only on the vendor's usage policy and ignore the organization's own standards.",
      explanation:
        "Incorrect: vendor usage policies establish a regulatory baseline; they do not replace enterprise-specific compliance standards.",
    },
    {
      id: "self-approve",
      text: "Let individual users approve their own exceptions to move faster.",
      explanation:
        "Incorrect: self-approving exceptions eliminates governance controls and destroys institutional accountability.",
    },
    {
      id: "no-audit",
      text: "Skip audit trails because the model's answers are not official records.",
      explanation:
        "Incorrect: audit trails are essential for investigating errors, validating compliance, and reviewing high-stakes decisions.",
    },
  ],
  correctChoiceIds: ["map-policy", "document-review", "review-updates"],
  correctExplanation:
    "Effective AI governance aligns use cases with corporate policy, documents human review and escalation trails, and schedules recurring audits as provider guidelines evolve. Vendor policies represent a baseline and cannot substitute for internal enterprise standards.",
  sourceIds: [
    "anthropic-usage-policy",
    "anthropic-privacy-policy",
    "anthropic-claude-constitution",
  ],
});

const optimizeBaseline: Question = questionSchema.parse({
  id: "optimize-workflow-baseline",
  type: "single-choice",
  stem: "A reporting workflow works but is slow and expensive. What is the best first optimization step?",
  choices: [
    {
      id: "measure-baseline",
      text: "Measure the current quality, latency, and cost on representative cases, then identify the largest bottleneck before changing anything.",
      explanation:
        "Correct: establishing empirical baseline metrics across quality, latency, and cost isolates the true bottleneck, enabling targeted technical interventions.",
    },
    {
      id: "cut-context",
      text: "Cut most of the context immediately to reduce tokens.",
      explanation:
        "Incorrect: arbitrarily truncating context risks removing essential grounding data and inducing hallucinations before diagnosing bottlenecks.",
    },
    {
      id: "largest-model",
      text: "Switch to the largest model and assume it will make the workflow cheaper.",
      explanation:
        "Incorrect: escalating to larger model tiers increases per-token costs and latency without resolving underlying pipeline inefficiencies.",
    },
    {
      id: "remove-qa",
      text: "Remove quality checks to shorten the process.",
      explanation:
        "Incorrect: eliminating quality assurance checks may reduce latency temporarily, but amplifies production defects and costly remediation.",
    },
  ],
  correctChoiceIds: ["measure-baseline"],
  correctExplanation:
    "Workflow optimization begins with empirical measurement: quantify baseline quality, latency, and token expenditure across representative test cases. Pinpointing whether the true bottleneck is bloated context, over-provisioned models, or un-cached prefixes drives targeted optimization rather than blind trial and error.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ],
});

const optimizePractices: Question = questionSchema.parse({
  id: "optimize-workflow-practices",
  type: "multiple-response",
  stem: "Which three practices optimize a Claude workflow effectively? Select three.",
  choices: [
    {
      id: "baseline-metrics",
      text: "Establish baseline metrics for quality, latency, and cost before changing the workflow.",
      explanation:
        "Correct: baselines provide the comparative benchmark required to verify whether technical adjustments delivered true net improvements.",
    },
    {
      id: "reduce-repetition",
      text: "Remove repeated or low-value context and use caching or batch processing where the workload fits.",
      explanation:
        "Correct: pruning redundant context and applying prompt caching or batch APIs directly minimizes token expenditures and latency.",
    },
    {
      id: "right-size",
      text: "Right-size the model and effort level for each task instead of using the largest setting everywhere.",
      explanation:
        "Correct: assigning smaller models (Haiku) to routine classification and reserving top tiers (Sonnet) for synthesis optimizes cost-efficiency.",
    },
    {
      id: "remove-human-review",
      text: "Remove human review to shorten the workflow.",
      explanation:
        "Incorrect: removing human review on high-stakes tasks introduces unacceptable compliance and error risks.",
    },
    {
      id: "optimize-before-measure",
      text: "Optimize before measuring so the team can move faster.",
      explanation:
        "Incorrect: optimizing without baseline measurements prevents teams from detecting regressions or quantifying actual gains.",
    },
    {
      id: "silent-quality-loss",
      text: "Accept a large quality drop as long as the workflow becomes cheaper.",
      explanation:
        "Incorrect: silently degrading quality to reduce token costs represents an unapproved operational failure.",
    },
  ],
  correctChoiceIds: ["baseline-metrics", "reduce-repetition", "right-size"],
  correctExplanation:
    "Effective workflow optimization balances quality, latency, and cost using empirical baselines: eliminate repetitive context, leverage prompt caching and batch APIs, and right-size model tiers per task. Never sacrifice non-negotiable quality thresholds or eliminate human checkpoints to cut costs.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ],
});

export const workflowExpansionQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(currentMarketResearch, "workflow-research-planning", [
    "anthropic-research-help",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(researchPlanningPractices, "workflow-research-planning", [
    "anthropic-research-help",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(approvalWorkflowDesign, "workflow-solution-design", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-building-effective-agents",
  ]),
  reviewedEntry(solutionDesignIteration, "workflow-solution-design", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-building-effective-agents",
  ]),
  reviewedEntry(stakeholderBrief, "workflow-stakeholder-communication", [
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ]),
  reviewedEntry(stakeholderEvidence, "workflow-stakeholder-communication", [
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ]),
];

export const governanceExpansionQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(confidentialContract, "governance-data-privacy", [
    "anthropic-privacy-policy",
    "anthropic-google-workspace-connectors",
    "anthropic-usage-policy",
  ]),
  reviewedEntry(privacyControls, "governance-data-privacy", [
    "anthropic-privacy-policy",
    "anthropic-google-workspace-connectors",
    "anthropic-usage-policy",
  ]),
  reviewedEntry(thirdPartyConnectorGovernance, "governance-data-privacy", [
    "anthropic-privacy-policy",
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ]),
  reviewedEntry(hiringScreeningPolicy, "governance-policies", [
    "anthropic-usage-policy",
    "anthropic-claude-constitution",
    "anthropic-privacy-policy",
  ]),
  reviewedEntry(governanceOperations, "governance-policies", [
    "anthropic-usage-policy",
    "anthropic-privacy-policy",
    "anthropic-claude-constitution",
  ]),
];

export const optimizationExpansionQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(optimizeBaseline, "optimize-workflows", [
    "anthropic-evaluation-docs",
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ]),
  reviewedEntry(optimizePractices, "optimize-workflows", [
    "anthropic-evaluation-docs",
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ]),
];
