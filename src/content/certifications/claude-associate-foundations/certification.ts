import {
  blueprintSchema,
  certificationSchema,
  providerSchema,
  type Blueprint,
  type Certification,
  type Provider,
} from "../../../domain";

export const anthropicProvider: Provider = providerSchema.parse({
  id: "anthropic",
  name: "Anthropic",
  website: "https://www.anthropic.com",
});

export const associateFoundationsCertification: Certification = certificationSchema.parse({
  id: "claude-associate-foundations",
  providerId: "anthropic",
  name: "Claude Certified Associate – Foundations",
  code: "CCAO-F",
  audience:
    "Professionals at Claude Partner Network organizations who use Claude as a productivity tool to complete business and knowledge-work tasks with minimal guidance.",
  officialUrl:
    "https://anthropic-partners.skilljar.com/claude-certified-associate-foundations-certification",
  verification: {
    status: "verified",
    checkedAt: "2026-10-26",
    note: "Credential name, code, audience, and registration path were checked against Exam Guide v1.0 and the official Partner Academy pages.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-partner-certifications",
      "anthropic-associate-certification",
    ],
  },
  contentStatus: "published",
});

/**
 * Exam Guide v1.0, effective July 2026. This is the blueprint that applies to
 * the learner's planned exam before 2026-11-14; the later update is recorded
 * separately instead of being blended into this version.
 */
export const associateFoundationsBlueprint: Blueprint = blueprintSchema.parse({
  id: "ccao-f-v1",
  certificationId: "claude-associate-foundations",
  version: "1.0",
  effectiveFromLabel: "July 2026",
  versionNotice:
    "A revised guide is expected to publish on 2026-11-17, with revised exam content effective 2026-12-07. This blueprint is version 1.0 for the learner's planned exam before 2026-11-14. The future revision notice is only partially verified because the Pearson VUE page was unavailable when re-checked on 2026-10-26.",
  versionNoticeSourceIds: ["pearson-anthropic-program"],
  format: {
    itemCount: 60,
    timeLimitMinutes: 120,
    seatTimeMinutes: 135,
    itemTypes: ["multiple-choice", "multiple-response"],
    delivery: "Proctored: online proctored (OnVUE) and/or Pearson test center",
    passingScore: {
      scaledMin: 100,
      scaledMax: 1000,
      cutScore: 720,
    },
    feeUsd: 99,
    validityMonths: 12,
    resultReporting:
      "Pass/fail plus a scaled score from 100 to 1,000 and percent-correct by domain",
  },
  domains: [
    {
      id: "prompting-task-execution",
      code: "1",
      title: "Prompting and Task Execution",
      weightPercent: 14,
      objectives: [
        {
          id: "prompting-create-effective-prompts",
          statement: "Create effective prompts for business and technical tasks",
        },
        {
          id: "prompting-task-decomposition",
          statement: "Apply task decomposition techniques to structure complex requests",
        },
        {
          id: "prompting-iterate",
          statement: "Iterate prompts to improve output quality",
        },
        {
          id: "prompting-adapt-strategies",
          statement:
            "Adapt prompting strategies based on task type (analysis, research, drafting, brainstorming)",
        },
      ],
    },
    {
      id: "output-evaluation-validation",
      code: "2",
      title: "Output Evaluation and Validation",
      weightPercent: 21,
      objectives: [
        {
          id: "output-evaluate-accuracy",
          statement: "Evaluate Claude-generated outputs for accuracy and completeness",
        },
        {
          id: "output-identify-hallucinations",
          statement: "Identify hallucinations, inconsistencies, and biases in responses",
        },
        {
          id: "output-fact-check",
          statement: "Apply fact-checking and validation techniques",
        },
        {
          id: "output-human-review",
          statement:
            "Determine when human review or additional verification is required",
        },
        {
          id: "output-edit-adapt",
          statement:
            "Edit, adapt, refine, and compare outputs for the intended audience",
        },
        {
          id: "output-format-selection",
          statement:
            "Organize and curate information and select appropriate output formats (artifacts, inline, structured data)",
        },
      ],
    },
    {
      id: "product-model-selection",
      code: "3",
      title: "Product and Model Selection",
      weightPercent: 12,
      objectives: [
        {
          id: "product-feature-selection",
          statement:
            "Select appropriate Claude product features (Projects, research mode, chat, artifacts)",
        },
        {
          id: "model-family-selection",
          statement: "Differentiate between Claude model types (Haiku, Sonnet, Opus)",
        },
        {
          id: "model-task-fit",
          statement:
            "Align model selection with task requirements (cost, speed, quality)",
        },
        {
          id: "context-memory-management",
          statement:
            "Understand and manage context limitations and memory considerations (when to restart, summarize, or persist)",
        },
      ],
    },
    {
      id: "workflow-integration-solution-design",
      code: "4",
      title: "Workflow Integration and Solution Design",
      weightPercent: 16,
      objectives: [
        {
          id: "workflow-requirements-analysis",
          statement: "Apply Claude to analyze requirements and use cases",
        },
        {
          id: "workflow-research-planning",
          statement:
            "Leverage Claude for research, planning, and process optimization",
        },
        {
          id: "workflow-solution-design",
          statement:
            "Use Claude to support solution design, development, and iteration",
        },
        {
          id: "workflow-integrate",
          statement:
            "Integrate Claude into existing workflows to augment or redesign them",
        },
        {
          id: "workflow-stakeholder-communication",
          statement: "Communicate Claude's value and limitations to stakeholders",
        },
      ],
    },
    {
      id: "configuration-knowledge-management",
      code: "5",
      title: "Configuration and Knowledge Management",
      weightPercent: 12,
      objectives: [
        {
          id: "config-project-instructions",
          statement:
            "Configure Claude Projects with instructions and knowledge sources",
        },
        {
          id: "config-knowledge-connectors",
          statement:
            "Manage uploaded knowledge and connectors (e.g., Google Drive, Gmail)",
        },
        {
          id: "config-system-instructions",
          statement: "Create effective system-level instructions",
        },
        {
          id: "config-maintain",
          statement:
            "Inform, maintain, and update Claude configurations, knowledge sources, and instructions",
        },
      ],
    },
    {
      id: "governance-risk-responsible-use",
      code: "6",
      title: "Governance, Risk, and Responsible Use",
      weightPercent: 15,
      objectives: [
        {
          id: "governance-use-case-fit",
          statement: "Identify appropriate and inappropriate use cases",
        },
        {
          id: "governance-data-privacy",
          statement:
            "Apply data sensitivity, regulatory, and privacy considerations",
        },
        {
          id: "governance-policies",
          statement:
            "Follow organizational AI policies and governance standards",
        },
        {
          id: "governance-ethics",
          statement: "Understand the ethical implications of AI usage",
        },
      ],
    },
    {
      id: "troubleshooting-optimization",
      code: "7",
      title: "Troubleshooting and Optimization",
      weightPercent: 10,
      objectives: [
        {
          id: "troubleshoot-diagnose",
          statement:
            "Identify, diagnose, and resolve issues with underperforming prompts or poor outputs",
        },
        {
          id: "troubleshoot-adjust",
          statement: "Adjust approach based on feedback and results",
        },
        {
          id: "optimize-workflows",
          statement: "Optimize workflows for efficiency and effectiveness",
        },
      ],
    },
  ],
  verification: {
    status: "verified",
    checkedAt: "2026-10-26",
    note: "Read the public PDF linked from the official Partner Academy certifications page. Version 1.0 is effective July 2026 and covers the learner's planned exam date before 2026-11-14. The 2026-11-17 / 2026-12-07 revision is tracked separately and is not part of this version.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-certification-faq",
      "anthropic-partner-certifications",
    ],
  },
  contentStatus: "published",
});
