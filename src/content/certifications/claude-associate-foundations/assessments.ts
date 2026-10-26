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
