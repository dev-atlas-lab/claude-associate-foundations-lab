import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * The first exam-mapped curriculum lesson. It teaches the six verified Domain 2
 * objectives and connects them to the reviewed practice bank. Technical claims
 * are limited to what the cited Anthropic sources actually support; bias is
 * treated as a framing/equal-treatment review lens, not as a complete fairness
 * audit.
 */
export const evaluationBasicsLesson: Lesson = lessonSchema.parse({
  id: "evaluation-basics",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 2,
  kind: "curriculum",
  contentStatus: "published",
  title: "Evaluating outputs: accuracy, evidence, and human review",
  englishTitle: "Evaluating outputs: accuracy, evidence, and human review",
  summary:
    "Master evidence-based evaluation of Claude's outputs: distinguish factual accuracy from completeness and relevance, identify hallucinations and framing bias, rigorously fact-check claims against ground truth, determine when human review is mandatory, and edit for target audiences without altering facts.",
  level: "foundation",
  estimatedMinutes: 18,
  verification: {
    status: "verified",
    checkedAt: "2026-10-26",
    note: "Technical content aligned with Anthropic documentation on reducing hallucinations, evaluation criteria, prompting best practices, structured outputs, artifacts, and Claude's Constitution. Six objectives mapped from Exam Guide v1.0.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-reduce-hallucinations-doc",
      "anthropic-evaluation-docs",
      "anthropic-prompting-best-practices",
      "anthropic-structured-outputs-doc",
      "anthropic-artifacts-doc",
      "anthropic-claude-constitution",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "output-evaluate-accuracy",
      "output-identify-hallucinations",
      "output-fact-check",
      "output-human-review",
      "output-edit-adapt",
      "output-format-selection",
    ],
    note: "Lesson covers all six verified Domain 2 objectives in Exam Guide v1.0.",
  },
  objectives: [
    "Evaluate model outputs across multidimensional criteria: accuracy, completeness, and task relevance rather than superficial fluency.",
    "Identify factual hallucinations, internal inconsistencies, and biased framing or asymmetric standards.",
    "Fact-check assertions systematically against source text, grounding claims in direct quotes and retracting unverified statements.",
    "Determine when high-stakes impact, conflicting sources, or ambiguity mandates qualified human review.",
    "Edit and adapt outputs for diverse audiences while preserving factual fidelity, quantitative metrics, and calibrated uncertainty.",
    "Select optimal output modalities: inline responses, structured data schemas, or standalone artifacts.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Fluency is not correctness",
      paragraphs: [
        "A response that is eloquently written, assertive, and well structured can still be completely factually wrong. Anthropic defines a hallucination as text that is factually incorrect or inconsistent with provided context. The foundational evaluation question is not 'does this sound convincing?', but rather 'what specific claims are being asserted, and what empirical evidence supports them?'.",
        "Evaluating outputs is a disciplined audit: define task requirements, extract verifiable claims, cross-reference against authoritative ground truth, and only then evaluate stylistic presentation. Anthropic treats task fidelity, relevance, coherence, tone/style, and context utilization as distinct evaluation dimensions; an output can be factually accurate yet incomplete or unsuited to its intended audience.",
      ],
    },
    {
      kind: "list",
      heading: "The three foundational evaluation questions",
      items: [
        "Accuracy: Do claims, statistics, and citations match verified ground-truth sources?",
        "Completeness: Have all mandatory sections, edge cases, negative constraints, and regulatory caveats been addressed?",
        "Relevance: Does the response directly fulfill the user's operational goal, or does it merely generate adjacent filler?",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Do not confuse consistency with correctness",
      body: "Two identical outputs across separate model runs can both be simultaneously wrong. Anthropic notes that techniques like Best-of-N sampling, iterative self-refinement, and cross-checking identify internal inconsistencies but cannot eliminate shared hallucinations; critical facts must still be validated against external ground truth. Treat consistency as an investigative indicator, never as definitive proof.",
    },
    {
      kind: "paragraphs",
      heading: "Distinguishing hallucinations, internal inconsistencies, and framing bias",
      paragraphs: [
        "A Factual Hallucination is an assertion that contradicts external reality or provided source documentation. An Internal Inconsistency occurs when two statements within the same response (or across consecutive turns) directly contradict each other. Framing Bias occurs when an output selectively highlights evidence or uses loaded language to skew perception — an asymmetric standard rather than a simple mathematical error. These defects require different remedies: replace hallucinated assertions with grounded citations, resolve internal contradictions, or restore balanced evidence selection.",
        "Claude's Constitution directs that Claude should remain even-handed, present balanced representations of controversial issues, cite multiple perspectives, and employ neutral terminology. It explicitly prohibits deceptive framing or selective emphasis. Recognizing these failure modes is an essential evaluation capability.",
      ],
    },
    {
      kind: "list",
      heading: "Quick bias and framing audit checklist",
      items: [
        "Evidence Selection: Does the output exclusively present evidence supporting one conclusion while omitting relevant counter-evidence?",
        "Framing: Are opposing parties described using neutral terminology, or are evaluative, emotionally loaded adjectives applied asymmetrically?",
        "Equal Treatment: Are comparable entities subjected to identical evidentiary thresholds and scrutiny, or are disparate standards applied?",
        "Protected Characteristics: Does the text draw unwarranted inferences regarding competence or trustworthiness from protected attributes (age, gender, ethnicity)?",
        "Calibrated Limitations: If available data is insufficient for a balanced conclusion, does the output disclose limitations rather than asserting certainty?",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Fact-checking is a multi-step audit process",
      paragraphs: [
        "Anthropic recommends engineering outputs to be auditable: enforce direct quotes, link every assertion to a source identifier, and explicitly retract claims that cannot be grounded in source text. For voluminous source documents, extract supporting quotes prior to drafting synthesis; for high-stakes assertions, re-verify claims post-generation.",
        "Effective fact-checking goes beyond verifying the existence of a citation. The citation must be genuine, accurately reflect the source's findings, and preserve operational context. If sources conflict or are outdated, flag the discrepancy as unresolved rather than arbitrarily selecting the most convenient claim.",
      ],
    },
    {
      kind: "list",
      heading: "Systematic claim-by-claim verification procedure",
      items: [
        "Decompose output into discrete, verifiable claims: numbers, dates, statutory citations, causal assertions, and recommendations.",
        "Identify evidence provenance: user-provided documentation, official external source, or model parametric memory.",
        "Locate exact source passage and verify verbatim quotation; audit units of measure, timeframes, and negative exceptions.",
        "If no supporting quote exists, modify the claim, reduce confidence calibration, or delete the claim entirely.",
        "Document audit status: record verified claims, unresolved ambiguities, and items flagged for human escalation.",
      ],
    },
    {
      kind: "diagram",
      diagramId: "hallucination-evaluation-sandbox",
      heading: "Interactive Sandbox: Audit & Defect Classifier",
      intro:
        "Practice auditing generated claims against ground truth documents. Accurately classify defects into Factual Hallucinations, Internal Inconsistencies, Fabricated Citations, or Missing Constraints per Anthropic Evaluation standards.",
    },
    {
      kind: "paragraphs",
      heading: "When is human review mandatory?",
      paragraphs: [
        "Anthropic explicitly emphasizes: despite applying hallucination mitigation techniques, critical information must be validated by qualified humans, particularly in high-stakes decisions. Qualified human review is non-negotiable whenever outputs affect healthcare, legal liability, financial commitments, physical safety, data privacy, or irreversible corporate actions.",
        "Furthermore, empirical evaluation demonstrates that subjective criteria (tone, cultural sensitivity, nuanced brand voice) cannot be fully automated. Escalate whenever sources conflict, data is stale, real-world consequences are severe, or human experts bear regulatory accountability.",
      ],
    },
    {
      kind: "list",
      heading: "Triggers mandating additional verification or qualified human review",
      items: [
        "High-Stakes Domains: Clinical dosage, legal contracts, credit approvals, physical security, or hiring decisions.",
        "Conflicting Evidence: Incompatible claims between separate authoritative documents or conflicting system outputs.",
        "Outdated or Unverified Data: Superseded regulations, unverified web citations, or anonymous sources.",
        "Irreversible External Impact: Safety bulletins, public press statements, or contractual commitments sent to clients.",
        "Subjective or Cultural Judgments: Brand voice appropriateness, equity considerations, or community impact.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Editing and adapting for audiences without factual drift",
      paragraphs: [
        "Adapting language for target audiences does not permit altering underlying facts. Anthropic treats tone, style, and audience suitability as core evaluation dimensions. When distilling complex technical findings for executive stakeholders, preserve exact figures, conditionality, and uncertainty; adapt sentence complexity and jargon, then cross-reference against the unabridged original.",
        "When comparing multiple candidate drafts, never select based on length or perceived confidence. Audit each candidate against ground truth, evaluate against audience rubrics, synthesize accurate components from each, and verify that the merged version introduces no novel hallucinations.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Selecting formats according to downstream consumption",
      paragraphs: [
        "Output formatting is an architectural decision, not aesthetic decoration. If downstream automated systems ingest the output, structured outputs (such as JSON Schema) guarantee schema compliance and prevent runtime parse errors. If content is substantial, self-contained, and destined for iterative editing, dedicated Artifacts are vastly superior to transient chat responses.",
        "Conversely, concise answers or status updates do not warrant an Artifact. Select the minimal format that fulfills user requirements: inline text for dialog, structured JSON for programmatic pipelines, formatted markdown tables for comparative data, and standalone Artifacts for enduring deliverables.",
      ],
    },
    {
      kind: "list",
      heading: "Pre-deployment output verification checklist",
      items: [
        "Identify target audience, operational decision, and risk tier of the output.",
        "Extract substantive claims and verify each against specific source text.",
        "Assess completeness against explicit prompt requirements, edge cases, and mandatory caveats.",
        "Audit framing: check for omitted perspectives, loaded adjectives, or asymmetric evaluation standards.",
        "Determine whether qualified human review is required, documenting the reviewer and confirmation scope.",
        "Edit for audience level while preserving exact numbers, dependencies, and calibrated uncertainty.",
        "Select output format matched to downstream usage: inline response, JSON schema, or standalone Artifact.",
        "Explicitly document limitations: unverified assertions, source discrepancies, and open questions.",
      ],
    },
  ],
  keyTerms: [
    {
      en: "Accuracy",
      vi: "Độ chính xác (Accuracy)",
      note: "The degree to which assertions, numerical data, and citations align perfectly with verified ground-truth sources.",
    },
    {
      en: "Completeness",
      vi: "Độ đầy đủ (Completeness)",
      note: "The extent to which an output addresses all requirements, constraints, edge cases, and mandatory disclosures.",
    },
    {
      en: "Relevance",
      vi: "Độ liên quan (Relevance)",
      note: "The degree to which an output directly resolves the user's core operational question rather than generating adjacent prose.",
    },
    {
      en: "Hallucination",
      vi: "Hallucination (ảo giác / thông tin bịa đặt)",
      note: "Model-generated assertions that contradict external factual reality or conflict with provided reference context.",
    },
    {
      en: "Inconsistency",
      vi: "Inconsistency (mâu thuẫn nội bộ)",
      note: "Contradictory assertions occurring within the same output or across consecutive evaluation runs.",
    },
    {
      en: "Framing bias",
      vi: "Framing bias (thiên lệch do góc nhìn)",
      note: "Selective presentation of facts or use of loaded adjectives creating an asymmetric or skewed impression.",
    },
    {
      en: "Fact-check",
      vi: "Fact-check (kiểm chứng dữ kiện)",
      note: "Systematic auditing of discrete claims against ground-truth sources, retracting or modifying ungrounded assertions.",
    },
    {
      en: "Human review",
      vi: "Human review (con người rà soát & phê duyệt)",
      note: "Mandatory evaluation and sign-off by a qualified domain professional before high-stakes actions take effect.",
    },
    {
      en: "Structured output",
      vi: "Structured output (đầu ra có cấu trúc)",
      note: "Responses conforming to deterministic machine-readable schemas (such as JSON) for reliable downstream parsing.",
    },
    {
      en: "Artifact",
      vi: "Artifact (khối nội dung độc lập)",
      note: "Dedicated side-by-side UI container for substantial, standalone, editable deliverables like code or documents.",
    },
  ],
  scenario: {
    title: "Scenario: Executive Customer Satisfaction Survey Synthesis",
    setup:
      "A product operations team receives a customer satisfaction survey summary drafted by Claude. The draft is fluent and well formatted, but contains a customer retention percentage that does not match the raw CSV data, omits feedback from recently onboarded enterprise cohorts, and uses dense statistical jargon inappropriate for executive leadership.",
    steps: [
      "Decompose draft into discrete claims: percentages, respondent headcounts, key qualitative themes, and recommendations.",
      "Cross-reference every metric against the raw CSV dataset; tag the retention percentage as ungrounded.",
      "Audit completeness against assignment requirements: identify omitted enterprise onboarding cohort responses.",
      "Audit framing: check whether the draft selectively highlighted positive sentiment while minimizing critical usability friction.",
      "Identify high-stakes components requiring human review: commercial metrics, SLA compliance, and enterprise cohort feedback.",
      "Rewrite executive brief: preserve verified facts and uncertainty while replacing jargon with clear business terminology.",
      "Select optimal formats: summary metrics table, executive bullet brief, and standalone Artifact for full survey methodology.",
    ],
    takeaway:
      "High-quality outputs require empirical grounding. Responses must withstand rigorous verification: supported by quotes, comprehensive across requirements, fair in framing, verified by humans where high-stakes, and structured for downstream decision-making.",
  },
  questions: [
    {
      id: "evaluation-lesson-review-order",
      type: "single-choice",
      stem: "A market brief is fluent and well formatted, but one statistic has no source, a required competitor is missing, and the tone is too technical for the sales team. Which review plan addresses the draft's problems in the right order?",
      choices: [
        {
          id: "tone-first",
          text: "Rewrite the tone for sales first, then publish because the structure is already clear.",
          explanation:
            "Incorrect: adjusting tone does not verify unsupported statistics or resolve missing competitor coverage.",
        },
        {
          id: "verify-then-adapt",
          text: "Verify the unsupported statistic and the required competitor section, then adapt the language for sales and re-check the revision against the source.",
          explanation:
            "Correct: resolves foundational factual accuracy and completeness first, then adapts tone for the sales audience and re-checks against source to avoid factual drift.",
        },
        {
          id: "delete-problems",
          text: "Delete the statistic and the competitor section so the brief is shorter and easier to read.",
          explanation:
            "Incorrect: deleting mandatory requirements violates completeness; unverified claims must be grounded or explicitly flagged as data gaps.",
        },
        {
          id: "second-draft",
          text: "Generate a second draft and keep the one with more confident language.",
          explanation:
            "Incorrect: assertive language does not compensate for missing requirements or unverified numerical data.",
        },
      ],
      correctChoiceIds: ["verify-then-adapt"],
      correctExplanation:
        "Disciplined review establishes factual accuracy and completeness before stylistically adapting for target audiences. Rewriting tone first risks polishing inaccuracies or diluting necessary constraints. Always re-verify the edited draft against source text to prevent factual drift during adaptation.",
      sourceIds: [
        "anthropic-reduce-hallucinations-doc",
        "anthropic-evaluation-docs",
      ],
    },
  ],
  relatedQuestionIds: [
    "output-accuracy-review-plan",
    "output-hallucination-signals",
    "output-fact-check-retention",
    "output-human-review-high-stakes",
    "output-edit-preserve-facts",
    "output-format-fit-deliverable",
    "output-bias-one-sided-framing",
    "output-evaluation-hallucination-audit-plan",
  ],
  takeaways: [
    "Evaluate model outputs by verifiable claims and grounded evidence, not superficial fluency or confidence.",
    "Hallucinations, internal inconsistencies, and framing bias represent distinct defects requiring targeted mitigations.",
    "Fact-check assertions systematically with verbatim quotes; retract or modify claims lacking empirical evidence.",
    "Enforce qualified human review for high-stakes consequences, conflicting sources, stale data, or subjective judgment.",
    "Audience adaptation must preserve factual metrics and calibrated uncertainty; select formats matching downstream consumption.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-structured-outputs-doc",
    "anthropic-artifacts-doc",
    "anthropic-claude-constitution",
  ],
});
