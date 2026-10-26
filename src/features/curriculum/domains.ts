export type DomainPlaceholder = {
  id: string;
  number: string;
  title: string;
  status: "unverified";
};

/**
 * Provisional domain titles carried over from the scaffold. They are NOT
 * confirmed exam domains: the official guide still has to be read before any
 * weight, objective, or coverage claim is made.
 */
export const provisionalDomains: DomainPlaceholder[] = [
  { id: "output-evaluation", number: "01", title: "Output Evaluation and Validation", status: "unverified" },
  { id: "workflow-design", number: "02", title: "Workflow Integration and Solution Design", status: "unverified" },
  { id: "governance", number: "03", title: "Governance, Risk, and Responsible Use", status: "unverified" },
  { id: "prompting", number: "04", title: "Prompting and Task Execution", status: "unverified" },
];

export const curriculumDisclaimer =
  "Domain names and weights are placeholders. They stay marked unverified until the current official exam guide is reviewed.";
