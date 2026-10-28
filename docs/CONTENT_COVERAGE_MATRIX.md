# Content Coverage Matrix

**Matrix updated:** 2026-10-27
**Source access dates:** 2026-10-26 for the original sources; 2026-10-27 for the Domain 5,
workflow-design, Domain 3/4/6/7 lesson, and coverage-depth sources listed in the source key
**Blueprint:** CCAO-F Exam Guide v1.0, effective July 2026  
**Applicable attempt:** before 2026-11-14 (do not apply the 2026-11-17 / 2026-12-07 revision)  
**Source of exam scope:** `docs/EXAM_BLUEPRINT.md`

This matrix separates three different things:

1. **Exam scope** — is the topic really in the official blueprint?
2. **Content coverage** — do we have a reviewed lesson and original practice items for it?
3. **General-knowledge safety** — can the topic be taught from official Claude documentation
   without overstating what the exam will ask?

A verified objective is **not** coverage. Today the product has one technical sample lesson, seven
exam-mapped curriculum lessons, and a **62-item reviewed bank** spanning all seven domains and
**all 30 objectives**. Every official objective has a mapped lesson and at least two reviewed
practice items. That is reviewed content, not a claim that any domain is exhausted or that the bank
is a full exam simulation.

## Legend

| Status | Meaning |
|---|---|
| **Verified** | Read in an official Anthropic or Pearson VUE source on 2026-10-26 or 2026-10-27 |
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
| **BA** | [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (official Anthropic Engineering, read 2026-10-27; the page notes that its December 2024 tooling details have changed, so only the workflow patterns, simplicity, measurement, and checkpoint guidance are used) |
| **SO** | [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) (official Anthropic documentation, read 2026-10-26) |
| **AR** | [What are artifacts and how do I use them?](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them) (official Anthropic Help Center, read 2026-10-26) |
| **CC** | [Claude's Constitution](https://www.anthropic.com/constitution) (official Anthropic publication, read 2026-10-26) |
| **PJ** | [What are projects?](https://support.claude.com/en/articles/9517075-what-are-projects) and [How can I create and manage projects?](https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects) (official Anthropic Help Center, read 2026-10-27) |
| **RG** | [Retrieval augmented generation (RAG) for projects](https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects) (official Anthropic Help Center, read 2026-10-27) |
| **CN** | [Use connectors to extend Claude's capabilities](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities) and [Use Google Workspace connectors](https://support.claude.com/en/articles/10166901-use-google-workspace-connectors) (official Anthropic Help Center, read 2026-10-27) |
| **RS** | [Use research on Claude](https://support.claude.com/en/articles/11088861-use-research-on-claude) (official Anthropic Help Center, read 2026-10-27) |
| **MD** | [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview) and [Choosing the right model](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model) (official Anthropic documentation, read 2026-10-27) |
| **PP** | [Privacy Policy](https://www.anthropic.com/legal/privacy) and [Usage Policy](https://www.anthropic.com/aup) (official Anthropic legal pages, read 2026-10-27) |

The Help Center pages under **PJ**, **RG**, **CN**, and **RS** are JavaScript-rendered: a direct fetch
returned only navigation chrome, so their body text was read through search-result extracts on
2026-10-27. Treat product UI steps from those pages as time-sensitive and re-check them before
repeating exact menu paths.

## Coverage summary

| Measure | Result |
|---|---|
| Official domains identified | **7 / 7 verified** |
| Official objectives identified | **30 / 30 verified** for exam scope |
| Objectives with a reviewed, exam-mapped lesson | **30 / 30** (all seven domains) |
| Objectives with reviewed original practice items | **30 / 30**, at least two items each |
| Domains with at least one reviewed bank item | **7 / 7** |
| Published lessons | **8** (7 exam-mapped curriculum lessons + 1 explicitly unmapped design sample) |
| Authored questions | **70** (8 lesson questions + 62 reviewed bank items) |
| Reviewed bank items | **62** (32 single-choice, 30 multiple-response) |
| Assessment definitions | **9 registry assessments** (1 sample, 7 domain sets, 1 mixed) **+ 1 derived mock-exam preview** |
| Practice sets | **8** (7 domain sets + 1 mixed set) |
| Mock-exam preview | **60 of 60** verified-format slots, shortfall **0**; 62 reviewed items available, 2 not selected, blueprint-weighted, no filler |
| Assessment core | **Implemented** (Phase C2.1); persistence, review queue, progress, and mock preview in Phase C2.3 |
| Planned lessons | **0**; all seven domains now have a published mapped lesson |
| Question bank status | **62 reviewed, exam-mapped items** across all 30 objectives; no official questions copied |
| Future guide revision | **Not applicable** to the pre-2026-11-14 attempt |

## Current content

| Item | Type | Exam mapping | Exam scope status | Content verification | Content status | Coverage | Sources |
|---|---|---|---|---|---|---|---|
| `context-window` | Sample lesson | **Unmapped**. It has a plausible relationship to Domain 3's context/memory objective, but that mapping has **not** been reviewed and is not claimed | Related objective is **Verified** in G; the lesson itself is **not** exam coverage | Technical claims **Verified** against D on 2026-10-26 | **Published as a sample** | 1 lesson, 1 single-choice question, 1 sample assessment definition; no multiple-response item | D |
| `evaluation-basics` | Curriculum lesson | Domain 2 — **verified mapping** to all six objectives | Six objectives are **Verified** in G; the lesson is exam-mapped | Technical claims **Verified** against R, E, PB, SO, AR and CC on 2026-10-26; bias remains policy-level | **Published** | 1 lesson, 1 single-choice knowledge check, 7 linked reviewed bank questions; route `/learn/evaluation-basics` | G, R, E, PB, SO, AR, CC |
| `configuration-basics` | Curriculum lesson | Domain 5 — **verified mapping** to all four objectives | Four objectives are **Verified** in G; the lesson is exam-mapped | Technical claims **Verified** against PJ, RG, CN and PB on 2026-10-27; project limits and connector UI marked time-sensitive | **Published** | 1 lesson, 1 single-choice knowledge check, 8 linked reviewed bank questions; route `/learn/configuration-basics` | G, PJ, RG, CN, PB |
| `prompt-structure` | Curriculum lesson | Domain 1 — **verified mapping** to all four objectives | Four objectives are **Verified** in G; the lesson is exam-mapped | Technical claims **Verified** against PB and E on 2026-10-27; model names kept generic | **Published** | 1 lesson, 1 single-choice knowledge check, 8 linked reviewed bank questions; route `/learn/prompt-structure` | G, PB, E |
| `product-selection` | Curriculum lesson | Domain 3 — **verified mapping** to all four objectives | Four objectives are **Verified** in G; the lesson is exam-mapped | Technical claims **Verified** against PJ, RG, RS, AR, MD and D on 2026-10-27; product UI and model details marked time-sensitive | **Published** | 1 lesson, 1 single-choice knowledge check, 8 linked reviewed bank questions; route `/learn/product-selection` | G, PJ, RG, RS, AR, MD, D |
| `workflow-design` | Curriculum lesson | Domain 4 — **verified mapping** to all five objectives | Five objectives are **Verified** in G; the lesson is exam-mapped | Technical claims **Verified** against BA, E, PB, RS, CC and PP on 2026-10-27; tooling details from BA are not used | **Published** | 1 lesson, 1 single-choice knowledge check, 10 linked reviewed bank questions; route `/learn/workflow-design` | G, BA, E, PB, RS, CC, PP |
| `governance-responsible-use` | Curriculum lesson | Domain 6 — **verified mapping** to all four objectives | Four objectives are **Verified** in G; the lesson is exam-mapped | Technical claims **Verified** against CC, PP, R, E and CN on 2026-10-27; review principles only, not legal advice | **Published** | 1 lesson, 1 single-choice knowledge check, 8 linked reviewed bank questions; route `/learn/governance-responsible-use` | G, CC, PP, R, E, CN |
| `troubleshooting-optimization` | Curriculum lesson | Domain 7 — **verified mapping** to all three objectives | Three objectives are **Verified** in G; the lesson is exam-mapped | Technical claims **Verified** against E, PB, R, D, MD and BA on 2026-10-27; optimization trade-offs taught as measurement, not fixed limits | **Published** | 1 lesson, 1 single-choice knowledge check, 6 linked reviewed bank questions; route `/learn/troubleshooting-optimization` | G, E, PB, R, D, MD, BA |
| `domain-2-output-validation-set` | Reviewed question bank + assessment | Domain 2 — **verified mapping** to all six objectives | Six objectives are **Verified** in G; bank covers all six, with bias treated as framing/equal treatment only | Technical claims **Verified** against R, E, PB, SO, AR and CC on 2026-10-26 | **Published** | 14 original items (8 single-choice, 6 multiple-response); all six objectives have at least two items | G, R, E, PB, SO, AR, CC |
| `domain-1-prompting-set` | Reviewed question bank + assessment | Domain 1 — **verified mapping** to all four objectives | Four objectives are **Verified** in G | Technical claims **Verified** against PB, E and BA on 2026-10-27 | **Published** | 8 original items (4 single-choice, 4 multiple-response); every Domain 1 objective has two items | G, PB, E, BA |
| `domain-3-context-set` | Reviewed question bank + assessment | Domain 3 — **verified mapping** to all four objectives | Four objectives are **Verified** in G; the `context-window` sample remains unmapped | Technical claims **Verified** against D, MD, PJ, RS, AR and PB on 2026-10-27 | **Published** | 8 original items (4 single-choice, 4 multiple-response); model questions describe capability tiers instead of frozen model names | G, D, MD, PJ, RS, AR, PB |
| `domain-4-workflow-set` | Reviewed question bank + assessment | Domain 4 — **verified mapping** to all five objectives | Five objectives are **Verified** in G | Technical claims **Verified** against E, PB, RS, CC, PP and BA on 2026-10-27 | **Published** | 10 original items (5 single-choice, 5 multiple-response); every Domain 4 objective has two items | G, E, PB, RS, CC, PP, BA |
| `domain-5-configuration-set` | Reviewed question bank + assessment | Domain 5 — **verified mapping** to all four objectives | Four objectives are **Verified** in G | Technical claims **Verified** against PJ, RG, CN and PB on 2026-10-27 | **Published** | 8 original items (4 single-choice, 4 multiple-response); every Domain 5 objective has two items | G, PJ, RG, CN, PB |
| `domain-6-governance-set` | Reviewed question bank + assessment | Domain 6 — **verified mapping** to all four objectives | Four objectives are **Verified** in G | Technical claims **Verified** against CC, R, PP, PB and E on 2026-10-27; review principles only, not legal advice | **Published** | 8 original items (4 single-choice, 4 multiple-response); every Domain 6 objective has two items | G, CC, R, PP, PB, E |
| `domain-7-troubleshooting-set` | Reviewed question bank + assessment | Domain 7 — **verified mapping** to all three objectives | Three objectives are **Verified** in G | Technical claims **Verified** against PB, E, MD, R and BA on 2026-10-27 | **Published** | 6 original items (3 single-choice, 3 multiple-response); every Domain 7 objective has two items | G, PB, E, MD, R, BA |
| `mixed-foundations-set` | Reviewed question bank + assessment | Domains 1–7 — **verified mappings** of all 62 bank items | Seven domains **Verified** | Same per-item verification as the domain sets | **Published** | Question ids derived from the reviewed bank so the set cannot drift; explicitly not a mock exam | G plus per-item sources |

## Objective coverage

All objectives below are **Verified** as exam scope from G §6. “Version” records the guide version
that governs the wording. “General-knowledge safety” records whether the topic can be taught from
official product documentation without pretending to know the live item bank.

### Domain 1 — Prompting and Task Execution (14%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `prompting-create-effective-prompts` | Create effective prompts for business and technical tasks | **Verified** | **Reviewed lesson + 2 bank items** | `prompt-structure`; `prompting-specific-brief`, `prompting-effective-prompt-additions` | Safe: official prompting guidance and worked examples | v1.0 + PB |
| `prompting-task-decomposition` | Apply task decomposition techniques to structure complex requests | **Verified** | **Reviewed lesson + 2 bank items** | `prompt-structure`; `prompting-decompose-steps`, `prompting-decomposition-decision` | Safe: decomposition and prompt-chaining patterns from PB, E and BA; examples are original | v1.0 + PB, E, BA |
| `prompting-iterate` | Iterate prompts to improve output quality | **Verified** | **Reviewed lesson + 2 bank items** | `prompt-structure`; `prompting-iterate-evidence`, `prompting-iterate-systematic` | Safe: iterative prompting is general practice | v1.0 + PB, E |
| `prompting-adapt-strategies` | Adapt prompting strategies based on task type (analysis, research, drafting, brainstorming) | **Verified** | **Reviewed lesson + 2 bank items** | `prompt-structure`; `prompting-analysis-task-strategy`, `prompting-adapt-task-types` | Safe: teach task-type trade-offs with original scenarios | v1.0 + PB |

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
| `product-feature-selection` | Select appropriate Claude product features (Projects, research mode, chat, artifacts) | **Verified** | **Reviewed lesson + 2 bank items** | `product-selection`; `product-feature-recurring-report`, `product-feature-fit-choices` | Safe with current-doc check: product surfaces change faster than the guide | v1.0 + PJ, RS, AR |
| `model-family-selection` | Differentiate between Claude model types (Haiku, Sonnet, Opus) | **Verified** | **Reviewed lesson + 2 bank items** | `product-selection`; `model-family-speed-cost`, `model-family-tradeoffs` | Principles safe; v1.0 names these three families. The lesson and items describe capability tiers rather than freezing current model names | v1.0 + MD |
| `model-task-fit` | Align model selection with task requirements (cost, speed, quality) | **Verified** | **Reviewed lesson + 2 bank items** | `product-selection`; `model-task-fit-complex`, `model-task-fit-practices` | Safe: teach the trade-off, not a fixed “best model” rule | v1.0 + MD |
| `context-memory-management` | Understand and manage context limitations and memory considerations (when to restart, summarize, or persist) | **Verified** | **Reviewed lesson + 2 bank items**; the `context-window` sample remains separately **unmapped** | `product-selection`; `context-summarize-and-restart`, `context-high-signal-practices` | Technical background safe from D and the Projects/RAG pages; product limits remain time-sensitive | v1.0 + D, PJ, RG |

### Domain 4 — Workflow Integration and Solution Design (16%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `workflow-requirements-analysis` | Apply Claude to analyze requirements and use cases | **Verified** | **Reviewed lesson + 2 bank items** | `workflow-design`; `workflow-requirements-extraction`, `workflow-requirements-artifacts` | Safe: requirements artifacts and traceability, using original business scenarios | v1.0 + E, PB |
| `workflow-research-planning` | Leverage Claude for research, planning, and process optimization | **Verified** | **Reviewed lesson + 2 bank items** | `workflow-design`; `workflow-research-current-scan`, `workflow-research-planning-practices` | Safe: general workflow patterns; validate facts with sources | v1.0 + RS, E |
| `workflow-solution-design` | Use Claude to support solution design, development, and iteration | **Verified** | **Reviewed lesson + 2 bank items** | `workflow-design`; `workflow-solution-options`, `workflow-solution-iteration` | Safe: solution options, evaluator-optimizer patterns, and human decision ownership | v1.0 + PB, E, BA |
| `workflow-integrate` | Integrate Claude into existing workflows to augment or redesign them | **Verified** | **Reviewed lesson + 2 bank items** | `workflow-design`; `workflow-integration-checkpoints`, `workflow-integration-first-pilot` | Safe: process mapping, bounded pilots, and human checkpoints | v1.0 + E, CC, BA |
| `workflow-stakeholder-communication` | Communicate Claude's value and limitations to stakeholders | **Verified** | **Reviewed lesson + 2 bank items** | `workflow-design`; `workflow-stakeholder-brief`, `workflow-stakeholder-evidence` | Safe: communication exercise, not a promise of business results | v1.0 + E, CC, PP |

### Domain 5 — Configuration and Knowledge Management (12%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `config-project-instructions` | Configure Claude Projects with instructions and knowledge sources | **Verified** | **Reviewed lesson + 2 bank items** | `configuration-basics`; `config-project-brief-setup`, `config-project-context-scope` | Safe with current-doc check: Projects UI and limits can change | v1.0 + PJ |
| `config-knowledge-connectors` | Manage uploaded knowledge and connectors (e.g., Google Drive, Gmail) | **Verified** | **Reviewed lesson + 2 bank items** | `configuration-basics`; `config-connector-rollout`, `config-connector-permission-model` | Safe with current-doc check: connector availability is plan- and region-dependent | v1.0 + CN, RG |
| `config-system-instructions` | Create effective system-level instructions | **Verified** | **Reviewed lesson + 2 bank items** | `configuration-basics`; `config-system-instruction-quality`, `config-system-instruction-components` | Safe: general instruction design; distinguish product settings from API system prompts | v1.0 + PB, PJ |
| `config-maintain` | Inform, maintain, and update Claude configurations, knowledge sources, and instructions | **Verified** | **Reviewed lesson + 2 bank items** | `configuration-basics`; `config-knowledge-refresh`, `config-maintenance-cadence` | Safe: maintenance checklist and review cadence | v1.0 + PJ, RG |

### Domain 6 — Governance, Risk, and Responsible Use (15%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `governance-use-case-fit` | Identify appropriate and inappropriate use cases | **Verified** | **Reviewed lesson + 2 bank items** | `governance-responsible-use`; `governance-customer-assistant-safeguards`, `governance-use-case-triage` | Safe: high-risk triage principles from PP and CC; not a legal determination | v1.0 + PP, CC |
| `governance-data-privacy` | Apply data sensitivity, regulatory, and privacy considerations | **Verified** | **Reviewed lesson + 2 bank items** | `governance-responsible-use`; `governance-privacy-confidential-upload`, `governance-privacy-controls` | **Principles only:** do not give legal advice; cite organizational policy and official privacy material | v1.0 + PP, CN |
| `governance-policies` | Follow organizational AI policies and governance standards | **Verified** | **Reviewed lesson + 2 bank items** | `governance-responsible-use`; `governance-policy-hiring-screening`, `governance-policy-operations` | **Principles only:** policy specifics vary by organization | v1.0 + PP, CC |
| `governance-ethics` | Understand the ethical implications of AI usage | **Verified** | **Reviewed lesson + 2 bank items** | `governance-responsible-use`; `governance-human-oversight`, `governance-ethics-considerations` | Safe: responsible-use reasoning from CC and PP, clearly framed as judgment | v1.0 + CC, PP, E |

### Domain 7 — Troubleshooting and Optimization (10%)

| Topic ID | Official objective | Exam scope | Content status | Coverage / next step | General-knowledge safety | Version |
|---|---|---|---|---|---|---|
| `troubleshoot-diagnose` | Identify, diagnose, and resolve issues with underperforming prompts or poor outputs | **Verified** | **Reviewed lesson + 2 bank items** | `troubleshooting-optimization`; `troubleshoot-diagnose-prompt`, `troubleshoot-diagnose-evidence` | Safe: diagnostic checklist based on prompting, context, and review practice | v1.0 + PB, E |
| `troubleshoot-adjust` | Adjust approach based on feedback and results | **Verified** | **Reviewed lesson + 2 bank items** | `troubleshooting-optimization`; `troubleshoot-feedback-loop`, `troubleshoot-adjust-regression` | Safe: measured iteration loop with original examples | v1.0 + E, PB |
| `optimize-workflows` | Optimize workflows for efficiency and effectiveness | **Verified** | **Reviewed lesson + 2 bank items** | `troubleshooting-optimization`; `optimize-workflow-baseline`, `optimize-workflow-practices` | Safe: measure before/after; avoid invented metrics | v1.0 + E, PB, MD |

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
| `prompting-iterate-evidence` | Single-choice | Domain 1 · `prompting-iterate` | **Reviewed / published** | Original item on diagnosing a vague draft against success criteria, then iterating on the same input. |
| `prompting-iterate-systematic` | Multiple-response | Domain 1 · `prompting-iterate` | Exact-set item on keeping a baseline, changing one variable, and classifying failure types. |
| `prompting-analysis-task-strategy` | Single-choice | Domain 1 · `prompting-adapt-strategies` | Original item on traceable theme extraction from interview transcripts. |
| `prompting-adapt-task-types` | Multiple-response | Domain 1 · `prompting-adapt-strategies` | Exact-set item on matching prompt structure to drafting, brainstorming, and analysis tasks. |
| `product-feature-recurring-report` | Single-choice | Domain 3 · `product-feature-selection` | Original item on using a project for a recurring report with stable PDFs and a fixed template. |
| `product-feature-fit-choices` | Multiple-response | Domain 3 · `product-feature-selection` | Exact-set item on research for current multi-source briefings, artifacts for reusable deliverables, and projects for recurring work. |
| `model-family-speed-cost` | Single-choice | Domain 3 · `model-family-selection` | Original item on an efficiency-first start for high-volume, latency-sensitive ticket classification. |
| `model-family-tradeoffs` | Multiple-response | Domain 3 · `model-family-selection` | Exact-set item on capability/latency/cost trade-offs, re-checking current documentation, and benchmarking before standardizing. |
| `model-task-fit-complex` | Single-choice | Domain 3 · `model-task-fit` | Original item on a capability-first start for costly, multi-step contract analysis. |
| `model-task-fit-practices` | Multiple-response | Domain 3 · `model-task-fit` | Exact-set item on explicit criteria, real-prompt benchmarks, and quality-versus-cost comparison. |
| `workflow-research-current-scan` | Single-choice | Domain 4 · `workflow-research-planning` | Original item on research with citations plus verification before a planning workshop. |
| `workflow-research-planning-practices` | Multiple-response | Domain 4 · `workflow-research-planning` | Exact-set item on defined research questions, citations with stated gaps, and separating facts from recommendations. |
| `workflow-solution-options` | Single-choice | Domain 4 · `workflow-solution-design` | Original item on drafting workflow options with assumptions and risks, then letting the accountable team decide and pilot. |
| `workflow-solution-iteration` | Multiple-response | Domain 4 · `workflow-solution-design` | Exact-set item on prototyping options, stakeholder review, and testing against requirements and edge cases. |
| `workflow-stakeholder-brief` | Single-choice | Domain 4 · `workflow-stakeholder-communication` | Original item on describing tested scope, measured results, failure modes, and human review instead of promising replacement. |
| `workflow-stakeholder-evidence` | Multiple-response | Domain 4 · `workflow-stakeholder-communication` | Exact-set item on measured outcomes, disclosed accountability, and stated scope and failure modes. |
| `governance-privacy-confidential-upload` | Single-choice | Domain 6 · `governance-data-privacy` | Original item on policy, approved workspace, and data minimization before uploading a confidential contract. |
| `governance-privacy-controls` | Multiple-response | Domain 6 · `governance-data-privacy` | Exact-set item on classification, least-privilege access, and minimizing retention exposure. |
| `governance-policy-hiring-screening` | Single-choice | Domain 6 · `governance-policies` | Original item on checking policy and high-risk requirements, including human review and disclosure, before screening candidates. |
| `governance-policy-operations` | Multiple-response | Domain 6 · `governance-policies` | Exact-set item on mapping use cases to policy, documenting review and escalation, and reviewing updates on a schedule. |
| `optimize-workflow-baseline` | Single-choice | Domain 7 · `optimize-workflows` | Original item on measuring quality, latency, and cost before changing a slow reporting workflow. |
| `optimize-workflow-practices` | Multiple-response | Domain 7 · `optimize-workflows` | Exact-set item on baseline metrics, removing repeated context with caching or batch where it fits, and right-sizing model and effort. |
| `config-project-brief-setup` | Single-choice | Domain 5 · `config-project-instructions` | Original item on placing a shared brief in project knowledge and voice rules in project instructions. |
| `config-project-context-scope` | Multiple-response | Domain 5 · `config-project-instructions` | Exact-set item on shared knowledge and instructions versus chat-isolated context and non-instruction metadata. |
| `config-connector-rollout` | Single-choice | Domain 5 · `config-knowledge-connectors` | Original item on an Owner enabling organization connectors before each employee authenticates. |
| `config-connector-permission-model` | Multiple-response | Domain 5 · `config-knowledge-connectors` | Exact-set item on inherited source permissions, Owner action restrictions, and default approval for sensitive actions. |
| `config-system-instruction-quality` | Single-choice | Domain 5 · `config-system-instructions` | Original item comparing a specific role/source/escalation instruction with vague or contradictory ones. |
| `config-system-instruction-components` | Multiple-response | Domain 5 · `config-system-instructions` | Exact-set item on role and audience, source and uncertainty rules, and escalation plus format. |
| `config-knowledge-refresh` | Single-choice | Domain 5 · `config-maintain` | Original item on replacing an obsolete PDF, updating the citing instruction, and re-testing representative questions. |
| `config-maintenance-cadence` | Multiple-response | Domain 5 · `config-maintain` | Exact-set item on a named owner, versioned source hygiene, and regression testing after material changes. |
| `prompting-effective-prompt-additions` | Multiple-response | Domain 1 · `prompting-create-effective-prompts` | **Reviewed / published** | Exact-set item on audience/environment, success criteria/format, and an approved example for a technical runbook. |
| `prompting-decomposition-decision` | Single-choice | Domain 1 · `prompting-task-decomposition` | **Reviewed / published** | Original item on extract-compare-summarize decomposition instead of a one-pass synthesis. |
| `workflow-requirements-artifacts` | Multiple-response | Domain 4 · `workflow-requirements-analysis` | **Reviewed / published** | Exact-set item on traceable requirements, unresolved conflicts, and separation of requirements from solution ideas. |
| `workflow-integration-first-pilot` | Single-choice | Domain 4 · `workflow-integrate` | **Reviewed / published** | Original item on choosing a bounded, reversible review step with a human checkpoint and baseline. |
| `governance-use-case-triage` | Single-choice | Domain 6 · `governance-use-case-fit` | **Reviewed / published** | Original item on pausing an automated insurance-denial use case for policy review and qualified human review. |
| `governance-ethics-considerations` | Multiple-response | Domain 6 · `governance-ethics` | **Reviewed / published** | Exact-set item on disclosure/accountability, equal treatment, and traceable job-relevant evidence in a performance review. |
| `troubleshoot-diagnose-evidence` | Multiple-response | Domain 7 · `troubleshoot-diagnose` | **Reviewed / published** | Exact-set item on systematic missing fields, undefined requirements, and outdated examples as prompt/context evidence. |
| `troubleshoot-adjust-regression` | Single-choice | Domain 7 · `troubleshoot-adjust` | **Reviewed / published** | Original item on keeping the baseline and rerunning the full suite when a change causes an edge-case regression. |
| `context-window-root-cause` | Single-choice | **Unmapped** | **Sample, runnable in its lesson** | Tests a general context-budgeting decision; not official exam content. Its `context-window-sample` definition remains in the pack but `/practice` does not surface it. |
| Multiple-response example | Multiple-response | Test fixture only | **Tested, not authored as curriculum** | Proves schema validation, exact-set scoring, and UI set-scoring; not part of a lesson |

No official sample questions from the guide were copied. The three published samples in Guide §8 are
used only for format calibration; product questions must be original.

The assessment core is not coverage. It makes authored questions runnable. The matrix records
**30 / 30** objectives with reviewed practice items and **30 / 30** objectives with a reviewed,
exam-mapped lesson. Every domain has one published mapped lesson, and every objective has at least
two bank items. No objective is claimed to be exhaustively covered; depth per objective ranges from
two to four items, and the 62-item bank still leaves two items outside the 60-item mock preview.

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
- The Domain 5 lesson `configuration-basics` is published, mapped to all four verified Domain 5
  objectives, and links to reviewed bank questions.
- The Domain 1 lesson `prompt-structure` is published, mapped to all four verified Domain 1
  objectives, and links to reviewed bank questions.
- The Domain 3 lesson `product-selection` is published, mapped to all four verified Domain 3
  objectives, and links to reviewed bank questions.
- The Domain 4 lesson `workflow-design` is published, mapped to all five verified Domain 4
  objectives, and links to reviewed bank questions.
- The Domain 6 lesson `governance-responsible-use` is published, mapped to all four verified
  Domain 6 objectives, and links to reviewed bank questions.
- The Domain 7 lesson `troubleshooting-optimization` is published, mapped to all three verified
  Domain 7 objectives, and links to reviewed bank questions.
- The bank contains **62 original, reviewed items**, split into 32 single-choice and 30
  multiple-response items, each with Vietnamese explanations for every option, and covers every
  official objective with at least two items.
- Bias is taught and assessed only at the framing/evidence-selection/equal-treatment level supported
  by Claude's Constitution. The bank does not claim a comprehensive fairness evaluation.
- Practice Mode is registry-driven: eight sets (seven domain sets plus one mixed set) are validated
  against the reviewed bank, support deep links, and persist attempts locally.
- The Review queue is derived from submitted attempts and includes incorrect, unanswered, and
  flagged questions; an item is resolved only by an explicit action.
- Progress separates reviewed-bank coverage from personal performance and shows a real zero-activity
  state instead of a fabricated score.
- The untimed mock-exam preview selects **60 of the verified 60-item format** by blueprint weight
  with no shortfall, using 60 of the 62 reviewed items and adding no filler or duplicates. It has no
  timer and no scaled score. A separate `/mock-exam/timed` attempt runs the 60-question /
  120-minute format with a persisted deadline and auto-submit; it is still practice content.

**May not claim**

- That any domain or objective is fully “covered” by a reviewed lesson or question bank.
- That the 62-item bank is an exhaustive or official exam simulation. Every objective has at least
  two items, but depth is still limited and no objective has more than four.
- That the sample lesson is mapped to Domain 3.
- That the 60 items are all scored, or that any per-domain item count is official.
- That the product contains an official practice exam or official questions.
- That the untimed preview or the timed simulation is an official exam form, a scaled score, or a
  readiness predictor. The timed attempt enforces its own deadline but still reports raw performance
  only.
- That the 2026-11-17 / 2026-12-07 revised blueprint has been applied.
- That the Haiku/Sonnet/Opus list is the complete current public model lineup.

## Next coverage work

1. Continuously re-check time-sensitive sources: model names, prices, limits, Help Center UI steps,
   and policy effective dates. The pack records access dates but cannot freeze provider behavior.
2. Add depth only where it assesses a genuinely different decision, prioritizing the heaviest domains
   (Domain 2 at 21%, Domain 4 at 16%, Domain 6 at 15%). Do not inflate counts to look complete.
3. Rewrite the Context Window sample for the Associate audience, then decide whether it can be
   verified against Domain 3's `context-memory-management` objective. Keep it unmapped until then.
4. Implement a timed 60-item simulation and any scaled-score logic only after the scoring rules are
   reviewed; never present a preview percentage as an official readiness estimate.
5. Continue source tracing for ethical and privacy claims, especially where provider policy is a floor
   and organizational policy or local law may be stricter.
6. Keep `src/test/question-bank.test.ts`, `src/test/curriculum.test.ts`,
   `src/test/domain-5-content.test.tsx`, and `src/test/domain-2-content.test.tsx` as the gate: every
   bank entry must map to a verified blueprint objective and cite registered sources, every lesson
   must map to real objectives, and every lesson-linked question must resolve.
