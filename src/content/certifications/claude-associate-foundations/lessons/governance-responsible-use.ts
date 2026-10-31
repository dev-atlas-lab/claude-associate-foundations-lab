import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all four verified Domain 6 objectives.
 * It teaches use-case triage, data sensitivity, organizational governance, and
 * ethical judgment from Anthropic's published policies and Constitution. It is
 * explicit that this is review guidance, not legal advice, and that an
 * organization's own policy can be stricter than the provider's policy.
 */
export const governanceResponsibleUseLesson: Lesson = lessonSchema.parse({
  id: "governance-responsible-use",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 7,
  kind: "curriculum",
  contentStatus: "published",
  title: "Governance and responsible use: use cases, data, and human accountability",
  englishTitle: "Governance and responsible use: use cases, data, and human accountability",
  summary:
    "Learn to evaluate use-case suitability, enforce data classification and minimization prior to ingesting into Claude, implement organizational compliance workflows and approval gates, and maintain qualified human accountability over high-stakes decisions.",
  level: "foundation",
  estimatedMinutes: 22,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Content aligned with Anthropic's Usage Policy, Privacy Policy, Claude's Constitution, documentation on reducing hallucinations, connector Help Center articles, and evaluation guidelines. Four objectives mapped from Exam Guide v1.0.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-usage-policy",
      "anthropic-privacy-policy",
      "anthropic-claude-constitution",
      "anthropic-reduce-hallucinations-doc",
      "anthropic-evaluation-docs",
      "anthropic-connectors-help",
      "anthropic-google-workspace-connectors",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "governance-use-case-fit",
      "governance-data-privacy",
      "governance-policies",
      "governance-ethics",
    ],
    note: "Lesson covers all four verified Domain 6 objectives in Exam Guide v1.0.",
  },
  objectives: [
    "Classify use cases into low-risk suitable applications, high-risk workflows requiring strict controls, and prohibited use cases.",
    "Apply data classification tiers, data minimization principles, and permission verifications prior to providing context to Claude.",
    "Align AI workflows with organizational governance policies, approval gates, audit logging, escalation channels, and periodic reviews.",
    "Navigate ethical considerations regarding AI transparency, non-discrimination, preservation of human accountability, and societal impact.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Governance begins with the decision, not the tool",
      paragraphs: [
        "The fundamental governance question is not 'is Claude technically capable of doing this?' but rather 'should we employ AI for this specific decision, with this data classification, under what compliance policies, and who maintains ultimate accountability?'. Anthropic explicitly states that its Usage Policy applies to anyone submitting inputs to Anthropic's services, and operators building or deploying agentic workflows bear legal and operational responsibility for ensuring policy compliance.",
        "Consequently, treat use-case triage as an architectural prerequisite, not an afterthought. If an intended use case fundamentally violates compliance or safety principles, modifying prompt wording or selecting an alternative model tier cannot cure the defect.",
      ],
    },
    {
      kind: "list",
      heading: "The four foundational governance triage questions",
      items: [
        "Use Case: Who is impacted, what decision is rendered, what is the severity of an error, and is qualified human sign-off mandatory?",
        "Data: What sensitivity tier does the data occupy, are proper permissions held, can data be sanitized or minimized, and what retention policies apply?",
        "Policy: Does organizational compliance authorize this workflow, who approves exceptions, and what logging or disclosure is required?",
        "Ethics: Is AI involvement transparent, are all cohorts treated equitably, and does the design avoid eroding human accountability?",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Suitable use cases versus high-risk workflows",
      paragraphs: [
        "A suitable AI use case features defined objectives, verifiable inputs and outputs, designated human owners, and review mechanisms proportional to real-world impact. Low-risk applications include internal documentation summarization, draft generation, code refactoring, brainstorming, or data extraction from approved corporate repositories.",
        "Anthropic designates specific domains as High-Risk Decisions: legal counsel, clinical healthcare, financial advisory, credit evaluation, insurance underwriting, housing access, employment screening, educational admissions, public benefits allocation, and legal status determinations. For high-risk applications, Anthropic's Usage Policy mandates: a qualified human in the loop, explicit disclosure that AI is being utilized, and independent non-AI safety interlocks for physical systems. Consumer-facing chatbots must similarly disclose AI identity.",
        "A high-risk designation does not mean absolute prohibition. It mandates rigorous defensive architecture: executive approval, expert human review, decision explainability, formal appeals mechanisms, continuous monitoring, and auditable baselines. An enterprise's internal policies may prohibit use cases even when provider policies permit them.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "High-risk workflows require architectural controls, not passive disclaimers",
      body: "A superficial disclaimer like 'generated by AI' does not satisfy human-in-the-loop requirements for credit, employment, insurance, medical, or legal decisions. Organizations must define qualified reviewer credentials, inspectable evidence rubrics, clear accountability ownership, and formal escalation and remediation channels.",
    },
    {
      kind: "diagram",
      heading: "Visual Simulation: Prompt Injection Defense, Jailbreaks & System Governance",
      diagramId: "safety-guardrails-simulator",
      intro: "Simulate Anthropic's multi-layered defense architecture: isolating untrusted input with XML delimiters, resisting adversarial role hijacking, and enforcing Sovereign System Prompt precedence.",
    },
    {
      kind: "paragraphs",
      heading: "Data governance: classification, minimization, and access rights",
      paragraphs: [
        "Anthropic's Privacy Policy outlines data handling for customer inputs and outputs. Enterprise customers hold responsibility for ensuring proper authorization before uploading proprietary assets or connecting third-party services. Commercial inputs and outputs submitted via enterprise APIs or paid workspace tiers are not utilized to train Anthropic's foundational models, subject to narrow trust-and-safety review exceptions.",
        "Never paste entire unstructured repositories into prompts. Classify data sensitivity, apply strict data minimization (ingesting only the minimal necessary subset), redact unnecessary Personally Identifiable Information (PII), utilize enterprise-managed workspaces, and audit connector ACLs. External connectors inherit native platform permissions and can be constrained to read-only access under the principle of least privilege.",
      ],
    },
    {
      kind: "list",
      heading: "Data pre-flight ingestion checklist",
      items: [
        "Classification: Is the asset public, internal-only, confidential, or legally restricted (PHI, PCI, PII)?",
        "Minimization: What exact fields are required; can non-essential records be redacted or aggregated?",
        "Authorization: Do legal terms and customer agreements permit processing this data via commercial AI?",
        "Environment: Is processing conducted within an approved enterprise workspace governed by corporate SSO?",
        "Retention: What data retention window applies, and are prompt logs subject to regulatory deletion requests?",
        "Incident Protocol: If unauthorized disclosure occurs, who is notified and what remediation workflow triggers?",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Deleting a chat thread does not instantly purge all enterprise backups",
      body: "While deleting a conversation removes it immediately from user-facing history and schedules deletion from production systems within defined policy windows, enterprise audit logs, secure archival backups, or cached connector systems may retain records according to organizational retention schedules.",
    },
    {
      kind: "paragraphs",
      heading: "Organizational policies and operational governance",
      paragraphs: [
        "Provider acceptable use policies represent a regulatory baseline, not a complete organizational policy. A production governance framework encompasses: formalized use-case risk tiers, designated business approvers, mandatory human review checkpoints, disclosure protocols, immutable audit logging, user training, and scheduled reviews as policies and models evolve.",
        "Never permit individual operators to grant ad-hoc policy exceptions or bypass audit logging because 'AI is only assisting'. When high-stakes outcomes occur, compliance auditors must be able to inspect which model version processed the request, what prompt and context were provided, which human approved the output, and what ground-truth evidence was reviewed.",
      ],
    },
    {
      kind: "list",
      heading: "Standardized use-case review template",
      items: [
        "Business Objective: Expected operational benefit and quantitative success metrics.",
        "Impact Assessment: Affected cohorts, potential harm from errors, and availability of appeal mechanisms.",
        "Data Ingestion Profile: Data classification tier, minimization strategy, and authorization basis.",
        "Automation Level: Advisory copilot, mandatory human approval gate, or autonomous background pipeline.",
        "Compliance Mandates: Mandatory AI disclosure, qualified human review, audit logging, and escalation paths.",
        "Governance Ownership: Designated accountable executive, review cadence, and operational stopping criteria.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Ethics: transparency, fairness, and human agency",
      paragraphs: [
        "Claude's Constitution embeds core ethical commitments: remaining unbiased and even-handed on contentious societal debates; presenting multiple valid viewpoints; employing neutral terminology; rejecting deceptive framing or cherry-picked evidence; prohibiting unlawful discrimination across protected characteristics; and strictly upholding human agency and oversight.",
        "In enterprise workflows, evaluate: Do affected customers know AI was involved? Do they possess recourse to dispute decisions? Does the model apply asymmetric evaluation criteria to protected groups? Does a designated human retain ultimate accountability? If the answer to any of these is unclear, pause the deployment and re-engineer safeguards.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Ethical principles are operational guidelines, not legal advice",
      body: "This curriculum establishes operational evaluation principles. It does not replace formal legal counsel. For workflows involving consumer credit, healthcare diagnostics, employment decisions, or statutory financial filings, always consult corporate legal, privacy, and compliance teams.",
    },
  ],
  keyTerms: [
    {
      en: "Use-case fit",
      vi: "Use-case fit (đánh giá mức độ phù hợp bài toán)",
      note: "Evaluating the balance between business value and potential harm to stakeholders prior to approving an AI deployment.",
    },
    {
      en: "High-risk use",
      vi: "High-risk use case (tình huống rủi ro cao)",
      note: "Workflows carrying significant legal, financial, or personal consequences (e.g., healthcare, lending, employment, legal analysis).",
    },
    {
      en: "Human in the loop",
      vi: "Human-in-the-loop (con người tham gia kiểm soát)",
      note: "Mandatory system architecture requiring a qualified human domain expert to inspect, verify, and approve high-stakes actions.",
    },
    {
      en: "Data minimization",
      vi: "Data minimization (nguyên tắc dữ liệu tối thiểu)",
      note: "Privacy principle mandating that only strictly necessary data fields are ingested into prompt context, redacting excess PII.",
    },
    {
      en: "Retention",
      vi: "Data retention (chính sách lưu trữ dữ liệu)",
      note: "Formal policies governing how long input prompts, tool outputs, and generated completions are stored across systems.",
    },
    {
      en: "Disclosure",
      vi: "AI Disclosure (công khai minh bạch việc dùng AI)",
      note: "Transparently notifying end users that they are interacting with an AI assistant or that content was AI-generated.",
    },
    {
      en: "Accountability",
      vi: "Accountability (trách nhiệm giải trình)",
      note: "Explicit identification of the human professional or organizational entity holding legal and operational liability for outcomes.",
    },
    {
      en: "Governance",
      vi: "AI Governance (quản trị AI và tuân thủ)",
      note: "Comprehensive institutional framework encompassing approval workflows, policy compliance, audit logging, and risk mitigation.",
    },
  ],
  scenario: {
    title: "Scenario: Customer Service Assistant with Autonomous Refund Authority",
    setup:
      "An e-commerce enterprise plans to deploy Claude as an automated customer support copilot. The proposed system would read customer order histories, answer queries, execute refunds, and alter delivery addresses autonomously. The organization aims to minimize resolution latency, but currently lacks formal data minimization rules, write-action approval gates, or escalation protocols.",
    steps: [
      "Classify use case: routine product FAQs represent low-risk advisory interactions; processing financial refunds and modifying delivery addresses carry financial and privacy risks requiring strict controls.",
      "Apply data minimization: ingest only order IDs and line-item records relevant to the active inquiry, redacting full customer profile archives.",
      "Audit enterprise policy: define financial refund thresholds, identify mandatory human approvers, and log transaction metadata.",
      "Engineer write-action guardrails: permit Claude to draft response text and propose refund amounts, while gating refund execution behind mandatory human agent approval.",
      "Incorporate AI disclosure: explicitly inform customers they are communicating with an AI copilot, providing a clear escape path to a human agent.",
      "Audit connector permissions: restrict external API integrations to read-only access for order history, enforcing least privilege.",
      "Track operational metrics: monitor resolution accuracy, escalation rates, customer dispute frequencies, and conduct scheduled compliance audits.",
      "Brief leadership: report empirical performance gains, disclose known edge-case failure modes, and articulate the ongoing necessity of human review.",
    ],
    takeaway:
      "A production assistant does not require unchecked autonomy. Responsible architecture decouples informational advisory from consequential write actions, enforces data minimization, mandates human authorization gates, and maintains full auditability.",
  },
  questions: [
    {
      id: "governance-lesson-assistant-actions",
      type: "single-choice",
      stem: "A team proposes a customer-facing Claude assistant that can issue refunds and change account details. Which design is most responsible?",
      choices: [
        {
          id: "limit-actions-and-review",
          text: "Let Claude read and draft responses, require human approval for refunds and account changes, disclose the AI interaction, and log actions.",
          explanation:
            "Correct: decouples read/drafting capabilities from consequential financial/account write actions, enforces human approval, ensures AI disclosure, and maintains auditability.",
        },
        {
          id: "allow-all-actions",
          text: "Allow every action so customers get faster service.",
          explanation:
            "Incorrect: granting autonomous refund and account modification authority introduces severe fraud, financial, and privacy liabilities without safety guardrails.",
        },
        {
          id: "hide-ai-disclosure",
          text: "Hide the AI disclosure to make the assistant feel more human.",
          explanation:
            "Incorrect: concealing AI identity violates Anthropic's Usage Policy and breaches basic ethical transparency principles.",
        },
        {
          id: "remove-human-review",
          text: "Remove human review because the model is consistent.",
          explanation:
            "Incorrect: consistency does not guarantee correctness; eliminating human oversight on consequential financial actions violates safe AI governance.",
        },
      ],
      correctChoiceIds: ["limit-actions-and-review"],
      correctExplanation:
        "Responsible system architecture decouples informational advisory from consequential actions. Allowing Claude to read records and draft proposed responses preserves operational velocity, while gating financial refunds and account modifications behind mandatory human approval prevents fraud and privacy breaches. Anthropic's Usage Policy mandates transparency and human oversight on consequential workflows.",
      sourceIds: [
        "anthropic-usage-policy",
        "anthropic-claude-constitution",
        "anthropic-connectors-help",
      ],
    },
  ],
  relatedQuestionIds: [
    "governance-human-oversight",
    "governance-customer-assistant-safeguards",
    "governance-privacy-confidential-upload",
    "governance-privacy-controls",
    "governance-privacy-third-party-connector",
    "governance-policy-hiring-screening",
    "governance-policy-operations",
    "governance-policy-exception-escalation",
    "governance-use-case-triage",
    "governance-ethics-considerations",
  ],
  takeaways: [
    "AI governance anchors in use-case suitability, data sensitivity, organizational compliance, and human accountability, not model selection.",
    "High-risk use cases are not prohibited, but mandate qualified human review, transparent AI disclosure, and robust architectural guardrails.",
    "Apply data classification and minimization, auditing connector permissions and retention policies before ingesting data into Claude.",
    "Provider acceptable use policies represent a baseline; organizations must implement approval workflows, audit logging, and regular reviews.",
    "Ethical deployment demands transparency, non-discrimination, auditable evidence, and safeguarding human agency at decision boundaries.",
    "Governance principles serve as operational review guides, not formal legal counsel; consult legal and compliance teams for regulated data.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-usage-policy",
    "anthropic-privacy-policy",
    "anthropic-claude-constitution",
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ],
});
