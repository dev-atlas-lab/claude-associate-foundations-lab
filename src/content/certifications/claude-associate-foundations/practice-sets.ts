import type { PracticeSet } from "../../../domain";

/**
 * Practice entry points. Each set is validated against the reviewed bank: every
 * question must be a bank item, and the declared domains must exactly match the
 * domains those questions are mapped to.
 */
export const practiceSets: PracticeSet[] = [
  {
    assessmentId: "domain-1-prompting-set",
    domainIds: ["prompting-task-execution"],
  },
  {
    assessmentId: "domain-2-output-validation-set",
    domainIds: ["output-evaluation-validation"],
  },
  {
    assessmentId: "domain-3-context-set",
    domainIds: ["product-model-selection"],
  },
  {
    assessmentId: "domain-4-workflow-set",
    domainIds: ["workflow-integration-solution-design"],
  },
  {
    assessmentId: "domain-5-configuration-set",
    domainIds: ["configuration-knowledge-management"],
  },
  {
    assessmentId: "domain-6-governance-set",
    domainIds: ["governance-risk-responsible-use"],
  },
  {
    assessmentId: "domain-7-troubleshooting-set",
    domainIds: ["troubleshooting-optimization"],
  },
  {
    assessmentId: "mixed-foundations-set",
    domainIds: [
      "prompting-task-execution",
      "output-evaluation-validation",
      "product-model-selection",
      "workflow-integration-solution-design",
      "configuration-knowledge-management",
      "governance-risk-responsible-use",
      "troubleshooting-optimization",
    ],
  },
];
