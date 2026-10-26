# Content Coverage Matrix

**Verification date:** 2026-10-26  
**Blueprint:** CCAO-F Exam Guide v1.0, effective July 2026  
**Applicable attempt:** before 2026-11-14 (do not apply the 2026-11-17 / 2026-12-07 revision)  
**Source of exam scope:** `docs/EXAM_BLUEPRINT.md`

This matrix separates three different things:

1. **Exam scope** — is the topic really in the official blueprint?
2. **Content coverage** — do we have a reviewed lesson and original practice items for it?
3. **General-knowledge safety** — can the topic be taught from official Claude documentation
   without overstating what the exam will ask?

A verified objective is **not** coverage. Today the product has one technical sample lesson, no
exam-mapped curriculum lesson, and no reviewed question bank.

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

## Coverage summary

| Measure | Result |
|---|---|
| Official domains identified | **7 / 7 verified** |
| Official objectives identified | **30 / 30 verified** for exam scope |
| Objectives with a reviewed, exam-mapped lesson | **0 / 30** |
| Objectives with reviewed original practice items | **0 / 30** |
| Published lessons | **1** design sample, explicitly unmapped |
| Authored questions | **1 single-choice** sample |
| Authored multiple-response questions | **0** (schema and UI support are tested) |
| Planned lessons | **3**, none routable |
| Question bank status | **Not started**; no official questions copied |
| Future guide revision | **Not applicable** to the pre-2026-11-14 attempt |

## Current content

| Item | Type | Exam mapping | Exam scope status | Content verification | Content status | Coverage | Sources |
|---|---|---|---|---|---|---|---|
| `context-window` | Sample lesson | **Unmapped**. It has a plausible relationship to Domain 3's context/memory objective, but that mapping has **not** been reviewed and is not claimed | Related objective is **Verified** in G; the lesson itself is **not** exam coverage | Technical claims **Verified** against D on 2026-10-26 | **Published as a sample** | 1 lesson, 1 single-choice question; no multiple-response item | D |
| `prompt-structure` | Planned lesson | Domain 1 — **planned**, not reviewed | Domain **Verified** | None yet | **Planned** | Roadmap only | G |
| `evaluation-basics` | Planned lesson | Domain 2 — **planned**, not reviewed | Domain **Verified** | None yet | **Planned** | Roadmap only | G |
| `workflow-design` | Planned lesson | Domain 4 — **planned**, not reviewed | Domain **Verified** | None yet | **Planned** | Roadmap only | G |

## Objective coverage

All objectives below are **Verified** as exam scope from G §6. “Version” records the guide version
that governs the wording. “General-knowledge safety” records whether the topic can be taught from
official product documentation without pretending to know the live item bank.

### Domain 1 — Prompting and Task Execution (14%)

| Topic ID | Official objective | Exam scope | Content status | Planned coverage | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `prompting-create-effective-prompts` | Create effective prompts for business and technical tasks | **Verified** | **Not started** | `prompt-structure` may cover part of this | Safe: official prompting guidance and worked examples | v1.0 |
| `prompting-task-decomposition` | Apply task decomposition techniques to structure complex requests | **Verified** | **Not started** | None | Safe: general decomposition patterns; examples must be original | v1.0 |
| `prompting-iterate` | Iterate prompts to improve output quality | **Verified** | **Not started** | `prompt-structure` may cover part of this | Safe: iterative prompting is general practice | v1.0 |
| `prompting-adapt-strategies` | Adapt prompting strategies based on task type (analysis, research, drafting, brainstorming) | **Verified** | **Not started** | None | Safe: teach task-type trade-offs with original scenarios | v1.0 |

### Domain 2 — Output Evaluation and Validation (21%)

| Topic ID | Official objective | Exam scope | Content status | Planned coverage | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `output-evaluate-accuracy` | Evaluate Claude-generated outputs for accuracy and completeness | **Verified** | **Not started** | `evaluation-basics` may cover part of this | Safe: general evaluation and review practice | v1.0 |
| `output-identify-hallucinations` | Identify hallucinations, inconsistencies, and biases in responses | **Verified** | **Not started** | `evaluation-basics` may cover part of this | Safe: official docs and general AI-literacy material; distinguish example from claim | v1.0 |
| `output-fact-check` | Apply fact-checking and validation techniques | **Verified** | **Not started** | `evaluation-basics` may cover part of this | Safe: source-checking workflow; do not invent citations | v1.0 |
| `output-human-review` | Determine when human review or additional verification is required | **Verified** | **Not started** | None | Safe: risk-based escalation principles | v1.0 |
| `output-edit-adapt` | Edit, adapt, refine, and compare outputs for the intended audience | **Verified** | **Not started** | None | Safe: editorial comparison exercises | v1.0 |
| `output-format-selection` | Organize and curate information and select appropriate output formats (artifacts, inline, structured data) | **Verified** | **Not started** | None | Safe with current-doc check: feature names and availability are time-sensitive | v1.0 + current docs |

### Domain 3 — Product and Model Selection (12%)

| Topic ID | Official objective | Exam scope | Content status | Planned coverage | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `product-feature-selection` | Select appropriate Claude product features (Projects, research mode, chat, artifacts) | **Verified** | **Not started** | None | Safe with current-doc check: product surface changes faster than the guide | v1.0 + current docs |
| `model-family-selection` | Differentiate between Claude model types (Haiku, Sonnet, Opus) | **Verified** | **Not started** | None | Principles safe; v1.0 names these three families. Current documentation may list additional models, so do not claim the public lineup is frozen | v1.0 + current docs |
| `model-task-fit` | Align model selection with task requirements (cost, speed, quality) | **Verified** | **Not started** | None | Safe: teach the trade-off, not a fixed “best model” rule | v1.0 + current docs |
| `context-memory-management` | Understand and manage context limitations and memory considerations (when to restart, summarize, or persist) | **Verified** | **Sample only** — `context-window`, **unmapped** | Rebuild for the Associate audience; then review against this objective | Technical background is safe from D; the current API-heavy sample is not yet Associate-level curriculum | v1.0 + D |

### Domain 4 — Workflow Integration and Solution Design (16%)

| Topic ID | Official objective | Exam scope | Content status | Planned coverage | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `workflow-requirements-analysis` | Apply Claude to analyze requirements and use cases | **Verified** | **Not started** | `workflow-design` may cover part of this | Safe: original business scenarios | v1.0 |
| `workflow-research-planning` | Leverage Claude for research, planning, and process optimization | **Verified** | **Not started** | `workflow-design` may cover part of this | Safe: general workflow patterns; validate facts with sources | v1.0 |
| `workflow-solution-design` | Use Claude to support solution design, development, and iteration | **Verified** | **Not started** | `workflow-design` may cover part of this | Safe: keep examples non-technical and role-appropriate | v1.0 |
| `workflow-integrate` | Integrate Claude into existing workflows to augment or redesign them | **Verified** | **Not started** | `workflow-design` may cover part of this | Safe: process mapping and human checkpoints | v1.0 |
| `workflow-stakeholder-communication` | Communicate Claude's value and limitations to stakeholders | **Verified** | **Not started** | None | Safe: communication exercise, not a promise of business results | v1.0 |

### Domain 5 — Configuration and Knowledge Management (12%)

| Topic ID | Official objective | Exam scope | Content status | Planned coverage | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `config-project-instructions` | Configure Claude Projects with instructions and knowledge sources | **Verified** | **Not started** | None | Safe with current-doc check: Projects UI and limits can change | v1.0 + current docs |
| `config-knowledge-connectors` | Manage uploaded knowledge and connectors (e.g., Google Drive, Gmail) | **Verified** | **Not started** | None | Safe with current-doc check: connector availability is plan- and region-dependent | v1.0 + current docs |
| `config-system-instructions` | Create effective system-level instructions | **Verified** | **Not started** | None | Safe: general instruction design; distinguish product settings from API system prompts | v1.0 |
| `config-maintain` | Inform, maintain, and update Claude configurations, knowledge sources, and instructions | **Verified** | **Not started** | None | Safe: maintenance checklist and review cadence | v1.0 |

### Domain 6 — Governance, Risk, and Responsible Use (15%)

| Topic ID | Official objective | Exam scope | Content status | Planned coverage | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `governance-use-case-fit` | Identify appropriate and inappropriate use cases | **Verified** | **Not started** | None | Safe: general use-case triage | v1.0 |
| `governance-data-privacy` | Apply data sensitivity, regulatory, and privacy considerations | **Verified** | **Not started** | None | **Principles only:** do not give legal advice; cite organizational policy and official privacy material | v1.0 + organizational policy |
| `governance-policies` | Follow organizational AI policies and governance standards | **Verified** | **Not started** | None | **Principles only:** policy specifics vary by organization | v1.0 + organizational policy |
| `governance-ethics` | Understand the ethical implications of AI usage | **Verified** | **Not started** | None | Safe: general responsible-use reasoning, clearly framed as judgment | v1.0 |

### Domain 7 — Troubleshooting and Optimization (10%)

| Topic ID | Official objective | Exam scope | Content status | Planned coverage | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `troubleshoot-diagnose` | Identify, diagnose, and resolve issues with underperforming prompts or poor outputs | **Verified** | **Not started** | None | Safe: diagnostic checklist based on general prompting and review practice | v1.0 |
| `troubleshoot-adjust` | Adjust approach based on feedback and results | **Verified** | **Not started** | None | Safe: iteration loop with original examples | v1.0 |
| `optimize-workflows` | Optimize workflows for efficiency and effectiveness | **Verified** | **Not started** | None | Safe: measure before/after; avoid invented metrics | v1.0 |

## Question-bank coverage

| Question | Type | Domain / objective | Status | Notes |
|---|---|---|---|---|
| `context-window-root-cause` | Single-choice | **Unmapped** | **Sample** | Tests a general context-budgeting decision; not official exam content |
| Multiple-response example | Multiple-response | Test fixture only | **Tested, not authored as curriculum** | Proves schema validation and UI set-scoring; not part of a lesson |

No official sample questions from the guide were copied. The three published samples in Guide §8 are
used only for format calibration; product questions must be original.

## What the product may and may not claim

**May claim now**

- The exam is CCAO-F, 60 items, 120 minutes, with multiple-choice and multiple-response items.
- The passing scaled score is 720 on a 100–1,000 scale.
- There are seven verified domains with the published weights and 30 verified objectives.
- The Context Window lesson's technical explanation is source-checked against Anthropic docs.
- The sample knowledge check is an original practice item, not an official question.

**May not claim**

- That any domain or objective is “covered” by a reviewed lesson or question bank.
- That the sample lesson is mapped to Domain 3.
- That the 60 items are all scored, or that any per-domain item count is official.
- That the product contains an official practice exam or official questions.
- That the 2026-11-17 / 2026-12-07 revised blueprint has been applied.
- That the Haiku/Sonnet/Opus list is the complete current public model lineup.

## Next coverage work

1. Rewrite the Context Window sample for the Associate audience, then decide whether it can be
   verified against Domain 3's `context-memory-management` objective.
2. Author Domain 2 first: it has the largest weight (21%) and no content.
3. Build the assessment engine before scaling the bank, so every new item can be exercised in
   practice, mock exam, and review modes.
4. Add a per-lesson coverage test that fails when a lesson claims an objective id that is not in the
   matching blueprint version.
