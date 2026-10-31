import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all five verified Domain 4 objectives.
 * It teaches a full workflow-design progression: requirements, research and
 * planning, solution options, integration and piloting, and stakeholder
 * communication. Examples are original workplace scenarios. Workflow patterns
 * are checked against Anthropic's engineering guidance; the lesson avoids
 * framework-specific or time-sensitive tooling claims.
 */
export const workflowDesignLesson: Lesson = lessonSchema.parse({
  id: "workflow-design",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 4,
  kind: "curriculum",
  contentStatus: "published",
  title: "Workflow design: from requirements to a checked pilot",
  englishTitle: "Workflow design: from requirements to a checked pilot",
  summary:
    "Learn to leverage Claude to analyze operational requirements, conduct disciplined research and planning, generate multiple architectural design options, integrate via bounded measurable pilots with human checkpoints, and transparently communicate technical value, failure modes, and boundaries to stakeholders.",
  level: "intermediate",
  estimatedMinutes: 24,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Technical content aligned with Anthropic documentation on building effective agents, evaluation criteria, prompting best practices, research, and Claude's Constitution. Five objectives mapped from Exam Guide v1.0.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-building-effective-agents",
      "anthropic-evaluation-docs",
      "anthropic-prompting-best-practices",
      "anthropic-research-help",
      "anthropic-claude-constitution",
      "anthropic-usage-policy",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "workflow-requirements-analysis",
      "workflow-research-planning",
      "workflow-solution-design",
      "workflow-integrate",
      "workflow-stakeholder-communication",
    ],
    note: "Lesson covers all five verified Domain 4 objectives in Exam Guide v1.0.",
  },
  objectives: [
    "Analyze messy business requirements into structured actors, goals, non-negotiable constraints, exceptions, and testable open questions.",
    "Utilize Claude for research and planning with verified sources, disciplined citations, and rigorous decoupling of facts from assumptions.",
    "Formulate and evaluate multiple architectural solution designs, articulating explicit trade-offs across cost, latency, risk, and control.",
    "Integrate Claude into existing operations via bounded, low-risk pilots with human-in-the-loop checkpoints and empirical baseline tracking.",
    "Communicate business value, technical boundaries, and known failure modes to stakeholders using empirical data rather than speculative claims.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Workflows versus agents: the principle of parsimony",
      paragraphs: [
        "In 'Building Effective Agents', Anthropic explicitly distinguishes between Workflows and Agents: Workflows are systems where LLMs and external tools are coordinated through deterministic, predefined code execution paths; Agents are systems where the model autonomously directs its own planning, decomposes tasks, and determines when and how to invoke tools. Anthropic's fundamental recommendation for engineers is: always begin with the simplest workflow pattern that accomplishes the objective, escalating complexity only when empirical evaluations prove that added autonomy yields demonstrable quality improvements.",
        "In production environments, this means resisting premature implementation of brittle autonomous multi-agent frameworks. Start by thoroughly analyzing the existing business process, isolating the specific sub-tasks that genuinely benefit from Claude's language reasoning, and engineering the simplest testable execution pipeline. A robust workflow features well-defined inputs, verifiable intermediate artifacts, and mandatory human-in-the-loop review checkpoints at high-stakes boundaries.",
      ],
    },
    {
      kind: "list",
      heading: "The five stages from business problem to operational deployment",
      items: [
        "Problem Framing: Identify current operators, process latency, frequent failure modes, and the primary business KPIs to optimize.",
        "Requirements Analysis: Deconstruct operations into actors, business goals, security/regulatory boundaries, exception handlers, and open ambiguities.",
        "Research & Planning: Gather reference facts, isolate unverified assumptions, define quantitative success metrics, and design test protocols.",
        "Solution Design & Integration: Formulate comparative architectural options, deploy a small-scale pilot, enforce human checkpoints, and measure against a pre-pilot baseline.",
        "Stakeholder Communication: Report empirical metrics, transparently disclose failure modes and operational boundaries, and establish controlled scaling milestones.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Requirements analysis: separating verified facts from assumptions",
      paragraphs: [
        "Requirements analysis is not drafting a lengthy technical speculative document. It is the disciplined translation of raw meeting notes, user interviews, and operational tickets into testable specifications: who executes each step, what outcome is required, what regulatory or legal constraints are non-negotiable, what exceptions mandate manual human intervention, and what data gaps remain unaddressed. Anthropic emphasizes defining quantitative, measurable acceptance criteria alongside an evaluation suite reflecting real-world distribution and adversarial edge cases.",
        "Traceability is non-negotiable: every technical constraint must link directly to an authoritative source document, policy, or designated domain owner. To prevent model hallucination where Claude invents requirements to fill gaps, explicitly instruct Claude to emit `[INSUFFICIENT_DATA]` tags rather than fabricating plausible assumptions.",
      ],
    },
    {
      kind: "list",
      heading: "The requirements audit checklist",
      items: [
        "Actors: Primary operators, approvers, compliance officers, and final escalation authorities.",
        "Goal: Concrete business deliverable (avoiding vague aspirations like 'apply AI to customer support').",
        "Constraints: Latency SLAs, token budgets, data classification restrictions, legacy software interfaces, and compliance mandates.",
        "Exceptions: Edge cases requiring immediate human handoff, and steps legally barred from full automation.",
        "Open Questions: Unresolved ambiguities, authorized decision-makers, and unverified assumptions that could invalidate architecture.",
        "Traceability: Direct citation to authorized stakeholder notes or signed policies, eliminating speculation.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Disciplined research and planning before solution commitment",
      paragraphs: [
        "Claude's research capabilities excel when synthesizing multi-source investigations requiring explicit citations. Anthropic notes that research workflows execute sequential search queries across web connectors to compile structured reports. However, citations are not automatically verified or current; users must audit source validity before basing strategic decisions on generated claims.",
        "In planning, enforce a three-layer taxonomy: verified empirical facts, unverified assumptions to test, and strategic recommendations. A sound plan articulates measurable pilot KPIs, designated owners, explicit stopping/escalation conditions, and defined criteria for failure. Never mistake polished prose for an operational plan.",
      ],
    },
    {
      kind: "list",
      heading: "Disciplined research and planning rules",
      items: [
        "Define research queries, source credibility criteria, and delivery deadlines prior to requesting synthesis.",
        "Mandate inline citations for every substantive claim and create a dedicated section for data gaps and conflicting sources.",
        "Decouple factual observations from recommendations, stating the underlying assumptions beneath every proposed strategy.",
        "Select targeted quantitative pilot metrics, avoiding unanchored claims like 'faster' or 'higher quality'.",
        "Establish unambiguous stopping criteria: metrics defining pilot success, triggers requiring architectural redesign, and conditions mandating shutdown.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Solution design: multiple architectural options and explicit trade-offs",
      paragraphs: [
        "Claude is an exceptional tool for exploring architectural trade-offs and surfacing hidden failure modes, but must not serve as the final decision-maker. Sound engineering designs compare at least two to three structural patterns with transparent trade-offs: manual human execution, semi-automated copilot, or multi-stage automated pipelines. Anthropic documents the Evaluator-Optimizer pattern, where a generator model produces drafts and an evaluator model audits against explicit rubrics in iterative cycles; this pattern is effective only when rubrics are deterministic and improvements are measurable.",
        "For each architectural option, document: which sub-tasks Claude executes, which require human operators, inputs ingested, outputs produced, failure points, and monitoring mechanisms.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Workflow versus agent selection",
      body: "If procedural steps can be mapped in advance and require deterministic output consistency, a bounded workflow is the default choice. Autonomous agents are warranted only when the exact sequence of tool calls cannot be predicted in advance, and when tested inside secure environments with rate limits, stopping criteria, and human authorization checkpoints.",
    },
    {
      kind: "diagram",
      heading: "Interactive Simulation: Workflow Design Patterns & Human Checkpoints",
      diagramId: "workflow-patterns-simulator",
      intro: "Explore four primary Anthropic workflow design patterns: Routing, Parallelization, Orchestrator-Workers, and the Evaluator-Optimizer loop.",
    },
    {
      kind: "paragraphs",
      heading: "Integration: begin with bounded, reversible pilots",
      paragraphs: [
        "Integrating AI into production is not about replacing an entire business line overnight. Map the existing workflow, isolate a bounded sub-process that is easily reversible, possesses clear acceptance criteria, and has a pre-existing operational baseline. Anthropic recommends iterative measurement; with agents, they stress implementing fail-safes that pause execution at checkpoints or blocker events.",
        "Human checkpoints must be positioned at high-stakes transitions: steps with irreversible consequences, external customer delivery, or regulatory implications. While routine intermediate formatting may proceed automatically, final determinations and sensitive state changes must maintain human authority. Claude's Constitution explicitly mandates preserving human agency and oversight.",
      ],
    },
    {
      kind: "list",
      heading: "Evaluation criteria for an initial pilot candidate",
      items: [
        "Narrow scope with clear value: a single processing step, a specific internal user cohort, or a standardized document type.",
        "Reversible with mandatory human sign-off prior to external impact.",
        "Pre-existing baseline measuring output accuracy, cycle time, and operational cost.",
        "Predefined acceptance thresholds and failure taxonomy, avoiding subjective 'it feels better' assessments.",
        "Designated operational owner with authority to trigger escalations or halt the pilot.",
        "Representative test dataset containing production distributions, atypical outliers, and complex edge cases.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Communicating value and boundaries to stakeholders",
      paragraphs: [
        "Enterprise stakeholders do not need flashy demos; they need empirical validation: what was tested, what quantitative gains were measured, what failure modes were discovered, who audits outputs, and what the phased rollout roadmap entails. A transparent technical report documents scope, assumptions, error rates, and operational boundaries.",
        "Never promise complete labor elimination, speculative cost savings, or '100% accuracy'. Unsubstantiated claims destroy stakeholder trust and violate engineering ethics. Claude's enterprise value typically derives from accelerating drafting, eliminating repetitive formatting, and allowing skilled professionals to focus on high-judgment decisions.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Never pitch unmeasured outcomes",
      body: "Without an empirical baseline and pilot metrics, efficiency claims are unsubstantiated hypotheses. Present clear test protocols, success criteria, and risk mitigations. For high-risk use cases (healthcare, legal, credit decisions), adhere strictly to Anthropic's Usage Policy regarding qualified human review and automated decision-making disclosures.",
    },
    {
      kind: "paragraphs",
      heading: "Post-pilot evaluation and operational iteration",
      paragraphs: [
        "Following pilot execution, analyze performance against baseline on a case-by-case level rather than relying solely on aggregate averages. Categorize root-cause errors: requirements ambiguity, prompt context flaws, architectural step design, or model capability limits. If an update improves average score but regresses on a critical high-severity case, treat it as an active regression that must be resolved.",
        "A defensible workflow is interpretable, measurable, and halt-able. When expanding scope, scale incrementally while maintaining proven human checkpoints. Do not introduce autonomous agent complexity simply because it is technically feasible.",
      ],
    },
  ],
  keyTerms: [
    {
      en: "Workflow",
      vi: "Workflow (luồng quy trình công việc định sẵn)",
      note: "Systems where LLMs and external tools are orchestrated via deterministic, predefined procedural execution paths.",
    },
    {
      en: "Agent",
      vi: "Agent (tác nhân AI tự chủ)",
      note: "Systems where the LLM autonomously determines its own execution steps and tool invocations; requires strict guardrails and stopping conditions.",
    },
    {
      en: "Requirements analysis",
      vi: "Requirements analysis (phân tích yêu cầu bài toán)",
      note: "Translating messy business demands into structured actors, goals, hard constraints, exceptions, and testable acceptance criteria.",
    },
    {
      en: "Use case",
      vi: "Use case (tình huống ứng dụng thực tế)",
      note: "Structured description of who interacts with Claude, under what conditions, to achieve what outcome, with what risk controls.",
    },
    {
      en: "Pilot",
      vi: "Pilot (thử nghiệm quy mô nhỏ)",
      note: "Bounded, low-risk operational deployment designed to validate empirical performance and discover edge cases prior to wide rollout.",
    },
    {
      en: "Baseline",
      vi: "Baseline (mốc đo lường ban đầu)",
      note: "Pre-existing metrics regarding accuracy, cycle time, and cost used as a comparative benchmark to measure AI impact.",
    },
    {
      en: "Human checkpoint",
      vi: "Human checkpoint (điểm kiểm soát con người)",
      note: "Mandatory gate requiring qualified human expert verification before an action takes real-world operational effect.",
    },
    {
      en: "Evaluator-optimizer",
      vi: "Mô hình Evaluator-Optimizer (tạo và đánh giá lặp lại)",
      note: "Architectural pattern where one model generates output and an independent evaluator assesses it against rubrics iteratively.",
    },
    {
      en: "Stakeholder",
      vi: "Stakeholder (các bên liên quan)",
      note: "End users, business owners, compliance officers, and executive leadership affected by or accountable for an AI deployment.",
    },
  ],
  scenario: {
    title: "Scenario: Insurance Claims Intake Workflow Modernization",
    setup:
      "A regional health insurer processes incoming claim forms via email and attached PDFs. Claims intake staff manually read attachments, key policy numbers and billing codes into core systems, and route files to claims adjusters. Average intake turnaround is 3 business days; frequent errors include missed document attachments and miskeyed policy numbers. Executive leadership demands 'using AI to fully automate the intake pipeline'.",
    steps: [
      "Map current operational workflow to identify exact bottleneck stages, recurring error modes, and baseline costs.",
      "Conduct requirements analysis: enumerate actors, mandatory documents, approval rules, non-negotiable compliance mandates, and data gaps.",
      "Research applicable architectural patterns and audit internal privacy policies regarding protected health information (PHI) and qualified human review.",
      "Formulate three solution designs: OCR data extraction copilot, extraction with auto-drafted triage briefs, or multi-step pipeline with human checkpoints.",
      "Select initial pilot scope: automated document attachment verification and policy number reconciliation, because it is bounded, reversible, and auditable.",
      "Measure baseline accuracy across 100 historical claim packets containing standard filings and missing-document edge cases.",
      "Review pilot results with claims leadership, classifying observed extraction errors and deciding whether to expand scope to triage drafting.",
      "Present empirical findings, error taxonomy, and operational boundaries to stakeholders; explicitly reject claims of eliminating human adjusters.",
    ],
    takeaway:
      "Workflow engineering begins with deep operational understanding, not model hype. A bounded pilot with verifiable requirements, human checkpoints, and honest baseline tracking delivers far greater value than an unvalidated full-automation mandate.",
  },
  questions: [
    {
      id: "workflow-design-lesson-pilot",
      type: "single-choice",
      stem: "A team wants to integrate Claude into a claims intake workflow. Which first pilot is most defensible?",
      choices: [
        {
          id: "bounded-reversible-step",
          text: "A bounded, reversible document-check step with clear acceptance criteria, a human checkpoint, and a baseline for accuracy and cycle time.",
          explanation:
            "Correct: a bounded, reversible step with empirical baselines and human review allows the team to validate accuracy and surface failure modes safely.",
        },
        {
          id: "final-denial-decision",
          text: "The final claim-denial decision, because it saves the most time.",
          explanation:
            "Incorrect: claim denial carries severe legal, ethical, and financial consequences; piloting on irreversible high-stakes outcomes without prior validation violates safe AI principles.",
        },
        {
          id: "all-steps-at-once",
          text: "Every step at once so the team can learn quickly.",
          explanation:
            "Incorrect: full-workflow automation without component validation amplifies errors and obscures causal root causes of failure.",
        },
        {
          id: "visible-step-without-baseline",
          text: "The most visible customer-facing step, without measuring the current process.",
          explanation:
            "Incorrect: deploying customer-facing automation without baseline metrics prevents objective assessment of whether quality improved or degraded.",
        },
      ],
      correctChoiceIds: ["bounded-reversible-step"],
      correctExplanation:
        "An initial pilot must be bounded, reversible, and governed by explicit acceptance criteria and qualified human checkpoints. Measuring pre-pilot baselines is mandatory to quantify impact on accuracy and latency. Anthropic recommends starting with simple, measurable workflows and escalating complexity only when empirical improvements are demonstrated.",
      sourceIds: [
        "anthropic-building-effective-agents",
        "anthropic-evaluation-docs",
        "anthropic-claude-constitution",
      ],
    },
  ],
  relatedQuestionIds: [
    "workflow-requirements-extraction",
    "workflow-research-current-scan",
    "workflow-research-planning-practices",
    "workflow-solution-options",
    "workflow-solution-iteration",
    "workflow-solution-handoff-controls",
    "workflow-routing-intent-classification",
    "workflow-integration-checkpoints",
    "workflow-stakeholder-brief",
    "workflow-stakeholder-evidence",
    "workflow-requirements-artifacts",
    "workflow-integration-first-pilot",
  ],
  takeaways: [
    "Anchor solutions in operational problems, not model hype; deterministic workflows are the default choice for understood business processes.",
    "Rigorous requirements articulate actors, business goals, hard constraints, exceptions, open ambiguities, and full traceability.",
    "Disciplined research and planning decouples empirical facts, unverified assumptions, and recommendations; verify all source citations.",
    "Solution design explores multiple architectural patterns with explicit trade-offs and preserves human agency at critical junctures.",
    "Integrate via bounded, reversible pilots governed by empirical baselines, objective rubrics, human checkpoints, and stopping conditions.",
    "Communicate value transparently through measured outcomes, error taxonomies, and operational boundaries rather than blanket automation promises.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-building-effective-agents",
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-research-help",
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ],
});
