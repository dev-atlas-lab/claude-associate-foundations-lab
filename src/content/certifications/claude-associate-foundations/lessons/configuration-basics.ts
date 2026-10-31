import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all four verified Domain 5 objectives.
 * Product details (menus, plan limits, connector availability) change faster
 * than the exam blueprint, so the lesson teaches durable configuration
 * decisions and points readers to current official documentation for UI steps.
 */
export const configurationBasicsLesson: Lesson = lessonSchema.parse({
  id: "configuration-basics",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 5,
  kind: "curriculum",
  contentStatus: "published",
  title: "Configuring Claude: projects, knowledge, connectors, and maintenance",
  englishTitle: "Configuring Claude: projects, knowledge, connectors, and maintenance",
  summary:
    "Learn to structure Claude into a robustly configured workspace: project instructions, persistent knowledge repositories, enterprise connectors, and system-level instructions. Focus on intentional information placement, least-privilege permission governance, and proactive configuration maintenance.",
  level: "foundation",
  estimatedMinutes: 20,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Technical content aligned with Anthropic Help Center documentation regarding projects, project RAG, connectors, Google Workspace integrations, and official prompting guidelines. Four objectives mapped from Exam Guide v1.0.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-projects-overview",
      "anthropic-projects-manage",
      "anthropic-projects-rag",
      "anthropic-connectors-help",
      "anthropic-google-workspace-connectors",
      "anthropic-prompting-best-practices",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "config-project-instructions",
      "config-knowledge-connectors",
      "config-system-instructions",
      "config-maintain",
    ],
    note: "Lesson covers all four verified Domain 5 objectives in Exam Guide v1.0.",
  },
  objectives: [
    "Configure Claude Projects with shared knowledge repositories and persistent instructions across multiple chat sessions.",
    "Manage third-party connectors, inherited source permissions, and authorization gates for sensitive write actions.",
    "Draft production system-level instructions clearly bounding roles, permitted sources, refusal thresholds, and human escalation pathways.",
    "Maintain configuration hygiene over time as source documentation, organizational policies, or team rosters evolve.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "System configuration directly dictates response quality",
      paragraphs: [
        "When identical user queries yield inconsistent or incorrect responses across conversations, the root cause is rarely the underlying model — it is configuration divergence: missing reference documents in Project Knowledge, transient instructions pasted ad-hoc into individual chats, or connectors operating under improper authorization boundaries. Domain 5 assesses your ability to establish and maintain these configuration layers intentionally.",
        "Anthropic defines a Project as a self-contained collaborative workspace featuring dedicated chat history and an isolated knowledge base. Reference files placed in Project Knowledge provide persistent grounding context for every chat within that project, while Project Instructions enforce behavioral guidelines across all team members. Crucially, a new chat within a project does not inherit the conversational transcripts of other chats; while project memory retains select preferences, Project Knowledge and Instructions represent the durable configuration backbone.",
      ],
    },
    {
      kind: "list",
      heading: "The four architectural configuration layers",
      items: [
        "Project Knowledge: Curated reference documents, code repositories, policy handbooks, or FAQs serving as grounding context for all chats in the project.",
        "Project Instructions: Persistent behavioral constraints, persona definitions, audience level, and output formatting rules applied across every conversation in the workspace.",
        "System-Level Instructions: Foundational operational guardrails governing role scope, allowed tools, data boundaries, and escalation triggers in multi-user deployments.",
        "Connectors: Integrations with external enterprise ecosystems (e.g., Google Drive, Gmail, Calendar) governed by inherited user permissions and write-action approval policies.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Project titles and descriptions are not system prompts",
      body: "According to Anthropic's technical documentation, Claude is not provided with project titles or descriptions as operational context. Never place critical behavioral constraints or compliance rules in the project description expecting the model to follow them. Place behavioral rules exclusively in Project Instructions and reference data in Project Knowledge.",
    },
    {
      kind: "paragraphs",
      heading: "Project Knowledge: placing reference assets where every chat can see them",
      paragraphs: [
        "Project Knowledge is the appropriate home for stable, reusable reference assets: brand style guides, technical specifications, approved standard operating procedures (SOPs), or standardized questionnaires. When documents reside in Project Knowledge, new chats reference them automatically without requiring manual re-uploading. Conversely, a decision made solely in an individual chat thread is ephemeral; to guarantee company-wide consistency, promote that decision into Project Knowledge or Instructions.",
        "On paid enterprise plans, as Project Knowledge approaches context window limits, Claude automatically utilizes RAG (Retrieval-Augmented Generation) to search and retrieve only relevant document chunks into active context. While RAG expands document capacity, it is not an excuse for poor data hygiene: redundant revisions, ambiguous file naming, and outdated PDFs degrade retrieval precision and introduce hallucination risks.",
      ],
    },
    {
      kind: "list",
      heading: "Checklist for onboarding assets into Project Knowledge",
      items: [
        "Is this document officially approved and currently in force?",
        "Does the filename clearly articulate content, version number, and publication date?",
        "Have superseded drafts or duplicate files that create contradictions been deleted?",
        "Is the document sanitized of unnecessary personally identifiable information (PII) or classified credentials?",
        "Is there a designated operational owner responsible for refreshing or revoking the asset when updated?",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Project Instructions: shaping behavior, not storing raw documentation",
      paragraphs: [
        "Project Instructions define durable operational standards: what role the assistant assumes, the target audience profile, which knowledge assets to consult, conditions mandating human escalation, and output schema requirements. Anthropic's prompting research indicates that explicit, contextually grounded instructions paired with few-shot exemplars produce the highest behavioral consistency across team members.",
        "Avoid pasting large policy text or raw manuals into the instruction field. Large reference documents belong in Project Knowledge; Project Instructions should contain behavioral steering and quality standards. Maintaining this clear separation allows teams to audit and iterate on prompt logic independently of document revisions.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Verbose instructions do not guarantee compliance",
      body: "Stuffing hundreds of conflicting, unstructured directives into project instructions creates attention interference, causing Claude to drop critical constraints. Keep instructions concise, organize logical blocks using clean XML tags, and run regression evaluations against representative test cases following every modification.",
    },
    {
      kind: "paragraphs",
      heading: "Connectors: source permissions, governance, and write-action controls",
      paragraphs: [
        "Connectors enable Claude to interact directly with external enterprise applications (such as Google Drive, Gmail, or Calendar) to read context and assist with operational workflows. Claude strictly enforces the permission model of the connected platform: if an individual user lacks read permissions for a specific file or folder in Google Drive, Claude cannot access that file on their behalf.",
        "In Team and Enterprise tiers, Organization Owners enable connectors at the workspace level, but individual users must authenticate via OAuth with their own enterprise credentials. Enabling a connector never circumvents native access controls. Furthermore, administrators can enforce action-level restrictions (e.g., allowing email drafting while blocking external sending) under the principle of least privilege.",
        "For Google Workspace connectors, default safeguards enforce mandatory human confirmation before executing write actions such as sending emails, deleting records, or updating calendars. Data fetched via connectors is tied to the active chat session and deleted upon session termination. Anthropic does not train commercial models on customer connector data.",
      ],
    },
    {
      kind: "list",
      heading: "Pre-deployment audit questions for connectors",
      items: [
        "Is an active external connector necessary, or does periodic file upload suffice?",
        "What data sensitivity tier applies to the connected repository, and does organizational policy permit integration?",
        "Has organizational leadership authorized the connector, and has each operator authenticated via corporate SSO/OAuth?",
        "Which write actions must be blocked or gated behind mandatory human approval?",
        "Are chats containing synchronized external data permitted to be shared across workspace members?",
      ],
    },
    {
      kind: "paragraphs",
      heading: "System-level instructions: stable framing, boundaries, and escalation",
      paragraphs: [
        "System-level instructions establish the constitutional foundation of an assistant. Effective instructions define the persona and audience, authorized reference materials, fallback behavior when data is missing, non-negotiable refusal topics, and clear human escalation channels. For instance: 'You are a Tier 1 support copilot for Payment Gateway X; answer strictly from provided policy pages; escalate refund disputes or legal claims to human staff immediately.'",
        "Negative failure modes must be explicitly avoided: never instruct the model to 'never say you don't know' or 'make educated guesses when data is absent'. Such directives directly induce hallucination. Never embed API keys, secrets, or internal credentials in system instructions.",
      ],
    },
    {
      kind: "list",
      heading: "The minimal system instruction schema",
      items: [
        "Role & Audience: Assistant persona, user background, and required domain tone.",
        "Permitted Sources: Explicit reference scope and whether general parametric knowledge is authorized.",
        "Uncertainty Protocol: Requirement to acknowledge knowledge gaps, seek clarification, or trigger human handoff.",
        "Refusal Boundaries: Prohibited topics or actions with concise, non-preachy justifications.",
        "Output Format: Length constraints, schema definitions, and structural tags.",
        "Escalation Mechanism: Specific trigger criteria and required metadata passed to human reviewers.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Configuration maintenance: proactive hygiene prevents stale outputs",
      paragraphs: [
        "Knowledge bases and prompt instructions are living assets, not one-time setups. Policies change, product branding updates, employees depart, and reference files are replaced. When obsolete PDFs remain in Project Knowledge, Claude will cite revoked policies; when instructions reference outdated deadlines, outputs will be factually wrong even if the model reasons correctly.",
        "Disciplined maintenance requires: an assigned operational owner, scheduled review cadences, structured versioning for replaced files, and a stable regression test suite. Following any substantive update, run the evaluation suite to detect regressions prior to production usage. In shared projects, archiving a project preserves its members and knowledge; archiving does not revoke permissions.",
      ],
    },
    {
      kind: "list",
      heading: "Recurring maintenance cadence checklist",
      items: [
        "Assign a designated primary owner and backup maintainer for each critical project.",
        "Conduct scheduled knowledge audits: prune superseded drafts, update filenames, and inspect metadata.",
        "Audit instructions for references to discontinued products, outdated deadlines, or superseded rules.",
        "Rerun the regression evaluation suite containing standard cases, edge cases, and out-of-domain queries.",
        "Maintain an audit log recording modifications, approving authority, and review timestamps.",
        "Revoke connector access and project memberships when team members change roles or leave the company.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Never rely on chat turns to patch shared configuration",
      body: "Typing 'please ignore the old PDF from now on' into a single chat turn does not update shared project configuration. While project memory may note that turn, other team members and future chats will continue referencing the outdated PDF in Project Knowledge. Correct shared configuration at the Project Knowledge and Instructions level, then run regression tests.",
    },
  ],
  keyTerms: [
    {
      en: "Project",
      vi: "Claude Projects (không gian làm việc dự án)",
      note: "Dedicated collaborative workspace housing conversation threads, shared Project Knowledge, and persistent custom instructions for team members.",
    },
    {
      en: "Project knowledge",
      vi: "Project knowledge (kho tài liệu tri thức dự án)",
      note: "Curated collection of reference documents, specifications, or datasets uploaded to ground Claude's responses across all project chats.",
    },
    {
      en: "Project instructions",
      vi: "Project instructions (bộ quy tắc / chỉ dẫn dự án)",
      note: "Persistent behavioral rules, persona definitions, and formatting standards configured at the project level.",
    },
    {
      en: "Connector",
      vi: "Connector (bộ kết nối dịch vụ ngoài)",
      note: "Integration bridge allowing Claude to search external enterprise tools (e.g., Google Workspace) strictly bounded by inherited user permissions.",
    },
    {
      en: "Retrieval augmented generation (RAG)",
      vi: "RAG (Retrieval-Augmented Generation / sinh văn bản kèm truy xuất)",
      note: "Automated retrieval of relevant text passages from large knowledge repositories into context window rather than loading full documents.",
    },
    {
      en: "System-level instruction",
      vi: "System-level instruction (chỉ dẫn cấp hệ thống)",
      note: "Foundational directive establishing role scope, permissible data sources, refusal thresholds, and escalation pathways.",
    },
    {
      en: "Least privilege",
      vi: "Least privilege (nguyên tắc đặc quyền tối thiểu)",
      note: "Security principle granting only the minimal necessary read/write authorizations required for task completion.",
    },
    {
      en: "Regression test",
      vi: "Regression test (kiểm thử hồi quy)",
      note: "Executing a standardized test suite following prompt or knowledge modifications to ensure existing capabilities have not degraded.",
    },
  ],
  scenario: {
    title: "Scenario: Multi-Client Advisory Workspace Configuration",
    setup:
      "A strategic consulting practice maintains separate Claude Projects for enterprise clients. Each project contains client brand guidelines, proprietary product roadmaps, and response templates. Recently, a client released an updated return policy, but the project knowledge base still contains the superseded 2024 PDF; an onboarding analyst pasted the new policy into their private chat turn, assuming it updated the workspace for all consultants. Simultaneously, a team member requested enabling the Gmail connector with autonomous sending permissions.",
    steps: [
      "Establish authoritative truth: upload the approved 2026 policy into Project Knowledge and delete the superseded PDF.",
      "Update Project Instructions if the new policy alters escalation thresholds, tone requirements, or refund review gates.",
      "Sanitize existing documentation, adding explicit publication dates and version metadata to filenames.",
      "Execute the standardized regression test suite covering refund edge cases, missing data scenarios, and out-of-scope inquiries.",
      "Review organizational connector policy: confirm primary owner approval, enforce individual OAuth authentication, and restrict write actions.",
      "Enforce least-privilege policies: permit email searching while keeping email dispatching behind mandatory human confirmation.",
      "Document project ownership, review cadence, and audit history to ensure institutional compliance.",
    ],
    takeaway:
      "Effective configuration requires intentional structural separation: reference data in Project Knowledge, behavioral governance in Project Instructions, least-privilege connectors, and proactive regression audits.",
  },
  questions: [
    {
      id: "configuration-lesson-source-placement",
      type: "single-choice",
      stem: "A team wants a new support policy to apply to every chat in a shared project. The policy is a long PDF, and the team also needs a rule that refund questions must be escalated. Where should each item go?",
      choices: [
        {
          id: "pdf-knowledge-rule-instructions",
          text: "Put the PDF in project knowledge and the escalation rule in project instructions.",
          explanation:
            "Correct: long reference documents belong in Project Knowledge to serve as persistent context; operational rules and escalation gates belong in Project Instructions.",
        },
        {
          id: "both-instructions",
          text: "Paste the entire PDF and the escalation rule into project instructions.",
          explanation:
            "Incorrect: stuffing voluminous policy text into instructions causes context clutter, makes maintenance difficult, and risks dropped constraints.",
        },
        {
          id: "both-one-chat",
          text: "Paste both into the first chat and tell the team to continue in that chat.",
          explanation:
            "Incorrect: instructions pasted into an individual chat thread do not configure the shared workspace; new chats do not inherit raw prior transcripts.",
        },
        {
          id: "pdf-description",
          text: "Put the PDF in the project description and the rule in the project name.",
          explanation:
            "Incorrect: Claude is not provided with project titles or descriptions as operational context; neither field functions as a prompt or knowledge store.",
        },
      ],
      correctChoiceIds: ["pdf-knowledge-rule-instructions"],
      correctExplanation:
        "Maintain clear separation of concerns: reference documentation resides in Project Knowledge for grounded retrieval, while behavioral constraints and escalation paths reside in Project Instructions to steer every conversation across the project. Project titles and descriptions are purely administrative and are not passed to Claude.",
      sourceIds: [
        "anthropic-projects-overview",
        "anthropic-projects-manage",
        "anthropic-prompting-best-practices",
      ],
    },
  ],
  relatedQuestionIds: [
    "config-project-brief-setup",
    "config-project-context-scope",
    "config-connector-rollout",
    "config-connector-permission-model",
    "config-system-instruction-quality",
    "config-system-instruction-components",
    "config-knowledge-refresh",
    "config-maintenance-cadence",
    "configuration-project-permission-revocation",
  ],
  takeaways: [
    "Project Knowledge holds shared grounding assets; Project Instructions govern persistent behavior across all chats.",
    "New chats do not inherit prior conversational transcripts; project memory does not replace explicit configuration.",
    "Connectors enforce inherited permissions under least privilege; enabling at the organization level never bypasses individual OAuth or file ACLs.",
    "Effective system instructions articulate role, audience, permitted sources, uncertainty behavior, refusal bounds, and human escalation.",
    "Proactive maintenance pairs clear ownership with scheduled document audits, version hygiene, and automated regression testing.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-projects-overview",
    "anthropic-projects-manage",
    "anthropic-projects-rag",
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
    "anthropic-prompting-best-practices",
  ],
});
