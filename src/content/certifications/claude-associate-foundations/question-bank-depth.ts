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

const rubricCalibration: Question = questionSchema.parse({
  id: "prompting-iterate-rubric-calibration",
  type: "single-choice",
  stem: "A team is iterating on a prompt for customer escalation summaries, and two reviewers disagree on whether a revised prompt improved quality. What should the team establish before running another iteration?",
  choices: [
    {
      id: "explicit-rubric-and-test-set",
      text: "Define an explicit grading rubric with representative test cases and score both the baseline and revised outputs against the same criteria.",
      explanation:
        "Đúng: rubric rõ ràng trên cùng bộ test giúp hai reviewer chấm nhất quán và biết thay đổi có thực sự cải thiện chất lượng hay không.",
    },
    {
      id: "prefer-longer-draft",
      text: "Adopt whichever prompt produces the longer summary on the most recent ticket.",
      explanation:
        "Sai: độ dài trên một ticket đơn lẻ không phản ánh độ chính xác, tính đầy đủ hay khả năng tổng quát hóa.",
    },
    {
      id: "rewrite-until-both-like-style",
      text: "Keep rewriting the prompt informally until both reviewers like the tone of a single sample.",
      explanation:
        "Sai: chỉnh theo cảm tính trên một mẫu dễ gây vòng lặp thử-sai và bỏ sót các tiêu chí nghiệp vụ quan trọng.",
    },
    {
      id: "average-two-models",
      text: "Switch models immediately so the team does not need to agree on evaluation criteria.",
      explanation:
        "Sai: đổi model không thay thế được tiêu chí đánh giá; nếu không có rubric thì vẫn không biết output nào đạt yêu cầu.",
    },
  ],
  correctChoiceIds: ["explicit-rubric-and-test-set"],
  correctExplanation:
    "Khi các reviewer bất đồng về chất lượng giữa hai phiên bản prompt, nguyên nhân thường là thiếu tiêu chí chấm rõ ràng. Thiết lập grading rubric cụ thể và chấm cả baseline lẫn phiên bản mới trên cùng bộ representative test cases giúp việc iterate dựa trên bằng chứng thay vì cảm tính.",
  sourceIds: ["anthropic-prompting-best-practices", "anthropic-evaluation-docs"],
});

const solutionHandoffControls: Question = questionSchema.parse({
  id: "workflow-solution-handoff-controls",
  type: "multiple-response",
  stem: "An operations team is designing a multi-step document-triage solution where Claude classifies incoming requests and drafts routing notes for human coordinators. Which three design practices keep the workflow reliable and auditable? Select three.",
  choices: [
    {
      id: "structured-intermediate-outputs",
      text: "Define structured intermediate outputs between classification and routing-note drafting so each stage can be inspected.",
      explanation:
        "Đúng: đầu ra trung gian có cấu trúc giúp kiểm tra từng bước và xác định nhanh lỗi nằm ở phân loại hay ở bước soạn ghi chú.",
    },
    {
      id: "ambiguous-case-escalation",
      text: "Route low-confidence or ambiguous requests to a human review queue with the supporting source excerpts attached.",
      explanation:
        "Đúng: chuyển các trường hợp mơ hồ kèm trích dẫn nguồn cho con người kiểm tra giúp giảm rủi ro phân luồng sai.",
    },
    {
      id: "edge-case-validation",
      text: "Test the workflow against edge cases and malformed inputs before expanding beyond the initial pilot.",
      explanation:
        "Đúng: kiểm thử trên edge case và input lỗi trước khi mở rộng giúp phát hiện điểm gãy của thiết kế.",
    },
    {
      id: "hide-intermediate-classification",
      text: "Hide intermediate classification fields so coordinators only see the final routing recommendation.",
      explanation:
        "Sai: ẩn bước trung gian làm giảm khả năng audit và khiến điều phối viên khó phát hiện phân loại sai.",
    },
    {
      id: "auto-close-unclassified",
      text: "Automatically close requests that do not match a standard category.",
      explanation:
        "Sai: tự động đóng các yêu cầu ngoại lệ không qua rà soát con người có thể làm mất yêu cầu quan trọng hoặc nhạy cảm.",
    },
    {
      id: "skip-pilot-metrics",
      text: "Roll out to all request types immediately and define success metrics after full deployment.",
      explanation:
        "Sai: triển khai toàn bộ trước khi có tiêu chí và kết quả pilot làm tăng rủi ro vận hành và không có baseline để so sánh.",
    },
  ],
  correctChoiceIds: [
    "structured-intermediate-outputs",
    "ambiguous-case-escalation",
    "edge-case-validation",
  ],
  correctExplanation:
    "Một giải pháp workflow nhiều bước đáng tin cậy cần đầu ra trung gian có cấu trúc để dễ kiểm tra, cơ chế chuyển các case mơ hồ kèm bằng chứng sang human review, và kiểm thử kỹ trên edge case trước khi mở rộng. Ẩn dữ liệu trung gian, tự động đóng case lạ hoặc bỏ qua pilot đều làm giảm tính an toàn và khả năng giải trình.",
  sourceIds: [
    "anthropic-building-effective-agents",
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
  ],
});

const policyExceptionEscalation: Question = questionSchema.parse({
  id: "governance-policy-exception-escalation",
  type: "single-choice",
  stem: "A project team wants to use Claude on a new internal dataset that is not yet covered by the organization's approved AI use-case register. What is the appropriate action under organizational AI governance?",
  choices: [
    {
      id: "pause-and-submit-governance-review",
      text: "Pause deployment on the unapproved dataset, submit the use case and data classification through the organization's governance review process, and proceed only after approval and required controls are documented.",
      explanation:
        "Đúng: khi dữ liệu và use case chưa nằm trong phạm vi phê duyệt, cần phân loại dữ liệu, xin phê duyệt theo quy trình quản trị và áp dụng đủ biện pháp kiểm soát trước khi chạy.",
    },
    {
      id: "run-in-personal-chat",
      text: "Test the dataset in a personal account first so the organization's workspace logs stay clean.",
      explanation:
        "Sai: đưa dữ liệu nội bộ sang tài khoản cá nhân vi phạm nguyên tắc kiểm soát truy cập, bảo mật và quản trị dữ liệu.",
    },
    {
      id: "proceed-and-notify-later",
      text: "Process the dataset immediately to meet the deadline and notify the governance team after the report is delivered.",
      explanation:
        "Sai: xử lý dữ liệu chưa được phê duyệt trước rồi báo cáo sau có thể gây lộ dữ liệu nhạy cảm không thể thu hồi.",
    },
    {
      id: "strip-headers-only",
      text: "Remove column headers from the file and upload it without checking data sensitivity or policy scope.",
      explanation:
        "Sai: xóa tiêu đề cột không thay thế việc phân loại dữ liệu và không làm cho nội dung nhạy cảm trở nên được phép sử dụng.",
    },
  ],
  correctChoiceIds: ["pause-and-submit-governance-review"],
  correctExplanation:
    "Theo nguyên tắc quản trị AI trong tổ chức, khi một tập dữ liệu hoặc use case chưa được phê duyệt trong danh mục cho phép, nhóm phải tạm dừng việc đưa dữ liệu vào công cụ, thực hiện phân loại mức độ nhạy cảm và trình duyệt qua quy trình governance/compliance. Không được dùng tài khoản cá nhân hoặc tự ý chạy trước rồi xin phép sau.",
  sourceIds: [
    "anthropic-usage-policy",
    "anthropic-claude-constitution",
    "anthropic-privacy-policy",
  ],
});

const workflowCostLatencyControls: Question = questionSchema.parse({
  id: "optimize-workflow-cost-latency-controls",
  type: "multiple-response",
  stem: "After establishing a quality baseline for a recurring compliance-summary workflow, a team wants to reduce latency and token cost without degrading accuracy on critical cases. Which three actions follow sound optimization practice? Select three.",
  choices: [
    {
      id: "trim-redundant-context",
      text: "Trim redundant instructions and stale reference text so only high-signal context is sent on each run.",
      explanation:
        "Đúng: loại bỏ hướng dẫn trùng lặp và tài liệu lỗi thời giúp giảm token đầu vào, giảm độ trễ và giữ tín hiệu rõ hơn.",
    },
    {
      id: "benchmark-faster-tier",
      text: "Benchmark a faster, lower-cost model tier on the same representative evaluation set before switching production traffic.",
      explanation:
        "Đúng: thử nghiệm tier nhanh/rẻ hơn trên chính bộ evaluation baseline giúp xác nhận chất lượng vẫn đạt trước khi chuyển lưu lượng thật.",
    },
    {
      id: "track-per-case-regressions",
      text: "Track per-case quality alongside latency and cost after each change so critical edge-case regressions are caught immediately.",
      explanation:
        "Đúng: theo dõi chất lượng từng case song song với độ trễ và chi phí ngăn việc tối ưu tốc độ làm hỏng các case tuân thủ quan trọng.",
    },
    {
      id: "drop-source-grounding",
      text: "Remove source excerpts from the prompt so the model generates summaries from general memory.",
      explanation:
        "Sai: bỏ nguồn tham chiếu trong tác vụ tuân thủ làm tăng mạnh nguy cơ hallucination và sai lệch dữ kiện.",
    },
    {
      id: "skip-regression-checks",
      text: "Stop running the evaluation suite once latency drops below the target threshold.",
      explanation:
        "Sai: chỉ nhìn độ trễ mà bỏ kiểm thử chất lượng dễ làm lọt lỗi nghiêm trọng ra môi trường vận hành.",
    },
    {
      id: "change-all-variables-together",
      text: "Change the prompt structure, context window contents, and model tier simultaneously without intermediate measurement.",
      explanation:
        "Sai: thay đổi mọi biến cùng lúc mà không đo từng bước khiến nhóm không biết thay đổi nào giúp ích hay gây lỗi.",
    },
  ],
  correctChoiceIds: [
    "trim-redundant-context",
    "benchmark-faster-tier",
    "track-per-case-regressions",
  ],
  correctExplanation:
    "Tối ưu hóa chi phí và độ trễ có kỷ luật đòi hỏi giữ nguyên baseline đánh giá: rút gọn context thừa để chỉ gửi thông tin high-signal, benchmark model tier nhanh/tiết kiệm hơn trên cùng bộ test đại diện, và giám sát chất lượng per-case cùng với latency/cost để không đánh đổi độ chính xác ở các case quan trọng.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-choosing-model",
  ],
});

const multilingualNuanceControl: Question = questionSchema.parse({
  id: "prompting-multilingual-nuance-control",
  type: "single-choice",
  stem: "A multinational team prompts Claude to localize technical compliance guidelines into Vietnamese and Japanese for regional branches. Early drafts showed inconsistent translation of regulatory terms and an overly informal tone for executive leadership. Which prompt enhancement best resolves both issues?",
  choices: [
    {
      id: "glossary-and-examples",
      text: "Provide an approved regulatory glossary in structured XML tags, define the formal executive audience and tone constraints in the system prompt, and supply two vetted few-shot examples.",
      explanation:
        "Đúng: kết hợp bảng thuật ngữ chuẩn hóa trong thẻ XML, ràng buộc văn phong trang trọng cho ban lãnh đạo và vài ví dụ mẫu chuẩn (few-shot) giúp model định hình chính xác cả thuật ngữ lẫn văn phong.",
    },
    {
      id: "raise-temperature",
      text: "Raise temperature to 0.9 so Claude invents culturally engaging phrasings for legal clauses.",
      explanation:
        "Sai: tăng temperature làm tăng độ ngẫu nhiên và biến thiên văn bản, hoàn toàn không phù hợp với văn bản tuân thủ pháp lý vốn cần tính nhất quán cao.",
    },
    {
      id: "open-ended-instruction",
      text: "Add an instruction saying “translate as naturally as possible” without supplying canonical bilingual term definitions.",
      explanation:
        "Sai: chỉ dẫn chung chung không giải quyết được vấn đề thuật ngữ kỹ thuật bị dịch sai hoặc thiếu đồng bộ qua các tài liệu.",
    },
    {
      id: "split-isolated-prompts",
      text: "Translate each sentence in separate isolated requests without sharing previously approved definitions.",
      explanation:
        "Sai: dịch từng câu cô lập làm mất mạch ngữ cảnh tổng thể và làm trầm trọng thêm tình trạng không đồng nhất thuật ngữ.",
    },
  ],
  correctChoiceIds: ["glossary-and-examples"],
  correctExplanation:
    "Để kiểm soát chất lượng dịch thuật và bản địa hóa chuyên ngành, cách hiệu quả nhất theo Anthropic Best Practices là: cung cấp bảng thuật ngữ chuẩn (glossary) trong thẻ XML tường minh, quy định rõ đối tượng độc giả/văn phong mong muốn, và cung cấp vài ví dụ đối chiếu chuẩn chỉnh (few-shot examples).",
  sourceIds: ["anthropic-prompting-best-practices"],
});

const hallucinationAuditPlan: Question = questionSchema.parse({
  id: "output-evaluation-hallucination-audit-plan",
  type: "multiple-response",
  stem: "A risk analyst is validating a 40-page technical risk assessment drafted by Claude from raw operational incident transcripts. Which three audit procedures are most effective for detecting and eliminating hallucinations before distribution? Select three.",
  choices: [
    {
      id: "isolate-verifiable-claims",
      text: "Isolate all quantitative metrics, dates, and causal conclusions into an audit table and require direct word-for-word citations from the transcripts.",
      explanation:
        "Đúng: bóc tách các nhận định định lượng, mốc thời gian và quan hệ nhân quả để đối chiếu trích dẫn trực tiếp là cách chắc chắn nhất để kiểm chứng tính xác thực.",
    },
    {
      id: "flag-unsupported-claims",
      text: "Explicitly qualify or delete any claim that cannot be corroborated by evidence in the provided source transcripts.",
      explanation:
        "Đúng: nguyên tắc cốt lõi của fact-checking là hạ mức độ khẳng định hoặc lược bỏ dứt điểm các luận điểm không có bằng chứng chứng minh.",
    },
    {
      id: "cross-check-inconsistencies",
      text: "Cross-check for internal contradictions between different sections of the report analyzing related operational incidents.",
      explanation:
        "Đúng: kiểm tra chéo các mâu thuẫn nội tại giữa các phần là tín hiệu quan trọng để phát hiện những đoạn model suy diễn thiếu nhất quán.",
    },
    {
      id: "rely-on-fluency",
      text: "Accept statements that sound highly confident and use polished corporate prose as inherently verified.",
      explanation:
        "Sai: văn phong tự tin và mượt mà không chứng minh được tính xác thực; hallucination thường xuất hiện dưới dạng câu văn rất trôi chảy.",
    },
    {
      id: "re-prompt-multiple-times",
      text: "Re-run the prompt five times and accept the majority response as ground truth without consulting source transcripts.",
      explanation:
        "Sai: kiểm tra chéo giữa các lần chạy (Best-of-N) có thể phát hiện sự thiếu nhất quán nhưng không thay thế được việc đối chiếu với tài liệu gốc.",
    },
    {
      id: "remove-source-constraints",
      text: "Remove source document boundaries so Claude can fill informational gaps from broad internet training memory.",
      explanation:
        "Sai: bỏ giới hạn tài liệu nguồn sẽ khiến model tự do suy diễn và làm tăng vọt nguy cơ hallucination trong báo cáo rủi ro.",
    },
  ],
  correctChoiceIds: [
    "isolate-verifiable-claims",
    "flag-unsupported-claims",
    "cross-check-inconsistencies",
  ],
  correctExplanation:
    "Quy trình kiểm soát hallucination bài bản đòi hỏi bóc tách các claim cụ thể để kiểm chứng bằng trích dẫn nguyên văn từ nguồn gốc, kiên quyết loại bỏ các khẳng định thiếu căn cứ, và rà soát mâu thuẫn nội bộ giữa các phần trong văn bản. Không được dựa vào văn phong tự tin hay kết quả đa số mà bỏ qua tài liệu đối soát.",
  sourceIds: [
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
  ],
});

const routingIntentClassification: Question = questionSchema.parse({
  id: "workflow-routing-intent-classification",
  type: "single-choice",
  stem: "An enterprise customer service architecture receives 100,000 requests per day. 80% are straightforward order status inquiries, while 20% involve nuanced legal or contractual disputes requiring multi-step reasoning. Which architecture best balances responsiveness, cost, and analytical rigor?",
  choices: [
    {
      id: "routing-tier-pattern",
      text: "Implement an upfront routing classifier using a fast, low-cost model to fulfill status lookups directly and escalate complex dispute requests to a higher-capability model tier.",
      explanation:
        "Đúng: mô hình phân luồng (routing) dùng model nhanh/rẻ (như Haiku) xử lý khối lượng lớn tác vụ đơn giản và chỉ chuyển 20% ca phức tạp cho model chuyên sâu (như Sonnet) là giải pháp tối ưu chi phí và độ trễ.",
    },
    {
      id: "all-opus-chain",
      text: "Route 100% of incoming inquiries through a multi-agent chain powered exclusively by the largest model tier.",
      explanation:
        "Sai: dùng model lớn nhất cho toàn bộ 100,000 yêu cầu mỗi ngày sẽ gây lãng phí chi phí token khổng lồ và độ trễ không cần thiết cho 80% tác vụ tra cứu đơn giản.",
    },
    {
      id: "single-haiku-only",
      text: "Enforce a single fast model across all requests without any escalation path for multi-step contractual analysis.",
      explanation:
        "Sai: model nhỏ khó đảm bảo chiều sâu lập luận và độ chính xác cho các tranh chấp pháp lý/hợp đồng phức tạp.",
    },
    {
      id: "unsupervised-agent",
      text: "Deploy an unconstrained autonomous agent that browses internal databases indefinitely for every inquiry without a stopping condition.",
      explanation:
        "Sai: thiếu điều kiện dừng và cơ chế kiểm soát sẽ dẫn đến vòng lặp vô tận, bùng nổ chi phí và tiềm ẩn rủi ro sai sót.",
    },
  ],
  correctChoiceIds: ["routing-tier-pattern"],
  correctExplanation:
    "Theo hướng dẫn 'Building effective agents' của Anthropic, mô hình định tuyến (Routing) là mẫu kiến trúc cơ bản và hiệu quả nhất khi có sự phân hóa rõ rệt giữa các luồng tác vụ. Nó giúp chuyển hướng chính xác tác vụ đơn giản tới model tối ưu tốc độ/chi phí, và chỉ dành tài nguyên model cao cấp cho bài toán đòi hỏi suy luận phức tạp.",
  sourceIds: [
    "anthropic-building-effective-agents",
    "anthropic-choosing-model",
  ],
});

const projectPermissionRevocation: Question = questionSchema.parse({
  id: "configuration-project-permission-revocation",
  type: "single-choice",
  stem: "A project administrator learns that an external consultant has completed their engagement but still possesses access to a shared Claude Project containing proprietary financial strategies. Which administrative action properly secures the Project environment?",
  choices: [
    {
      id: "remove-member-audit-knowledge",
      text: "Remove the consultant from the Project and organization workspace, rotate any shared connector credentials they handled, and audit Project knowledge files to ensure access is fully terminated.",
      explanation:
        "Đúng: phải thu hồi quyền ở cấp thành viên workspace/project và xoay vòng (rotate) credential của các connector ngoài để đảm bảo chấm dứt hoàn toàn quyền truy cập dữ liệu nhạy cảm.",
    },
    {
      id: "archive-project-only",
      text: "Archive the Project, assuming that archiving automatically revokes member permissions and disconnects shared tools.",
      explanation:
        "Sai: việc archive Project chỉ ẩn project khỏi giao diện hoạt động nhưng vẫn bảo lưu danh sách thành viên và cấu hình; nó không thay thế cho việc thu hồi quyền.",
    },
    {
      id: "prompt-ignore-contractor",
      text: "Add a Project instruction telling Claude to decline questions submitted by that specific consultant's name.",
      explanation:
        "Sai: prompt instruction không thể làm công cụ kiểm soát truy cập (access control) và không ngăn chặn được việc người đó đọc kho tài liệu Project knowledge.",
    },
    {
      id: "delete-single-file-only",
      text: "Delete one financial strategy document from Project knowledge while leaving the consultant's Project membership active.",
      explanation:
        "Sai: chỉ xóa một file không ngăn được người đó xem các tài liệu còn lại, các cuộc trò chuyện chia sẻ hoặc tiếp tục sử dụng Project.",
    },
  ],
  correctChoiceIds: ["remove-member-audit-knowledge"],
  correctExplanation:
    "Quản trị Project theo nguyên tắc bảo mật và quyền tối thiểu đòi hỏi phải thu hồi quyền thành viên ở cấp độ tài khoản/workspace và cập nhật credential của các connector liên quan. Không thể dựa vào tính năng Archive hay prompt instruction để thay thế cho cơ chế phân quyền bảo mật thực tế.",
  sourceIds: [
    "anthropic-projects-manage",
    "anthropic-usage-policy",
  ],
});

const regressionPromptPinning: Question = questionSchema.parse({
  id: "troubleshoot-regression-prompt-pinning",
  type: "multiple-response",
  stem: "After modifying a customer support prompt to incorporate newly announced product return policies, the team observes that accuracy on handling legacy warranty claims dropped from 94% to 78%. Which three diagnostic actions should the team take to address this regression? Select three.",
  choices: [
    {
      id: "run-baseline-eval-suite",
      text: "Evaluate the modified prompt against the entire regression test suite representing both legacy warranty cases and new return scenarios.",
      explanation:
        "Đúng: chạy lại bộ kiểm thử toàn diện trên cả trường hợp cũ lẫn trường hợp mới giúp đo lường chính xác phạm vi và mức độ nghiêm trọng của lỗi thoái lui (regression).",
    },
    {
      id: "diff-prompt-changes",
      text: "Inspect the diff between the previous baseline prompt and the updated version to locate overlapping or conflicting constraints.",
      explanation:
        "Đúng: so sánh chi tiết các thay đổi trong câu chữ và ràng buộc của prompt giúp phát hiện chính xác chỗ quy định mới lấn át hoặc mâu thuẫn với quy định cũ.",
    },
    {
      id: "categorize-failure-modes",
      text: "Categorize the failed legacy test cases to determine whether errors stem from ambiguous instructions, missing context, or overly restrictive return rules.",
      explanation:
        "Đúng: phân loại cụ thể các ca bị lỗi giúp nhóm xác định đúng căn nguyên lỗi thay vì sửa mò không có định hướng.",
    },
    {
      id: "switch-models-immediately",
      text: "Immediately migrate to a different model family in production without investigating the prompt wording differences.",
      explanation:
        "Sai: đổi model đột ngột làm thay đổi quá nhiều biến số cùng lúc và không giải quyết được căn nguyên mâu thuẫn logic trong prompt.",
    },
    {
      id: "delete-legacy-eval-cases",
      text: "Delete legacy warranty cases from the evaluation dataset so the pass rate reflects only the new return policy.",
      explanation:
        "Sai: xóa test case để làm đẹp số liệu là hành vi che giấu lỗi thoái lui trong sản phẩm thực tế.",
    },
    {
      id: "double-max-tokens",
      text: "Double max_tokens in production in hopes that generating longer answers will naturally reconcile conflicting warranty rules.",
      explanation:
        "Sai: tăng max_tokens chỉ kéo dài câu trả lời chứ không sửa được xung đột về mặt chỉ dẫn logic trong prompt.",
    },
  ],
  correctChoiceIds: [
    "run-baseline-eval-suite",
    "diff-prompt-changes",
    "categorize-failure-modes",
  ],
  correctExplanation:
    "Xử lý lỗi hồi quy (regression) có phương pháp đòi hỏi: chạy lại toàn bộ bộ kiểm thử đại diện (gồm cả case cũ và mới), soi diff để định vị xung đột câu chữ giữa các phiên bản prompt, và phân loại bản chất các ca bị lỗi để tinh chỉnh có mục tiêu. Tuyệt đối không xóa test case, đổi model vội vã hay tăng token một cách mù quáng.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});

export const coverageDepthQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(effectivePromptAdditions, "prompting-create-effective-prompts", [
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(multilingualNuanceControl, "prompting-create-effective-prompts", [
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(decompositionDecision, "prompting-task-decomposition", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-building-effective-agents",
  ]),
  reviewedEntry(rubricCalibration, "prompting-iterate", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(hallucinationAuditPlan, "output-identify-hallucinations", [
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
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
  reviewedEntry(solutionHandoffControls, "workflow-solution-design", [
    "anthropic-building-effective-agents",
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(routingIntentClassification, "workflow-solution-design", [
    "anthropic-building-effective-agents",
    "anthropic-choosing-model",
  ]),
  reviewedEntry(projectPermissionRevocation, "config-maintain", [
    "anthropic-projects-manage",
    "anthropic-usage-policy",
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
  reviewedEntry(policyExceptionEscalation, "governance-policies", [
    "anthropic-usage-policy",
    "anthropic-claude-constitution",
    "anthropic-privacy-policy",
  ]),
  reviewedEntry(diagnosticEvidence, "troubleshoot-diagnose", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(regressionPromptPinning, "troubleshoot-diagnose", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(regressionAdjustment, "troubleshoot-adjust", [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(workflowCostLatencyControls, "optimize-workflows", [
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-choosing-model",
  ]),
];
