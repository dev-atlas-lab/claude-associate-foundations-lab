# Content Coverage Matrix

**Matrix updated:** 2026-10-27
**Source access date:** 2026-10-26
**Blueprint:** CCAO-F Exam Guide v1.0, effective July 2026  
**Applicable attempt:** before 2026-11-14 (do not apply the 2026-11-17 / 2026-12-07 revision)  
**Source of exam scope:** `docs/EXAM_BLUEPRINT.md`

This matrix separates three different things:

1. **Exam scope** — is the topic really in the official blueprint?
2. **Content coverage** — do we have a reviewed lesson and original practice items for it?
3. **General-knowledge safety** — can the topic be taught from official Claude documentation
   without overstating what the exam will ask?

A verified objective is **not** coverage. Today the product has one technical sample lesson, one
exam-mapped Domain 2 curriculum lesson, and a **24-item reviewed bank** spanning six of the seven
domains and **15 of the 30 objectives**. That is reviewed content, not a claim that any domain is
exhausted or that the bank is a full exam simulation.

## Legend

| Status | Meaning |
|---|---|
| **Verified** | Read in an official Anthropic or Pearson VUE source on 2026-10-26 |
| **Partially verified** | Official source exists, but access or completeness was limited |
| **Unverified** | Not confirmed by an official source |
| **Inferred** | A reasonable interpretation or planning decision, not an official fact |
| **Not started** | No lesson or practice content authored |
| **Planned** | A roadmap entry exists; not routable and not reviewed |
| **Sample only** | A design sample exists, but it is not mapped to an official objective |
| **Reviewed / Published** | Content passed the project's content and source checks |

### Source key

| Key | Source |
|---|---|
| **G** | [CCAO-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf) (official PDF, read 2026-10-26) |
| **F** | [Certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications) (official, read 2026-10-26) |
| **C** | [Certification catalogue](https://anthropic-partners.skilljar.com/page/partner-certifications) and [CCAO-F registration page](https://anthropic-partners.skilljar.com/claude-certified-associate-foundations-certification) |
| **P** | [Pearson VUE program page](https://www.pearsonvue.com/us/en/anthropic.html) (HTTP 504 on 2026-10-26; future-revision notice only partially verified) |
| **Prep** | [Official CCAO-F prep path](https://anthropic-partners.skilljar.com/path/claude-certified-associate-foundations) |
| **D** | Anthropic product documentation: [Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows), [Token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting), [Compaction](https://platform.claude.com/docs/en/build-with-claude/compaction), [Context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) |
| **R** | [Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) (official Anthropic documentation, read 2026-10-26) |
| **E** | [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) (official Anthropic documentation, read 2026-10-26) |
| **PB** | [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) (official Anthropic documentation, read 2026-10-26) |
| **SO** | [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) (official Anthropic documentation, read 2026-10-26) |
| **AR** | [What are artifacts and how do I use them?](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them) (official Anthropic Help Center, read 2026-10-26) |
| **CC** | [Claude's Constitution](https://www.anthropic.com/constitution) (official Anthropic publication, read 2026-10-26) |

## Coverage summary

| Measure | Result |
|---|---|
| Official domains identified | **7 / 7 verified** |
| Official objectives identified | **30 / 30 verified** for exam scope |
| Objectives with a reviewed, exam-mapped lesson | **6 / 30** (all six Domain 2 objectives) |
| Objectives with reviewed original practice items | **15 / 30** |
| Domains with at least one reviewed bank item | **6 / 7** (Domain 5 has none) |
| Published lessons | **2** (1 exam-mapped curriculum lesson + 1 explicitly unmapped design sample) |
| Authored questions | **26** (1 sample lesson question + 1 Domain 2 lesson question + 24 reviewed bank items) |
| Reviewed bank items | **24** (13 single-choice, 11 multiple-response) |
| Assessment definitions | **8 registry assessments** (1 sample, 6 domain sets, 1 mixed) **+ 1 derived mock-exam preview** |
| Practice sets | **7** (6 domain sets with items + 1 mixed set) |
| Mock-exam preview | **24 of 60** verified-format slots, shortfall **36**; blueprint-weighted, no filler |
| Assessment core | **Implemented** (Phase C2.1); persistence, review queue, progress, and mock preview in Phase C2.3 |
| Planned lessons | **2**, none routable |
| Question bank status | **24 reviewed, exam-mapped items** across 15 objectives; no official questions copied |
| Future guide revision | **Not applicable** to the pre-2026-11-14 attempt |

## Current content

| Item | Type | Exam mapping | Exam scope status | Content verification | Content status | Coverage | Sources |
|---|---|---|---|---|---|---|---|
| `context-window` | Sample lesson | **Unmapped**. It has a plausible relationship to Domain 3's context/memory objective, but that mapping has **not** been reviewed and is not claimed | Related objective is **Verified** in G; the lesson itself is **not** exam coverage | Technical claims **Verified** against D on 2026-10-26 | **Published as a sample** | 1 lesson, 1 single-choice question, 1 sample assessment definition; no multiple-response item | D |
| `evaluation-basics` | Curriculum lesson | Domain 2 — **verified mapping** to all six objectives | Six objectives are **Verified** in G; the lesson is exam-mapped | Technical claims **Verified** against R, E, PB, SO, AR and CC on 2026-10-26; bias remains policy-level | **Published** | 1 lesson, 1 single-choice knowledge check, 7 linked reviewed bank questions; route `/learn/evaluation-basics` | G, R, E, PB, SO, AR, CC |
| `domain-2-output-validation-set` | Reviewed question bank + assessment | Domain 2 — **verified mapping** to all six objectives | Six objectives are **Verified** in G; bank covers all six, with bias treated as framing/equal treatment only | Technical claims **Verified** against R, E, PB, SO, AR and CC on 2026-10-26 | **Published** | 14 original items (8 single-choice, 6 multiple-response); all six objectives have at least two items | G, R, E, PB, SO, AR, CC |
| `domain-1-prompting-set` | Reviewed question bank + assessment | Domain 1 — **verified mapping** to `prompting-create-effective-prompts` and `prompting-task-decomposition` | Both objectives are **Verified** in G | Technical claims **Verified** against PB and E on 2026-10-26 | **Published** | 2 original items (1 single-choice, 1 multiple-response) | G, PB, E |
| `domain-3-context-set` | Reviewed question bank + assessment | Domain 3 — **verified mapping** to `context-memory-management` only | Objective is **Verified** in G; the lesson sample remains unmapped | Technical claims **Verified** against D on 2026-10-26 | **Published** | 2 original items (1 single-choice, 1 multiple-response) | G, D |
| `domain-4-workflow-set` | Reviewed question bank + assessment | Domain 4 — **verified mapping** to `workflow-requirements-analysis` and `workflow-integrate` | Both objectives are **Verified** in G | Technical claims **Verified** against E, PB and CC on 2026-10-26 | **Published** | 2 original items (1 single-choice, 1 multiple-response) | G, E, PB, CC |
| `domain-6-governance-set` | Reviewed question bank + assessment | Domain 6 — **verified mapping** to `governance-use-case-fit` and `governance-ethics` | Both objectives are **Verified** in G | Technical claims **Verified** against CC and R on 2026-10-26; review principles only, not legal advice | **Published** | 2 original items (1 single-choice, 1 multiple-response) | G, CC, R |
| `domain-7-troubleshooting-set` | Reviewed question bank + assessment | Domain 7 — **verified mapping** to `troubleshoot-diagnose` and `troubleshoot-adjust` | Both objectives are **Verified** in G | Technical claims **Verified** against PB and E on 2026-10-26 | **Published** | 2 original items (1 single-choice, 1 multiple-response) | G, PB, E |
| `mixed-foundations-set` | Reviewed question bank + assessment | Domains 1, 2, 3, 4, 6, 7 — **verified mappings** of all 24 bank items | Six domains **Verified**; Domain 5 absent | Same per-item verification as the domain sets | **Published** | 24 original items across six domains; explicitly not a mock exam | G plus per-item sources |
| `prompt-structure` | Planned lesson | Domain 1 — **planned**, not reviewed | Domain **Verified** | None yet | **Planned** | Roadmap only | G |
| `workflow-design` | Planned lesson | Domain 4 — **planned**, not reviewed | Domain **Verified** | None yet | **Planned** | Roadmap only | G |

## Objective coverage

All objectives below are **Verified** as exam scope from G §6. “Version” records the guide version
that governs the wording. “General-knowledge safety” records whether the topic can be taught from
official product documentation without pretending to know the live item bank.

### Domain 1 — Prompting and Task Execution (14%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `prompting-create-effective-prompts` | Create effective prompts for business and technical tasks | **Verified** | **1 reviewed bank item** | `prompting-specific-brief`; no mapped lesson yet | Safe: official prompting guidance and worked examples | v1.0 + PB |
| `prompting-task-decomposition` | Apply task decomposition techniques to structure complex requests | **Verified** | **1 reviewed bank item** | `prompting-decompose-steps`; no mapped lesson yet | Safe: general decomposition patterns; examples must be original | v1.0 + PB, E |
| `prompting-iterate` | Iterate prompts to improve output quality | **Verified** | **Not started** | `prompt-structure` may cover part of this | Safe: iterative prompting is general practice | v1.0 |
| `prompting-adapt-strategies` | Adapt prompting strategies based on task type (analysis, research, drafting, brainstorming) | **Verified** | **Not started** | None | Safe: teach task-type trade-offs with original scenarios | v1.0 |

### Domain 2 — Output Evaluation and Validation (21%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `output-evaluate-accuracy` | Evaluate Claude-generated outputs for accuracy and completeness | **Verified** | **Reviewed lesson + 2 bank items** | `evaluation-basics` plus accuracy/completeness practice | Safe: evaluation guidance plus source-backed review practice | v1.0 + E, R |
| `output-identify-hallucinations` | Identify hallucinations, inconsistencies, and biases in responses | **Verified** | **Reviewed lesson + 4 bank items** (2 hallucination/inconsistency + 2 bias) | `evaluation-basics` plus practice | Hallucination and inconsistency are source-backed by R; bias is limited to framing and equal-treatment principles in CC, not a comprehensive fairness audit | v1.0 + R, CC |
| `output-fact-check` | Apply fact-checking and validation techniques | **Verified** | **Reviewed lesson + 2 bank items** | `evaluation-basics` plus practice | Safe: source-checking and retraction workflow from official documentation | v1.0 + R |
| `output-human-review` | Determine when human review or additional verification is required | **Verified** | **Reviewed lesson + 2 bank items** | `evaluation-basics` plus risk-based escalation practice | Safe: high-stakes validation and expert-judgment guidance from R and E, applied as review principles rather than legal or medical advice | v1.0 + R, E |
| `output-edit-adapt` | Edit, adapt, refine, and compare outputs for the intended audience | **Verified** | **Reviewed lesson + 2 bank items** | `evaluation-basics` plus audience-editing and draft-comparison practice | Safe: tone/style, relevance, and target-audience criteria from E and PB; factual claims still checked against sources | v1.0 + E, PB, R |
| `output-format-selection` | Organize and curate information and select appropriate output formats (artifacts, inline, structured data) | **Verified** | **Reviewed lesson + 2 bank items** | `evaluation-basics` plus format-choice practice | Safe with current-doc check: SO and AR support structured-vs-document reasoning; availability and UI details are time-sensitive | v1.0 + SO, AR, PB |

### Domain 3 — Product and Model Selection (12%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `product-feature-selection` | Select appropriate Claude product features (Projects, research mode, chat, artifacts) | **Verified** | **Not started** | None | Safe with current-doc check: product surface changes faster than the guide | v1.0 + current docs |
| `model-family-selection` | Differentiate between Claude model types (Haiku, Sonnet, Opus) | **Verified** | **Not started** | None | Principles safe; v1.0 names these three families. Current documentation may list additional models, so do not claim the public lineup is frozen | v1.0 + current docs |
| `model-task-fit` | Align model selection with task requirements (cost, speed, quality) | **Verified** | **Not started** | None | Safe: teach the trade-off, not a fixed “best model” rule | v1.0 + current docs |
| `context-memory-management` | Understand and manage context limitations and memory considerations (when to restart, summarize, or persist) | **Verified** | **2 reviewed bank items**; the `context-window` lesson remains **unmapped** | `context-summarize-and-restart`, `context-high-signal-practices`; rewrite the lesson for the Associate audience before claiming a mapped lesson | Technical background is safe from D; the current API-heavy sample is not yet Associate-level curriculum | v1.0 + D |

### Domain 4 — Workflow Integration and Solution Design (16%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `workflow-requirements-analysis` | Apply Claude to analyze requirements and use cases | **Verified** | **1 reviewed bank item** | `workflow-requirements-extraction`; no mapped lesson yet | Safe: original business scenarios | v1.0 + E, PB |
| `workflow-research-planning` | Leverage Claude for research, planning, and process optimization | **Verified** | **Not started** | `workflow-design` may cover part of this | Safe: general workflow patterns; validate facts with sources | v1.0 |
| `workflow-solution-design` | Use Claude to support solution design, development, and iteration | **Verified** | **Not started** | `workflow-design` may cover part of this | Safe: keep examples non-technical and role-appropriate | v1.0 |
| `workflow-integrate` | Integrate Claude into existing workflows to augment or redesign them | **Verified** | **1 reviewed bank item** | `workflow-integration-checkpoints`; no mapped lesson yet | Safe: process mapping and human checkpoints | v1.0 + E, CC |
| `workflow-stakeholder-communication` | Communicate Claude's value and limitations to stakeholders | **Verified** | **Not started** | None | Safe: communication exercise, not a promise of business results | v1.0 |

### Domain 5 — Configuration and Knowledge Management (12%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `config-project-instructions` | Configure Claude Projects with instructions and knowledge sources | **Verified** | **Not started** | None | Safe with current-doc check: Projects UI and limits can change | v1.0 + current docs |
| `config-knowledge-connectors` | Manage uploaded knowledge and connectors (e.g., Google Drive, Gmail) | **Verified** | **Not started** | None | Safe with current-doc check: connector availability is plan- and region-dependent | v1.0 + current docs |
| `config-system-instructions` | Create effective system-level instructions | **Verified** | **Not started** | None | Safe: general instruction design; distinguish product settings from API system prompts | v1.0 |
| `config-maintain` | Inform, maintain, and update Claude configurations, knowledge sources, and instructions | **Verified** | **Not started** | None | Safe: maintenance checklist and review cadence | v1.0 |

### Domain 6 — Governance, Risk, and Responsible Use (15%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `governance-use-case-fit` | Identify appropriate and inappropriate use cases | **Verified** | **1 reviewed bank item** | `governance-customer-assistant-safeguards`; no mapped lesson yet | Safe: general use-case triage | v1.0 + CC |
| `governance-data-privacy` | Apply data sensitivity, regulatory, and privacy considerations | **Verified** | **Not started** | None | **Principles only:** do not give legal advice; cite organizational policy and official privacy material | v1.0 + organizational policy |
| `governance-policies` | Follow organizational AI policies and governance standards | **Verified** | **Not started** | None | **Principles only:** policy specifics vary by organization | v1.0 + organizational policy |
| `governance-ethics` | Understand the ethical implications of AI usage | **Verified** | **1 reviewed bank item** | `governance-human-oversight`; no mapped lesson yet | Safe: general responsible-use reasoning, clearly framed as judgment | v1.0 + CC, R |

### Domain 7 — Troubleshooting and Optimization (10%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `troubleshoot-diagnose` | Identify, diagnose, and resolve issues with underperforming prompts or poor outputs | **Verified** | **1 reviewed bank item** | `troubleshoot-diagnose-prompt`; no mapped lesson yet | Safe: diagnostic checklist based on general prompting and review practice | v1.0 + PB, E |
| `troubleshoot-adjust` | Adjust approach based on feedback and results | **Verified** | **1 reviewed bank item** | `troubleshoot-feedback-loop`; no mapped lesson yet | Safe: iteration loop with original examples | v1.0 + E, PB |
| `optimize-workflows` | Optimize workflows for efficiency and effectiveness | **Verified** | **Not started** | None | Safe: measure before/after; avoid invented metrics | v1.0 |

## Question-bank coverage

| Question | Type | Domain / objective | Status | Notes |
|---|---|---|---|---|
| `prompting-specific-brief` | Single-choice | Domain 1 · `prompting-create-effective-prompts` | **Reviewed / published** | Original item on replacing a vague launch-email request with goal, audience, facts, constraints, and format. |
| `prompting-decompose-steps` | Multiple-response | Domain 1 · `prompting-task-decomposition` | **Reviewed / published** | Exact-set item on outlining first, defining intermediate artifacts, and reconciling independent sub-tasks. |
| `output-accuracy-review-plan` | Single-choice | Domain 2 · `output-evaluate-accuracy` | **Reviewed / published** | Original item on verifying claims and checking required sections, risks, and edge cases. |
| `output-accurate-but-incomplete` | Single-choice | Domain 2 · `output-evaluate-accuracy` | **Reviewed / published** | Original item distinguishing factual accuracy from missing required information. |
| `output-fabricated-policy-detail` | Single-choice | Domain 2 · `output-identify-hallucinations` | **Reviewed / published** | Original item on a fabricated section that contradicts the supplied policy. |
| `output-hallucination-signals` | Multiple-response | Domain 2 · `output-identify-hallucinations` | **Reviewed / published** | Exact-set item on unsupported claims, inconsistency, and wrong source details. |
| `output-fact-check-retention` | Single-choice | Domain 2 · `output-fact-check` | **Reviewed / published** | Original item on quoting the source passage and retracting unsupported claims. |
| `output-reduce-unsupported-claims` | Multiple-response | Domain 2 · `output-fact-check` | **Reviewed / published** | Exact-set item on source restriction, quote-first grounding, and verify/retract. |
| `output-human-review-high-stakes` | Single-choice | Domain 2 · `output-human-review` | **Reviewed / published** | Original item on clinician verification before using AI-drafted medication instructions. |
| `output-human-review-triggers` | Multiple-response | Domain 2 · `output-human-review` | **Reviewed / published** | Exact-set item on high-stakes, conflicting-source, and obsolete-source escalation triggers. |
| `output-edit-preserve-facts` | Single-choice | Domain 2 · `output-edit-adapt` | **Reviewed / published** | Original item on adapting an incident summary for executives without factual drift. |
| `output-compare-customer-faq-drafts` | Multiple-response | Domain 2 · `output-edit-adapt` | **Reviewed / published** | Exact-set item on source checks, audience criteria, and merge/re-check discipline. |
| `output-format-fit-deliverable` | Single-choice | Domain 2 · `output-format-selection` | **Reviewed / published** | Original item on matching structured data, executive prose, and an editable artifact to three deliverables. |
| `output-format-decisions` | Multiple-response | Domain 2 · `output-format-selection` | **Reviewed / published** | Exact-set item on JSON for downstream parsing, inline answers for short updates, and artifacts for reusable documents. |
| `output-bias-one-sided-framing` | Single-choice | Domain 2 · `output-identify-hallucinations` | **Reviewed / published** | Original item on one-sided evidence, loaded labels, and omitted contrary analysis in a policy summary. |
| `output-bias-unequal-standards` | Multiple-response | Domain 2 · `output-identify-hallucinations` | **Reviewed / published** | Exact-set item distinguishing unequal standards and protected-characteristic assumptions from style, completeness, and hallucination. |
| `context-summarize-and-restart` | Single-choice | Domain 3 · `context-memory-management` | **Reviewed / published** | Original item on summarizing durable facts and decisions before restarting a long support context. |
| `context-high-signal-practices` | Multiple-response | Domain 3 · `context-memory-management` | **Reviewed / published** | Exact-set item on retrieving relevant material, summarizing older turns, and removing stale context. |
| `workflow-requirements-extraction` | Single-choice | Domain 4 · `workflow-requirements-analysis` | **Reviewed / published** | Original item on extracting and validating requirements before proposing a solution. |
| `workflow-integration-checkpoints` | Multiple-response | Domain 4 · `workflow-integrate` | **Reviewed / published** | Exact-set item on process mapping, human checkpoints, and piloting with measurement. |
| `governance-human-oversight` | Single-choice | Domain 6 · `governance-ethics` | **Reviewed / published** | Original item on AI recommending an expense decision while a human remains accountable. |
| `governance-customer-assistant-safeguards` | Multiple-response | Domain 6 · `governance-use-case-fit` | **Reviewed / published** | Exact-set item on prohibited uses, AI disclosure, and fairness checks for a customer-facing assistant. |
| `troubleshoot-diagnose-prompt` | Single-choice | Domain 7 · `troubleshoot-diagnose` | **Reviewed / published** | Original item on inspecting the prompt and inputs before changing models or sampling settings. |
| `troubleshoot-feedback-loop` | Multiple-response | Domain 7 · `troubleshoot-adjust` | **Reviewed / published** | Exact-set item on success criteria, baseline comparison, and failure-cause analysis. |
| `context-window-root-cause` | Single-choice | **Unmapped** | **Sample, runnable in its lesson** | Tests a general context-budgeting decision; not official exam content. Its `context-window-sample` definition remains in the pack but `/practice` does not surface it. |
| Multiple-response example | Multiple-response | Test fixture only | **Tested, not authored as curriculum** | Proves schema validation, exact-set scoring, and UI set-scoring; not part of a lesson |

No official sample questions from the guide were copied. The three published samples in Guide §8 are
used only for format calibration; product questions must be original.

The assessment core is not coverage. It makes authored questions runnable. The matrix records
**15 / 30** objectives with reviewed practice items and **6 / 30** objectives with a reviewed,
exam-mapped lesson. Domain 2 is the only domain with a mapped lesson; the other nine covered objectives
have bank items but no mapped lesson. Domain 5 has no items at all. No objective is claimed to be
exhaustively covered.

## What the product may and may not claim

**May claim now**

- The exam is CCAO-F, 60 items, 120 minutes, with multiple-choice and multiple-response items.
- The passing scaled score is 720 on a 100–1,000 scale.
- There are seven verified domains with the published weights and 30 verified objectives.
- The Context Window lesson's technical explanation is source-checked against Anthropic docs.
- The sample knowledge check is an original practice item, not an official question.
- The assessment core scores single-choice and multiple-response items deterministically with
  exact-set matching, no partial credit, and a practice-only raw percentage.
- The Domain 2 lesson `evaluation-basics` is published, mapped to all six verified Domain 2
  objectives, and links to reviewed bank questions.
- The bank contains **24 original, reviewed items** across six domains, split into 13 single-choice
  and 11 multiple-response items, each with Vietnamese explanations for every option.
- Bias is taught and assessed only at the framing/evidence-selection/equal-treatment level supported
  by Claude's Constitution. The bank does not claim a comprehensive fairness evaluation.
- Practice Mode is registry-driven: seven sets (six domain sets plus one mixed set) are validated
  against the reviewed bank, support deep links, and persist attempts locally.
- The Review queue is derived from submitted attempts and includes incorrect, unanswered, and
  flagged questions; an item is resolved only by an explicit action.
- Progress separates reviewed-bank coverage from personal performance and shows a real zero-activity
  state instead of a fabricated score.
- The mock-exam preview selects **24 of the verified 60-item format** by blueprint weight, reports
  the 36-item shortfall, and adds no filler or duplicates. It has no timer and no scaled score.

**May not claim**

- That any domain or objective is fully “covered” by a reviewed lesson or question bank.
- That the 24-item bank is an exhaustive or official exam simulation. It is small, Domain 5 is
  absent, 15 objectives have no items, and nine covered objectives have no mapped lesson.
- That the sample lesson is mapped to Domain 3.
- That the 60 items are all scored, or that any per-domain item count is official.
- That the product contains an official practice exam or official questions.
- That the mock-exam preview is a 60-item exam, a timed simulation, or a readiness predictor.
- That the 2026-11-17 / 2026-12-07 revised blueprint has been applied.
- That the Haiku/Sonnet/Opus list is the complete current public model lineup.

## Next coverage work

1. Cover Domain 5 (`config-*`, 12% of the exam) — currently **zero** reviewed items and zero lessons.
2. Expand the remaining uncovered objectives: Domain 1 (`iterate`, `adapt-strategies`), Domain 3
   (`product-feature-selection`, `model-family-selection`, `model-task-fit`), Domain 4
   (`research-planning`, `solution-design`, `stakeholder-communication`), Domain 6 (`data-privacy`,
   `policies`), and Domain 7 (`optimize-workflows`).
3. Rewrite the Context Window sample for the Associate audience, then decide whether it can be
   verified against Domain 3's `context-memory-management` objective.
4. Add mapped lessons for the domains that currently have only bank items, starting with Domain 1
   and Domain 4.
5. Grow the bank toward a full 60-item mock form without duplicating items or inventing filler.
6. Keep `src/test/question-bank.test.ts` and `src/test/domain-2-content.test.tsx` as the gate: every
   bank entry must map to a verified blueprint objective and cite registered sources, and every
   lesson-linked question must resolve.
