import { assessmentDefinitionSchema, type AssessmentDefinition } from "../../../domain";

/**
 * Design sample only. The question belongs to the Context Window sample
 * lesson, which is deliberately unmapped to an official CCAO-F objective.
 * This definition proves the assessment core against real content; it is not
 * a practice bank or a mock exam.
 */
export const contextWindowSampleAssessment: AssessmentDefinition = assessmentDefinitionSchema.parse({
  id: "context-window-sample",
  title: "Context Window sample check",
  description:
    "One English scenario question from the Context Window sample lesson, with an explanation for every option after submission. This is original practice material, not an official CCAO-F item, and it is not mapped to an official objective.",
  questionIds: ["context-window-root-cause"],
  policy: {
    scoring: "all-or-nothing",
    allowAnswerChangesBeforeSubmit: true,
  },
});

/**
 * Reviewed Domain 2 practice set. It is exam-mapped in the question bank, but
 * it is still original practice material rather than an official CCAO-F form.
 */
export const domainTwoOutputValidationAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "domain-2-output-validation-set",
    title: "Domain 2: Output Evaluation and Validation",
    description:
      "Fourteen reviewed English practice items covering accuracy and completeness, hallucination/inconsistency and bias detection, source-based fact-checking, human-review escalation, audience editing, and output-format selection. Explanations for every option are in Vietnamese after submission. These are original practice items, not official CCAO-F questions, and this is not a mock exam.",
    questionIds: [
      "output-accuracy-review-plan",
      "output-accurate-but-incomplete",
      "output-fabricated-policy-detail",
      "output-hallucination-signals",
      "output-fact-check-retention",
      "output-reduce-unsupported-claims",
      "output-human-review-high-stakes",
      "output-human-review-triggers",
      "output-edit-preserve-facts",
      "output-compare-customer-faq-drafts",
      "output-format-fit-deliverable",
      "output-format-decisions",
      "output-bias-one-sided-framing",
      "output-bias-unequal-standards",
    ],
    policy: {
      scoring: "all-or-nothing",
      allowAnswerChangesBeforeSubmit: true,
    },
  });

const practicePolicy = {
  scoring: "all-or-nothing" as const,
  allowAnswerChangesBeforeSubmit: true,
};

export const domainOnePromptingAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "domain-1-prompting-set",
    title: "Domain 1: Prompting and Task Execution",
    description:
      "Two reviewed English practice items on writing specific prompts and decomposing complex requests. Explanations for every option are in Vietnamese after submission. Original practice material, not official CCAO-F content.",
    questionIds: ["prompting-specific-brief", "prompting-decompose-steps"],
    policy: practicePolicy,
  });

export const domainThreeContextAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "domain-3-context-set",
    title: "Domain 3: Context and Memory Management",
    description:
      "Two reviewed English practice items on summarizing and restarting long conversations and keeping context high-signal. Explanations for every option are in Vietnamese after submission. Original practice material, not official CCAO-F content.",
    questionIds: ["context-summarize-and-restart", "context-high-signal-practices"],
    policy: practicePolicy,
  });

export const domainFourWorkflowAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "domain-4-workflow-set",
    title: "Domain 4: Workflow Integration and Solution Design",
    description:
      "Two reviewed English practice items on requirements analysis and responsible workflow integration. Explanations for every option are in Vietnamese after submission. Original practice material, not official CCAO-F content.",
    questionIds: ["workflow-requirements-extraction", "workflow-integration-checkpoints"],
    policy: practicePolicy,
  });

export const domainSixGovernanceAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "domain-6-governance-set",
    title: "Domain 6: Governance, Risk, and Responsible Use",
    description:
      "Two reviewed English practice items on human oversight and safeguards for a customer-facing assistant. Explanations for every option are in Vietnamese after submission. These teach review principles, not legal advice. Original practice material, not official CCAO-F content.",
    questionIds: ["governance-human-oversight", "governance-customer-assistant-safeguards"],
    policy: practicePolicy,
  });

export const domainSevenTroubleshootingAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "domain-7-troubleshooting-set",
    title: "Domain 7: Troubleshooting and Optimization",
    description:
      "Two reviewed English practice items on diagnosing weak prompts and using feedback to improve them. Explanations for every option are in Vietnamese after submission. Original practice material, not official CCAO-F content.",
    questionIds: ["troubleshoot-diagnose-prompt", "troubleshoot-feedback-loop"],
    policy: practicePolicy,
  });

/**
 * Mixed set across every domain that currently has reviewed items. It is not a
 * 60-item mock exam and does not claim to represent the official item mix.
 */
export const mixedFoundationsAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "mixed-foundations-set",
    title: "Mixed foundations set",
    description:
      "All twenty-four reviewed practice items, mixed across the six domains that currently have source-grounded content. Explanations are in Vietnamese after submission. This is a mixed practice set, not a mock exam and not a coverage claim for the seven official domains.",
    questionIds: [
      "prompting-specific-brief",
      "prompting-decompose-steps",
      "output-accuracy-review-plan",
      "output-accurate-but-incomplete",
      "output-fabricated-policy-detail",
      "output-hallucination-signals",
      "output-fact-check-retention",
      "output-reduce-unsupported-claims",
      "output-human-review-high-stakes",
      "output-human-review-triggers",
      "output-edit-preserve-facts",
      "output-compare-customer-faq-drafts",
      "output-format-fit-deliverable",
      "output-format-decisions",
      "output-bias-one-sided-framing",
      "output-bias-unequal-standards",
      "context-summarize-and-restart",
      "context-high-signal-practices",
      "workflow-requirements-extraction",
      "workflow-integration-checkpoints",
      "governance-human-oversight",
      "governance-customer-assistant-safeguards",
      "troubleshoot-diagnose-prompt",
      "troubleshoot-feedback-loop",
    ],
    policy: practicePolicy,
  });
