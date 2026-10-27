import {
  questionBankEntrySchema,
  questionSchema,
  type Question,
  type QuestionBankEntry,
} from "../../../domain";

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

const guideSourceId = "ccao-f-exam-guide-v1";

function reviewedEntry(
  question: Question,
  objectiveId: string,
  technicalSourceIds: readonly string[],
): QuestionBankEntry {
  const sourceIds = [...new Set([guideSourceId, ...technicalSourceIds])];

  return questionBankEntrySchema.parse({
    question,
    certificationId: "claude-associate-foundations",
    blueprintId: "ccao-f-v1",
    examMapping: {
      status: "verified",
      objectiveIds: [objectiveId],
      note: `Original practice item mapped to the verified CCAO-F v1.0 Domain 2 objective "${objectiveId}". It is not official exam content.`,
    },
    contentStatus: "published",
    verification: {
      status: "verified",
      checkedAt: "2026-10-26",
      note: "Reviewed against Exam Guide v1.0 for objective scope and against the cited Anthropic documentation for the technical claims. The item is original; no official question or third-party exam content was copied.",
      sourceIds,
    },
  });
}

const accuracyReviewPlan: Question = questionSchema.parse({
  id: "output-accuracy-review-plan",
  type: "single-choice",
  stem: "Claude has produced a polished competitor analysis with a table of market-share figures and a list of product risks. You have the source reports. Which review plan best evaluates the analysis for accuracy and completeness?",
  choices: [
    {
      id: "format-only",
      text: "Check that the table is well formatted and the tone matches the audience.",
      explanation:
        "Định dạng và tone không chứng minh số liệu hay nhận định đúng; đây chỉ là kiểm tra trình bày.",
    },
    {
      id: "verify-and-check-sections",
      text: "Verify each figure and material claim against the source reports, then check the analysis against the requested sections, risks, and edge cases.",
      explanation:
        "Đúng: accuracy cần đối chiếu từng claim với nguồn; completeness cần kiểm tra theo yêu cầu và edge case, không chỉ đọc bản nháp.",
    },
    {
      id: "make-longer",
      text: "Ask Claude to expand the analysis until it is at least ten pages long.",
      explanation:
        "Độ dài không bảo đảm độ chính xác hay đầy đủ; kéo dài có thể thêm lỗi và nội dung không có trong nguồn.",
    },
    {
      id: "second-output",
      text: "Generate a second Claude response and keep the one with more citations.",
      explanation:
        "Bản thứ hai có thể giúp phát hiện khác biệt, nhưng nhiều citation hơn không có nghĩa là các trích dẫn đúng hoặc bao phủ yêu cầu.",
    },
  ],
  correctChoiceIds: ["verify-and-check-sections"],
  correctExplanation:
    "Đánh giá accuracy bằng cách kiểm tra từng figure và material claim với source; đánh giá completeness bằng checklist các phần, risk và edge case mà người dùng yêu cầu. Định dạng, độ dài và số lượng citation không thay thế việc kiểm chứng.",
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
        "Không có mâu thuẫn chỉ giải quyết accuracy; bỏ sót constraint quan trọng vẫn là thiếu completeness.",
    },
    {
      id: "accurate-incomplete",
      text: "Accurate but incomplete; add the missing constraints, then check the brief against the required sections before publishing.",
      explanation:
        "Đúng: nội dung hiện có khớp notes, nhưng thiếu thông tin bắt buộc. Bổ sung rồi đối chiếu checklist.",
    },
    {
      id: "call-hallucination",
      text: "Hallucinated; rewrite it because it left out information.",
      explanation:
        "Bỏ sót không phải hallucination. Hallucination là claim sai hoặc không nhất quán với nguồn, không phải thiếu nội dung.",
    },
    {
      id: "call-bias",
      text: "Biased; remove the stakeholder quotes because they may favor one group.",
      explanation:
        "Không có bằng chứng thiên lệch; xóa quote có thể làm mất thông tin cần thiết.",
    },
  ],
  correctChoiceIds: ["accurate-incomplete"],
  correctExplanation:
    "Bản nháp đúng với notes nhưng thiếu hai ràng buộc mà stakeholder coi là bắt buộc. Đó là accurate nhưng incomplete: bổ sung thông tin thiếu và kiểm tra lại theo yêu cầu, thay vì gọi là hallucination hoặc bias khi không có bằng chứng.",
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
        "Không phải chỉ thiếu thông tin: câu trả lời thêm một section và quy định không tồn tại, còn mâu thuẫn với policy.",
    },
    {
      id: "hallucination",
      text: "The answer fabricates a policy detail that contradicts the supplied source, so it is a hallucination and must be corrected.",
      explanation:
        "Đúng: chi tiết bịa đặt, không có trong nguồn và mâu thuẫn với nguồn, là hallucination.",
    },
    {
      id: "bias",
      text: "The answer is biased toward business-class travelers.",
      explanation:
        "Không có bằng chứng về bias; vấn đề chính là claim không được nguồn hỗ trợ.",
    },
    {
      id: "specific-is-enough",
      text: "The answer is acceptable because the section number makes it sound specific.",
      explanation:
        "Sự cụ thể không phải bằng chứng. Một section number bịa vẫn là thông tin sai.",
    },
  ],
  correctChoiceIds: ["hallucination"],
  correctExplanation:
    "Câu trả lời tạo ra Section 4.2 và một quy định không có trong policy, đồng thời trái với điều kiện premium economy trong nguồn. Đây là hallucination: cần sửa theo đúng nguồn và kiểm tra lại trước khi dùng.",
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
        "Đúng: claim không có nguồn hỗ trợ là dấu hiệu hallucination.",
    },
    {
      id: "tone",
      text: "The brief uses a formal tone that differs from the requested conversational style.",
      explanation:
        "Sai: đây là vấn đề style, không phải hallucination hay inconsistency.",
    },
    {
      id: "conflicting-dates",
      text: "Two sections give different dates for the same policy change.",
      explanation:
        "Đúng: hai phần mâu thuẫn nhau là inconsistency.",
    },
    {
      id: "wrong-year",
      text: "A report is described as published in 2024, but the source says 2022.",
      explanation:
        "Đúng: chi tiết mâu thuẫn với nguồn là lỗi factual/hallucination.",
    },
    {
      id: "omitted-example",
      text: "The brief leaves out a minor example that the request did not require.",
      explanation:
        "Sai: thiếu một ví dụ không bắt buộc là vấn đề completeness nhỏ, không phải bằng chứng bịa đặt.",
    },
    {
      id: "uncertainty",
      text: "The brief says it does not have enough information to answer one sub-question.",
      explanation:
        "Sai: thừa nhận thiếu thông tin là hành vi phù hợp, không phải hallucination.",
    },
  ],
  correctChoiceIds: ["missing-stat", "conflicting-dates", "wrong-year"],
  correctExplanation:
    "Ba dấu hiệu đều cho thấy claim không khớp hoặc mâu thuẫn với nguồn: thống kê không tồn tại, ngày mâu thuẫn và năm sai. Tone, thiếu ví dụ không bắt buộc, hay việc thừa nhận thiếu thông tin không tự động là hallucination.",
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
        "Sai: tự đánh giá lại có thể vẫn sai; cần kiểm tra nguồn.",
    },
    {
      id: "quote-source",
      text: "Find the retention section in the policy, quote the exact passage, and confirm that it states 90 days; if no passage supports it, remove or revise the claim.",
      explanation:
        "Đúng: đối chiếu claim với đoạn nguồn cụ thể và rút lại nếu không có bằng chứng.",
    },
    {
      id: "format-check",
      text: "Check that the FAQ is shorter than the policy and uses consistent formatting.",
      explanation:
        "Sai: độ dài và định dạng không xác minh nội dung.",
    },
    {
      id: "majority-vote",
      text: "Run the same prompt three times and keep the answer that appears most often.",
      explanation:
        "Sai: lặp lại có thể giúp phát hiện khác biệt, nhưng số đông không thay thế việc kiểm tra nguồn.",
    },
  ],
  correctChoiceIds: ["quote-source"],
  correctExplanation:
    "Fact-check đáng tin cậy là tìm đúng đoạn trong nguồn, trích nguyên văn và xác nhận claim. Nếu không tìm thấy đoạn hỗ trợ, phải sửa hoặc bỏ claim; câu trả lời tự tin hay lặp lại nhiều lần không đủ.",
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
        "Đúng: giới hạn nguồn và cho phép thừa nhận thiếu thông tin giúp giảm claim bịa.",
    },
    {
      id: "quote-first",
      text: "Ask Claude to extract exact supporting quotes before drafting, then remove claims without a supporting quote.",
      explanation:
        "Đúng: quote trước giúp grounding và tạo dấu vết kiểm tra cho từng claim.",
    },
    {
      id: "increase-length",
      text: "Increase the response length so that every topic gets more coverage.",
      explanation:
        "Sai: dài hơn có thể thêm nội dung không được nguồn hỗ trợ.",
    },
    {
      id: "verify-and-retract",
      text: "Ask Claude to verify each claim against a cited source and retract claims it cannot support.",
      explanation:
        "Đúng: bước verification và retraction trực tiếp loại bỏ claim không có bằng chứng.",
    },
    {
      id: "accept-fluency",
      text: "Accept fluent, specific answers because they are more likely to be accurate.",
      explanation:
        "Sai: độ trôi chảy và cụ thể không bảo đảm tính đúng.",
    },
    {
      id: "warmer-tone",
      text: "Use a warmer, more confident tone in the prompt.",
      explanation:
        "Sai: tone không làm claim có nguồn hỗ trợ.",
    },
  ],
  correctChoiceIds: ["restrict-sources", "quote-first", "verify-and-retract"],
  correctExplanation:
    "Ba cách hiệu quả là giới hạn nguồn, trích quote làm nền và verify/retract từng claim. Chúng tạo ra bằng chứng kiểm tra được; độ dài, độ trôi chảy và tone không thay thế việc đó.",
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
        "Sai: completeness và citation không thay thế việc chuyên gia xác nhận thông tin quan trọng trong tình huống high-stakes.",
    },
    {
      id: "clinician-approval",
      text: "Have a qualified clinician verify the doses and warning signs against the formulary and approve the instructions before use.",
      explanation:
        "Đúng: đây là thông tin y tế có rủi ro cao; cần human review và xác minh với nguồn trước khi dùng.",
    },
    {
      id: "self-consistency",
      text: "Ask Claude to answer again and publish if the two answers agree.",
      explanation:
        "Sai: hai câu trả lời giống nhau vẫn có thể cùng sai; consistency không thay thế kiểm chứng chuyên môn.",
    },
    {
      id: "disclaimer",
      text: "Add a disclaimer that the instructions may be inaccurate, then publish.",
      explanation:
        "Sai: disclaimer không giảm rủi ro của liều thuốc hoặc dấu hiệu cảnh báo sai.",
    },
  ],
  correctChoiceIds: ["clinician-approval"],
  correctExplanation:
    "Đây là ví dụ high-stakes: liều thuốc và dấu hiệu cảnh báo ảnh hưởng trực tiếp đến an toàn bệnh nhân. Anthropic khuyến nghị luôn validate critical information, đặc biệt trong high-stakes decisions; cần chuyên gia có thẩm quyền kiểm tra nguồn và phê duyệt trước khi dùng.",
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
        "Đúng: hậu quả pháp lý và tài chính lớn; cần chuyên gia xác minh điều khoản trước khi dùng.",
    },
    {
      id: "lunch-themes",
      text: "A manager asks for five low-risk themes for an optional team lunch.",
      explanation:
        "Sai: đây là tình huống ít rủi ro, dễ đảo ngược và không cần chuyên gia phê duyệt.",
    },
    {
      id: "revenue-conflict",
      text: "A finance analyst receives a revenue figure that conflicts with two source systems.",
      explanation:
        "Đúng: nguồn mâu thuẫn là tín hiệu cần additional verification trước khi dùng con số.",
    },
    {
      id: "variable-names",
      text: "An engineer asks for three alternative variable names for a private prototype.",
      explanation:
        "Sai: đây là lựa chọn kỹ thuật nhỏ, dễ sửa và không cần human review đặc biệt.",
    },
    {
      id: "obsolete-safety-notice",
      text: "A product team plans to publish a safety notice generated from an obsolete regulation.",
      explanation:
        "Đúng: thông tin công khai, ảnh hưởng an toàn và nguồn đã lỗi thời; cần xác minh và chuyên gia phê duyệt.",
    },
    {
      id: "private-meeting-note",
      text: "A colleague asks for a one-sentence recap of a private meeting that the team already attended.",
      explanation:
        "Sai: nội dung nội bộ, rủi ro thấp và có thể kiểm tra nhanh; không phải trường hợp escalation rõ ràng.",
    },
  ],
  correctChoiceIds: ["contract-payment", "revenue-conflict", "obsolete-safety-notice"],
  correctExplanation:
    "Ba tình huống có hậu quả lớn, nguồn mâu thuẫn hoặc nguồn đã lỗi thời: tóm tắt điều khoản thanh toán, số liệu doanh thu xung đột và thông báo an toàn dựa trên quy định cũ. Các lựa chọn còn lại có rủi ro thấp hoặc dễ đảo ngược, nên không tự động cần human review.",
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
        "Sai: làm mất chi tiết và có thể tạo claim mới không được nguồn hỗ trợ.",
    },
    {
      id: "preserve-and-recheck",
      text: "Preserve the facts, numbers, and stated uncertainties; rewrite structure and terms for executives; then compare the revision with the original and source for factual drift.",
      explanation:
        "Đúng: thay đổi audience nhưng giữ nguyên sự thật và kiểm tra lại sau khi edit.",
    },
    {
      id: "add-more-detail",
      text: "Add more technical detail so executives can see the complexity.",
      explanation:
        "Sai: thêm chi tiết kỹ thuật không giải quyết vấn đề audience và có thể làm bản tóm tắt khó dùng hơn.",
    },
    {
      id: "delete-caveats",
      text: "Shorten it by deleting the caveats and incident timeline.",
      explanation:
        "Sai: xóa caveat và timeline có thể bỏ mất uncertainty hoặc thông tin cần thiết.",
    },
  ],
  correctChoiceIds: ["preserve-and-recheck"],
  correctExplanation:
    "Edit cho audience phải thay đổi cách trình bày, không thay đổi sự thật. Giữ facts, numbers và uncertainty, viết lại cấu trúc và thuật ngữ cho executive committee, rồi so lại với bản gốc và nguồn để phát hiện factual drift. Anthropic xem tone/style theo target audience và relevance/coherence là tiêu chí đánh giá riêng.",
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
        "Đúng: factual grounding là điều kiện trước khi so sánh chất lượng trình bày.",
    },
    {
      id: "apply-audience-criteria",
      text: "Apply audience criteria such as plain language, required steps, and expected reading level to compare which draft serves the reader.",
      explanation:
        "Đúng: tone/style và relevance phải được đánh giá theo target audience, không chỉ theo độ dài.",
    },
    {
      id: "merge-and-recheck",
      text: "Preserve accurate content from both drafts, merge the stronger structure, and re-check the merged version for new claims or changed meaning.",
      explanation:
        "Đúng: kết hợp nội dung đúng rồi kiểm tra lại để tránh factual drift sau khi ghép.",
    },
    {
      id: "choose-longer",
      text: "Choose the longer draft because it includes more detail.",
      explanation:
        "Sai: nhiều chi tiết hơn không có nghĩa là phù hợp audience hoặc chính xác hơn.",
    },
    {
      id: "choose-confident",
      text: "Pick the draft with more confident language because confidence improves clarity.",
      explanation:
        "Sai: giọng tự tin không thay thế bằng chứng và có thể che giấu uncertainty cần thiết.",
    },
    {
      id: "average-sentences",
      text: "Average the two drafts sentence by sentence to create a balanced version.",
      explanation:
        "Sai: ghép câu máy móc có thể tạo câu sai ngữ cảnh hoặc thay đổi nghĩa.",
    },
  ],
  correctChoiceIds: ["check-source", "apply-audience-criteria", "merge-and-recheck"],
  correctExplanation:
    "Ba bước đúng là kiểm tra từng draft với source, so sánh theo tiêu chí audience, rồi merge nội dung chính xác và kiểm tra lại bản ghép. Độ dài, giọng tự tin và việc ghép câu trung bình không bảo đảm chất lượng.",
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
        "Sai: một narrative dài không phục vụ tốt cả downstream spreadsheet, executive brief và tài liệu có thể chỉnh sửa.",
    },
    {
      id: "fit-formats-to-use",
      text: "Produce structured data (for example, JSON or a table) for the spreadsheet, a concise prose brief for executives, and a substantial editable document or artifact for the working plan.",
      explanation:
        "Đúng: mỗi format phù hợp với cách người dùng sẽ đọc, xử lý hoặc tái sử dụng nội dung.",
    },
    {
      id: "all-json",
      text: "Put every deliverable in a single JSON object and ask executives to read the JSON.",
      explanation:
        "Sai: JSON phù hợp cho downstream processing, nhưng không phải format dễ đọc cho executive brief.",
    },
    {
      id: "chat-only",
      text: "Use only a chat message because artifacts cannot be edited.",
      explanation:
        "Sai: artifacts có thể được chỉnh sửa; chat message không phù hợp cho tài liệu dài dùng lại nhiều tháng.",
    },
  ],
  correctChoiceIds: ["fit-formats-to-use"],
  correctExplanation:
    "Chọn format theo cách nội dung sẽ được dùng: structured data cho hệ thống downstream, prose ngắn cho người đọc executive, và artifact/document tự chứa cho tài liệu dài cần chỉnh sửa. Anthropic mô tả structured outputs cho valid, parseable downstream processing và artifacts cho nội dung lớn, self-contained, có thể edit/reuse.",
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
        "Đúng: structured output giúp response đúng schema và parse được cho hệ thống downstream.",
    },
    {
      id: "status-inline",
      text: "Use a short inline answer in the conversation for a one-sentence status update.",
      explanation:
        "Đúng: nội dung ngắn, không self-contained lớn, nên trả lời trực tiếp trong chat là phù hợp.",
    },
    {
      id: "charter-artifact",
      text: "Use an artifact or editable document for a long, self-contained project charter that the team will revise over time.",
      explanation:
        "Đúng: artifact phù hợp với nội dung lớn, self-contained, có thể edit và reuse.",
    },
    {
      id: "townhall-json",
      text: "Use a JSON object for a narrative memo that will be read aloud at a town hall.",
      explanation:
        "Sai: memo để đọc aloud cần prose dễ đọc; JSON là format cho downstream processing.",
    },
    {
      id: "tiny-artifact",
      text: "Create a separate artifact for a two-word confirmation so it is easy to find.",
      explanation:
        "Sai: nội dung quá ngắn và không self-contained; artifact không phù hợp.",
    },
    {
      id: "report-in-chat",
      text: "Keep a thirty-page report entirely in the chat message so it stays with the conversation.",
      explanation:
        "Sai: báo cáo dài, self-contained và có thể cần chỉnh sửa nên artifact/document phù hợp hơn.",
    },
  ],
  correctChoiceIds: ["invoice-json", "status-inline", "charter-artifact"],
  correctExplanation:
    "Ba lựa chọn đúng khớp format với cách dùng: JSON cho hệ thống kế toán parse, câu trả lời ngắn trực tiếp trong chat, và artifact/document cho project charter dài cần chỉnh sửa. JSON cho memo đọc aloud, artifact cho xác nhận hai từ và nhồi báo cáo 30 trang vào chat đều không phù hợp.",
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
        "Đúng: chỉ chọn một phía, dùng nhãn loaded và bỏ phân tích trái chiều là biased framing.",
    },
    {
      id: "hallucination",
      text: "It is a hallucination because the summary contains no direct quotes from opponents.",
      explanation:
        "Sai: thiếu quote từ phía đối lập là vấn đề chọn nguồn/framing, không tự động là bịa đặt.",
    },
    {
      id: "incomplete-only",
      text: "It is only incomplete; adding more supporters' quotes would fix it.",
      explanation:
        "Sai: thêm quote cùng một phía không sửa được one-sided framing hoặc loaded language.",
    },
    {
      id: "style-only",
      text: "It is a style issue; the loaded labels are acceptable if the summary is concise.",
      explanation:
        "Sai: nhãn “radical outsiders” không chỉ là style; nó thể hiện framing thiên lệch.",
    },
  ],
  correctChoiceIds: ["biased-framing"],
  correctExplanation:
    "Bản tóm tắt chỉ chọn bằng chứng ủng hộ, gọi phía phản đối bằng nhãn loaded và bỏ phân tích ngân sách trái chiều. Đó là biased framing/evidence selection. Claude's Constitution yêu cầu Claude unbiased và even-handed, trình bày multiple perspectives, dùng neutral terminology và tránh selective emphasis.",
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
        "Đúng: cùng một hành vi nhưng bị gắn nhãn khác nhau theo ứng viên là dấu hiệu thiên lệch/unequal standards.",
    },
    {
      id: "age-assumption",
      text: "The recommendation rejects a candidate because of their age and assumes they will resist new tools.",
      explanation:
        "Đúng: dùng tuổi để suy ra năng lực là định kiến, không dựa trên bằng chứng phỏng vấn.",
    },
    {
      id: "selective-evidence",
      text: "It cites only evidence that supports the preferred candidate and omits contrary interview notes.",
      explanation:
        "Đúng: chọn lọc bằng chứng một phía là bias trong cách lập luận.",
    },
    {
      id: "too-short",
      text: "It is shorter than the requested two pages.",
      explanation:
        "Sai: độ dài là vấn đề completeness/format, không phải bias.",
    },
    {
      id: "formal-tone",
      text: "It uses a formal tone instead of a conversational one.",
      explanation:
        "Sai: tone là vấn đề style, không phải bias.",
    },
    {
      id: "unsupported-salary",
      text: "It states a salary figure that does not appear in the interview notes.",
      explanation:
        "Sai: con số không có trong nguồn là hallucination/factual error, không phải bias.",
    },
  ],
  correctChoiceIds: ["different-labels", "age-assumption", "selective-evidence"],
  correctExplanation:
    "Ba dấu hiệu bias là áp đặt tiêu chuẩn khác nhau cho cùng hành vi, suy luận từ tuổi thay vì bằng chứng, và chỉ chọn bằng chứng ủng hộ ứng viên mong muốn. Độ dài là completeness, tone là style, còn salary không có trong notes là hallucination. Claude's Constitution yêu cầu equal and fair treatment và không facilitate illegal discrimination dựa trên protected characteristics.",
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
        "Đúng: prompt rõ ràng nêu goal, audience, facts, constraints và format. Ví dụ ngắn giúp Claude bám đúng cấu trúc và giọng điệu.",
    },
    {
      id: "ask-harder",
      text: "Add the instruction \"try harder and be more creative.\"",
      explanation:
        "Sai: yêu cầu chung chung không bổ sung thông tin còn thiếu, nên kết quả vẫn có thể bỏ sót pricing và audience.",
    },
    {
      id: "raise-temperature",
      text: "Raise the temperature so the draft varies more.",
      explanation:
        "Sai: temperature chỉ thay đổi độ ngẫu nhiên, không cung cấp facts hay ràng buộc cần thiết.",
    },
    {
      id: "more-adjectives",
      text: "Add more adjectives and emojis to make the email energetic.",
      explanation:
        "Sai: trang trí bề mặt không sửa được thiếu context, pricing hoặc mục tiêu.",
    },
  ],
  correctChoiceIds: ["add-context-and-format"],
  correctExplanation:
    "Một prompt tốt cho business task cần nêu rõ mục tiêu, người đọc, dữ kiện quan trọng, ràng buộc, format và tiêu chí thành công. Khi format quan trọng, ví dụ ngắn là cách ổn định để truyền đạt cấu trúc. Các lựa chọn còn lại chỉ thay đổi giọng điệu hoặc tham số mà không bổ sung thông tin.",
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
        "Đúng: chia thành plan và draft giúp kiểm tra hướng đi trước khi đầu tư vào toàn bộ nội dung.",
    },
    {
      id: "intermediate-artifacts",
      text: "Define intermediate artifacts and acceptance criteria for each step.",
      explanation:
        "Đúng: đầu ra trung gian và tiêu chí rõ ràng giúp phát hiện lỗi sớm và giữ các bước nhất quán.",
    },
    {
      id: "separate-and-reconcile",
      text: "Run independent sub-tasks separately, then reconcile them with a final consistency check.",
      explanation:
        "Đúng: tách các phần độc lập rồi đối chiếu lại giảm tải cho một lần sinh và bắt được mâu thuẫn.",
    },
    {
      id: "one-paragraph",
      text: "Put every instruction into one long paragraph so nothing is lost.",
      explanation:
        "Sai: dồn mọi thứ vào một khối dài làm giảm độ rõ ràng và khó kiểm tra từng bước.",
    },
    {
      id: "final-first",
      text: "Request the final answer first and skip planning.",
      explanation:
        "Sai: bỏ qua bước lập kế hoạch dễ dẫn đến cấu trúc sai và phải làm lại toàn bộ.",
    },
    {
      id: "repeat-average",
      text: "Repeat the same request three times and average the answers.",
      explanation:
        "Sai: lặp lại không tạo ra decomposition; nó chỉ tạo thêm biến thể có thể cùng sai.",
    },
  ],
  correctChoiceIds: ["outline-first", "intermediate-artifacts", "separate-and-reconcile"],
  correctExplanation:
    "Decomposition hiệu quả là chia công việc thành các bước có đầu ra và tiêu chí rõ ràng, xử lý các phần độc lập riêng rồi đối chiếu lại. Cách này giúp kiểm soát chất lượng ở từng chặng thay vì hy vọng một câu trả lời dài làm đúng mọi thứ.",
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
        "Đúng: tóm tắt thông tin bền vững rồi khởi động context mới giữ được facts và decisions mà không mang theo toàn bộ lịch sử.",
    },
    {
      id: "remove-system",
      text: "Keep every raw message and delete the system instructions to make room.",
      explanation:
        "Sai: xóa system instructions có thể làm mất ràng buộc quan trọng, trong khi lịch sử thô vẫn chiếm chỗ.",
    },
    {
      id: "longer-replies",
      text: "Ask for longer replies so fewer turns are needed.",
      explanation:
        "Sai: câu trả lời dài hơn làm tăng token sử dụng và có thể đẩy context đến giới hạn nhanh hơn.",
    },
    {
      id: "forget-without-summary",
      text: "Tell Claude to forget irrelevant details without recording what must be retained.",
      explanation:
        "Sai: không có bản tóm tắt rõ ràng thì facts và decisions cần giữ có thể bị mất.",
    },
  ],
  correctChoiceIds: ["summary-restart"],
  correctExplanation:
    "Khi context gần đầy, cách an toàn là chưng cất những gì cần giữ — facts, constraints, decisions — thành bản tóm tắt, bắt đầu context mới với bản tóm tắt đó và lưu lại để dùng tiếp. Anthropic mô tả compaction như một cách tóm tắt hội thoại dài để tiếp tục làm việc, và context engineering nhấn mạnh việc giữ tập token tín hiệu cao thay vì toàn bộ lịch sử.",
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
        "Đúng: lấy đúng phần liên quan giảm nhiễu và tiết kiệm ngân sách context.",
    },
    {
      id: "summarize-older",
      text: "Summarize older turns while keeping decisions and constraints.",
      explanation:
        "Đúng: tóm tắt các lượt cũ giữ thông tin quyết định mà không giữ toàn bộ chi tiết.",
    },
    {
      id: "remove-stale",
      text: "Remove stale tool output that no longer affects the task.",
      explanation:
        "Đúng: output cũ không còn tác dụng chỉ chiếm chỗ và có thể gây nhầm lẫn.",
    },
    {
      id: "paste-everything",
      text: "Paste the entire knowledge base into every turn.",
      explanation:
        "Sai: dán toàn bộ tài liệu làm tăng token và giảm khả năng tập trung vào thông tin cần thiết.",
    },
    {
      id: "duplicate-system",
      text: "Duplicate the system prompt after every message.",
      explanation:
        "Sai: lặp lại system prompt không thêm thông tin mới và làm tăng kích thước context.",
    },
    {
      id: "keep-drafts",
      text: "Keep every intermediate draft forever.",
      explanation:
        "Sai: giữ mọi bản nháp làm context phình ra với nội dung đã bị thay thế.",
    },
  ],
  correctChoiceIds: ["retrieve-relevant", "summarize-older", "remove-stale"],
  correctExplanation:
    "Context tốt là tập thông tin nhỏ nhưng có tín hiệu cao: phần được truy xuất đúng nhu cầu, bản tóm tắt các lượt cũ giữ quyết định và ràng buộc, và loại bỏ output đã lỗi thời. Dán toàn bộ tài liệu, lặp system prompt hay giữ mọi bản nháp đều làm tăng nhiễu.",
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
        "Đúng: bóc tách yêu cầu thành các thành phần kiểm tra được rồi xác nhận với stakeholder giúp tránh xây dựng trên giả định sai.",
    },
    {
      id: "design-immediately",
      text: "Ask for the final system design immediately and skip requirements.",
      explanation:
        "Sai: bỏ qua requirements dễ tạo ra thiết kế đẹp nhưng không giải quyết đúng vấn đề.",
    },
    {
      id: "invent-gaps",
      text: "Ask Claude to invent missing requirements so the document looks complete.",
      explanation:
        "Sai: bịa yêu cầu không có trong nguồn là hallucination và có thể dẫn đến quyết định sai.",
    },
    {
      id: "loudest-stakeholder",
      text: "Summarize only the requests from the most senior stakeholder.",
      explanation:
        "Sai: chỉ nghe một phía bỏ qua actor và ràng buộc quan trọng từ các bên khác.",
    },
  ],
  correctChoiceIds: ["extract-and-validate"],
  correctExplanation:
    "Phân tích yêu cầu tốt là trích xuất actor, mục tiêu, ràng buộc và câu hỏi mở từ nguồn, rồi xác nhận lại với stakeholder trước khi thiết kế. Điều này tách việc hiểu vấn đề khỏi việc đề xuất giải pháp và giảm nguy cơ bịa hoặc bỏ sót yêu cầu.",
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
        "Đúng: hiểu quy trình hiện tại giúp chọn điểm tích hợp có giá trị thay vì tự động hóa mù quáng.",
    },
    {
      id: "human-checkpoints",
      text: "Add human checkpoints for high-impact or irreversible steps.",
      explanation:
        "Đúng: bước có hậu quả lớn hoặc khó đảo ngược cần con người xem xét và phê duyệt.",
    },
    {
      id: "pilot-measure",
      text: "Pilot with a small group and measure quality before scaling.",
      explanation:
        "Đúng: pilot nhỏ với tiêu chí đo lường giúp phát hiện lỗi trước khi mở rộng.",
    },
    {
      id: "automate-all",
      text: "Automate every step at once to maximize speed.",
      explanation:
        "Sai: tự động hóa toàn bộ ngay lập tức khuếch đại lỗi và khó xác định nguyên nhân.",
    },
    {
      id: "remove-review",
      text: "Remove review because Claude is consistent.",
      explanation:
        "Sai: tính nhất quán không thay thế kiểm tra ở bước quan trọng; model vẫn có thể sai.",
    },
    {
      id: "skip-baseline",
      text: "Skip baseline metrics to avoid slowing the rollout.",
      explanation:
        "Sai: không có baseline thì không thể biết tích hợp có cải thiện chất lượng hay không.",
    },
  ],
  correctChoiceIds: ["map-process", "human-checkpoints", "pilot-measure"],
  correctExplanation:
    "Tích hợp có trách nhiệm bắt đầu từ bản đồ quy trình hiện tại, thêm human checkpoint ở bước rủi ro cao, và pilot có đo lường trước khi mở rộng. Tự động hóa toàn bộ, bỏ review hoặc bỏ baseline đều làm tăng rủi ro và khó đánh giá kết quả.",
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
        "Đúng: Claude hỗ trợ phân tích nhưng con người vẫn chịu trách nhiệm ở quyết định có rủi ro tài chính và tuân thủ; log giúp truy vết.",
    },
    {
      id: "auto-approve-all",
      text: "Let Claude approve all exceptions to reduce delays.",
      explanation:
        "Sai: tự động phê duyệt mọi ngoại lệ bỏ qua human oversight ở bước có hậu quả lớn.",
    },
    {
      id: "confidence-only",
      text: "Approve automatically whenever Claude reports high confidence.",
      explanation:
        "Sai: confidence tự báo cáo không phải bằng chứng về tính đúng hay mức độ rủi ro.",
    },
    {
      id: "remove-audit",
      text: "Remove the audit log to protect employee privacy.",
      explanation:
        "Sai: xóa audit log làm mất khả năng truy vết và kiểm soát, không giải quyết privacy một cách đúng đắn.",
    },
  ],
  correctChoiceIds: ["recommend-human-decides"],
  correctExplanation:
    "Với quyết định tài chính và tuân thủ, Claude nên đóng vai trò hỗ trợ: chuẩn bị khuyến nghị và bằng chứng, còn con người phê duyệt và chịu trách nhiệm. Claude's Constitution nhấn mạnh không được làm suy yếu human oversight; audit log giúp kiểm tra lại quyết định.",
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
        "Đúng: ranh giới sử dụng rõ ràng và escalation giúp xử lý yêu cầu nhạy cảm đúng cách.",
    },
    {
      id: "disclose-ai",
      text: "Tell users they are interacting with AI and state the assistant's limitations.",
      explanation:
        "Đúng: minh bạch về AI và giới hạn giúp người dùng hiểu và đánh giá thông tin đúng mức.",
    },
    {
      id: "check-fairness",
      text: "Check outputs for illegal discrimination and biased treatment.",
      explanation:
        "Đúng: kiểm tra phân biệt đối xử và đối xử thiên lệch là một phần của responsible use.",
    },
    {
      id: "binding-legal",
      text: "Let the assistant give binding legal advice without review.",
      explanation:
        "Sai: lời khuyên pháp lý ràng buộc cần chuyên gia có thẩm quyền, không nên giao cho assistant không được review.",
    },
    {
      id: "hide-disclosure",
      text: "Hide the AI disclosure to improve engagement.",
      explanation:
        "Sai: che giấu việc dùng AI làm giảm minh bạch và có thể gây hiểu nhầm.",
    },
    {
      id: "override-oversight",
      text: "Allow the assistant to override human oversight.",
      explanation:
        "Sai: cho assistant vượt qua human oversight đi ngược nguyên tắc giám sát của con người.",
    },
  ],
  correctChoiceIds: ["prohibited-uses", "disclose-ai", "check-fairness"],
  correctExplanation:
    "Ba biện pháp phù hợp là định nghĩa ranh giới sử dụng và escalation, minh bạch về AI cùng giới hạn, và kiểm tra phân biệt đối xử/thiên lệch. Lời khuyên pháp lý ràng buộc không nên giao cho assistant, còn che giấu AI hoặc cho assistant vượt human oversight đều làm giảm trách nhiệm giải trình.",
  sourceIds: ["anthropic-claude-constitution"],
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
        "Đúng: xác định thiếu sót trong prompt/context trước giúp sửa đúng nguyên nhân thay vì đổi model mù quáng.",
    },
    {
      id: "largest-model",
      text: "Switch to the largest available model immediately.",
      explanation:
        "Sai: model lớn hơn không tự bổ sung schema, ví dụ hay ràng buộc còn thiếu.",
    },
    {
      id: "raise-temperature",
      text: "Raise the temperature to get a different answer.",
      explanation:
        "Sai: tăng temperature làm output khó đoán hơn, không đảm bảo có đủ field.",
    },
    {
      id: "ask-longer",
      text: "Ask for a longer answer and hope the missing fields appear.",
      explanation:
        "Sai: độ dài không thay thế yêu cầu rõ ràng về cấu trúc và nội dung bắt buộc.",
    },
  ],
  correctChoiceIds: ["inspect-prompt"],
  correctExplanation:
    "Khi output thiếu field hoặc mơ hồ, bước đầu là kiểm tra prompt và context: mục tiêu, schema đầu ra, ví dụ và ràng buộc đã được nêu rõ chưa. Đổi model hay tăng temperature không sửa được yêu cầu còn thiếu; đánh giá có tiêu chí giúp xác nhận sau khi sửa.",
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
        "Đúng: tiêu chí đo được và test case đại diện giúp biết thay đổi có thực sự cải thiện.",
    },
    {
      id: "compare-baseline",
      text: "Compare the revised prompt against the baseline on the same cases.",
      explanation:
        "Đúng: so sánh trên cùng bộ case giúp tách tác động của thay đổi khỏi biến thiên ngẫu nhiên.",
    },
    {
      id: "inspect-causes",
      text: "Inspect failures to decide whether the cause is instructions, context, or task decomposition.",
      explanation:
        "Đúng: phân loại nguyên nhân giúp sửa đúng chỗ thay vì thay đổi lung tung.",
    },
    {
      id: "change-many",
      text: "Change several variables at once so the fix is faster.",
      explanation:
        "Sai: đổi nhiều biến cùng lúc khiến không biết thay đổi nào tạo ra kết quả.",
    },
    {
      id: "first-fluent",
      text: "Accept the first fluent answer as the new baseline.",
      explanation:
        "Sai: câu trả lời trôi chảy không chứng minh đáp ứng tiêu chí.",
    },
    {
      id: "remove-failures",
      text: "Remove failing test cases to improve the score.",
      explanation:
        "Sai: xóa case khó làm sai lệch đánh giá và che giấu lỗi thật.",
    },
  ],
  correctChoiceIds: ["success-criteria", "compare-baseline", "inspect-causes"],
  correctExplanation:
    "Vòng cải thiện đáng tin cậy cần tiêu chí thành công và test case đại diện, so sánh với baseline trên cùng bộ case, và phân loại nguyên nhân thất bại. Đổi nhiều biến, chấp nhận câu trả lời trôi chảy đầu tiên hoặc xóa case khó đều làm mất khả năng đánh giá trung thực.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-prompting-best-practices"],
});

export const promptingQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(specificPromptBrief, "prompting-create-effective-prompts", [
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(decomposeComplexRequest, "prompting-task-decomposition", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
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
  ]),
];

export const governanceQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(humanOversightExpense, "governance-ethics", [
    "anthropic-claude-constitution",
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(customerAssistantSafeguards, "governance-use-case-fit", [
    "anthropic-claude-constitution",
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
  ...contextQuestionBank,
  ...workflowQuestionBank,
  ...governanceQuestionBank,
  ...troubleshootingQuestionBank,
];