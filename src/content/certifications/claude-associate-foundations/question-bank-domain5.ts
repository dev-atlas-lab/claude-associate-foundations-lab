import { questionSchema, type Question, type QuestionBankEntry } from "../../../domain";
import { reviewedEntry } from "./bank-helpers";

/**
 * Reviewed Domain 5 bank: Configuration and Knowledge Management.
 *
 * Scope: all four verified Domain 5 objectives. The items stay at the level the
 * official Anthropic documentation supports: how project knowledge, project
 * instructions, connectors, system-level instructions, and maintenance routines
 * behave. Product UI details and plan limits can change, so questions focus on
 * durable configuration decisions rather than screenshots or exact quotas.
 */

const projectConfigBrief: Question = questionSchema.parse({
  id: "config-project-brief-setup",
  type: "single-choice",
  stem: "You manage a recurring client account in Claude. Every chat in the client's project must follow the same brand voice and use the approved product brief. A colleague asks where to put the brief and the voice rules so they apply to future chats. What should you do?",
  choices: [
    {
      id: "project-knowledge-instructions",
      text: "Upload the brief to project knowledge and save the voice rules as project instructions, then start chats inside the project.",
      explanation:
        "Correct: files in Project Knowledge provide persistent grounding across all chats in the project, while Project Instructions are configured once and govern behavioral tone across all future threads.",
    },
    {
      id: "paste-in-one-chat",
      text: "Paste the brief and the voice rules into the first chat and rely on later chats to remember them.",
      explanation:
        "Incorrect: pasting into an individual chat thread does not create shared project configuration. New chats do not inherit raw prior transcripts, and project memory does not reliably substitute for explicit configuration.",
    },
    {
      id: "project-description",
      text: "Put the voice rules in the project description, because Claude reads it before every chat.",
      explanation:
        "Incorrect: project names and descriptions are purely administrative and are not passed to Claude as system prompts.",
    },
    {
      id: "new-project-per-chat",
      text: "Create a separate project for each chat and re-upload the brief every time.",
      explanation:
        "Incorrect: creating a new project for every chat defeats the purpose of shared workspace knowledge and increases the risk of document version divergence.",
    },
  ],
  correctChoiceIds: ["project-knowledge-instructions"],
  correctExplanation:
    "Project Knowledge maintains persistent reference assets for all chats within a project, whereas Project Instructions enforce behavioral guidelines, brand tone, and constraints. Placing the product brief in Knowledge and voice rules in Instructions ensures reusable, centrally maintained configuration independent of individual user memory.",
  sourceIds: [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
  ],
});

const projectContextScope: Question = questionSchema.parse({
  id: "config-project-context-scope",
  type: "multiple-response",
  stem: "Which three statements about context in a Claude project are accurate? Select three.",
  choices: [
    {
      id: "knowledge-shared",
      text: "Files added to project knowledge are available across chats within that project.",
      explanation:
        "Correct: Project Knowledge serves as a shared grounding context accessible across all chats within the project.",
    },
    {
      id: "instructions-shared",
      text: "Saved project instructions apply to every chat in the project.",
      explanation:
        "Correct: Project Instructions are enforced at the project level and steer all conversations within that workspace.",
    },
    {
      id: "chat-context-isolated",
      text: "A new chat does not receive the full transcript of another chat; shared configuration belongs in project knowledge or project instructions.",
      explanation:
        "Correct: conversation transcripts remain isolated between chats; durable shared context must be configured in Project Knowledge or Instructions.",
    },
    {
      id: "description-visible",
      text: "The project name and description are passed to Claude as hidden instructions.",
      explanation:
        "Incorrect: Anthropic documentation confirms that project names and descriptions are not passed to Claude as system instructions.",
    },
    {
      id: "memory-cross-project",
      text: "A project automatically uses memory saved in every other project in the account.",
      explanation:
        "Incorrect: project memory is isolated to its specific project workspace and does not cross-pollinate across disparate projects.",
    },
    {
      id: "free-unlimited",
      text: "Free accounts can create an unlimited number of projects.",
      explanation:
        "Incorrect: free tiers enforce limits on project creation and feature access.",
    },
  ],
  correctChoiceIds: ["knowledge-shared", "instructions-shared", "chat-context-isolated"],
  correctExplanation:
    "Three distinct context mechanisms must be recognized: Project Knowledge (shared reference files), Project Instructions (shared behavioral steering), and individual chat history (isolated per conversation). New chats do not inherit prior transcripts. Shared rules and reference documents must be placed explicitly in Knowledge or Instructions.",
  sourceIds: [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
  ],
});

const connectorRollout: Question = questionSchema.parse({
  id: "config-connector-rollout",
  type: "single-choice",
  stem: "A Team-plan organization wants Claude to search Google Drive, Gmail, and Calendar without employees uploading exports manually. What is the correct rollout sequence?",
  choices: [
    {
      id: "owner-enables-user-authenticates",
      text: "An Owner or Primary Owner enables the connectors for the organization, then each employee authenticates their own Google account.",
      explanation:
        "Correct: organization Owners enable connector availability at the workspace level, after which each individual employee must authenticate their own enterprise account via OAuth.",
    },
    {
      id: "enable-grants-all-files",
      text: "The Owner enables the connectors once, and every employee immediately gets access to all organization files.",
      explanation:
        "Incorrect: enabling a connector does not bypass file permissions. Claude strictly inherits the connected user's existing permissions in the source system.",
    },
    {
      id: "users-connect-personal",
      text: "Employees connect their personal Google accounts so the organization does not need to manage access.",
      explanation:
        "Incorrect: using personal accounts exfiltrates enterprise data outside corporate governance and violates administrative policies.",
    },
    {
      id: "export-and-upload",
      text: "Employees keep exporting email and calendar data to spreadsheets, then upload those files to each project.",
      explanation:
        "Incorrect: manual exporting creates redundant, stale data snapshots and fails to achieve automated connector integration.",
    },
  ],
  correctChoiceIds: ["owner-enables-user-authenticates"],
  correctExplanation:
    "In Team and Enterprise plans, connectors must first be enabled by an Owner or Primary Owner at the organizational level. Individual users then authenticate their specific corporate accounts via OAuth. Claude mirrors native source permissions, so enabling a connector never broadens access rights or bypasses individual authentication.",
  sourceIds: [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ],
});

const connectorPermissionModel: Question = questionSchema.parse({
  id: "config-connector-permission-model",
  type: "multiple-response",
  stem: "Which three statements correctly describe connector permissions and action controls? Select three.",
  choices: [
    {
      id: "inherits-source-permissions",
      text: "Claude can only reach files, messages, or records that the connected user can already access in the source system.",
      explanation:
        "Correct: connectors strictly enforce native platform ACLs and cannot access files the authenticated user lacks permission to view.",
    },
    {
      id: "owners-restrict-writes",
      text: "On Team and Enterprise plans, an Owner can allow reads while blocking write or delete actions.",
      explanation:
        "Correct: Owners can enforce action-level policies under least privilege (e.g., permitting email reading while blocking email sending or file deletion).",
    },
    {
      id: "approval-before-send",
      text: "By default, Claude asks for approval before actions such as sending email or sharing a Drive file.",
      explanation:
        "Correct: write actions like sending messages or modifying shared file settings require explicit human approval by default.",
    },
    {
      id: "enable-grants-everything",
      text: "Enabling a connector at the organization level gives every member access to every file in the source system.",
      explanation:
        "Incorrect: organizational enablement only makes the integration available; data access remains strictly governed by each user's native account permissions.",
    },
    {
      id: "connector-expands-access",
      text: "A connector can grant a user more access than that user has in Google Drive or Gmail.",
      explanation:
        "Incorrect: connector controls operate under least privilege; they can restrict capabilities but can never expand access beyond source system grants.",
    },
    {
      id: "synced-content-shareable",
      text: "On Team and Enterprise plans, a chat containing synced connector content can be shared with the whole organization without restriction.",
      explanation:
        "Incorrect: Anthropic documentation specifies that chats containing synchronized connector data cannot be shared publicly across an organization.",
    },
  ],
  correctChoiceIds: [
    "inherits-source-permissions",
    "owners-restrict-writes",
    "approval-before-send",
  ],
  correctExplanation:
    "The connector security model operates across three layers: native source account permissions, organization-level enablement, and in-app action controls. Claude cannot view records the user cannot access, administrators can restrict write/delete capabilities, and sensitive write actions mandate explicit human confirmation by default.",
  sourceIds: [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ],
});

const systemInstructionQuality: Question = questionSchema.parse({
  id: "config-system-instruction-quality",
  type: "single-choice",
  stem: "Which system-level instruction is most likely to produce consistent and safe responses from a billing support assistant?",
  choices: [
    {
      id: "role-sources-escalation",
      text: "You are a Tier 1 support assistant for Acme's billing portal. Answer only from the supplied policy pages, use plain language, and escalate refund or legal questions to a human agent.",
      explanation:
        "Correct: clearly defines role, allowed knowledge sources, communication style, and explicit escalation boundaries.",
    },
    {
      id: "be-helpful",
      text: "Be as helpful as possible and answer every question confidently.",
      explanation:
        "Incorrect: overly vague and encourages uncalibrated overconfidence while omitting authorized sources, boundaries, and escalation paths.",
    },
    {
      id: "never-say-unknown",
      text: "Never say you do not know. If a policy is missing, infer the most likely answer.",
      explanation:
        "Incorrect: explicitly induces hallucination by barring admission of knowledge gaps and mandating guesswork in high-stakes billing scenarios.",
    },
    {
      id: "contradictory-rules",
      text: "Always give a refund immediately, never discuss refunds, and keep every answer under one sentence while explaining all policy details.",
      explanation:
        "Incorrect: contradictory and infeasible constraints force the model to arbitrarily violate directives, creating severe behavioral instability.",
    },
  ],
  correctChoiceIds: ["role-sources-escalation"],
  correctExplanation:
    "Effective system-level instructions establish durable operational guardrails: defined role, intended audience, permitted grounding sources, negative refusal boundaries, and human escalation pathways. It guides the model on when to answer, when to acknowledge uncertainty, and when to transfer control to human staff.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-projects-manage",
  ],
});

const systemInstructionComponents: Question = questionSchema.parse({
  id: "config-system-instruction-components",
  type: "multiple-response",
  stem: "Which three elements belong in an effective system-level instruction? Select three.",
  choices: [
    {
      id: "role-and-audience",
      text: "The assistant's role and the audience it is serving.",
      explanation:
        "Correct: role and audience framing align tone, depth, and domain terminology with user expectations.",
    },
    {
      id: "sources-and-uncertainty",
      text: "Which sources to rely on and what to do when information is missing or uncertain.",
      explanation:
        "Correct: specifying permitted sources and handling uncertainty reduces ungrounded hallucination and makes outputs auditable.",
    },
    {
      id: "escalation-and-format",
      text: "Escalation rules and the expected response format or length.",
      explanation:
        "Correct: escalation triggers define human handoff gates, while schema constraints ensure consistent, usable outputs.",
    },
    {
      id: "entire-policy-verbatim",
      text: "The entire policy manual pasted verbatim into every instruction.",
      explanation:
        "Incorrect: stuffing full policy manuals into instructions causes prompt bloat and maintenance friction; reference manuals belong in Project Knowledge.",
    },
    {
      id: "share-secrets",
      text: "Customer passwords and API keys so the assistant can verify identity.",
      explanation:
        "Incorrect: embedding credentials or secrets in system prompts violates fundamental data minimization and security practices.",
    },
    {
      id: "all-caps",
      text: "Every sentence in all caps to make the rules more forceful.",
      explanation:
        "Incorrect: typing in all caps does not improve constraint adherence and can degrade semantic parsing.",
    },
  ],
  correctChoiceIds: ["role-and-audience", "sources-and-uncertainty", "escalation-and-format"],
  correctExplanation:
    "System-level instructions should define persona role, authorized knowledge sources, protocols for handling missing information, operational refusal boundaries, schema format, and human escalation triggers. Voluminous reference manuals belong in Project Knowledge, keeping instructions concise and maintainable.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-projects-manage",
  ],
});

const knowledgeRefresh: Question = questionSchema.parse({
  id: "config-knowledge-refresh",
  type: "single-choice",
  stem: "A compliance policy changed last week. The shared project still contains the old PDF in project knowledge, and its project instructions cite the old deadline. What is the best maintenance action?",
  choices: [
    {
      id: "replace-update-retest",
      text: "Replace the obsolete PDF, update the instruction that cites the deadline, and re-test representative questions before the team relies on the project.",
      explanation:
        "Correct: resolves both grounding data and behavioral instructions, followed by regression testing across representative test cases to verify compliance.",
    },
    {
      id: "tell-claude-ignore",
      text: "Leave both files in place and add a chat message telling Claude to ignore the old version.",
      explanation:
        "Incorrect: a single chat message does not update shared project configuration; other chats and team members will continue retrieving the outdated PDF.",
    },
    {
      id: "delete-project",
      text: "Delete the whole project and ask the team to rebuild it from memory.",
      explanation:
        "Incorrect: deleting the entire workspace destroys vetted configuration, permissions, and history; updating specific assets is the proper maintenance action.",
    },
    {
      id: "wait-for-rag",
      text: "Wait for RAG to activate automatically, because retrieval will find the new policy on the web.",
      explanation:
        "Incorrect: Project RAG searches exclusively within uploaded Project Knowledge files; it does not crawl external websites to replace outdated internal files.",
    },
  ],
  correctChoiceIds: ["replace-update-retest"],
  correctExplanation:
    "Disciplined configuration maintenance follows a controlled process: delete or replace superseded reference files, update instructions referencing outdated terms, and rerun representative regression test cases. Prompting Claude in an individual chat to 'ignore the old PDF' is ineffective because shared Project Knowledge remains polluted.",
  sourceIds: [
    "anthropic-projects-manage",
    "anthropic-projects-rag",
  ],
});

const maintenanceCadence: Question = questionSchema.parse({
  id: "config-maintenance-cadence",
  type: "multiple-response",
  stem: "Which three practices keep a shared project configuration trustworthy over time? Select three.",
  choices: [
    {
      id: "named-owner",
      text: "Assign a named owner who reviews knowledge sources and instructions on a set schedule.",
      explanation:
        "Correct: designated ownership and scheduled reviews ensure obsolete documents are identified and updated before production errors occur.",
    },
    {
      id: "remove-and-version",
      text: "Remove obsolete files and record which version of a source the project is supposed to use.",
      explanation:
        "Correct: pruning superseded files and maintaining clear version metadata prevents contradictory guidance between old and new policies.",
    },
    {
      id: "regression-tests",
      text: "Re-run a small set of representative questions after any material change.",
      explanation:
        "Correct: executing regression test cases confirms whether prompt or knowledge updates inadvertently broke existing capabilities.",
    },
    {
      id: "never-change",
      text: "Never change a configuration that has already produced a good answer once.",
      explanation:
        "Incorrect: operational policies and reference documentation evolve; freezing configuration guarantees eventual obsolescence.",
    },
    {
      id: "conflicting-copies",
      text: "Keep several conflicting copies of each policy so Claude can choose the most convenient one.",
      explanation:
        "Incorrect: retaining conflicting revisions induces hallucination and prevents consistent factual verification.",
    },
    {
      id: "rely-on-memory",
      text: "Rely on project memory to remember which documents are current instead of maintaining the sources.",
      explanation:
        "Incorrect: project memory is an auxiliary preference feature and does not replace active knowledge hygiene; outdated files in Knowledge will still be retrieved.",
    },
  ],
  correctChoiceIds: ["named-owner", "remove-and-version", "regression-tests"],
  correctExplanation:
    "Trustworthy shared workspaces rely on clear ownership, rigorous knowledge hygiene, and regression evaluation. A designated maintainer audits assets on a set schedule, superseded files are pruned with version tracking, and benchmark questions are rerun after every modification.",
  sourceIds: [
    "anthropic-projects-manage",
    "anthropic-projects-rag",
    "anthropic-prompting-best-practices",
  ],
});

export const domainFiveQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(projectConfigBrief, "config-project-instructions", [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
  ]),
  reviewedEntry(projectContextScope, "config-project-instructions", [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
  ]),
  reviewedEntry(connectorRollout, "config-knowledge-connectors", [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ]),
  reviewedEntry(connectorPermissionModel, "config-knowledge-connectors", [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ]),
  reviewedEntry(systemInstructionQuality, "config-system-instructions", [
    "anthropic-prompting-best-practices",
    "anthropic-projects-manage",
  ]),
  reviewedEntry(systemInstructionComponents, "config-system-instructions", [
    "anthropic-prompting-best-practices",
    "anthropic-projects-manage",
  ]),
  reviewedEntry(knowledgeRefresh, "config-maintain", [
    "anthropic-projects-manage",
    "anthropic-projects-rag",
  ]),
  reviewedEntry(maintenanceCadence, "config-maintain", [
    "anthropic-projects-manage",
    "anthropic-projects-rag",
    "anthropic-prompting-best-practices",
  ]),
];
