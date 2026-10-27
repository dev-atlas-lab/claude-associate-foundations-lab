import { questionSchema, type Question, type QuestionBankEntry } from "../../../domain";
import { reviewedEntry } from "./bank-helpers";

/**
 * Additional reviewed items for Domain 4 (research, solution design, and
 * stakeholder communication), Domain 6 (privacy and policy governance), and
 * Domain 7 (workflow optimization).
 *
 * Governance items teach review principles, not legal advice. Claims about
 * privacy, retention, and high-risk use are limited to the cited Anthropic
 * policies and help-center articles and should be re-checked against the
 * organization's own policy.
 */

const currentMarketResearch: Question = questionSchema.parse({
  id: "workflow-research-current-scan",
  type: "single-choice",
  stem: "A strategy team needs a current competitor scan with citations before a planning workshop. What is the best use of Claude?",
  choices: [
    {
      id: "research-and-verify",
      text: "Run research over current sources, ask for a cited synthesis, then verify the cited claims before the workshop.",
      explanation:
        "Đúng: research phù hợp để thu thập và tổng hợp nhiều nguồn hiện hành; citation vẫn cần được kiểm tra trước khi dùng cho quyết định.",
    },
    {
      id: "rely-on-memory",
      text: "Ask Claude to answer from its training knowledge and skip current sources because the market moves slowly.",
      explanation:
        "Sai: kiến thức huấn luyện có cutoff và không bảo đảm phản ánh thị trường hiện tại; bỏ nguồn làm tăng nguy cơ lỗi thời.",
    },
    {
      id: "one-paragraph",
      text: "Request a single paragraph without citations so the brief is easy to read.",
      explanation:
        "Sai: một đoạn không citation khó kiểm chứng và dễ che giấu khoảng trống bằng chứng.",
    },
    {
      id: "confident-recommendation",
      text: "Ask for a confident recommendation and treat it as final to save review time.",
      explanation:
        "Sai: sự tự tin không phải bằng chứng; khuyến nghị cần được kiểm tra với nguồn và người có trách nhiệm.",
    },
  ],
  correctChoiceIds: ["research-and-verify"],
  correctExplanation:
    "Research được thiết kế cho điều tra nhiều bước trên web và các connector, tạo báo cáo tổng hợp có citation. Tuy vậy, citation phải được kiểm tra: mục tiêu là đưa bằng chứng đáng tin vào workshop, không phải thay thế bước xác minh bằng một câu trả lời nghe tự tin.",
  sourceIds: [
    "anthropic-research-help",
    "anthropic-evaluation-docs",
  ],
});

const researchPlanningPractices: Question = questionSchema.parse({
  id: "workflow-research-planning-practices",
  type: "multiple-response",
  stem: "Which three practices improve research and planning with Claude? Select three.",
  choices: [
    {
      id: "define-questions",
      text: "Define the research questions, source criteria, and deadline before asking for a synthesis.",
      explanation:
        "Đúng: câu hỏi và tiêu chí nguồn rõ giúp research tập trung và giảm thu thập dữ liệu không liên quan.",
    },
    {
      id: "citations-gaps",
      text: "Require citations and explicitly flag gaps, conflicting sources, and assumptions.",
      explanation:
        "Đúng: citation và phần gap giúp người đọc biết điều gì đã được chứng minh và điều gì còn mở.",
    },
    {
      id: "separate-facts",
      text: "Separate verified facts from recommendations, and review the assumptions behind each option.",
      explanation:
        "Đúng: tách fact khỏi khuyến nghị giúp planning không biến giả định thành kết luận.",
    },
    {
      id: "first-answer",
      text: "Accept the first synthesized answer as the plan so the team can move quickly.",
      explanation:
        "Sai: bản tổng hợp đầu tiên có thể bỏ sót nguồn hoặc hiểu sai yêu cầu; cần kiểm tra trước khi thành plan.",
    },
    {
      id: "single-source",
      text: "Use one source to keep the research simple and avoid conflicting information.",
      explanation:
        "Sai: một nguồn không đủ để phát hiện mâu thuẫn hoặc đánh giá độ tin cậy.",
    },
    {
      id: "skip-validation",
      text: "Skip validation because research mode already provides citations.",
      explanation:
        "Sai: citation không tự động đúng hoặc còn hiện hành; vẫn phải kiểm tra nguồn và claim quan trọng.",
    },
  ],
  correctChoiceIds: ["define-questions", "citations-gaps", "separate-facts"],
  correctExplanation:
    "Research và planning tốt cần đầu vào rõ, bằng chứng có thể kiểm tra và sự tách biệt giữa dữ kiện với khuyến nghị. Đặt câu hỏi và tiêu chí nguồn trước, yêu cầu citation kèm gap, rồi review giả định sẽ giúp kế hoạch đứng vững hơn một bản tổng hợp trôi chảy.",
  sourceIds: [
    "anthropic-research-help",
    "anthropic-evaluation-docs",
  ],
});

const approvalWorkflowDesign: Question = questionSchema.parse({
  id: "workflow-solution-options",
  type: "single-choice",
  stem: "A team is designing a new internal approval workflow. How should Claude be used?",
  choices: [
    {
      id: "options-assumptions-human-decision",
      text: "Draft several workflow options with explicit assumptions, constraints, and risks, then have the accountable team choose and pilot one.",
      explanation:
        "Đúng: Claude hỗ trợ tạo và so sánh phương án; quyết định, trách nhiệm và pilot vẫn thuộc về con người.",
    },
    {
      id: "auto-deploy",
      text: "Let Claude select and deploy the workflow automatically to avoid a long design review.",
      explanation:
        "Sai: thiết kế workflow ảnh hưởng đến nhiều người và hệ thống; tự động triển khai bỏ qua review và trách nhiệm giải trình.",
    },
    {
      id: "final-decision",
      text: "Ask Claude for the final decision and implement it without stakeholder input.",
      explanation:
        "Sai: Claude có thể hỗ trợ phân tích nhưng không thay thế người chịu trách nhiệm ra quyết định.",
    },
    {
      id: "skip-stakeholders",
      text: "Skip stakeholder review because the model can infer what each team needs.",
      explanation:
        "Sai: model không biết đầy đủ ràng buộc, chính trị tổ chức hay tác động thực tế; bỏ stakeholder dễ tạo workflow không dùng được.",
    },
  ],
  correctChoiceIds: ["options-assumptions-human-decision"],
  correctExplanation:
    "Trong solution design, Claude phù hợp để mở rộng không gian phương án, làm rõ giả định và surface rủi ro. Quyết định cuối cùng vẫn cần người có trách nhiệm, stakeholder review và pilot có đo lường trước khi triển khai rộng.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
  ],
});

const solutionDesignIteration: Question = questionSchema.parse({
  id: "workflow-solution-iteration",
  type: "multiple-response",
  stem: "Which three practices support solution design and iteration with Claude? Select three.",
  choices: [
    {
      id: "prototype-assumptions",
      text: "Prototype several options and state the assumptions and trade-offs behind each.",
      explanation:
        "Đúng: nhiều phương án kèm giả định giúp so sánh và tránh chốt sớm vào một thiết kế.",
    },
    {
      id: "stakeholder-feedback",
      text: "Review prototypes with stakeholders and incorporate feedback into the next iteration.",
      explanation:
        "Đúng: phản hồi từ người dùng thật phát hiện ràng buộc và tác động mà model không biết.",
    },
    {
      id: "test-requirements",
      text: "Test each iteration against requirements, edge cases, and failure modes.",
      explanation:
        "Đúng: kiểm thử theo yêu cầu và edge case cho thấy thiết kế có thực sự hoạt động ngoài ví dụ đẹp.",
    },
    {
      id: "first-final",
      text: "Treat the first proposal as final because it sounds coherent.",
      explanation:
        "Sai: tính mạch lạc không chứng minh thiết kế đúng; cần review và kiểm thử.",
    },
    {
      id: "hide-tradeoffs",
      text: "Hide trade-offs so stakeholders can focus on the recommended option.",
      explanation:
        "Sai: che giấu trade-off làm quyết định kém minh bạch và dễ bỏ qua rủi ro quan trọng.",
    },
    {
      id: "skip-pilot",
      text: "Skip the pilot and roll out to every team at once.",
      explanation:
        "Sai: triển khai toàn bộ khi chưa pilot làm tăng phạm vi ảnh hưởng của lỗi thiết kế.",
    },
  ],
  correctChoiceIds: ["prototype-assumptions", "stakeholder-feedback", "test-requirements"],
  correctExplanation:
    "Solution design là vòng lặp: tạo phương án có giả định rõ, review với stakeholder, kiểm thử theo yêu cầu và edge case, rồi cải tiến. Giữ trade-off minh bạch và pilot trước khi mở rộng giúp giảm rủi ro của một thiết kế nghe hợp lý nhưng chưa được chứng minh.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
  ],
});

const stakeholderBrief: Question = questionSchema.parse({
  id: "workflow-stakeholder-brief",
  type: "single-choice",
  stem: "An executive asks whether Claude can replace part of the claims intake team. Which response communicates value and limitations responsibly?",
  choices: [
    {
      id: "scope-evidence-limits",
      text: "Describe the tested scope, measured results, known failure modes, required human review, and a bounded next step.",
      explanation:
        "Đúng: câu trả lời nêu rõ phạm vi đã kiểm thử, kết quả đo được, giới hạn, human review và bước tiếp theo có kiểm soát.",
    },
    {
      id: "guarantee-replacement",
      text: "Guarantee that Claude can replace the team and cut headcount immediately.",
      explanation:
        "Sai: không có bằng chứng cho cam kết đó; hứa thay thế toàn bộ bỏ qua giới hạn, rủi ro và trách nhiệm con người.",
    },
    {
      id: "no-review-needed",
      text: "Say that AI removes the need for human review because the model is consistent.",
      explanation:
        "Sai: nhất quán không đồng nghĩa đúng; các quyết định quan trọng vẫn cần người có thẩm quyền review.",
    },
    {
      id: "demo-only",
      text: "Show an impressive demo and avoid discussing failure cases or operating constraints.",
      explanation:
        "Sai: demo chọn lọc không đại diện cho vận hành thật; bỏ qua failure case là truyền đạt thiếu trung thực.",
    },
  ],
  correctChoiceIds: ["scope-evidence-limits"],
  correctExplanation:
    "Truyền đạt giá trị của Claude cần đi kèm phạm vi và giới hạn: đã test gì, kết quả đo ra sao, lỗi nào đã biết, ai review và bước tiếp theo là gì. Cam kết thay thế toàn bộ hoặc bỏ human review là những tuyên bố không có bằng chứng và làm xói mòn niềm tin.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ],
});

const stakeholderEvidence: Question = questionSchema.parse({
  id: "workflow-stakeholder-evidence",
  type: "multiple-response",
  stem: "Which three statements communicate Claude's value and limitations responsibly? Select three.",
  choices: [
    {
      id: "measured-outcomes",
      text: "Quantify only outcomes the team actually measured, and state the test conditions.",
      explanation:
        "Đúng: chỉ nêu số liệu đã đo, kèm điều kiện test, để người nghe hiểu phạm vi áp dụng.",
    },
    {
      id: "review-accountability",
      text: "Disclose where verification, escalation, and human accountability remain necessary.",
      explanation:
        "Đúng: nêu rõ điểm cần con người kiểm tra và chịu trách nhiệm giúp mô tả đúng vai trò của AI.",
    },
    {
      id: "scope-failures",
      text: "State the scope, assumptions, and known failure modes alongside the benefits.",
      explanation:
        "Đúng: giới hạn và failure mode là một phần của mô tả trung thực về năng lực.",
    },
    {
      id: "perfect-accuracy",
      text: "Claim 100% accuracy because the demo produced no errors.",
      explanation:
        "Sai: một demo không chứng minh độ chính xác tuyệt đối; tuyên bố như vậy là phóng đại.",
    },
    {
      id: "hide-failures",
      text: "Hide pilot failures so stakeholders stay enthusiastic.",
      explanation:
        "Sai: che giấu thất bại ngăn người ra quyết định thấy rủi ro thật.",
    },
    {
      id: "promise-headcount",
      text: "Promise headcount reduction before measuring productivity or quality.",
      explanation:
        "Sai: cam kết cắt giảm nhân sự khi chưa có dữ liệu là tuyên bố không có căn cứ.",
    },
  ],
  correctChoiceIds: ["measured-outcomes", "review-accountability", "scope-failures"],
  correctExplanation:
    "Giao tiếp có trách nhiệm dựa trên bằng chứng đo được, phạm vi và failure mode, đồng thời nói rõ human review và trách nhiệm. Tránh các tuyên bố tuyệt đối, che giấu lỗi hoặc hứa kết quả kinh doanh khi chưa có dữ liệu.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ],
});

const confidentialContract: Question = questionSchema.parse({
  id: "governance-privacy-confidential-upload",
  type: "single-choice",
  stem: "An employee wants to paste a confidential client contract into a personal Claude account to summarize it. What is the best action?",
  choices: [
    {
      id: "policy-approved-minimize",
      text: "Follow the organization's data policy, use an approved workspace or project, and minimize or redact unnecessary sensitive details before uploading.",
      explanation:
        "Đúng: cần kiểm tra chính sách, dùng môi trường được phê duyệt và chỉ đưa dữ liệu cần thiết; đây là cách giảm rủi ro pháp lý và bảo mật.",
    },
    {
      id: "paste-anyway",
      text: "Paste the full contract because summarization is a legitimate business task.",
      explanation:
        "Sai: mục đích hợp pháp không thay thế quyền truy cập, chính sách dữ liệu hay nghĩa vụ bảo mật với khách hàng.",
    },
    {
      id: "redact-names",
      text: "Remove the client's name only and assume the rest of the contract is safe to upload.",
      explanation:
        "Sai: hợp đồng có thể chứa điều khoản, giá, thông tin cá nhân và dữ liệu nhận diện khác; chỉ xóa tên chưa đủ.",
    },
    {
      id: "personal-account",
      text: "Use a personal account so the organization's retention settings do not apply.",
      explanation:
        "Sai: dùng tài khoản cá nhân có thể đưa dữ liệu công ty ra ngoài kiểm soát và vi phạm chính sách tổ chức.",
    },
  ],
  correctChoiceIds: ["policy-approved-minimize"],
  correctExplanation:
    "Dữ liệu mật cần được xử lý theo chính sách của tổ chức, không chỉ theo khả năng kỹ thuật của công cụ. Dùng tài khoản và workspace được phê duyệt, giảm thiểu hoặc che dữ liệu không cần thiết, và kiểm tra retention/training settings là các bước cơ bản trước khi upload.",
  sourceIds: [
    "anthropic-privacy-policy",
    "anthropic-google-workspace-connectors",
    "anthropic-usage-policy",
  ],
});

const privacyControls: Question = questionSchema.parse({
  id: "governance-privacy-controls",
  type: "multiple-response",
  stem: "Which three practices reduce privacy risk when using Claude? Select three.",
  choices: [
    {
      id: "classify",
      text: "Classify the sensitivity of data before deciding whether and where to upload it.",
      explanation:
        "Đúng: phân loại dữ liệu giúp áp đúng mức bảo vệ và tránh đưa dữ liệu mật vào môi trường không phù hợp.",
    },
    {
      id: "least-privilege",
      text: "Use approved accounts and grant connectors the least access needed for the task.",
      explanation:
        "Đúng: tài khoản được phê duyệt và quyền tối thiểu giảm phạm vi dữ liệu có thể bị lộ.",
    },
    {
      id: "minimize-retention",
      text: "Minimize or redact unnecessary details and check retention and training settings.",
      explanation:
        "Đúng: giảm dữ liệu đầu vào và hiểu retention/training giúp kiểm soát vòng đời thông tin.",
    },
    {
      id: "delete-assumption",
      text: "Assume deleting a chat immediately removes every copy from all systems and third parties.",
      explanation:
        "Sai: xóa chat không tự động xóa mọi bản sao ở hệ thống khác hoặc dịch vụ bên thứ ba; cần kiểm tra chính sách lưu trữ.",
    },
    {
      id: "personal-drive",
      text: "Connect a personal Drive account to a work project to make files easier to find.",
      explanation:
        "Sai: kết nối tài khoản cá nhân có thể vượt kiểm soát của tổ chức và trộn dữ liệu ngoài phạm vi.",
    },
    {
      id: "upload-everything",
      text: "Upload the full dataset by default so Claude never lacks context.",
      explanation:
        "Sai: tải toàn bộ dữ liệu làm tăng phạm vi rủi ro và vi phạm nguyên tắc tối thiểu hóa.",
    },
  ],
  correctChoiceIds: ["classify", "least-privilege", "minimize-retention"],
  correctExplanation:
    "Giảm rủi ro riêng tư là kết hợp phân loại dữ liệu, quyền tối thiểu và tối thiểu hóa nội dung. Cần hiểu retention/training settings và giới hạn của việc xóa chat; không nên giả định mọi bản sao biến mất ngay hoặc dùng tài khoản cá nhân cho dữ liệu công việc.",
  sourceIds: [
    "anthropic-privacy-policy",
    "anthropic-google-workspace-connectors",
    "anthropic-usage-policy",
  ],
});

const hiringScreeningPolicy: Question = questionSchema.parse({
  id: "governance-policy-hiring-screening",
  type: "single-choice",
  stem: "A manager wants Claude to screen job applications and rank candidates. What should happen first?",
  choices: [
    {
      id: "policy-high-risk-review",
      text: "Check the organization's policy and the provider's high-risk use requirements, including qualified human review and disclosure, before any use.",
      explanation:
        "Đúng: tuyển dụng là high-risk area; cần kiểm tra chính sách, yêu cầu human review, disclosure và quy trình phê duyệt trước khi dùng.",
    },
    {
      id: "proceed-accuracy",
      text: "Proceed because the model is accurate and the ranking saves time.",
      explanation:
        "Sai: độ chính xác không thay thế yêu cầu pháp lý, chính sách và trách nhiệm con người trong quyết định tuyển dụng.",
    },
    {
      id: "add-disclaimer",
      text: "Add a disclaimer to the rejection email and let the model decide the ranking.",
      explanation:
        "Sai: disclaimer không đủ; cần người có năng lực review và chịu trách nhiệm, cùng với kiểm tra chính sách.",
    },
    {
      id: "ask-claude-policy",
      text: "Ask Claude whether the use is allowed and follow its answer as legal advice.",
      explanation:
        "Sai: Claude không phải cố vấn pháp lý và không thể thay thế chính sách tổ chức hay đánh giá tuân thủ.",
    },
  ],
  correctChoiceIds: ["policy-high-risk-review"],
  correctExplanation:
    "Tuyển dụng và sàng lọc ứng viên thuộc nhóm high-risk. Trước khi dùng, cần đối chiếu chính sách tổ chức và yêu cầu của nhà cung cấp, bảo đảm người có năng lực review, minh bạch việc dùng AI và có quy trình phê duyệt. Đây là nguyên tắc quản trị, không phải tư vấn pháp lý.",
  sourceIds: [
    "anthropic-usage-policy",
    "anthropic-claude-constitution",
    "anthropic-privacy-policy",
  ],
});

const governanceOperations: Question = questionSchema.parse({
  id: "governance-policy-operations",
  type: "multiple-response",
  stem: "Which three are appropriate governance practices for Claude use? Select three.",
  choices: [
    {
      id: "map-policy",
      text: "Map each use case to the organization's policy and required approval before launch.",
      explanation:
        "Đúng: ánh xạ use case với chính sách và cấp phê duyệt giúp phát hiện rủi ro trước khi triển khai.",
    },
    {
      id: "document-review",
      text: "Document human review, escalation paths, and the evidence used for important decisions.",
      explanation:
        "Đúng: hồ sơ review và escalation tạo khả năng giải trình và cải thiện khi có sự cố.",
    },
    {
      id: "review-updates",
      text: "Review policy and vendor changes on a schedule and train users on the current rules.",
      explanation:
        "Đúng: chính sách và sản phẩm thay đổi; review định kỳ và đào tạo giữ người dùng cập nhật.",
    },
    {
      id: "vendor-only",
      text: "Rely only on the vendor's usage policy and ignore the organization's own standards.",
      explanation:
        "Sai: chính sách nhà cung cấp là mức tối thiểu, không thay thế yêu cầu và trách nhiệm của tổ chức.",
    },
    {
      id: "self-approve",
      text: "Let individual users approve their own exceptions to move faster.",
      explanation:
        "Sai: tự phê duyệt ngoại lệ làm mất kiểm soát và trách nhiệm giải trình.",
    },
    {
      id: "no-audit",
      text: "Skip audit trails because the model's answers are not official records.",
      explanation:
        "Sai: audit trail vẫn cần cho quyết định quan trọng, điều tra sự cố và chứng minh tuân thủ.",
    },
  ],
  correctChoiceIds: ["map-policy", "document-review", "review-updates"],
  correctExplanation:
    "Quản trị tốt nối use case với chính sách, ghi lại review và escalation, đồng thời cập nhật khi chính sách hoặc sản phẩm thay đổi. Chính sách của nhà cung cấp không thay thế tiêu chuẩn nội bộ; người dùng cũng không nên tự phê duyệt ngoại lệ.",
  sourceIds: [
    "anthropic-usage-policy",
    "anthropic-privacy-policy",
    "anthropic-claude-constitution",
  ],
});

const optimizeBaseline: Question = questionSchema.parse({
  id: "optimize-workflow-baseline",
  type: "single-choice",
  stem: "A reporting workflow works but is slow and expensive. What is the best first optimization step?",
  choices: [
    {
      id: "measure-baseline",
      text: "Measure the current quality, latency, and cost on representative cases, then identify the largest bottleneck before changing anything.",
      explanation:
        "Đúng: baseline và bottleneck giúp chọn thay đổi có tác động thật thay vì tối ưu theo cảm giác.",
    },
    {
      id: "cut-context",
      text: "Cut most of the context immediately to reduce tokens.",
      explanation:
        "Sai: cắt context có thể làm mất thông tin cần thiết và giảm chất lượng trước khi biết đâu là nút thắt.",
    },
    {
      id: "largest-model",
      text: "Switch to the largest model and assume it will make the workflow cheaper.",
      explanation:
        "Sai: model lớn hơn thường tăng chi phí và độ trễ; không giải quyết nguyên nhân chậm hay đắt.",
    },
    {
      id: "remove-qa",
      text: "Remove quality checks to shorten the process.",
      explanation:
        "Sai: bỏ QA có thể giảm thời gian trước mắt nhưng tăng lỗi và chi phí sửa chữa về sau.",
    },
  ],
  correctChoiceIds: ["measure-baseline"],
  correctExplanation:
    "Tối ưu hóa phải bắt đầu bằng đo lường: chất lượng, độ trễ và chi phí trên các case đại diện. Khi biết nút thắt lớn nhất, mới chọn thay đổi phù hợp như giảm context dư thừa, điều chỉnh model/effort, hoặc dùng batch/caching. Cắt bừa hoặc đổi model mà không đo dễ làm hỏng chất lượng.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ],
});

const optimizePractices: Question = questionSchema.parse({
  id: "optimize-workflow-practices",
  type: "multiple-response",
  stem: "Which three practices optimize a Claude workflow effectively? Select three.",
  choices: [
    {
      id: "baseline-metrics",
      text: "Establish baseline metrics for quality, latency, and cost before changing the workflow.",
      explanation:
        "Đúng: baseline là mốc để biết thay đổi có thực sự cải thiện hay chỉ dịch chuyển chi phí.",
    },
    {
      id: "reduce-repetition",
      text: "Remove repeated or low-value context and use caching or batch processing where the workload fits.",
      explanation:
        "Đúng: giảm token lặp lại và dùng caching/batch đúng chỗ có thể giảm chi phí và độ trễ.",
    },
    {
      id: "right-size",
      text: "Right-size the model and effort level for each task instead of using the largest setting everywhere.",
      explanation:
        "Đúng: chọn model và effort phù hợp giúp cân bằng chất lượng với chi phí, độ trễ.",
    },
    {
      id: "remove-human-review",
      text: "Remove human review to shorten the workflow.",
      explanation:
        "Sai: bỏ human review có thể làm giảm chất lượng và tăng rủi ro, đặc biệt với quyết định quan trọng.",
    },
    {
      id: "optimize-before-measure",
      text: "Optimize before measuring so the team can move faster.",
      explanation:
        "Sai: tối ưu không có baseline không xác định được cải thiện hay regression.",
    },
    {
      id: "silent-quality-loss",
      text: "Accept a large quality drop as long as the workflow becomes cheaper.",
      explanation:
        "Sai: giảm chi phí bằng cách hạ chất lượng âm thầm là đánh đổi không được đo và có thể gây hậu quả lớn hơn.",
    },
  ],
  correctChoiceIds: ["baseline-metrics", "reduce-repetition", "right-size"],
  correctExplanation:
    "Tối ưu hiệu quả dựa trên baseline và đánh đổi có ý thức: giảm context lặp, dùng caching/batch khi phù hợp, và chọn model/effort theo task. Không nên cắt human review hoặc chấp nhận mất chất lượng mà không đo, vì tiết kiệm trước mắt có thể che giấu chi phí và rủi ro lớn hơn.",
  sourceIds: [
    "anthropic-evaluation-docs",
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ],
});

export const workflowExpansionQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(currentMarketResearch, "workflow-research-planning", [
    "anthropic-research-help",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(researchPlanningPractices, "workflow-research-planning", [
    "anthropic-research-help",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(approvalWorkflowDesign, "workflow-solution-design", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
  ]),
  reviewedEntry(solutionDesignIteration, "workflow-solution-design", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
  ]),
  reviewedEntry(stakeholderBrief, "workflow-stakeholder-communication", [
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ]),
  reviewedEntry(stakeholderEvidence, "workflow-stakeholder-communication", [
    "anthropic-evaluation-docs",
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ]),
];

export const governanceExpansionQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(confidentialContract, "governance-data-privacy", [
    "anthropic-privacy-policy",
    "anthropic-google-workspace-connectors",
    "anthropic-usage-policy",
  ]),
  reviewedEntry(privacyControls, "governance-data-privacy", [
    "anthropic-privacy-policy",
    "anthropic-google-workspace-connectors",
    "anthropic-usage-policy",
  ]),
  reviewedEntry(hiringScreeningPolicy, "governance-policies", [
    "anthropic-usage-policy",
    "anthropic-claude-constitution",
    "anthropic-privacy-policy",
  ]),
  reviewedEntry(governanceOperations, "governance-policies", [
    "anthropic-usage-policy",
    "anthropic-privacy-policy",
    "anthropic-claude-constitution",
  ]),
];

export const optimizationExpansionQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(optimizeBaseline, "optimize-workflows", [
    "anthropic-evaluation-docs",
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ]),
  reviewedEntry(optimizePractices, "optimize-workflows", [
    "anthropic-evaluation-docs",
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ]),
];
