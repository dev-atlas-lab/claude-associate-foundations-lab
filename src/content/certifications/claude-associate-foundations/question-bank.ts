import {
  questionSchema,
  type Question,
  type QuestionBankEntry,
} from "../../../domain";
import { reviewedEntry } from "./bank-helpers";
import { coverageDepthQuestionBank } from "./question-bank-depth";
import { domainFiveQuestionBank } from "./question-bank-domain5";
import {
  productSelectionExpansionQuestionBank,
  promptingExpansionQuestionBank,
} from "./question-bank-expansion-a";
import {
  governanceExpansionQuestionBank,
  optimizationExpansionQuestionBank,
  workflowExpansionQuestionBank,
} from "./question-bank-expansion-b";
import { expansionCQuestionBank } from "./question-bank-expansion-c";
import { expansionDQuestionBank } from "./question-bank-expansion-d";

/**
 * Reviewed Domain 2 bank: Output Evaluation and Validation.
 *
 * Scope: all six objectives from the verified CCAO-F v1.0 blueprint. The bank
 * covers accuracy/completeness review, hallucination/inconsistency and bias
 * detection, source-based fact-checking, human-review escalation, audience
 * editing/comparison, and output-format selection. Bias is assessed at the
 * framing/equal-treatment level supported by Claude's Constitution; it is not
 * a complete fairness audit or a claim about model-level evaluation results.
 *
 * These are original practice items. They are not copied from the official
 * exam guide, an exam dump, or any third-party question bank.
 */

const accuracyReviewPlan: Question = questionSchema.parse({
  id: "output-accuracy-review-plan",
  type: "single-choice",
  stem: "Claude has produced a polished competitor analysis with a table of market-share figures and a list of product risks. You have the source reports. Which review plan best evaluates the analysis for accuracy and completeness?",
  choices: [
    {
      id: "format-only",
      text: "Check that the table is well formatted and the tone matches the audience.",
      explanation:
        "Incorrect: Formatting and tone do not verify whether figures or claims are correct; this only validates presentation.",
    },
    {
      id: "verify-and-check-sections",
      text: "Verify each figure and material claim against the source reports, then check the analysis against the requested sections, risks, and edge cases.",
      explanation:
        "Correct: Accuracy requires cross-referencing each claim against the source; completeness requires verifying against requested sections, risks, and edge cases.",
    },
    {
      id: "make-longer",
      text: "Ask Claude to expand the analysis until it is at least ten pages long.",
      explanation:
        "Incorrect: Length does not ensure accuracy or completeness; expanding text can introduce errors and ungrounded content.",
    },
    {
      id: "second-output",
      text: "Generate a second Claude response and keep the one with more citations.",
      explanation:
        "Incorrect: A second output can reveal discrepancies, but more citations does not imply citations are accurate or fully cover requirements.",
    },
  ],
  correctChoiceIds: ["verify-and-check-sections"],
  correctExplanation:
    "Evaluate accuracy by checking each figure and material claim against authoritative sources; evaluate completeness using a checklist of requested sections, risks, and edge cases. Formatting, length, and citation count cannot substitute for ground-truth verification.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-reduce-hallucinations-doc"],
});

const accurateButIncomplete: Question = questionSchema.parse({
  id: "output-accurate-but-incomplete",
  type: "single-choice",
  stem: "A project manager asks Claude to summarize five stakeholder interviews into a one-page requirements brief. The draft matches the notes factually, but it omits the budget cap and go-live date that three stakeholders called non-negotiable. How should you classify and handle the draft?",
  choices: [
    {
      id: "publish-as-complete",
      text: "Accurate and complete; publish it because no statement contradicts the notes.",
      explanation:
        "Incorrect: The absence of contradictions only satisfies accuracy; omitting non-negotiable constraints is still a completeness defect.",
    },
    {
      id: "accurate-incomplete",
      text: "Accurate but incomplete; add the missing constraints, then check the brief against the required sections before publishing.",
      explanation:
        "Correct: Existing content aligns with notes, but critical constraints are absent. Supplement the missing information and audit against requirements checklist.",
    },
    {
      id: "call-hallucination",
      text: "Hallucinated; rewrite it because it left out information.",
      explanation:
        "Incorrect: Omission is not hallucination. Hallucination involves ungrounded or contradictory claims, not missing coverage.",
    },
    {
      id: "call-bias",
      text: "Biased; remove the stakeholder quotes because they may favor one group.",
      explanation:
        "Incorrect: There is no evidence of bias; deleting quotes risks discarding essential context.",
    },
  ],
  correctChoiceIds: ["accurate-incomplete"],
  correctExplanation:
    "The draft factually matches the notes but omits two stakeholder-mandated constraints. It is accurate but incomplete: add the missing information and verify against requirements, rather than labeling it hallucination or bias without evidence.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-reduce-hallucinations-doc"],
});

const fabricatedPolicyDetail: Question = questionSchema.parse({
  id: "output-fabricated-policy-detail",
  type: "single-choice",
  stem: "Claude answers a question about a company's travel policy: \"Section 4.2 allows business-class travel for any flight longer than four hours.\" The supplied policy has no Section 4.2 and says only that premium economy may be approved for flights over six hours. What is the most accurate description of the problem?",
  choices: [
    {
      id: "incomplete-only",
      text: "The answer is incomplete but supported by the policy.",
      explanation:
        "Incorrect: This is not merely missing information; the response invents a non-existent section and policy rule that contradicts the source.",
    },
    {
      id: "hallucination",
      text: "The answer fabricates a policy detail that contradicts the supplied source, so it is a hallucination and must be corrected.",
      explanation:
        "Correct: The response invents a policy detail that contradicts the provided source, constituting a hallucination that must be corrected.",
    },
    {
      id: "bias",
      text: "The answer is biased toward business-class travelers.",
      explanation:
        "Incorrect: There is no evidence of bias; the primary defect is an unsupported factual claim.",
    },
    {
      id: "specific-is-enough",
      text: "The answer is acceptable because the section number makes it sound specific.",
      explanation:
        "Incorrect: Specificity does not equal accuracy. A fabricated section number remains erroneous information.",
    },
  ],
  correctChoiceIds: ["hallucination"],
  correctExplanation:
    "The output invents Section 4.2 and a rule absent from the policy, contradicting the source's premium economy conditions. This is a hallucination: revise according to the actual source and verify before distribution.",
  sourceIds: ["anthropic-reduce-hallucinations-doc"],
});

const hallucinationSignals: Question = questionSchema.parse({
  id: "output-hallucination-signals",
  type: "multiple-response",
  stem: "You are reviewing Claude's research brief against the source documents you supplied. Which three findings are evidence of hallucination or inconsistency, rather than merely a style or completeness issue?",
  choices: [
    {
      id: "missing-stat",
      text: "A cited statistic does not appear anywhere in the supplied documents.",
      explanation:
        "Correct: Citing a statistic unsupported by the provided source documents is a clear hallucination signal.",
    },
    {
      id: "tone",
      text: "The brief uses a formal tone that differs from the requested conversational style.",
      explanation:
        "Incorrect: Tone mismatch is a stylistic issue, not evidence of hallucination or inconsistency.",
    },
    {
      id: "conflicting-dates",
      text: "Two sections give different dates for the same policy change.",
      explanation:
        "Correct: Conflicting dates across sections indicate internal inconsistency.",
    },
    {
      id: "wrong-year",
      text: "A report is described as published in 2024, but the source says 2022.",
      explanation:
        "Correct: Stating a publication year that conflicts directly with source documents is a factual defect / hallucination.",
    },
    {
      id: "omitted-example",
      text: "The brief leaves out a minor example that the request did not require.",
      explanation:
        "Incorrect: Omitting an optional, non-required example is a minor completeness variation, not fabrication.",
    },
    {
      id: "uncertainty",
      text: "The brief says it does not have enough information to answer one sub-question.",
      explanation:
        "Incorrect: Stating that information is insufficient to answer is appropriate model behavior, not a hallucination.",
    },
  ],
  correctChoiceIds: ["missing-stat", "conflicting-dates", "wrong-year"],
  correctExplanation:
    "All three indicate claims that do not align with or contradict the source: nonexistent statistics, conflicting dates, and incorrect years. Tone variations, omitted optional examples, or candid expressions of uncertainty are not hallucinations.",
  sourceIds: ["anthropic-reduce-hallucinations-doc"],
});

const factCheckRetention: Question = questionSchema.parse({
  id: "output-fact-check-retention",
  type: "single-choice",
  stem: "A draft FAQ says, \"The retention period is 90 days.\" The source is a 40-page policy document. Which fact-checking step is most reliable?",
  choices: [
    {
      id: "ask-claude",
      text: "Ask Claude whether the statement is true and accept a confident yes.",
      explanation:
        "Incorrect: Self-verification can repeat errors due to sycophancy; ground truth verification is required.",
    },
    {
      id: "quote-source",
      text: "Find the retention section in the policy, quote the exact passage, and confirm that it states 90 days; if no passage supports it, remove or revise the claim.",
      explanation:
        "Correct: Locate the specific retention section, extract the exact passage, confirm the 90-day figure, and retract or revise if ungrounded.",
    },
    {
      id: "format-check",
      text: "Check that the FAQ is shorter than the policy and uses consistent formatting.",
      explanation:
        "Incorrect: Document length and formatting uniformity do not validate factual content.",
    },
    {
      id: "majority-vote",
      text: "Run the same prompt three times and keep the answer that appears most often.",
      explanation:
        "Incorrect: Repeated sampling may reveal variance, but popular consensus does not replace direct source verification.",
    },
  ],
  correctChoiceIds: ["quote-source"],
  correctExplanation:
    "Reliable fact-checking requires pinpointing the exact passage in the source document, extracting verbatim text, and validating the claim. If supporting evidence is missing, retract or revise; confidence and repetition do not constitute proof.",
  sourceIds: ["anthropic-reduce-hallucinations-doc"],
});

const reduceUnsupportedClaims: Question = questionSchema.parse({
  id: "output-reduce-unsupported-claims",
  type: "multiple-response",
  stem: "You are using Claude to draft a briefing from a set of internal documents. Which three practices most directly reduce the risk of unsupported claims?",
  choices: [
    {
      id: "restrict-sources",
      text: "Tell Claude to use only the supplied documents and to say when they do not contain enough information.",
      explanation:
        "Correct: Restricting sources and allowing the model to acknowledge insufficient information drastically curbs hallucinated claims.",
    },
    {
      id: "quote-first",
      text: "Ask Claude to extract exact supporting quotes before drafting, then remove claims without a supporting quote.",
      explanation:
        "Correct: Requiring supporting quotes before synthesis anchors the response and creates an auditable verification trail.",
    },
    {
      id: "increase-length",
      text: "Increase the response length so that every topic gets more coverage.",
      explanation:
        "Incorrect: Increasing response length frequently encourages filler and ungrounded assertions.",
    },
    {
      id: "verify-and-retract",
      text: "Ask Claude to verify each claim against a cited source and retract claims it cannot support.",
      explanation:
        "Correct: A dedicated verification and retraction step directly eliminates ungrounded statements.",
    },
    {
      id: "accept-fluency",
      text: "Accept fluent, specific answers because they are more likely to be accurate.",
      explanation:
        "Incorrect: Fluency and articulateness do not guarantee factual validity.",
    },
    {
      id: "warmer-tone",
      text: "Use a warmer, more confident tone in the prompt.",
      explanation:
        "Incorrect: Conversational tone has no bearing on factual groundedness.",
    },
  ],
  correctChoiceIds: ["restrict-sources", "quote-first", "verify-and-retract"],
  correctExplanation:
    "Three proven practices are source restriction, quote-first grounding, and explicit verification/retraction steps. These establish verifiable evidence; length, fluency, and tone cannot substitute for source grounding.",
  sourceIds: ["anthropic-reduce-hallucinations-doc"],
});

const highStakesDischargeInstructions: Question = questionSchema.parse({
  id: "output-human-review-high-stakes",
  type: "single-choice",
  stem: "A clinic asks Claude to draft patient discharge instructions that include medication doses and warning signs. The draft is complete, cites the clinic's formulary, and reads clearly. What is the most appropriate next step?",
  choices: [
    {
      id: "publish-because-complete",
      text: "Publish it immediately because it is complete, clear, and cites a source.",
      explanation:
        "Incorrect: Completeness and citations do not replace domain-expert confirmation for high-stakes healthcare instructions.",
    },
    {
      id: "clinician-approval",
      text: "Have a qualified clinician verify the doses and warning signs against the formulary and approve the instructions before use.",
      explanation:
        "Correct: Medical dosing instructions involve high patient-safety risks; qualified clinicians must verify formulary alignment and approve before publication.",
    },
    {
      id: "self-consistency",
      text: "Ask Claude to answer again and publish if the two answers agree.",
      explanation:
        "Incorrect: Two concordant responses can still replicate the same factual error; self-consistency cannot replace clinical sign-off.",
    },
    {
      id: "disclaimer",
      text: "Add a disclaimer that the instructions may be inaccurate, then publish.",
      explanation:
        "Incorrect: Disclaimers do not mitigate the acute physical risks of erroneous medication dosages.",
    },
  ],
  correctChoiceIds: ["clinician-approval"],
  correctExplanation:
    "In high-stakes domains such as clinical discharge instructions, medication dosages and warning signs carry life-safety impact. Anthropic mandates qualified human review and verification against source formularies prior to deployment.",
  sourceIds: [
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
  ],
});

const humanReviewTriggers: Question = questionSchema.parse({
  id: "output-human-review-triggers",
  type: "multiple-response",
  stem: "Which three situations most clearly require human review or additional verification before Claude's output is used?",
  choices: [
    {
      id: "contract-payment",
      text: "A legal team receives a summary of a contract clause that determines whether a payment obligation applies.",
      explanation:
        "Correct: Summarizing payment obligation clauses carries substantial legal and financial exposure, requiring legal counsel review.",
    },
    {
      id: "lunch-themes",
      text: "A manager asks for five low-risk themes for an optional team lunch.",
      explanation:
        "Incorrect: Brainstorming optional team lunch themes is low-risk and easily reversible.",
    },
    {
      id: "revenue-conflict",
      text: "A finance analyst receives a revenue figure that conflicts with two source systems.",
      explanation:
        "Correct: A revenue metric conflicting across source systems requires additional verification before reliance.",
    },
    {
      id: "variable-names",
      text: "An engineer asks for three alternative variable names for a private prototype.",
      explanation:
        "Incorrect: Generating prototype variable names is an internal, low-risk technical decision.",
    },
    {
      id: "obsolete-safety-notice",
      text: "A product team plans to publish a safety notice generated from an obsolete regulation.",
      explanation:
        "Correct: Publishing public safety notices based on outdated regulations demands immediate verification and specialist approval.",
    },
    {
      id: "private-meeting-note",
      text: "A colleague asks for a one-sentence recap of a private meeting that the team already attended.",
      explanation:
        "Incorrect: Recapping an already-attended team meeting is low-risk internal correspondence.",
    },
  ],
  correctChoiceIds: ["contract-payment", "revenue-conflict", "obsolete-safety-notice"],
  correctExplanation:
    "High-consequence financial obligations, conflicting source figures, and safety notices referencing outdated regulations clearly trigger human review. Low-risk, internal, or easily reversible brainstorming requests do not require escalation.",
  sourceIds: [
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
  ],
});

const executiveIncidentSummary: Question = questionSchema.parse({
  id: "output-edit-preserve-facts",
  type: "single-choice",
  stem: "Claude's incident summary is factually accurate for engineers but too technical for the executive committee. You need an executive version without changing the facts. Which editing approach is best?",
  choices: [
    {
      id: "generalize-causes",
      text: "Replace specific causes and timestamps with confident general statements.",
      explanation:
        "Incorrect: Generalizing removes essential root cause context and may introduce ungrounded speculation.",
    },
    {
      id: "preserve-and-recheck",
      text: "Preserve the facts, numbers, and stated uncertainties; rewrite structure and terms for executives; then compare the revision with the original and source for factual drift.",
      explanation:
        "Correct: Preserve facts, figures, and uncertainties; adapt structure and vocabulary for executives; then verify against source documents for factual drift.",
    },
    {
      id: "add-more-detail",
      text: "Add more technical detail so executives can see the complexity.",
      explanation:
        "Incorrect: Piling on technical minutiae defeats the purpose of an executive summary.",
    },
    {
      id: "delete-caveats",
      text: "Shorten it by deleting the caveats and incident timeline.",
      explanation:
        "Incorrect: Removing caveats conceals critical operational uncertainties.",
    },
  ],
  correctChoiceIds: ["preserve-and-recheck"],
  correctExplanation:
    "Adapting for a target audience adjusts presentation without distorting underlying facts. Retain core metrics, timeline events, and uncertainties, tailor tone and structure for executives, and cross-reference with source material to catch factual drift.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-reduce-hallucinations-doc",
  ],
});

const compareCustomerFaqDrafts: Question = questionSchema.parse({
  id: "output-compare-customer-faq-drafts",
  type: "multiple-response",
  stem: "You have two Claude drafts of a customer-facing FAQ answer. Which three actions are the strongest way to compare and refine them for the intended audience?",
  choices: [
    {
      id: "check-source",
      text: "Check each draft against the source policy and flag claims that the source does not support.",
      explanation:
        "Correct: Factual grounding against policy documents is a prerequisite before evaluating communication style.",
    },
    {
      id: "apply-audience-criteria",
      text: "Apply audience criteria such as plain language, required steps, and expected reading level to compare which draft serves the reader.",
      explanation:
        "Correct: Audience criteria (plain terminology, clarity of instructions, appropriate reading grade) measure reader usability.",
    },
    {
      id: "merge-and-recheck",
      text: "Preserve accurate content from both drafts, merge the stronger structure, and re-check the merged version for new claims or changed meaning.",
      explanation:
        "Correct: Merge accurate elements and audit the synthesized text against policy to prevent emergent factual drift.",
    },
    {
      id: "choose-longer",
      text: "Choose the longer draft because it includes more detail.",
      explanation:
        "Incorrect: Extra length does not ensure clarity or relevance for end users.",
    },
    {
      id: "choose-confident",
      text: "Pick the draft with more confident language because confidence improves clarity.",
      explanation:
        "Incorrect: Confident phrasing can mask unsupported claims or gloss over important nuances.",
    },
    {
      id: "average-sentences",
      text: "Average the two drafts sentence by sentence to create a balanced version.",
      explanation:
        "Incorrect: Mechanically averaging sentences produces incoherent phrasing and out-of-context claims.",
    },
  ],
  correctChoiceIds: ["check-source", "apply-audience-criteria", "merge-and-recheck"],
  correctExplanation:
    "Sound draft comparison begins with source grounding, evaluates readability and task completion against target audience criteria, merges the strongest elements, and verifies against factual drift.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-reduce-hallucinations-doc",
  ],
});

const multiDeliverableFormat: Question = questionSchema.parse({
  id: "output-format-fit-deliverable",
  type: "single-choice",
  stem: "An operations team needs a project plan that a spreadsheet can consume, a one-page brief for executives, and a reusable document the team will edit for months. Which output strategy best fits all three needs?",
  choices: [
    {
      id: "one-long-narrative",
      text: "Return one long narrative with the plan embedded as bullet points.",
      explanation:
        "Incorrect: A long narrative does not satisfy spreadsheet ingestion, executive brevity, or modular editing needs.",
    },
    {
      id: "fit-formats-to-use",
      text: "Produce structured data (for example, JSON or a table) for the spreadsheet, a concise prose brief for executives, and a substantial editable document or artifact for the working plan.",
      explanation:
        "Correct: Provide structured data (e.g. JSON/tables) for spreadsheet parsing, a concise executive summary, and an editable document/artifact for project management.",
    },
    {
      id: "all-json",
      text: "Put every deliverable in a single JSON object and ask executives to read the JSON.",
      explanation:
        "Incorrect: JSON is ideal for automated pipelines but provides a poor reading experience for executive briefings.",
    },
    {
      id: "chat-only",
      text: "Use only a chat message because artifacts cannot be edited.",
      explanation:
        "Incorrect: Chat messages are poorly suited for long, evolving documents that require multi-month maintenance.",
    },
  ],
  correctChoiceIds: ["fit-formats-to-use"],
  correctExplanation:
    "Match deliverable formats to their operational consumption: structured schemas for programmatic parsing, concise text for executive reading, and self-contained artifacts for long-term collaborative editing.",
  sourceIds: [
    "anthropic-structured-outputs-doc",
    "anthropic-artifacts-doc",
    "anthropic-prompting-best-practices",
  ],
});

const outputFormatDecisions: Question = questionSchema.parse({
  id: "output-format-decisions",
  type: "multiple-response",
  stem: "Which three output-format decisions fit the described deliverables?",
  choices: [
    {
      id: "invoice-json",
      text: "Use a structured JSON schema for invoice fields that a downstream accounting system will parse.",
      explanation:
        "Correct: Structured JSON schema guarantees predictable, valid fields for automated accounting parser ingestion.",
    },
    {
      id: "status-inline",
      text: "Use a short inline answer in the conversation for a one-sentence status update.",
      explanation:
        "Correct: Brief conversational answers directly in chat are ideal for lightweight, non-artifact updates.",
    },
    {
      id: "charter-artifact",
      text: "Use an artifact or editable document for a long, self-contained project charter that the team will revise over time.",
      explanation:
        "Correct: Artifacts are designed for substantial, self-contained, modifiable deliverables such as project charters.",
    },
    {
      id: "townhall-json",
      text: "Use a JSON object for a narrative memo that will be read aloud at a town hall.",
      explanation:
        "Incorrect: Town hall speeches require spoken prose; JSON is intended for programmatic processing.",
    },
    {
      id: "tiny-artifact",
      text: "Create a separate artifact for a two-word confirmation so it is easy to find.",
      explanation:
        "Incorrect: Creating artifacts for two-word updates clutters workspace interfaces unnecessarily.",
    },
    {
      id: "report-in-chat",
      text: "Keep a thirty-page report entirely in the chat message so it stays with the conversation.",
      explanation:
        "Incorrect: Ingesting a 30-page document entirely into chat makes versioning, referencing, and editing cumbersome.",
    },
  ],
  correctChoiceIds: ["invoice-json", "status-inline", "charter-artifact"],
  correctExplanation:
    "Anthropic formatting guidelines match formats to user consumption: structured outputs for machine parsers, inline text for brief answers, and artifacts for substantial, standalone, reusable documents.",
  sourceIds: [
    "anthropic-structured-outputs-doc",
    "anthropic-artifacts-doc",
    "anthropic-prompting-best-practices",
  ],
});

const oneSidedHousingSummary: Question = questionSchema.parse({
  id: "output-bias-one-sided-framing",
  type: "single-choice",
  stem: "Claude summarizes a city housing policy. The summary quotes only supporters, calls opponents \"radical outsiders\", and omits an independent budget analysis that challenges the policy's cost estimates. Which finding best describes the main problem?",
  choices: [
    {
      id: "biased-framing",
      text: "The summary is biased in framing and evidence selection; it should represent relevant perspectives, use neutral language, and include the omitted analysis.",
      explanation:
        "Correct: The summary demonstrates biased framing and selective evidence by quoting only proponents, omitting budget counter-evidence, and using derogatory labels.",
    },
    {
      id: "hallucination",
      text: "It is a hallucination because the summary contains no direct quotes from opponents.",
      explanation:
        "Incorrect: Omitting opposing viewpoints is a framing and source-selection defect, not fabrication of facts.",
    },
    {
      id: "incomplete-only",
      text: "It is only incomplete; adding more supporters' quotes would fix it.",
      explanation:
        "Incorrect: Adding more proponent quotes does not remediate one-sided framing or loaded language.",
    },
    {
      id: "style-only",
      text: "It is a style issue; the loaded labels are acceptable if the summary is concise.",
      explanation:
        "Incorrect: Calling opponents 'radical outsiders' reflects partisan framing, not acceptable stylistic flair.",
    },
  ],
  correctChoiceIds: ["biased-framing"],
  correctExplanation:
    "Selecting only supportive arguments, omitting independent fiscal critique, and applying derogatory labels constitutes biased framing. Claude's Constitution mandates balanced, even-handed representation of multiple viewpoints and neutral language.",
  sourceIds: ["anthropic-claude-constitution"],
});

const unequalHiringStandards: Question = questionSchema.parse({
  id: "output-bias-unequal-standards",
  type: "multiple-response",
  stem: "A Claude-generated hiring recommendation reviews two candidates with similar interview evidence. Which three patterns are bias signals rather than ordinary style, completeness, or hallucination problems?",
  choices: [
    {
      id: "different-labels",
      text: "One candidate is called \"confident\" while the other is called \"abrasive\" for the same behavior.",
      explanation:
        "Correct: Applying contrasting descriptors ('confident' vs 'abrasive') to identical behavior indicates disparate evaluation standards.",
    },
    {
      id: "age-assumption",
      text: "The recommendation rejects a candidate because of their age and assumes they will resist new tools.",
      explanation:
        "Correct: Discounting a candidate based on age assumptions is stereotyping, not grounded interview evidence.",
    },
    {
      id: "selective-evidence",
      text: "It cites only evidence that supports the preferred candidate and omits contrary interview notes.",
      explanation:
        "Correct: Cherry-picking evidence to favor one candidate reflects confirmation bias in reasoning.",
    },
    {
      id: "too-short",
      text: "It is shorter than the requested two pages.",
      explanation:
        "Incorrect: Falling short of page targets is a formatting or completeness issue, not bias.",
    },
    {
      id: "formal-tone",
      text: "It uses a formal tone instead of a conversational one.",
      explanation:
        "Incorrect: A formal tone is a stylistic choice, not bias.",
    },
    {
      id: "unsupported-salary",
      text: "It states a salary figure that does not appear in the interview notes.",
      explanation:
        "Incorrect: Mentioning an unverified salary figure is a factual error / hallucination, not bias.",
    },
  ],
  correctChoiceIds: ["different-labels", "age-assumption", "selective-evidence"],
  correctExplanation:
    "Key bias indicators include unequal standards for identical actions, demographic prejudice (age), and selective evidence presentation. Length relates to completeness, tone to style, and fabricated numbers to hallucination.",
  sourceIds: [
    "anthropic-claude-constitution",
    "anthropic-reduce-hallucinations-doc",
  ],
});

export const domainTwoQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(accuracyReviewPlan, "output-evaluate-accuracy", [
    "anthropic-evaluation-docs",
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(accurateButIncomplete, "output-evaluate-accuracy", [
    "anthropic-evaluation-docs",
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(fabricatedPolicyDetail, "output-identify-hallucinations", [
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(hallucinationSignals, "output-identify-hallucinations", [
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(factCheckRetention, "output-fact-check", [
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(reduceUnsupportedClaims, "output-fact-check", [
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(highStakesDischargeInstructions, "output-human-review", [
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(humanReviewTriggers, "output-human-review", [
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(executiveIncidentSummary, "output-edit-adapt", [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(compareCustomerFaqDrafts, "output-edit-adapt", [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(multiDeliverableFormat, "output-format-selection", [
    "anthropic-structured-outputs-doc",
    "anthropic-artifacts-doc",
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(outputFormatDecisions, "output-format-selection", [
    "anthropic-structured-outputs-doc",
    "anthropic-artifacts-doc",
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(oneSidedHousingSummary, "output-identify-hallucinations", [
    "anthropic-claude-constitution",
  ]),
  reviewedEntry(unequalHiringStandards, "output-identify-hallucinations", [
    "anthropic-claude-constitution",
    "anthropic-reduce-hallucinations-doc",
  ]),
];

/* ── Domain 1: Prompting and Task Execution ────────────────────────────── */

const specificPromptBrief: Question = questionSchema.parse({
  id: "prompting-specific-brief",
  type: "single-choice",
  stem: "A marketing manager asks Claude to \"write a launch email.\" The first draft is generic and ignores the product's pricing and audience. Which revision is most likely to produce a useful draft?",
  choices: [
    {
      id: "add-context-and-format",
      text: "State the goal, audience, key product facts, pricing constraints, desired tone, and required call to action; include a short example if the format matters.",
      explanation:
        "Correct: An effective prompt specifies goals, target audience, core facts, constraints, tone, format, and few-shot exemplars.",
    },
    {
      id: "ask-harder",
      text: "Add the instruction \"try harder and be more creative.\"",
      explanation:
        "Incorrect: Vague encouragement provides no missing business context or target constraints.",
    },
    {
      id: "raise-temperature",
      text: "Raise the temperature so the draft varies more.",
      explanation:
        "Incorrect: Adjusting temperature alters sampling randomness but cannot supply missing facts or boundaries.",
    },
    {
      id: "more-adjectives",
      text: "Add more adjectives and emojis to make the email energetic.",
      explanation:
        "Incorrect: Superficial stylistic decoration does not resolve missing pricing or audience requirements.",
    },
  ],
  correctChoiceIds: ["add-context-and-format"],
  correctExplanation:
    "High-performing business prompts define goals, audience, core facts, operational constraints, output formats, and acceptance criteria. Exemplars reliably communicate structure without relying on ambiguous adjectives.",
  sourceIds: ["anthropic-prompting-best-practices"],
});

const decomposeComplexRequest: Question = questionSchema.parse({
  id: "prompting-decompose-steps",
  type: "multiple-response",
  stem: "Which three techniques best decompose a complex request into manageable steps?",
  choices: [
    {
      id: "outline-first",
      text: "Ask for an outline or plan first, review it, then draft the sections.",
      explanation:
        "Correct: Dividing tasks into planning and execution stages validates direction prior to full drafting.",
    },
    {
      id: "intermediate-artifacts",
      text: "Define intermediate artifacts and acceptance criteria for each step.",
      explanation:
        "Correct: Defining intermediate deliverables and acceptance criteria enables early error detection.",
    },
    {
      id: "separate-and-reconcile",
      text: "Run independent sub-tasks separately, then reconcile them with a final consistency check.",
      explanation:
        "Correct: Executing independent sub-tasks separately and reconciling results mitigates cognitive load and attention rot.",
    },
    {
      id: "one-paragraph",
      text: "Put every instruction into one long paragraph so nothing is lost.",
      explanation:
        "Incorrect: Packing all instructions into an undifferentiated block degrades clarity and complicates auditing.",
    },
    {
      id: "final-first",
      text: "Request the final answer first and skip planning.",
      explanation:
        "Incorrect: Bypassing planning stages increases the probability of structural flaws requiring complete rewrites.",
    },
    {
      id: "repeat-average",
      text: "Repeat the same request three times and average the answers.",
      explanation:
        "Incorrect: Repeating unguided prompts simply produces random variations without addressing workflow decomposition.",
    },
  ],
  correctChoiceIds: ["outline-first", "intermediate-artifacts", "separate-and-reconcile"],
  correctExplanation:
    "Effective task decomposition structures workflows into distinct stages with intermediate acceptance criteria, processing independent sections separately before final synthesis.",
  sourceIds: ["anthropic-prompting-best-practices", "anthropic-evaluation-docs"],
});

/* ── Domain 3: Product and Model Selection ─────────────────────────────── */

const summarizeAndRestartContext: Question = questionSchema.parse({
  id: "context-summarize-and-restart",
  type: "single-choice",
  stem: "A long support conversation is approaching the context limit. The team needs to keep the same case facts and decisions in later turns. Which approach best manages the limit?",
  choices: [
    {
      id: "summary-restart",
      text: "Summarize durable facts, constraints, and decisions, start a fresh context with that summary, and persist it for later turns.",
      explanation:
        "Correct: Distilling durable facts, decisions, and constraints into a compact summary and restarting fresh preserves essential signal while clearing context overhead.",
    },
    {
      id: "remove-system",
      text: "Keep every raw message and delete the system instructions to make room.",
      explanation:
        "Incorrect: Deleting system instructions compromises core behavioral guardrails while keeping noisy history.",
    },
    {
      id: "longer-replies",
      text: "Ask for longer replies so fewer turns are needed.",
      explanation:
        "Incorrect: Demanding longer outputs consumes token limits even faster.",
    },
    {
      id: "forget-without-summary",
      text: "Tell Claude to forget irrelevant details without recording what must be retained.",
      explanation:
        "Incorrect: Instructing the model to forget details without documenting what must be kept leads to catastrophic context loss.",
    },
  ],
  correctChoiceIds: ["summary-restart"],
  correctExplanation:
    "When approaching context limits, best practice is compaction: distill durable facts, constraints, and decisions into a structured summary, then launch a fresh context window seeded with that summary.",
  sourceIds: [
    "anthropic-context-windows-doc",
    "anthropic-compaction-doc",
    "anthropic-context-engineering-blog",
  ],
});

const highSignalContext: Question = questionSchema.parse({
  id: "context-high-signal-practices",
  type: "multiple-response",
  stem: "Which three practices keep a long working context high-signal?",
  choices: [
    {
      id: "retrieve-relevant",
      text: "Retrieve only the sections needed for the current step.",
      explanation:
        "Correct: Retrieving only current task-relevant excerpts minimizes token bloat and attention distraction.",
    },
    {
      id: "summarize-older",
      text: "Summarize older turns while keeping decisions and constraints.",
      explanation:
        "Correct: Periodically summarizing completed conversation turns retains key decisions while shedding obsolete tokens.",
    },
    {
      id: "remove-stale",
      text: "Remove stale tool output that no longer affects the task.",
      explanation:
        "Correct: Truncating obsolete intermediate tool outputs prevents confusion and conserves window budget.",
    },
    {
      id: "paste-everything",
      text: "Paste the entire knowledge base into every turn.",
      explanation:
        "Incorrect: Dumping entire knowledge bases into every turn dilutes model attention and inflates costs.",
    },
    {
      id: "duplicate-system",
      text: "Duplicate the system prompt after every message.",
      explanation:
        "Incorrect: Redundantly appending system prompts wastes tokens without conveying new instructional value.",
    },
    {
      id: "keep-drafts",
      text: "Keep every intermediate draft forever.",
      explanation:
        "Incorrect: Preserving superseded intermediate drafts clutters working memory.",
    },
  ],
  correctChoiceIds: ["retrieve-relevant", "summarize-older", "remove-stale"],
  correctExplanation:
    "Maintaining a high-signal context requires targeted retrieval, periodic compaction of past turns, and trimming obsolete tool outputs. Stuffing full documents or repeating instructions introduces noise.",
  sourceIds: [
    "anthropic-context-windows-doc",
    "anthropic-context-engineering-blog",
  ],
});

/* ── Domain 4: Workflow Integration and Solution Design ───────────────── */

const requirementsExtraction: Question = questionSchema.parse({
  id: "workflow-requirements-extraction",
  type: "single-choice",
  stem: "You are using Claude to turn stakeholder notes into requirements for a new approval workflow. Which approach best supports requirements analysis?",
  choices: [
    {
      id: "extract-and-validate",
      text: "Extract actors, goals, constraints, and open questions, then validate the list with stakeholders before designing the workflow.",
      explanation:
        "Correct: Extracting actors, goals, constraints, and open questions and validating them with stakeholders prevents building solutions on incorrect premises.",
    },
    {
      id: "design-immediately",
      text: "Ask for the final system design immediately and skip requirements.",
      explanation:
        "Incorrect: Rushing to technical design before validating requirements leads to building the wrong system.",
    },
    {
      id: "invent-gaps",
      text: "Ask Claude to invent missing requirements so the document looks complete.",
      explanation:
        "Incorrect: Hallucinating missing requirements creates compliance risks and leads to flawed decisions.",
    },
    {
      id: "loudest-stakeholder",
      text: "Summarize only the requests from the most senior stakeholder.",
      explanation:
        "Incorrect: Summarizing only the senior stakeholder ignores key operational constraints from other actors.",
    },
  ],
  correctChoiceIds: ["extract-and-validate"],
  correctExplanation:
    "Sound requirements analysis extracts explicit actors, goals, constraints, and ambiguities, validating them with stakeholders before designing solutions. This prevents ungrounded assumptions.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-prompting-best-practices"],
});

const workflowCheckpoints: Question = questionSchema.parse({
  id: "workflow-integration-checkpoints",
  type: "multiple-response",
  stem: "Which three practices are appropriate when integrating Claude into an existing business workflow?",
  choices: [
    {
      id: "map-process",
      text: "Map the current process and identify where Claude adds value.",
      explanation:
        "Correct: Mapping current business workflows identifies where AI adds measurable value without blind automation.",
    },
    {
      id: "human-checkpoints",
      text: "Add human checkpoints for high-impact or irreversible steps.",
      explanation:
        "Correct: Incorporating human checkpoints at irreversible or high-impact stages mitigates operational risk.",
    },
    {
      id: "pilot-measure",
      text: "Pilot with a small group and measure quality before scaling.",
      explanation:
        "Correct: Piloting with controlled user cohorts and empirical quality metrics catches defects prior to full rollout.",
    },
    {
      id: "automate-all",
      text: "Automate every step at once to maximize speed.",
      explanation:
        "Incorrect: Automating entire workflows all at once amplifies points of failure and obscures root causes.",
    },
    {
      id: "remove-review",
      text: "Remove review because Claude is consistent.",
      explanation:
        "Incorrect: Model consistency does not eliminate the risk of erroneous outputs at critical decision gates.",
    },
    {
      id: "skip-baseline",
      text: "Skip baseline metrics to avoid slowing the rollout.",
      explanation:
        "Incorrect: Omitting baseline benchmarks makes it impossible to verify whether the AI deployment improved quality.",
    },
  ],
  correctChoiceIds: ["map-process", "human-checkpoints", "pilot-measure"],
  correctExplanation:
    "Responsible enterprise integration maps workflows, establishes human checkpoints at high-stakes decision gates, and conducts measured pilot rollouts before expanding.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-claude-constitution"],
});

/* ── Domain 6: Governance, Risk, and Responsible Use ──────────────────── */

const humanOversightExpense: Question = questionSchema.parse({
  id: "governance-human-oversight",
  type: "single-choice",
  stem: "A team wants Claude to approve expense exceptions automatically. The exceptions can create financial and compliance risk. What is the most responsible design?",
  choices: [
    {
      id: "recommend-human-decides",
      text: "Use Claude to prepare a recommendation and supporting evidence, keep a human decision-maker for approval, and log the decision.",
      explanation:
        "Correct: Claude should analyze evidence and draft recommendations, leaving approval authority to accountable human managers, backed by audit logging.",
    },
    {
      id: "auto-approve-all",
      text: "Let Claude approve all exceptions to reduce delays.",
      explanation:
        "Incorrect: Fully autonomous approvals for exceptions circumvent fiduciary oversight.",
    },
    {
      id: "confidence-only",
      text: "Approve automatically whenever Claude reports high confidence.",
      explanation:
        "Incorrect: Self-reported model confidence does not guarantee compliance accuracy or fiduciary validity.",
    },
    {
      id: "remove-audit",
      text: "Remove the audit log to protect employee privacy.",
      explanation:
        "Incorrect: Removing audit trails eliminates forensic accountability.",
    },
  ],
  correctChoiceIds: ["recommend-human-decides"],
  correctExplanation:
    "For financial exception workflows, Claude is best utilized as an analytical copilot: synthesizing evidence and drafting recommendations, while retaining accountable human approvers and audit logs.",
  sourceIds: ["anthropic-claude-constitution", "anthropic-reduce-hallucinations-doc"],
});

const customerAssistantSafeguards: Question = questionSchema.parse({
  id: "governance-customer-assistant-safeguards",
  type: "multiple-response",
  stem: "Which three safeguards are appropriate for a customer-facing Claude assistant?",
  choices: [
    {
      id: "prohibited-uses",
      text: "Define prohibited uses and escalate sensitive requests to a human.",
      explanation:
        "Correct: Defining clear operational boundaries and providing human escalation paths handles high-risk interactions responsibly.",
    },
    {
      id: "disclose-ai",
      text: "Tell users they are interacting with AI and state the assistant's limitations.",
      explanation:
        "Correct: Transparently disclosing AI interaction and system limitations establishes realistic user expectations.",
    },
    {
      id: "check-fairness",
      text: "Check outputs for illegal discrimination and biased treatment.",
      explanation:
        "Correct: Monitoring outputs for biased framing and discriminatory treatment enforces responsible AI standards.",
    },
    {
      id: "binding-legal",
      text: "Let the assistant give binding legal advice without review.",
      explanation:
        "Incorrect: Providing unreviewed binding legal counsel violates regulatory compliance and usage policies.",
    },
    {
      id: "hide-disclosure",
      text: "Hide the AI disclosure to improve engagement.",
      explanation:
        "Incorrect: Concealing AI usage reduces transparency and compromises ethical governance.",
    },
    {
      id: "override-oversight",
      text: "Allow the assistant to override human oversight.",
      explanation:
        "Incorrect: Allowing automated assistants to override human oversight violates core governance principles.",
    },
  ],
  correctChoiceIds: ["prohibited-uses", "disclose-ai", "check-fairness"],
  correctExplanation:
    "Core safeguards for public customer assistants include bounding permissible topics with escalation paths, transparent AI disclosures, and continuous bias monitoring. Delivering binding legal advice or suppressing disclosures is impermissible.",
  sourceIds: ["anthropic-claude-constitution", "anthropic-usage-policy"],
});

/* ── Domain 7: Troubleshooting and Optimization ───────────────────────── */

const diagnoseVagueReport: Question = questionSchema.parse({
  id: "troubleshoot-diagnose-prompt",
  type: "single-choice",
  stem: "Claude's output for a recurring report is vague and misses required fields. What is the best first diagnostic step?",
  choices: [
    {
      id: "inspect-prompt",
      text: "Inspect the prompt and supplied context for a missing goal, output schema, examples, and constraints before changing models.",
      explanation:
        "Correct: Inspect the prompt and context for missing objectives, output schemas, exemplars, and constraints before altering model parameters.",
    },
    {
      id: "largest-model",
      text: "Switch to the largest available model immediately.",
      explanation:
        "Incorrect: Upgrading to larger models cannot supply missing schemas or domain specifications.",
    },
    {
      id: "raise-temperature",
      text: "Raise the temperature to get a different answer.",
      explanation:
        "Incorrect: Increasing temperature adds randomness, worsening missing-field errors.",
    },
    {
      id: "ask-longer",
      text: "Ask for a longer answer and hope the missing fields appear.",
      explanation:
        "Incorrect: Demanding length does not enforce structural schema adherence.",
    },
  ],
  correctChoiceIds: ["inspect-prompt"],
  correctExplanation:
    "When outputs miss required fields, the primary diagnostic step is reviewing prompt instructions and context: verify goal clarity, explicit schemas, few-shot exemplars, and boundaries before altering infrastructure.",
  sourceIds: ["anthropic-prompting-best-practices", "anthropic-evaluation-docs"],
});

const feedbackImprovementLoop: Question = questionSchema.parse({
  id: "troubleshoot-feedback-loop",
  type: "multiple-response",
  stem: "Which three practices turn feedback into a reliable prompt-improvement loop?",
  choices: [
    {
      id: "success-criteria",
      text: "Define measurable success criteria and representative test cases.",
      explanation:
        "Correct: Defining objective success criteria and representative test suites verifies genuine progress.",
    },
    {
      id: "compare-baseline",
      text: "Compare the revised prompt against the baseline on the same cases.",
      explanation:
        "Correct: Benchmarking prompt modifications against frozen baselines on identical test cases isolates causal impact.",
    },
    {
      id: "inspect-causes",
      text: "Inspect failures to decide whether the cause is instructions, context, or task decomposition.",
      explanation:
        "Correct: Categorizing failures into instructions, context, or decomposition issues directs targeted remedies.",
    },
    {
      id: "change-many",
      text: "Change several variables at once so the fix is faster.",
      explanation:
        "Incorrect: Changing multiple variables simultaneously confounds diagnostic insight.",
    },
    {
      id: "first-fluent",
      text: "Accept the first fluent answer as the new baseline.",
      explanation:
        "Incorrect: Superficial fluency does not guarantee adherence to rubric criteria.",
    },
    {
      id: "remove-failures",
      text: "Remove failing test cases to improve the score.",
      explanation:
        "Incorrect: Deleting failing edge cases inflates scores artificially and conceals critical bugs.",
    },
  ],
  correctChoiceIds: ["success-criteria", "compare-baseline", "inspect-causes"],
  correctExplanation:
    "A disciplined evaluation loop establishes quantitative rubrics, maintains representative test sets, benchmarks against frozen baselines, and categorizes failure root causes.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-prompting-best-practices"],
});

export const promptingQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(specificPromptBrief, "prompting-create-effective-prompts", [
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(decomposeComplexRequest, "prompting-task-decomposition", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-building-effective-agents",
  ]),
];

export const contextQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(summarizeAndRestartContext, "context-memory-management", [
    "anthropic-context-windows-doc",
    "anthropic-compaction-doc",
    "anthropic-context-engineering-blog",
  ]),
  reviewedEntry(highSignalContext, "context-memory-management", [
    "anthropic-context-windows-doc",
    "anthropic-context-engineering-blog",
  ]),
];

export const workflowQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(requirementsExtraction, "workflow-requirements-analysis", [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(workflowCheckpoints, "workflow-integrate", [
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-building-effective-agents",
  ]),
];

export const governanceQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(humanOversightExpense, "governance-ethics", [
    "anthropic-claude-constitution",
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(customerAssistantSafeguards, "governance-use-case-fit", [
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ]),
];

export const troubleshootingQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(diagnoseVagueReport, "troubleshoot-diagnose", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(feedbackImprovementLoop, "troubleshoot-adjust", [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
  ]),
];

/** Every reviewed, exam-mapped bank entry. */
export const reviewedQuestionBank: QuestionBankEntry[] = [
  ...domainTwoQuestionBank,
  ...promptingQuestionBank,
  ...promptingExpansionQuestionBank,
  ...contextQuestionBank,
  ...productSelectionExpansionQuestionBank,
  ...workflowQuestionBank,
  ...workflowExpansionQuestionBank,
  ...domainFiveQuestionBank,
  ...governanceQuestionBank,
  ...governanceExpansionQuestionBank,
  ...troubleshootingQuestionBank,
  ...optimizationExpansionQuestionBank,
  ...coverageDepthQuestionBank,
  ...expansionCQuestionBank,
  ...expansionDQuestionBank,
];
