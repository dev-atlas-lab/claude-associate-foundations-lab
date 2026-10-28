# Content and Assessment Audit — 2026-10-28

**Status:** completed local audit; corrections are unstaged for human review; one timed-allocation
expectation is accepted as a documented deviation; CI is pending a future commit/push.

**Scope:** 62 reviewed question-bank items, 8 published lessons, 15 glossary entries, 27 registered
sources, 7 domain practice sets, the mixed practice set, and the timed mock exam.

**Non-goals:** no new questions, no official or third-party exam questions, no branch change, no
commit, no push, no deployment, and no full local E2E/build run. CI owns full regression after the
user pushes.

## Baseline verified from the repository

| Measure | Result |
|---|---|
| Question-bank items | **62** |
| Item types | **32 single-choice + 30 multiple-response** |
| Domain bank counts (D1–D7) | **8 / 14 / 8 / 10 / 8 / 8 / 6** |
| Objectives | **30** across **7 domains** |
| Items per objective | **2** except `output-identify-hallucinations` with **4** |
| Published lessons | **8** (7 exam-mapped curriculum lessons + 1 explicitly unmapped sample) |
| Glossary entries | **15** |
| Registered sources | **27** |
| Assessment definitions | **9 registry assessments** (1 sample, 7 domain, 1 mixed) plus the derived untimed preview and the separate timed simulation |
| Timed format | **60 items / 120 minutes**, weights **14 / 21 / 12 / 16 / 12 / 15 / 10** |
| Timed selection | **60 distinct reviewed items**, shortfall **0**, no filler or duplicate |
| Source-link check | All **27** URLs returned HTTP **200** to a HEAD request on 2026-10-28 |

## Evidence hierarchy and limitations

1. **Exam scope** comes only from the official CCAO-F Exam Guide v1.0 (effective July 2026), the
   official Partner Academy pages, and the Pearson VUE program page. The planned attempt is before
   2026-11-14, so the 2026-11-17 / 2026-12-07 revision is not applied.
2. **Technical behavior** comes from official Anthropic documentation, Help Center articles,
   Engineering posts, and Claude's Constitution. These sources support product/technical claims, not
   exam weights or official item content.
3. **Policy claims** were checked against the Anthropic Usage Policy and Privacy Policy. The Usage
   Policy page read on 2026-10-28 states an effective date of **2026-11-12**. It applies if the
   attempt is on or after that date; an earlier attempt could be governed by a prior version, and no
   earlier version was archived.
4. Help Center pages are JavaScript-rendered and can change without notice. A HEAD 200 proves the URL
   resolves; it does not prove that a particular UI label or plan limit is unchanged. Time-sensitive
   UI details remain flagged in the coverage matrix.
5. The temporary `lesson-glossary-audit.md` dump used for review had undefined `keyTerms`/`scenario`
   fields because of a dump-script/schema mismatch. That is tooling noise, not a content defect.

## Status definitions

| Status | Meaning |
|---|---|
| **pass** | No factual, assessment, mapping, or traceability defect found. |
| **minor-fix** | The answer key or main concept remains valid, but wording, a definition, or a supporting explanation was imprecise and was corrected. |
| **major-fix** | A lesson taught a materially false rule or a core explanation contradicted current official documentation; corrected. |
| **needs-review** | A requirement or expectation cannot be satisfied without a human decision or new reviewed content. No silent workaround was applied. |

## Result summary

| Area | Pass | Minor-fix | Major-fix | Needs-review |
|---|---:|---:|---:|---:|
| 62 question-bank items | **60** | **2** | **0** | **0** |
| 8 published lessons | **6** | **0** | **2** | **0** |
| 15 glossary entries | **13** | **2** | **0** | **0** |
| 27 registered sources | **26** | **1** | **0** | **0** |
| 7 domain practice sets | **3** | **4** | **0** | **0** |
| Timed mock integrity | **pass** | — | — | **0** — accepted allocation deviation below |

## Corrections applied

### 1. Project memory was treated as nonexistent or as the only reuse path

**Evidence:** [How can I create and manage projects?](https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects)
states:

> Each project has its own memory. While working in a project, Claude uses the project's memory
> alongside your memory from chats outside of projects, but not memory from other projects. New
> memory is saved to the project, and if you have memory turned on, Claude can reference it in chats
> outside of projects too.

The same page also says that context is not shared across chats unless information is added to project
knowledge. The accurate synthesis is: a new chat does not receive the full transcript of another chat;
project knowledge and instructions are the reliable shared configuration; project memory may retain
some information but is not a substitute for that configuration.

**Applied corrections:**

- `src/content/certifications/claude-associate-foundations/question-bank-domain5.ts`
  - `config-project-brief-setup`: distractor explanation now acknowledges project memory while still
    explaining why pasting into one chat is unreliable.
  - `config-project-context-scope`: the correct choice and explanation now distinguish the full
    transcript, project knowledge/instructions, and project memory. The answer key is unchanged.
- `src/content/certifications/claude-associate-foundations/lessons/configuration-basics.ts`
  - Corrected the introduction, knowledge-base paragraph, “don't use chat to change shared
    configuration” callout, knowledge-check explanation, and takeaway.
- `src/content/certifications/claude-associate-foundations/lessons/product-selection.ts`
  - Corrected the “Project không phải chat dài hơn” callout and the project takeaway.
  - Corrected a separate callout title that referred to “project memory” while its body described
    project knowledge and RAG retrieval; the title now refers to project knowledge retrieval.
- `src/content/sources.ts`
  - Replaced the blanket source-registry bullet with the full-transcript/project-memory distinction.

**Severity:** the two questions are **minor-fix** because their keys and main lesson remain correct;
the two lessons are **major-fix** because they stated a blanket rule that is false under current
project memory behavior.

### 2. Four domain practice sets omitted reviewed bank items

The bank, coverage matrix, and lesson `relatedQuestionIds` already reflected the larger counts, but
four assessment definitions were stale. The missing items were added and descriptions updated:

| Set | Before | After | Added |
|---|---:|---:|---|
| `domain-1-prompting-set` | 6 | **8** | `prompting-effective-prompt-additions`, `prompting-decomposition-decision` |
| `domain-4-workflow-set` | 8 | **10** | `workflow-requirements-artifacts`, `workflow-integration-first-pilot` |
| `domain-6-governance-set` | 6 | **8** | `governance-use-case-triage`, `governance-ethics-considerations` |
| `domain-7-troubleshooting-set` | 4 | **6** | `troubleshoot-diagnose-evidence`, `troubleshoot-adjust-regression` |

Domains 2, 3, and 5 were already complete. The mixed set remains derived from the full reviewed bank.
A new regression test asserts that every domain practice set equals the reviewed bank items mapped to
that domain.

### 3. Two glossary definitions were narrower than the official definitions

- `context-rot`: the old definition implied that irrelevant information is required. The official
  [context-windows documentation](https://docs.claude.com/en/docs/build-with-claude/context-windows)
  says accuracy and recall degrade as token count grows; irrelevant or lengthy material can make it
  worse. The definition now says that.
- `hallucination`: the old definition said output “sounds plausible but is wrong.” Plausibility is
  common but not required. The official
  [reduce-hallucinations guidance](https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
  defines hallucination as text that is factually incorrect or inconsistent with the given context.
  The definition now uses that standard while retaining the practical verification advice.

### 4. Regression tests for audited invariants

- `src/test/question-bank.test.ts`: every domain practice set now must equal all reviewed bank items
  mapped to that domain.
- `src/test/curriculum.test.ts`: exact official weights are asserted as
  `14 / 21 / 12 / 16 / 12 / 15 / 10`.
- `src/test/timed-exam-content.test.ts`: exact available counts, weights, and the actual allocation are
  asserted, with a comment explaining the Domain 6 availability cap.

## Question audit matrix

Every bank item was reviewed for stem clarity, answer-key correctness, distractor quality, objective
mapping, Vietnamese explanations, and source traceability. “Pass” does not mean the item is official
exam content; every item remains original practice material.

| # | Question ID | Domain / objective | Type | Status | Review note |
|---:|---|---|---|---|---|
| 1 | output-accuracy-review-plan | output-evaluation-validation / output-evaluate-accuracy | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-reduce-hallucinations-doc; no change. |
| 2 | output-accurate-but-incomplete | output-evaluation-validation / output-evaluate-accuracy | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-reduce-hallucinations-doc; no change. |
| 3 | output-fabricated-policy-detail | output-evaluation-validation / output-identify-hallucinations | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-reduce-hallucinations-doc; no change. |
| 4 | output-hallucination-signals | output-evaluation-validation / output-identify-hallucinations | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-reduce-hallucinations-doc; no change. |
| 5 | output-fact-check-retention | output-evaluation-validation / output-fact-check | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-reduce-hallucinations-doc; no change. |
| 6 | output-reduce-unsupported-claims | output-evaluation-validation / output-fact-check | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-reduce-hallucinations-doc; no change. |
| 7 | output-human-review-high-stakes | output-evaluation-validation / output-human-review | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-reduce-hallucinations-doc, anthropic-evaluation-docs; no change. |
| 8 | output-human-review-triggers | output-evaluation-validation / output-human-review | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-reduce-hallucinations-doc, anthropic-evaluation-docs; no change. |
| 9 | output-edit-preserve-facts | output-evaluation-validation / output-edit-adapt | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-prompting-best-practices, anthropic-reduce-hallucinations-doc; no change. |
| 10 | output-compare-customer-faq-drafts | output-evaluation-validation / output-edit-adapt | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-prompting-best-practices, anthropic-reduce-hallucinations-doc; no change. |
| 11 | output-format-fit-deliverable | output-evaluation-validation / output-format-selection | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-structured-outputs-doc, anthropic-artifacts-doc, anthropic-prompting-best-practices; no change. |
| 12 | output-format-decisions | output-evaluation-validation / output-format-selection | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-structured-outputs-doc, anthropic-artifacts-doc, anthropic-prompting-best-practices; no change. |
| 13 | output-bias-one-sided-framing | output-evaluation-validation / output-identify-hallucinations | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-claude-constitution; no change. |
| 14 | output-bias-unequal-standards | output-evaluation-validation / output-identify-hallucinations | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-claude-constitution, anthropic-reduce-hallucinations-doc; no change. |
| 15 | prompting-specific-brief | prompting-task-execution / prompting-create-effective-prompts | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices; no change. |
| 16 | prompting-decompose-steps | prompting-task-execution / prompting-task-decomposition | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-evaluation-docs; no change. |
| 17 | prompting-iterate-evidence | prompting-task-execution / prompting-iterate | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-evaluation-docs; no change. |
| 18 | prompting-iterate-systematic | prompting-task-execution / prompting-iterate | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-evaluation-docs; no change. |
| 19 | prompting-analysis-task-strategy | prompting-task-execution / prompting-adapt-strategies | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-evaluation-docs; no change. |
| 20 | prompting-adapt-task-types | prompting-task-execution / prompting-adapt-strategies | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-evaluation-docs; no change. |
| 21 | context-summarize-and-restart | product-model-selection / context-memory-management | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-context-windows-doc, anthropic-compaction-doc, anthropic-context-engineering-blog; no change. |
| 22 | context-high-signal-practices | product-model-selection / context-memory-management | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-context-windows-doc, anthropic-context-engineering-blog; no change. |
| 23 | product-feature-recurring-report | product-model-selection / product-feature-selection | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-projects-overview, anthropic-projects-manage, anthropic-artifacts-doc; no change. |
| 24 | product-feature-fit-choices | product-model-selection / product-feature-selection | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-research-help, anthropic-artifacts-doc, anthropic-projects-overview; no change. |
| 25 | model-family-speed-cost | product-model-selection / model-family-selection | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-choosing-model, anthropic-models-overview; no change. |
| 26 | model-family-tradeoffs | product-model-selection / model-family-selection | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-models-overview, anthropic-choosing-model; no change. |
| 27 | model-task-fit-complex | product-model-selection / model-task-fit | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-choosing-model, anthropic-models-overview; no change. |
| 28 | model-task-fit-practices | product-model-selection / model-task-fit | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-choosing-model, anthropic-models-overview; no change. |
| 29 | workflow-requirements-extraction | workflow-integration-solution-design / workflow-requirements-analysis | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-prompting-best-practices; no change. |
| 30 | workflow-integration-checkpoints | workflow-integration-solution-design / workflow-integrate | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-claude-constitution; no change. |
| 31 | workflow-research-current-scan | workflow-integration-solution-design / workflow-research-planning | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-research-help, anthropic-evaluation-docs; no change. |
| 32 | workflow-research-planning-practices | workflow-integration-solution-design / workflow-research-planning | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-research-help, anthropic-evaluation-docs; no change. |
| 33 | workflow-solution-options | workflow-integration-solution-design / workflow-solution-design | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-evaluation-docs, anthropic-claude-constitution; no change. |
| 34 | workflow-solution-iteration | workflow-integration-solution-design / workflow-solution-design | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-evaluation-docs, anthropic-claude-constitution; no change. |
| 35 | workflow-stakeholder-brief | workflow-integration-solution-design / workflow-stakeholder-communication | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-claude-constitution, anthropic-usage-policy; no change. |
| 36 | workflow-stakeholder-evidence | workflow-integration-solution-design / workflow-stakeholder-communication | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-claude-constitution, anthropic-usage-policy; no change. |
| 37 | config-project-brief-setup | configuration-knowledge-management / config-project-instructions | single-choice | **minor-fix** | Minor wording fix: the distractor explanation implied a new chat can never retain pasted content; updated to acknowledge project memory while keeping knowledge/instructions as the reliable shared configuration. |
| 38 | config-project-context-scope | configuration-knowledge-management / config-project-instructions | multiple-response | **minor-fix** | Minor wording fix: the correct statement and explanation implied content can only be reused via project knowledge; updated to distinguish the full transcript from project memory and shared configuration. |
| 39 | config-connector-rollout | configuration-knowledge-management / config-knowledge-connectors | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-connectors-help, anthropic-google-workspace-connectors; no change. |
| 40 | config-connector-permission-model | configuration-knowledge-management / config-knowledge-connectors | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-connectors-help, anthropic-google-workspace-connectors; no change. |
| 41 | config-system-instruction-quality | configuration-knowledge-management / config-system-instructions | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-projects-manage; no change. |
| 42 | config-system-instruction-components | configuration-knowledge-management / config-system-instructions | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-projects-manage; no change. |
| 43 | config-knowledge-refresh | configuration-knowledge-management / config-maintain | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-projects-manage, anthropic-projects-rag; no change. |
| 44 | config-maintenance-cadence | configuration-knowledge-management / config-maintain | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-projects-manage, anthropic-projects-rag, anthropic-prompting-best-practices; no change. |
| 45 | governance-human-oversight | governance-risk-responsible-use / governance-ethics | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-claude-constitution, anthropic-reduce-hallucinations-doc; no change. |
| 46 | governance-customer-assistant-safeguards | governance-risk-responsible-use / governance-use-case-fit | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-claude-constitution, anthropic-usage-policy; no change. |
| 47 | governance-privacy-confidential-upload | governance-risk-responsible-use / governance-data-privacy | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-privacy-policy, anthropic-google-workspace-connectors, anthropic-usage-policy; no change. |
| 48 | governance-privacy-controls | governance-risk-responsible-use / governance-data-privacy | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-privacy-policy, anthropic-google-workspace-connectors, anthropic-usage-policy; no change. |
| 49 | governance-policy-hiring-screening | governance-risk-responsible-use / governance-policies | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-usage-policy, anthropic-claude-constitution, anthropic-privacy-policy; no change. |
| 50 | governance-policy-operations | governance-risk-responsible-use / governance-policies | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-usage-policy, anthropic-privacy-policy, anthropic-claude-constitution; no change. |
| 51 | troubleshoot-diagnose-prompt | troubleshooting-optimization / troubleshoot-diagnose | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-evaluation-docs; no change. |
| 52 | troubleshoot-feedback-loop | troubleshooting-optimization / troubleshoot-adjust | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-prompting-best-practices; no change. |
| 53 | optimize-workflow-baseline | troubleshooting-optimization / optimize-workflows | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-models-overview, anthropic-choosing-model; no change. |
| 54 | optimize-workflow-practices | troubleshooting-optimization / optimize-workflows | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-models-overview, anthropic-choosing-model; no change. |
| 55 | prompting-effective-prompt-additions | prompting-task-execution / prompting-create-effective-prompts | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices; no change. |
| 56 | prompting-decomposition-decision | prompting-task-execution / prompting-task-decomposition | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-evaluation-docs, anthropic-building-effective-agents; no change. |
| 57 | workflow-requirements-artifacts | workflow-integration-solution-design / workflow-requirements-analysis | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-prompting-best-practices; no change. |
| 58 | workflow-integration-first-pilot | workflow-integration-solution-design / workflow-integrate | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-building-effective-agents, anthropic-evaluation-docs, anthropic-claude-constitution; no change. |
| 59 | governance-use-case-triage | governance-risk-responsible-use / governance-use-case-fit | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-usage-policy, anthropic-claude-constitution; no change. |
| 60 | governance-ethics-considerations | governance-risk-responsible-use / governance-ethics | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-claude-constitution, anthropic-usage-policy, anthropic-evaluation-docs; no change. |
| 61 | troubleshoot-diagnose-evidence | troubleshooting-optimization / troubleshoot-diagnose | multiple-response | **pass** | Stem, key, and every explanation checked against anthropic-prompting-best-practices, anthropic-evaluation-docs; no change. |
| 62 | troubleshoot-adjust-regression | troubleshooting-optimization / troubleshoot-adjust | single-choice | **pass** | Stem, key, and every explanation checked against anthropic-evaluation-docs, anthropic-prompting-best-practices; no change. |

**Research-citation traceability note:** the registered `anthropic-research-help` page supports the
multi-step research behavior, while the citation claim in items 24, 31, and 32 is corroborated by the
official Anthropic research announcement at <https://www.anthropic.com/news/research> (“easy-to-check
citations”). The announcement is not a separate registry entry; no content change was needed, but this
is recorded as a traceability limitation.

## Lesson audit

| Lesson | Mapping | Status | Finding / action |
|---|---|---|---|
| `context-window` | Explicitly unmapped sample | **pass** | Context-window, token-counting, compaction, and context-engineering claims match official documentation. Kept unmapped; no official exam-guide evidence supports mapping it. |
| `evaluation-basics` | Domain 2, all 6 objectives | **pass** | Evaluation criteria, hallucination mitigation, human review, output formats, and bias framing checked. Bias remains limited to framing/equal-treatment principles in Claude's Constitution; no change. |
| `configuration-basics` | Domain 5, all 4 objectives | **major-fix** | Multiple statements treated project memory as nonexistent or as the only reuse path. Corrected to distinguish full transcripts, knowledge/instructions, and project memory. |
| `prompt-structure` | Domain 1, all 4 objectives | **pass** | Prompt specificity, decomposition, iteration, and task-type adaptation checked against prompting and evaluation documentation; no change. |
| `product-selection` | Domain 3, all 4 objectives | **major-fix** | The project callout and takeaway repeated the blanket “context is not shared” rule. Corrected with the project-memory nuance. A separate callout title conflated project memory with project knowledge/RAG and was corrected to refer to project knowledge retrieval. Model and product-surface guidance otherwise accurate. |
| `workflow-design` | Domain 4, all 5 objectives | **pass** | Requirements, research, solution design, integration, and stakeholder communication checked against evaluation, prompting, research, Constitution, and Usage Policy sources; no change. |
| `governance-responsible-use` | Domain 6, all 4 objectives | **pass** | High-risk categories, human review, disclosure, privacy, and oversight checked against the Usage Policy, Privacy Policy, and Claude's Constitution. The page read on 2026-10-28 is effective 2026-11-12; content uses durable principles and no change was needed. |
| `troubleshooting-optimization` | Domain 7, all 3 objectives | **pass** | Diagnosis, feedback loops, baselines, and quality/latency/cost trade-offs checked; no invented metrics or fixed limits; no change. |

## Glossary audit

| Entry | Status | Finding / action |
|---|---|---|
| `token` | **pass** | Accurate; notes non-1:1 word mapping and language variation. |
| `context-window` | **pass** | Accurate but intentionally non-exhaustive; system prompt, messages, documents, tools, and output are listed. |
| `context-rot` | **minor-fix** | Corrected to say degradation grows with token count; irrelevant/long content can worsen it. |
| `prompt` | **pass** | Accurate. |
| `system-prompt` | **pass** | Accurate. |
| `temperature` | **pass** | Accurate at the general level. |
| `few-shot-examples` | **pass** | Accurate. |
| `hallucination` | **minor-fix** | Corrected to the official “factually incorrect or inconsistent with context” standard; plausibility is not required. |
| `prompt-injection` | **pass** | Accurate and appropriately defensive. |
| `grounding` | **pass** | Accurate. |
| `rag` | **pass** | “Helps reduce fabrication” is a risk reduction, not a guarantee; wording is acceptable. |
| `evaluation` | **pass** | Accurate. |
| `tool-use` | **pass** | Accurate. |
| `compaction` | **pass** | Accurate. |
| `latency` | **pass** | Accurate at the general level. |

## Source audit

All 27 URLs returned HTTP 200 on 2026-10-28. Body-level claims were spot-checked against the current
rendered pages. Status is about the registered claim set, not merely link availability.

| Source | HTTP | Status | Finding |
|---|---:|---|---|
| `ccao-f-exam-guide-v1` | 200 | **pass** | Exam code, 60/120 format, weights, objectives, and policies match the verified v1.0 guide. |
| `anthropic-partner-certifications` | 200 | **pass** | Certification catalogue and CCAO-F listing checked. |
| `anthropic-certification-faq` | 200 | **pass** | Format, scoring, retake, validity, and eligibility claims checked. |
| `anthropic-associate-certification` | 200 | **pass** | Registration page and $99 listing checked. |
| `anthropic-associate-prep-course` | 200 | **pass** | Prep path and its study-resource status checked. |
| `pearson-anthropic-program` | 200 | **pass** | Page now resolves; the future-revision notice remains only partially verified and is not blended into v1.0. |
| `anthropic-context-windows-doc` | 200 | **pass** | Context-window composition, cached-prefix occupancy, context rot, and compaction references checked. |
| `anthropic-token-counting-doc` | 200 | **pass** | Estimation behavior and tokenizer dependence checked. |
| `anthropic-compaction-doc` | 200 | **pass** | Server-side compaction summary behavior checked. |
| `anthropic-context-engineering-blog` | 200 | **pass** | Context rot, high-signal curation, and compaction checked. |
| `anthropic-reduce-hallucinations-doc` | 200 | **pass** | Hallucination definition, quote grounding, retraction, and validation limits checked. |
| `anthropic-evaluation-docs` | 200 | **pass** | Success criteria, task fidelity, multidimensional evaluation, and expert judgment checked. |
| `anthropic-prompting-best-practices` | 200 | **pass** | Explicit instructions, context, examples, and formatting guidance checked. |
| `anthropic-structured-outputs-doc` | 200 | **pass** | Schema-constrained, parseable output checked. |
| `anthropic-artifacts-doc` | 200 | **pass** | Self-contained output, 15-line guideline, editability, and sharing checked. |
| `anthropic-claude-constitution` | 200 | **pass** | Balanced framing, equal treatment, non-deception, and human oversight checked. |
| `anthropic-projects-overview` | 200 | **pass** | Workspace, knowledge, instructions, RAG, sharing, and free-project limits checked. |
| `anthropic-projects-manage` | 200 | **minor-fix** | Replaced the blanket “context is not shared” bullet with the full-transcript/project-memory distinction. |
| `anthropic-projects-rag` | 200 | **pass** | Automatic RAG, up-to-10x capacity, retrieval, and reversibility checked. |
| `anthropic-connectors-help` | 200 | **pass** | Inherited permissions, Owner enablement, action restrictions, private-project rule, and unshareable synced chats checked. |
| `anthropic-google-workspace-connectors` | 200 | **pass** | Availability, default approval, minimum retrieval, retention, and training caveat checked. |
| `anthropic-research-help` | 200 | **pass** | Multi-step research and connector behavior checked; citation claim is corroborated by the official research announcement, not this page alone. |
| `anthropic-models-overview` | 200 | **pass** | Capability tiers, latency, price, context/output limits, and batch/cache pricing checked. |
| `anthropic-choosing-model` | 200 | **pass** | Capability/speed/cost/effort balance, efficiency-first/capability-first, and benchmark guidance checked. |
| `anthropic-privacy-policy` | 200 | **pass** | Input/output collection, permissions, training/opt-out caveats, integrations, deletion, and business-customer scope checked. |
| `anthropic-usage-policy` | 200 | **pass** | Universal standards, high-risk categories, human review, disclosure, and agent responsibility checked. Page effective 2026-11-12; applies to attempts on or after that date. |
| `anthropic-building-effective-agents` | 200 | **pass** | Workflow/agent distinction, prompt chaining, routing, parallelization, evaluator-optimizer, checkpoints, and measurement checked; December 2024 tooling details remain excluded. |

## Domain practice sets and coverage

| Set | Bank items | Set after fix | Status |
|---|---:|---:|---|
| `domain-1-prompting-set` | 8 | **8** | **minor-fix** — added 2 missing items |
| `domain-2-output-validation-set` | 14 | **14** | **pass** |
| `domain-3-context-set` | 8 | **8** | **pass** |
| `domain-4-workflow-set` | 10 | **10** | **minor-fix** — added 2 missing items |
| `domain-5-configuration-set` | 8 | **8** | **pass** |
| `domain-6-governance-set` | 8 | **8** | **minor-fix** — added 2 missing items |
| `domain-7-troubleshooting-set` | 6 | **6** | **minor-fix** — added 2 missing items |
| `mixed-foundations-set` | 62 | **62** | **pass** — derived from the full reviewed bank |

All lesson `relatedQuestionIds` still resolve. The Context Window lesson remains intentionally
unmapped and is not counted as exam coverage.

## Timed mock exam integrity

| Check | Result |
|---|---|
| Requested format | **60 items / 120 minutes** from the verified blueprint |
| Domain weights | **14 / 21 / 12 / 16 / 12 / 15 / 10** |
| Available reviewed items | **8 / 14 / 8 / 10 / 8 / 8 / 6** |
| Actual allocation | **8 / 13 / 8 / 10 / 7 / 8 / 6** |
| Selected items | **60** distinct reviewed IDs |
| Duplicates / filler | **none** |
| Shortfall | **0** |
| Seed behavior | deterministic for the same attempt seed; different seeds change selection/order |
| Resolution | every selected ID resolves to a reviewed question |
| Deadline/recovery | unchanged from C2.8; not re-exercised by E2E in this audit |

**Allocation expectation — accepted deviation:** the task brief listed an allocation of
`8 / 13 / 7 / 10 / 7 / 9 / 6`. That is not achievable with the current bank: Domain 6 has only **8**
reviewed items, so it cannot receive 9. The selector correctly caps Domain 6 at 8 and gives the spare
slot to Domain 3, the next-largest weighted deficit, producing `8 / 13 / 8 / 10 / 7 / 8 / 6`. Filling
the requested array would require either a ninth reviewed Domain 6 item (not added; it would increase
the bank to 63 and require new content review) or a duplicate/fabricated item (prohibited). The project
owner accepted the actual allocation on 2026-10-28. This is an accepted deviation, not a code change
and not a claim that the original target was met. The actual allocation is asserted in the targeted
test.

## Unresolved items and limitations

1. **Timed allocation expectation — accepted deviation, not fixed:** the project owner accepted the
   actual `8 / 13 / 8 / 10 / 7 / 8 / 6` allocation on 2026-10-28 because it respects weights,
   availability, and the no-filler rule. No code change was made, and the original target
   `8 / 13 / 7 / 10 / 7 / 9 / 6` is not claimed. Adding a ninth Domain 6 item remains a separate
   content-authoring decision, not an audit fix.
2. **Usage Policy effective date:** the page read on 2026-10-28 is effective 2026-11-12. It applies if
   the attempt is on or after that date; an earlier attempt could be governed by a prior version. No
   earlier version was available for comparison. Content cites durable principles, not dated policy
   details.
3. **Research citation traceability:** the registered Help Center page supports multi-step research;
   the citation claim is corroborated by the official announcement but that announcement is not a
   registry entry. No content change was needed.
4. **Help Center volatility:** UI labels, plan limits, and model names remain time-sensitive. The
   coverage matrix already flags these; this audit did not freeze them.
5. **Context Window lesson:** remains unmapped. No official exam-guide evidence justifies mapping it to
   Domain 3, so it stays a sample.
6. **No full local regression:** `npm test`, full Playwright E2E, and `npm run build` were not run for
   this audit. Targeted tests, typecheck, and lint are recorded below; full CI is pending a push.
7. **No deployment:** Vercel remains unverified and no deployment was performed.
8. **No second independent content review:** the two major-fix lesson corrections are present and
   covered by targeted lesson/content tests, but this final review did not perform a second full
   independent audit of every lesson sentence. The audit statuses record the original findings and the
   corrections listed above.

## Local verification

| Check | Status |
|---|---|
| `git diff --check` | **Pass** — re-run after final edits; only Git's LF-to-CRLF normalization warnings, no whitespace errors |
| Content validation through targeted tests | **Pass** — content pack and source/objective references loaded and validated |
| Targeted unit/integration tests | **Pass** — 9 files / 71 tests (`question-bank`, `curriculum`, `timed-exam-content`, `domain-2-content`, `domain-5-content`, `glossary`, `lesson`, `practice-page`, `mock-exam`) |
| Final-review focused tests | **Pass** — 3 files / 12 tests (`lesson`, `glossary`, `timed-exam-content`) after the callout-title correction |
| `npm run typecheck` | **Pass** — re-run after final edits |
| `npm run lint` | **Pass** — 0 problems; re-run after final edits |
| Full `npm test` | Not run locally; delegated to CI |
| Full Playwright E2E | Not run locally; delegated to CI |
| `npm run build` | Not run locally; delegated to CI |
| GitHub Actions | Pending a future commit/push |
| Vercel deployment | Not performed |

## Git state at audit completion

- Branch: `main`
- Baseline commit: `8631d55` (`feat: add timed mock exam with deadline recovery`)
- Changes: modified files and the new audit document are unstaged/untracked; nothing is staged
- No branch change, commit, push, deploy, reset, stash, or destructive cleanup was performed.
