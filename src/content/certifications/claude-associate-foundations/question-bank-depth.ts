import { questionSchema, type Question, type QuestionBankEntry } from "../../../domain";
import { reviewedEntry } from "./bank-helpers";

/**
 * Depth pass for the eight objectives that previously had only one reviewed
 * item. Each addition tests a different decision from the existing item:
 * diagnosing a prompt, deciding when to decompose, producing requirements
 * artifacts, choosing a first integration point, triaging a high-risk use case,
 * applying ethical safeguards, reading diagnostic evidence, and handling a
 * regression.
 *
 * Items stay at the objective level and avoid volatile model names, prices, or
 * limits. Multi-response items have exactly three correct choices, matching the
 * existing bank convention.
 */

/* ── Domain 1: Prompting and Task Execution ───────────────────────────── */

const effectivePromptAdditions: Question = questionSchema.parse({
  id: "prompting-effective-prompt-additions",
  type: "multiple-response",
  stem: "A team is rewriting a vague request for a technical runbook: \"Explain how to deploy the service.\" Which three additions are most likely to produce a usable runbook? Select three.",
  choices: [
    {
      id: "audience-and-environment",
      text: "State the audience, the target environment, and the deployment prerequisites.",
      explanation:
        "Đúng: audience và môi trường quyết định mức chi tiết, thuật ngữ và các bước cần có.",
    },
    {
      id: "success-and-format",
      text: "Define the required sections, command format, and what counts as a successful deployment.",
      explanation:
        "Đúng: format và tiêu chí thành công biến yêu cầu mơ hồ thành đầu ra kiểm tra được.",
    },
    {
      id: "approved-example",
      text: "Include a short approved example and the constraints the runbook must respect.",
      explanation:
        "Đúng: ví dụ chuẩn và ràng buộc giúp Claude bám cấu trúc và tránh bịa bước.",
    },
    {
      id: "role-only",
      text: "Tell Claude to act as a senior engineer without providing system details.",
      explanation:
        "Sai: role không thay thế thông tin về hệ thống, môi trường và quy trình.",
    },
    {
      id: "longer-answer",
      text: "Ask for a longer answer so that no step is missed.",
      explanation:
        "Sai: độ dài không bảo đảm đúng nội dung; có thể làm tăng thông tin thừa và lỗi.",
    },
    {
      id: "more-randomness",
      text: "Increase randomness so the runbook covers unusual cases.",
      explanation:
        "Sai: tăng randomness làm output kém ổn định, không bổ sung kiến thức còn thiếu.",
    },
  ],
  correctChoiceIds: ["audience-and-environment", "success-and-format", "approved-example"],
  correctExplanation:
    "Một prompt kỹ thuật tốt cung cấp audience, môi trường, prerequisite, format, tiêu chí thành công, ví dụ chuẩn và ràng buộc. Role, độ dài hay randomness không thay thế các dữ kiện đó. Đây là cùng nguyên tắc với prompt rõ ràng và context đủ trong tài liệu prompting của Anthropic.",
  sourceIds: ["anthropic-prompting-best-practices"],
});

const decompositionDecision: Question = questionSchema.parse({
  id: "prompting-decomposition-decision",
  type: "single-choice",
  stem: "A request asks Claude to read 30 vendor contracts, compare liability terms, and produce a board summary. Which approach best applies task decomposition?",
  choices: [
    {
      id: "extract-compare-summarize",
      text: "Extract liability terms per contract into a structured table, compare the extracted terms, then draft and verify the board summary.",
      explanation:
        "Đúng: tách thành trích xuất, so sánh và tổng hợp; mỗi bước có output trung gian kiểm tra được.",
    },
    {
      id: "summary-first",
      text: "Ask for the board summary first, then ask Claude to explain how it reached its conclusions.",
      explanation:
        "Sai: tổng hợp trước khi trích xuất dễ tạo kết luận không dựa trên bằng chứng và khó kiểm tra.",
    },
    {
      id: "one-pass",
      text: "Put all 30 contracts in one prompt and ask for the best possible answer in one pass.",
      explanation:
        "Sai: gộp quá nhiều tài liệu và nhiều mục tiêu làm tăng nguy cơ bỏ sót, quá context và trộn lẫn bước.",
    },
    {
      id: "rank-before-reading",
      text: "Ask Claude to rank the contracts by risk before reading any contract text.",
      explanation:
        "Sai: xếp hạng trước khi đọc không có bằng chứng; đây là suy đoán chứ không phải phân tích.",
    },
  ],
  correctChoiceIds: ["extract-compare-summarize"],
  correctExplanation:
    "Task có nhiều tài liệu và nhiều bước nên được chia thành các bước có đầu ra kiểm tra được: trích xuất từng hợp đồng, so sánh các trường đã trích xuất, rồi tổng hợp và kiểm tra. Cách này giảm tải context, giúp phát hiện thiếu sót và tránh để bản tổng hợp che mất lỗi ở bước trích xuất.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-building-effective-agents",
  ],
});

/* ── Domain 4: Workflow Integration and Solution Design ───────────────── */

const requirementsArtifacts: Question = questionSchema.parse({
  id: "workflow-requirements-artifacts",
  type: "multiple-response",
  stem: "You are using Claude to analyze stakeholder notes for a new approval workflow. Which three outputs are appropriate before solution design? Select three.",
  choices: [
    {
      id: "traceable-requirements",
      text: "A traceable list of actors, goals, constraints, exceptions, and open questions, each linked to the notes.",
      explanation:
        "Đúng: đây là đầu ra cốt lõi của phân tích yêu cầu, có thể kiểm tra và truy vết.",
    },
    {
      id: "conflicts-and-gaps",
      text: "A list of conflicts and ambiguities that stakeholders must resolve.",
      explanation:
        "Đúng: nêu rõ điều chưa biết hoặc mâu thuẫn giúp tránh thiết kế dựa trên giả định.",
    },
    {
      id: "requirements-vs-solutions",
      text: "A clear separation between confirmed requirements and proposed solution ideas.",
      explanation:
        "Đúng: tách yêu cầu khỏi giải pháp ngăn việc biến một ý tưởng thành yêu cầu không được xác nhận.",
    },
    {
      id: "complete-final-design",
      text: "A complete final workflow design with no open questions.",
      explanation:
        "Sai: thiết kế cuối trước khi xác nhận yêu cầu là quá sớm; che giấu câu hỏi mở làm tăng rủi ro.",
    },
    {
      id: "invented-requirements",
      text: "Invented requirements that fill gaps so the document looks complete.",
      explanation:
        "Sai: bịa yêu cầu là hallucination và có thể dẫn đến thiết kế sai.",
    },
    {
      id: "senior-only-summary",
      text: "A summary of only the most senior stakeholder's requests.",
      explanation:
        "Sai: bỏ qua actor khác làm mất ràng buộc, ngoại lệ và tác động đến người bị ảnh hưởng.",
    },
  ],
  correctChoiceIds: ["traceable-requirements", "conflicts-and-gaps", "requirements-vs-solutions"],
  correctExplanation:
    "Trước khi thiết kế giải pháp, Claude nên giúp tạo danh sách yêu cầu có thể truy vết, các mâu thuẫn và câu hỏi mở, và sự tách biệt giữa yêu cầu đã xác nhận với ý tưởng giải pháp. Không nên bịa yêu cầu, chốt thiết kế quá sớm hoặc chỉ nghe một stakeholder.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-prompting-best-practices"],
});

const firstIntegrationPoint: Question = questionSchema.parse({
  id: "workflow-integration-first-pilot",
  type: "single-choice",
  stem: "A department wants to add Claude to an existing invoice-review workflow. Which first integration point is most defensible?",
  choices: [
    {
      id: "bounded-review-step",
      text: "A bounded, reversible review step with clear acceptance criteria, a human checkpoint, and a baseline for quality and cycle time.",
      explanation:
        "Đúng: phạm vi hẹp, có thể đảo ngược, có tiêu chí và baseline giúp đo hiệu quả và giới hạn rủi ro.",
    },
    {
      id: "final-payment-approval",
      text: "The final payment-approval decision, because it offers the largest time saving.",
      explanation:
        "Sai: đây là bước có hậu quả tài chính lớn và khó đảo ngược; không phù hợp làm pilot đầu tiên.",
    },
    {
      id: "all-steps",
      text: "Every step at once so the team can learn quickly.",
      explanation:
        "Sai: tự động hóa toàn bộ ngay lập tức khuếch đại lỗi và khó xác định nguyên nhân.",
    },
    {
      id: "visible-step-no-baseline",
      text: "The most visible customer-facing step, without measuring the current process.",
      explanation:
        "Sai: thiếu baseline thì không thể biết thay đổi có cải thiện chất lượng hoặc thời gian hay không.",
    },
  ],
  correctChoiceIds: ["bounded-review-step"],
  correctExplanation:
    "Pilot đầu tiên nên là một bước hẹp, dễ đảo ngược, có tiêu chí chấp nhận, human checkpoint và baseline. Bước quyết định cuối hoặc toàn bộ quy trình có phạm vi quá lớn và rủi ro cao. Cách tiếp cận này phù hợp với khuyến nghị bắt đầu đơn giản, đo lường và chỉ tăng độ phức tạp khi có cải thiện rõ ràng.",
  sourceIds: [
    "anthropic-building-effective-agents",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
  ],
});

/* ── Domain 6: Governance, Risk, and Responsible Use ──────────────────── */

const highRiskUseCase: Question = questionSchema.parse({
  id: "governance-use-case-triage",
  type: "single-choice",
  stem: "A team proposes using Claude to automatically deny insurance claims above a threshold without human review. What is the most appropriate response?",
  choices: [
    {
      id: "pause-and-control",
      text: "Do not launch as proposed; treat it as a high-risk use that requires policy review, a qualified human in the loop, and disclosure.",
      explanation:
        "Đúng: bảo hiểm là lĩnh vực high-risk; quyết định có hậu quả lớn cần chính sách, human review và minh bạch.",
    },
    {
      id: "launch-for-speed",
      text: "Launch it because Claude can process claims faster and more consistently.",
      explanation:
        "Sai: tốc độ và tính nhất quán không thay thế yêu cầu kiểm soát đối với quyết định high-risk.",
    },
    {
      id: "disclaimer-only",
      text: "Launch it with a disclaimer in the denial letter.",
      explanation:
        "Sai: một disclaimer không tương đương với qualified human review và kiểm soát chính sách.",
    },
    {
      id: "logging-only",
      text: "Launch it if every decision is logged, even without human review.",
      explanation:
        "Sai: logging giúp truy vết nhưng không thay thế con người có thẩm quyền review quyết định.",
    },
  ],
  correctChoiceIds: ["pause-and-control"],
  correctExplanation:
    "Bảo hiểm nằm trong danh sách high-risk của Usage Policy. Quyết định tự động từ chối yêu cầu bồi thường có hậu quả lớn đối với người bị ảnh hưởng, nên cần rà soát chính sách, qualified human in the loop và disclosure. Disclaimer hoặc logging một mình không đủ thay thế human review.",
  sourceIds: ["anthropic-usage-policy", "anthropic-claude-constitution"],
});

const ethicsSafeguards: Question = questionSchema.parse({
  id: "governance-ethics-considerations",
  type: "multiple-response",
  stem: "Which three considerations are ethical requirements for a Claude-assisted employee performance review? Select three.",
  choices: [
    {
      id: "disclose-and-accountable",
      text: "Disclose how AI is used and keep a human accountable for the final decision.",
      explanation:
        "Đúng: minh bạch và trách nhiệm con người là nền tảng của sử dụng có trách nhiệm.",
    },
    {
      id: "check-unequal-treatment",
      text: "Check for unequal treatment and avoid decisions based on protected characteristics.",
      explanation:
        "Đúng: cần kiểm tra thiên lệch và đối xử công bằng, đặc biệt trong quyết định về việc làm.",
    },
    {
      id: "job-relevant-traceable",
      text: "Use job-relevant evidence and keep the reasoning traceable for human review.",
      explanation:
        "Đúng: bằng chứng liên quan đến công việc và khả năng review giúp quyết định có thể giải thích.",
    },
    {
      id: "hide-ai",
      text: "Maximize engagement by hiding that AI contributed to the review.",
      explanation:
        "Sai: che giấu vai trò của AI làm giảm minh bạch và có thể gây hiểu nhầm.",
    },
    {
      id: "speed-over-transparency",
      text: "Optimize for speed even if the employee cannot see the evidence.",
      explanation:
        "Sai: tốc độ không biện minh cho việc thiếu minh bạch hoặc không thể giải thích quyết định.",
    },
    {
      id: "remove-human-review",
      text: "Remove human review because the model is consistent.",
      explanation:
        "Sai: tính nhất quán của model không thay thế trách nhiệm và phán đoán của con người.",
    },
  ],
  correctChoiceIds: ["disclose-and-accountable", "check-unequal-treatment", "job-relevant-traceable"],
  correctExplanation:
    "Đánh giá nhân viên là use case high-risk về việc làm. Các yêu cầu đạo đức gồm minh bạch về việc dùng AI, giữ con người chịu trách nhiệm, kiểm tra đối xử công bằng và thiên lệch, dùng bằng chứng liên quan đến công việc và giữ khả năng review. Che giấu AI, đặt tốc độ lên trên minh bạch hoặc bỏ human review đều đi ngược các nguyên tắc này.",
  sourceIds: [
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
    "anthropic-evaluation-docs",
  ],
});

/* ── Domain 7: Troubleshooting and Optimization ───────────────────────── */

const diagnosticEvidence: Question = questionSchema.parse({
  id: "troubleshoot-diagnose-evidence",
  type: "multiple-response",
  stem: "A prompt fails on a required field in a recurring report. Which three observations would most strongly indicate a prompt or context problem rather than a model-capability problem? Select three.",
  choices: [
    {
      id: "systematic-missing-field",
      text: "The same field is missing across repeated runs and different inputs.",
      explanation:
        "Đúng: lỗi lặp lại có hệ thống thường chỉ ra yêu cầu hoặc định nghĩa trường bị thiếu.",
    },
    {
      id: "undefined-field",
      text: "The prompt never defines the field, its format, or an example.",
      explanation:
        "Đúng: không có định nghĩa, format hay ví dụ thì model không có cơ sở để tạo đúng trường.",
    },
    {
      id: "outdated-example",
      text: "The supplied example shows an older format that omits the field.",
      explanation:
        "Đúng: ví dụ lỗi thời trong context dạy model bỏ qua trường bắt buộc.",
    },
    {
      id: "latency-changed",
      text: "Latency increased after the last deployment.",
      explanation:
        "Sai: độ trễ không giải thích vì sao một trường bắt buộc bị thiếu.",
    },
    {
      id: "price-changed",
      text: "The model's price changed.",
      explanation:
        "Sai: giá không phải bằng chứng về chất lượng nội dung hoặc nguyên nhân thiếu trường.",
    },
    {
      id: "one-off-wording",
      text: "One unusual input produced different wording in an unrelated section.",
      explanation:
        "Sai: thay đổi nhỏ ở một input hiếm không chứng minh lỗi hệ thống ở trường bắt buộc.",
    },
  ],
  correctChoiceIds: ["systematic-missing-field", "undefined-field", "outdated-example"],
  correctExplanation:
    "Lỗi lặp lại trên nhiều input, thiếu định nghĩa/format/ví dụ, và ví dụ cũ trong context đều chỉ về vấn đề prompt hoặc context. Độ trễ, giá và một thay đổi nhỏ ở input hiếm không giải thích được việc trường bắt buộc bị bỏ sót. Hãy sửa yêu cầu và context trước khi thử model khác.",
  sourceIds: ["anthropic-prompting-best-practices", "anthropic-evaluation-docs"],
});

const regressionAdjustment: Question = questionSchema.parse({
  id: "troubleshoot-adjust-regression",
  type: "single-choice",
  stem: "A revised prompt raises the average quality score but causes a critical edge case to fail. What is the best adjustment?",
  choices: [
    {
      id: "inspect-and-rerun",
      text: "Keep the baseline, inspect the regression, refine or revert the change, and rerun the full test set including the edge case.",
      explanation:
        "Đúng: điểm trung bình có thể che regression; cần xem case cụ thể và chạy lại toàn bộ bộ test.",
    },
    {
      id: "ship-average",
      text: "Ship the revision because the average score improved.",
      explanation:
        "Sai: cải thiện trung bình không bù được việc một case quan trọng bị hỏng.",
    },
    {
      id: "remove-edge-case",
      text: "Remove the failing edge case from the test set so the average stays high.",
      explanation:
        "Sai: xóa case khó làm chỉ số đẹp hơn nhưng che mất rủi ro thật.",
    },
    {
      id: "larger-model-same-prompt",
      text: "Switch to a larger model and keep the same prompt and test set.",
      explanation:
        "Sai: đổi model không giải quyết nguyên nhân regression và có thể làm tăng chi phí.",
    },
  ],
  correctChoiceIds: ["inspect-and-rerun"],
  correctExplanation:
    "Một thay đổi làm tăng điểm trung bình nhưng hỏng case quan trọng là regression. Cần giữ baseline, xem case nào bị ảnh hưởng, tinh chỉnh hoặc revert, rồi chạy lại toàn bộ bộ test gồm cả edge case. Chỉ mở rộng khi các case quan trọng đều đạt.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-prompting-best-practices"],
});

export const coverageDepthQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(effectivePromptAdditions, "prompting-create-effective-prompts", [
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(decompositionDecision, "prompting-task-decomposition", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-building-effective-agents",
  ]),
  reviewedEntry(requirementsArtifacts, "workflow-requirements-analysis", [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(firstIntegrationPoint, "workflow-integrate", [
    "anthropic-building-effective-agents",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
  ]),
  reviewedEntry(highRiskUseCase, "governance-use-case-fit", [
    "anthropic-usage-policy",
    "anthropic-claude-constitution",
  ]),
  reviewedEntry(ethicsSafeguards, "governance-ethics", [
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(diagnosticEvidence, "troubleshoot-diagnose", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(regressionAdjustment, "troubleshoot-adjust", [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
  ]),
];
