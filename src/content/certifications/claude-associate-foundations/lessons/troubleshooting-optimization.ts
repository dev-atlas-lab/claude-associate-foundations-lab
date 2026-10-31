import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all three verified Domain 7 objectives.
 * It teaches a measured diagnose-adjust-optimize loop: reproduce, classify,
 * change one variable, rerun the full suite, and optimize only after a baseline
 * exists. Examples are original workplace scenarios.
 */
export const troubleshootingOptimizationLesson: Lesson = lessonSchema.parse({
  id: "troubleshooting-optimization",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 8,
  kind: "curriculum",
  contentStatus: "published",
  title: "Diagnose and optimize: from weak output to a measured improvement loop",
  englishTitle: "Diagnose and optimize: from weak output to a measured improvement loop",
  summary:
    "Learn to diagnose poor outputs using empirical baselines and structured error taxonomies, adjust prompt framing, context, or task decomposition based on evidence, guard against regressions across the entire test suite, and optimize workflows across quality, latency, and token economics without silent trade-offs.",
  level: "intermediate",
  estimatedMinutes: 22,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Technical content aligned with Anthropic documentation on evaluation criteria, prompting best practices, reducing hallucinations, context windows, model overviews, model selection, and building effective agents. Three objectives mapped from Exam Guide v1.0.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-evaluation-docs",
      "anthropic-prompting-best-practices",
      "anthropic-reduce-hallucinations-doc",
      "anthropic-context-windows-doc",
      "anthropic-models-overview",
      "anthropic-choosing-model",
      "anthropic-building-effective-agents",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "troubleshoot-diagnose",
      "troubleshoot-adjust",
      "optimize-workflows",
    ],
    note: "Lesson covers all three verified Domain 7 objectives in Exam Guide v1.0.",
  },
  objectives: [
    "Diagnose low-quality outputs by reproducing errors, evaluating against objective rubrics, and categorizing failure causes.",
    "Adjust prompt instructions, context retrieval, or task decomposition using empirical feedback while rigorously verifying regression test suites.",
    "Optimize workflow efficiency across quality, latency, and cost dimensions once stable baselines and acceptance thresholds are established.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Poor output is a symptom, not a root cause",
      paragraphs: [
        "When Claude generates an unsatisfactory response, an inexperienced practitioner's knee-jerk reaction is to immediately escalate to a larger model, inflate temperature, or arbitrarily lengthen prompt instructions. This trial-and-error patching frequently obscures root causes, increases operational cost and latency, and silently introduces regressions into previously functioning test cases. A disciplined diagnostic protocol begins by deterministically reproducing the defect on identical inputs, auditing against objective acceptance rubrics, and pinpointing whether the defect stems from prompt ambiguity, context pollution, monolithic task structure, or model capability limits.",
        "Anthropic emphasizes defining quantitative, measurable success criteria and curating an evaluation dataset that accurately reflects production distributions and adversarial edge cases. Without established rubrics and baseline measurements, all troubleshooting remains subjective guesswork.",
      ],
    },
    {
      kind: "list",
      heading: "The diagnostic triage framework",
      items: [
        "Prompt Instruction: Does the prompt clearly articulate goal, audience persona, schema constraints, technical boundaries, and acceptance criteria?",
        "Context & Retrieval: Are reference documents, few-shot exemplars, tool results, or history turns incomplete, obsolete, conflicting, or diluting attention?",
        "Task Structure: Is the prompt conflating too many interdependent operations in a single turn, inducing cognitive overload in the model?",
        "Model Tier & Reasoning Effort: Consider switching model families only after optimizing the preceding three factors; a larger model cannot resolve an ambiguous prompt.",
        "Evaluation Signal: Which specific test cases are failing, what exact defect archetype is present, and which quality rubric is being breached?",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Defect reproduction and baseline establishment",
      paragraphs: [
        "An isolated failure does not establish a systemic trend. Engineers must rerun identical prompts and inputs across multiple iterations to evaluate non-deterministic variance. Next, evaluate across a representative test suite: standard workflows, complex multi-step cases, missing-data scenarios, and boundary edge cases. If a defect manifests consistently across the dataset, it indicates a systemic specification or context deficiency. If it occurs sporadically on idiosyncratic edge cases, it highlights a missing negative constraint or few-shot exemplar.",
        "Always record baseline metrics prior to introducing modifications: per-field accuracy percentages, latency (TTFT and end-to-end), token expenditures, and categorized defect tallies. Baseline metrics provide the sole empirical proof that your technical intervention represents a genuine improvement rather than an undetected regression.",
      ],
    },
    {
      kind: "list",
      heading: "The production troubleshooting checklist",
      items: [
        "Audit prompt objectively: Are the goal, role, schema, and exemplars unambiguous to a human reader?",
        "Audit context hygiene: Are there outdated reference docs, malformed exemplars, conflicting rules, or critical facts buried in long context?",
        "Audit task architecture: Should the monolithic workflow be decomposed into bounded pipeline stages (Extract → Validate → Synthesize)?",
        "Cross-reference output against success criteria and ground truth, precisely identifying the defective span.",
        "Classify the defect: Missing data, instruction misunderstanding, factual hallucination, schema deviation, or model reasoning ceiling.",
        "Test alternative models only after instructions and context are standardized, holding all other variables constant.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Resist the impulse to change models first",
      body: "A larger model tier may mask an ambiguous prompt during an ad-hoc demo, but it does not resolve unwritten evaluation criteria, stale context, or overloaded multi-turn pipelines. Escalating model tiers sharply increases API costs and latency without delivering durable reliability. Perfect your instructions, context boundaries, and decomposition first.",
    },
    {
      kind: "paragraphs",
      heading: "Evidence-based adjustments: changing one variable at a time",
      paragraphs: [
        "Disciplined prompt engineering adjusts a single variable, reruns the entire evaluation suite, inspects per-case shifts, and logs empirical deltas. If adding a few-shot exemplar resolves Case A but causes Case B to fail, you must catch that trade-off immediately. Never rely solely on aggregate average scores; an average score can rise even as a mission-critical edge case catastrophically regresses.",
        "Anthropic advocates prompt chaining with inspectable intermediate outputs and evaluator-optimizer loops with objective rubrics. In practice, this means: break difficult reasoning steps into verifiable sub-stages, inspect intermediate artifacts, and advance to subsequent steps only when prerequisites pass validation gates.",
      ],
    },
    {
      kind: "list",
      heading: "The systematic adjustment loop",
      items: [
        "Classify defect archetype: missing requirement, context pollution, flawed task structure, or model capability gap.",
        "Formulate the minimal testable intervention: adding a negative constraint, defining a field schema, or providing a balanced few-shot exemplar.",
        "Rerun the complete evaluation suite across all test cases, not just the single failing example.",
        "Inspect per-case diffs against baseline to identify unintended regressions.",
        "If regressions occur, isolate affected cases and decide whether to refine constraints, decouple rules, or revert the modification.",
        "Promote changes to production only when quality remains stable across the representative suite and all critical cases pass.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Workflow optimization: balance quality, latency, and cost",
      paragraphs: [
        "Optimization is not merely minimizing token spend. It is the balanced calibration of three competing dimensions: Quality, Latency, and Cost. Measure all three before intervening, and identify the true architectural bottleneck: bloated context windows, redundant roundtrips, over-provisioned models on simple sub-tasks, or prolonged manual human reviews.",
        "Anthropic provides several architectural optimization levers: right-sizing to smaller models (e.g., Haiku) for high-throughput classification or triage, leveraging Prompt Caching for repetitive static prefixes, utilizing Batch Processing for asynchronous non-real-time jobs, and tuning reasoning effort. These levers are valid only when output quality comfortably clears acceptance thresholds. Never reduce costs by eliminating human review on high-stakes decisions.",
      ],
    },
    {
      kind: "list",
      heading: "Architectural optimization levers",
      items: [
        "Prune irrelevant context: Remove outdated drafts, verbose tool outputs, and redundant docs; retain confirmed decisions and constraints.",
        "Pipeline right-sizing: Decompose complex workflows and assign smaller models (Haiku) to extraction/routing and high-tier models (Sonnet) to synthesis.",
        "Implement Prompt Caching: Cache large static document prefixes, few-shot exemplars, and system prompts to achieve up to 90% read cost discounts.",
        "Leverage Batch Processing: Utilize asynchronous batch APIs for non-urgent tasks to access substantial pricing discounts.",
        "Constrain output token limits: Enforce structured schemas and concise formatting directives to eliminate verbose filler.",
        "Rerun benchmarks following every modification: optimization is a measured cycle, not an arbitrary toggle.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Cost optimization cannot compromise quality thresholds",
      body: "If a configuration modification reduces token expenditure by 30% but introduces an unacceptable error rate in compliance-critical cases, it is not an optimization — it is an unapproved operational defect. Document all trade-offs, minimum acceptable quality bars, and obtaining stakeholder sign-off before downgrading models or bypassing review checkpoints.",
    },
    {
      kind: "diagram",
      heading: "Interactive Tool: Model Right-Sizing & Prompt Caching Cost Calculator",
      diagramId: "prompt-caching-cost-calculator",
      intro: "Compare economic trade-offs across Claude 3.5 model families (Haiku vs. Sonnet vs. Opus) and simulate up to 90% cache read savings based on prefix length and query volume.",
    },
    {
      kind: "paragraphs",
      heading: "Establishing explicit stopping conditions",
      paragraphs: [
        "Conclude optimization when output quality decisively meets defined acceptance thresholds across the representative evaluation set, zero regressions occur in critical cases, and latency and cost fall comfortably within operational SLAs. Avoid endless tinkering; marginal returns diminish rapidly while every modification introduces operational change risk.",
        "Record the exact prompt revision, model version, test dataset, and quantitative results in a version-controlled repository. This documentation ensures full reproducibility, accelerates future onboarding, and provides empirical justification to stakeholders that engineering decisions are grounded in measurement rather than intuition.",
      ],
    },
  ],
  keyTerms: [
    {
      en: "Diagnostic baseline",
      vi: "Diagnostic baseline (mốc đối chuẩn chẩn đoán)",
      note: "Standardized performance measurements recorded across a representative test suite prior to implementing modifications.",
    },
    {
      en: "Failure classification",
      vi: "Failure classification (phân loại căn nguyên lỗi)",
      note: "Categorizing root causes into instruction ambiguity, context pollution, task decomposition flaws, or model capability limits.",
    },
    {
      en: "Regression",
      vi: "Regression (lỗi thoái lui / suy giảm chất lượng)",
      note: "Degradation where an intervention solving one test case inadvertently damages performance on previously passing cases.",
    },
    {
      en: "Latency",
      vi: "Latency (độ trễ phản hồi)",
      note: "Elapsed duration between dispatching a prompt and receiving a complete, actionable response (including TTFT).",
    },
    {
      en: "Cost per successful outcome",
      vi: "Cost per successful outcome (chi phí trên mỗi kết quả đạt chuẩn)",
      note: "Comprehensive economic metric calculating total tokens and compute invested to produce an acceptable output, including retries.",
    },
    {
      en: "Right-sizing",
      vi: "Right-sizing (chọn đúng cấp năng lực model)",
      note: "Architectural practice of matching each sub-task to the most cost- and latency-efficient model tier capable of reliable execution.",
    },
    {
      en: "Prompt caching",
      vi: "Prompt caching (bộ nhớ đệm prompt)",
      note: "Reusing processed prefix tokens across consecutive requests to dramatically lower latency and reduce read costs by up to 90%.",
    },
    {
      en: "Batch processing",
      vi: "Batch processing (xử lý hàng loạt theo mẻ)",
      note: "Submitting groups of asynchronous requests to secure significant pricing discounts when sub-second latency is not required.",
    },
  ],
  scenario: {
    title: "Scenario: Weekly Operations Incident Brief Missing Mandatory Fields",
    setup:
      "An IT operations team uses Claude to summarize weekly incident logs. Outputs are generally formatted well, but approximately 30% of generated reports omit the mandatory 'Assigned Owner' field, and occasionally cite non-existent ticket IDs. The team proposes switching to the largest model tier and increasing temperature to 'increase flexibility'.",
    steps: [
      "Reproduce defects across a benchmark set of 20 representative ticket logs; log omission frequencies and fabricated ticket IDs.",
      "Inspect prompt: verify whether the 'Assigned Owner' field has a clear definition, few-shot exemplar, and fallback instructions for missing data.",
      "Inspect context: check for outdated incident templates or malformed exemplars contaminating the prompt.",
      "Classify defects: missing owner field is an instruction/schema ambiguity; fabricated ticket IDs represent a grounding/citation failure.",
      "Apply minimal testable fix: define the owner field explicitly with a few-shot exemplar, instruct Claude to output 'UNKNOWN' when unassigned, and mandate exact ticket citations.",
      "Rerun all 20 test cases, verifying per-case diffs against the baseline to ensure no other fields regressed.",
      "Right-size architecture: test assigning a smaller model (Haiku) to ticket extraction and reserving Sonnet for executive summary synthesis.",
      "Document empirical metrics, trade-offs, and stopping criteria; deploy to production only after all 20 benchmark tickets pass validation.",
    ],
    takeaway:
      "Changing models and raising temperature cannot resolve missing schema definitions or ungrounded context. A disciplined diagnostic loop with stable baselines, error classification, and regression testing uncovers root causes faster, cheaper, and reliably.",
  },
  questions: [
    {
      id: "troubleshooting-lesson-diagnose-first",
      type: "single-choice",
      stem: "A support prompt works for common tickets but fails on refund exceptions. The team wants to switch to a larger model. What is the best next step?",
      choices: [
        {
          id: "inspect-requirements-and-context",
          text: "Check whether the prompt and context define the exception policy, include representative examples, and reproduce the failure before testing model changes.",
          explanation:
            "Correct: failures concentrated on a specific exception type indicate missing rules or exemplars; diagnosing instructions and reproducing the defect isolates root causes before escalating models.",
        },
        {
          id: "switch-model-immediately",
          text: "Switch to the larger model immediately and keep the same prompt.",
          explanation:
            "Incorrect: switching models fails to supply missing exception policy rules and obscures whether prompt instructions were defective.",
        },
        {
          id: "raise-temperature",
          text: "Raise the temperature so the model explores more possible answers.",
          explanation:
            "Incorrect: raising temperature increases output randomness and instability; it cannot supply unstated business rules.",
        },
        {
          id: "remove-exception-cases",
          text: "Remove the failing exception cases from the test set.",
          explanation:
            "Incorrect: deleting difficult edge cases creates artificial high scores while blinding the team to critical production failure modes.",
        },
      ],
      correctChoiceIds: ["inspect-requirements-and-context"],
      correctExplanation:
        "When failures concentrate on specific exception pathways, audit prompt instructions and reference context for missing policy rules and representative few-shot exemplars first. Reproducing the defect deterministically isolates root causes. Changing model tiers prematurely inflates costs while failing to address missing business logic.",
      sourceIds: [
        "anthropic-prompting-best-practices",
        "anthropic-evaluation-docs",
        "anthropic-reduce-hallucinations-doc",
      ],
    },
  ],
  relatedQuestionIds: [
    "troubleshoot-diagnose-prompt",
    "troubleshoot-feedback-loop",
    "optimize-workflow-baseline",
    "optimize-workflow-practices",
    "optimize-workflow-cost-latency-controls",
    "troubleshoot-diagnose-evidence",
    "troubleshoot-adjust-regression",
    "troubleshoot-regression-prompt-pinning",
  ],
  takeaways: [
    "Troubleshooting begins with deterministic reproduction, objective rubrics, and empirical baselines, not model switching.",
    "Classify defect root causes into prompt instructions, context retrieval, task decomposition, or model capability limits.",
    "Adjust one variable at a time and rerun the complete evaluation suite to detect regressions early.",
    "Aggregate average scores can conceal critical regressions; always inspect per-case test results.",
    "Optimize quality, latency, and cost after establishing baselines; never accept unapproved quality trade-offs for cost savings.",
    "Document prompt versions, benchmark metrics, and decision rationale to guarantee operational reproducibility.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-reduce-hallucinations-doc",
    "anthropic-context-windows-doc",
    "anthropic-models-overview",
    "anthropic-choosing-model",
    "anthropic-building-effective-agents",
  ],
});
