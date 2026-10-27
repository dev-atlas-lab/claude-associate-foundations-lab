import { assessmentDefinitionSchema, type AssessmentDefinition } from "../../../domain";
import { reviewedQuestionBank } from "./question-bank";

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
      "Six reviewed English practice items on writing specific prompts, decomposing complex requests, iterating with evidence, and adapting prompting strategies to analysis, research, drafting, and brainstorming tasks. Explanations for every option are in Vietnamese after submission. Original practice material, not official CCAO-F content.",
    questionIds: [
      "prompting-specific-brief",
      "prompting-decompose-steps",
      "prompting-iterate-evidence",
      "prompting-iterate-systematic",
      "prompting-analysis-task-strategy",
      "prompting-adapt-task-types",
    ],
    policy: practicePolicy,
  });

export const domainThreeContextAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "domain-3-context-set",
    title: "Domain 3: Product and Model Selection",
    description:
      "Eight reviewed English practice items on selecting Projects, research, chat, and artifacts; choosing a model family and matching it to cost, speed, and quality; and managing context. Explanations for every option are in Vietnamese after submission. Original practice material, not official CCAO-F content.",
    questionIds: [
      "context-summarize-and-restart",
      "context-high-signal-practices",
      "product-feature-recurring-report",
      "product-feature-fit-choices",
      "model-family-speed-cost",
      "model-family-tradeoffs",
      "model-task-fit-complex",
      "model-task-fit-practices",
    ],
    policy: practicePolicy,
  });

export const domainFourWorkflowAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "domain-4-workflow-set",
    title: "Domain 4: Workflow Integration and Solution Design",
    description:
      "Eight reviewed English practice items on requirements analysis, research and planning, solution design and iteration, responsible workflow integration, and stakeholder communication. Explanations for every option are in Vietnamese after submission. Original practice material, not official CCAO-F content.",
    questionIds: [
      "workflow-requirements-extraction",
      "workflow-research-current-scan",
      "workflow-research-planning-practices",
      "workflow-solution-options",
      "workflow-solution-iteration",
      "workflow-integration-checkpoints",
      "workflow-stakeholder-brief",
      "workflow-stakeholder-evidence",
    ],
    policy: practicePolicy,
  });

export const domainFiveConfigurationAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "domain-5-configuration-set",
    title: "Domain 5: Configuration and Knowledge Management",
    description:
      "Eight reviewed English practice items on configuring Project knowledge and instructions, managing connectors and permissions, writing effective system-level instructions, and maintaining configurations over time. Explanations for every option are in Vietnamese after submission. Original practice material, not official CCAO-F content.",
    questionIds: [
      "config-project-brief-setup",
      "config-project-context-scope",
      "config-connector-rollout",
      "config-connector-permission-model",
      "config-system-instruction-quality",
      "config-system-instruction-components",
      "config-knowledge-refresh",
      "config-maintenance-cadence",
    ],
    policy: practicePolicy,
  });

export const domainSixGovernanceAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "domain-6-governance-set",
    title: "Domain 6: Governance, Risk, and Responsible Use",
    description:
      "Six reviewed English practice items on appropriate use cases, data privacy, organizational policy, high-risk review, and human oversight. Explanations for every option are in Vietnamese after submission. These teach review principles, not legal advice. Original practice material, not official CCAO-F content.",
    questionIds: [
      "governance-human-oversight",
      "governance-customer-assistant-safeguards",
      "governance-privacy-confidential-upload",
      "governance-privacy-controls",
      "governance-policy-hiring-screening",
      "governance-policy-operations",
    ],
    policy: practicePolicy,
  });

export const domainSevenTroubleshootingAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "domain-7-troubleshooting-set",
    title: "Domain 7: Troubleshooting and Optimization",
    description:
      "Four reviewed English practice items on diagnosing weak prompts, using feedback to improve them, establishing a baseline, and optimizing quality, latency, and cost. Explanations for every option are in Vietnamese after submission. Original practice material, not official CCAO-F content.",
    questionIds: [
      "troubleshoot-diagnose-prompt",
      "troubleshoot-feedback-loop",
      "optimize-workflow-baseline",
      "optimize-workflow-practices",
    ],
    policy: practicePolicy,
  });

/**
 * Mixed set across every official domain. It is not a 60-item mock exam and
 * does not claim to represent the official item mix. The question list is
 * derived from the reviewed bank so it cannot drift out of sync with the
 * registry.
 */
export const mixedFoundationsAssessment: AssessmentDefinition =
  assessmentDefinitionSchema.parse({
    id: "mixed-foundations-set",
    title: "Mixed foundations set",
    description: `All ${reviewedQuestionBank.length} reviewed practice items, mixed across all seven domains that currently have source-grounded content. Explanations are in Vietnamese after submission. This is a mixed practice set, not a mock exam and not a coverage claim that any domain is exhausted.`,
    questionIds: reviewedQuestionBank.map((entry) => entry.question.id),
    policy: practicePolicy,
  });
