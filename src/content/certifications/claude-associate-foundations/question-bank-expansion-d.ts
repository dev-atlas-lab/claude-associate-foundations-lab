import {
  questionSchema,
  type Question,
  type QuestionBankEntry,
} from "../../../domain";
import { reviewedEntry } from "./bank-helpers";

/* ── Domain 1: Prompting and Task Execution ───────────────────────────── */

/**
 * Domain 1 - Objective: prompting-create-effective-prompts (few-shot distributional diversity)
 */
const promptingFewShotDistributionalDiversity: Question = questionSchema.parse({
  id: "prompting-few-shot-distributional-diversity",
  type: "single-choice",
  stem: "An enterprise support team is designing few-shot examples to teach Claude how to classify customer tickets into four urgency categories. During testing, Claude persistently over-assigns the 'Critical' label. Which few-shot design correction best follows Anthropic best practices?",
  choices: [
    {
      id: "add-all-critical",
      text: "Provide ten consecutive examples of 'Critical' tickets so Claude learns all edge cases of urgent issues.",
      explanation:
        "Sai: Cung cấp toàn ví dụ Critical sẽ làm lệch phân phối (distributional skew), khiến Claude càng thiên vị nhãn Critical hơn.",
    },
    {
      id: "balanced-representative-distribution",
      text: "Ensure the few-shot set has a balanced, representative distribution across all four categories, including subtle boundary cases and negative examples.",
      explanation:
        "Đúng: Anthropic khuyến nghị các ví dụ few-shot phải phản ánh đúng tỷ lệ phân phối kỳ vọng và cung cấp các ca cận biên (boundary/edge cases) để mô hình phân biệt ranh giới chính xác.",
    },
    {
      id: "remove-all-few-shots",
      text: "Remove all few-shot examples and rely entirely on increasing the model temperature to 1.0.",
      explanation:
        "Sai: Tăng temperature lên 1.0 làm tăng tính ngẫu nhiên, không giải quyết được lỗi phân loại sai nhãn.",
    },
    {
      id: "caps-instruction-only",
      text: "Write 'DO NOT OVERUSE CRITICAL' in capital letters in the user prompt.",
      explanation:
        "Sai: Chỉ thị cảm tính viết hoa không cung cấp căn cứ mẫu hành vi chuẩn xác bằng việc cân bằng tập few-shot.",
    },
  ],
  correctChoiceIds: ["balanced-representative-distribution"],
  correctExplanation:
    "Anthropic tài liệu hướng dẫn nêu rõ rằng mô hình học quy nạp từ các ví dụ few-shot; nếu tập ví dụ thiên vị một nhãn, mô hình sẽ bị skewed. Bộ few-shot chuẩn phải cân bằng số lượng giữa các nhãn và chứa cả các ca ranh giới tế nhị (subtle boundary cases).",
  sourceIds: ["anthropic-prompting-best-practices"],
});

/**
 * Domain 1 - Objective: prompting-iterate (chain-of-thought XML separation)
 */
const promptingCotXmlThinkingSeparation: Question = questionSchema.parse({
  id: "prompting-cot-xml-thinking-separation",
  type: "multiple-response",
  stem: "A financial analyst prompts Claude to perform multi-step tax calculations and output a clean JSON response for downstream API processing. However, when Claude reasons step-by-step inline, the JSON parser breaks. Which two prompt engineering techniques resolve this issue? Select two.",
  choices: [
    {
      id: "separate-thinking-tags",
      text: "Instruct Claude to execute its step-by-step mathematical reasoning inside `<thinking>` tags before delivering the JSON inside `<output>` tags.",
      explanation:
        "Đúng: Tách riêng phần suy luận từng bước (Chain-of-Thought) trong thẻ `<thinking>` và kết quả cuối trong `<output>` giúp hệ thống downstream dễ dàng bóc tách (regex/parse) mà không làm mất chất lượng tính toán.",
    },
    {
      id: "disable-cot-completely",
      text: "Forbid Claude from reasoning step-by-step and force immediate raw JSON generation.",
      explanation:
        "Sai: Ép mô hình bỏ qua reasoning đối với bài toán tính thuế nhiều bước phức tạp sẽ làm suy giảm nghiêm trọng độ chính xác tính toán.",
    },
    {
      id: "prefill-output-opening-tag",
      text: "Prefill the assistant response with `<output>` or `{` to guide the model directly into structured output syntax.",
      explanation:
        "Đúng: Kỹ thuật Prefill Assistant Message giúp mô hình tuân thủ tuyệt đối định dạng mở đầu mong muốn, ngăn chặn các câu chào hỏi mở đầu làm hỏng JSON parser.",
    },
    {
      id: "switch-to-unstructured-markdown",
      text: "Abandon JSON and request freeform narrative markdown instead.",
      explanation:
        "Sai: Hệ thống downstream cần API parsing tự động nên không thể thay thế JSON bằng văn xuôi tự do.",
    },
  ],
  correctChoiceIds: ["separate-thinking-tags", "prefill-output-opening-tag"],
  correctExplanation:
    "Anthropic khuyến nghị hai kỹ thuật mạnh mẽ khi cần cả suy luận phức tạp lẫn output có cấu trúc: (1) Yêu cầu mô hình suy luận bên trong thẻ `<thinking>` trước khi đóng gói JSON trong thẻ chuyên biệt, và (2) Dùng kỹ thuật Prefill Assistant Response để bảo đảm tính hợp lệ của cấu trúc trả về.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-structured-outputs-doc",
  ],
});

/* ── Domain 2: Output Evaluation and Validation ───────────────────────── */

/**
 * Domain 2 - Objective: output-human-review (automated vs human eval trade-off)
 */
const outputAutomatedVsHumanEvalTradeoff: Question = questionSchema.parse({
  id: "output-automated-vs-human-eval-tradeoff",
  type: "single-choice",
  stem: "An enterprise is setting up an evaluation pipeline for a customer-facing medical triage assistant. Which evaluation approach best balances scalability with high-stakes risk governance according to Anthropic principles?",
  choices: [
    {
      id: "pure-automated-metrics",
      text: "Rely solely on automated keyword matching and latency metrics to evaluate 10,000 queries per day without human review.",
      explanation:
        "Sai: Keyword matching không thể đánh giá được tính đúng đắn lâm sàng và an toàn trong lĩnh vực y tế rủi ro cao.",
    },
    {
      id: "hybrid-automated-screening-expert-sampling",
      text: "Use automated model-graded rubrics to screen high-volume traffic, and mandate expert human review (clinicians) for all borderline scores and high-risk flagged cases.",
      explanation:
        "Đúng: Kết hợp đánh giá tự động diện rộng bằng rubric với quy trình Human-in-the-loop (chuyên gia y tế) đối với các ca ranh giới hoặc rủi ro cao là phương pháp tiếp cận tối ưu của Anthropic.",
    },
    {
      id: "manual-review-all-queries",
      text: "Hire clinicians to manually inspect every single trivial query such as clinic address lookups.",
      explanation:
        "Sai: Kiểm duyệt thủ công 100% mọi truy vấn tầm thường gây quá tải chi phí và không tận dụng được tự động hóa.",
    },
    {
      id: "user-thumbs-up-only",
      text: "Rely exclusively on end-user thumbs-up/thumbs-down ratings collected on the mobile interface.",
      explanation:
        "Sai: Đánh giá từ người dùng phổ thông không bảo đảm tính chính xác chuyên môn y khoa.",
    },
  ],
  correctChoiceIds: ["hybrid-automated-screening-expert-sampling"],
  correctExplanation:
    "Anthropic Evaluation Best Practices nêu rõ kiến trúc đánh giá phân tầng (layered eval): dùng automated LLM rubrics để sàng lọc quy mô lớn, đồng thời thiết lập trạm kiểm duyệt con người chuyên môn (Expert Human Review) đối với các tình huống rủi ro cao hoặc điểm số ranh giới.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-reduce-hallucinations-doc"],
});

/**
 * Domain 2 - Objective: output-identify-hallucinations (adversarial counterfactual probe)
 */
const outputAdversarialCounterfactualProbe: Question = questionSchema.parse({
  id: "output-adversarial-counterfactual-probe",
  type: "multiple-response",
  stem: "A quality assurance engineer wants to test whether Claude will hallucinate when asked about internal corporate policies that do not exist. Which two testing practices represent sound adversarial evaluation? Select two.",
  choices: [
    {
      id: "negative-constraint-probing",
      text: "Submit questions with false premises (e.g., 'Summarize our 2025 Mars relocation policy') and verify that Claude explicitly acknowledges that no such policy exists rather than fabricating details.",
      explanation:
        "Đúng: Kỹ thuật kiểm thử tiền đề sai (counterfactual / negative probing) giúp xác minh mô hình có biết từ chối chân thực khi thiếu thông tin thay vì bịa đặt.",
    },
    {
      id: "evaluate-groundedness-citation-matching",
      text: "Provide an authentic handbook and test whether Claude invents clause numbers or non-existent section titles when answering specific compliance questions.",
      explanation:
        "Đúng: Kiểm tra độ bám sát nguồn (groundedness) và phát hiện trích dẫn giả mạo (fabricated citations) là trọng tâm của kiểm thử hallucination.",
    },
    {
      id: "test-only-with-existing-faqs",
      text: "Test exclusively with questions taken verbatim from existing published FAQs that Claude has seen repeatedly.",
      explanation:
        "Sai: Chỉ kiểm thử bằng câu hỏi quen thuộc sẽ không phát hiện được xu hướng hallucination khi gặp dữ liệu lạ hoặc tiền đề sai.",
    },
    {
      id: "benchmark-only-by-output-length",
      text: "Measure only the total token count and consider any answer above 500 words as hallucination-free.",
      explanation:
        "Sai: Độ dài văn bản không đồng nghĩa với tính chính xác; câu trả lời dài dòng vẫn có thể chứa toàn thông tin bịa đặt.",
    },
  ],
  correctChoiceIds: [
    "negative-constraint-probing",
    "evaluate-groundedness-citation-matching",
  ],
  correctExplanation:
    "Đánh giá hallucination bài bản đòi hỏi: (1) Kiểm thử các tiền đề giả định không tồn tại (Negative constraint / false premise probing) để bảo đảm Claude biết nói 'Tôi không tìm thấy thông tin', và (2) Kiểm tra đối chiếu trích dẫn để phát hiện số điều khoản hoặc quy định bịa đặt.",
  sourceIds: ["anthropic-evaluation-docs", "anthropic-reduce-hallucinations-doc"],
});

/**
 * Domain 2 - Objective: output-format-selection (markdown table schema fidelity)
 */
const outputMarkdownTableSchemaFidelity: Question = questionSchema.parse({
  id: "output-markdown-table-schema-fidelity",
  type: "single-choice",
  stem: "An operations team needs Claude to extract data from logistics invoices and produce a table for an executive summary report. Which prompt constraint ensures the highest structural reliability and data fidelity?",
  choices: [
    {
      id: "ask-for-pretty-table",
      text: "Ask Claude to 'make a nice clean table with whatever columns look good'.",
      explanation:
        "Sai: Yêu cầu chung chung không nêu rõ tên cột sẽ khiến Claude tự suy diễn và tạo ra cấu trúc không nhất quán giữa các lần chạy.",
    },
    {
      id: "explicit-columns-and-null-handling",
      text: "Define the exact column headers required, specify markdown table format, and instruct Claude on how to handle missing data (e.g., write 'N/A' rather than omitting cells or inventing values).",
      explanation:
        "Đúng: Xác định rõ ràng schema bảng (tên cột cụ thể), định dạng Markdown chuẩn, và quy tắc xử lý dữ liệu khuyết thiếu (viết 'N/A' thay vì bỏ trống hoặc bịa số) bảo đảm độ tin cậy cấu trúc cao nhất.",
    },
    {
      id: "request-latex-matrix-only",
      text: "Require output in raw LaTeX matrix notation for executive reporting.",
      explanation:
        "Sai: Ma trận LaTeX khó đọc trực tiếp trong báo cáo quản trị và không phù hợp với nhu cầu đọc của lãnh đạo.",
    },
    {
      id: "post-process-with-regex-only",
      text: "Let Claude write paragraphs and instruct downstream human analysts to parse the numbers manually.",
      explanation:
        "Sai: Đây là hành vi thủ công, không tận dụng năng lực định dạng cấu trúc của Claude theo yêu cầu đề bài.",
    },
  ],
  correctChoiceIds: ["explicit-columns-and-null-handling"],
  correctExplanation:
    "Anthropic hướng dẫn khi yêu cầu định dạng bảng (Markdown Table) cần nêu cụ thể tiêu đề các cột, quy tắc căn chỉnh và đặc biệt là chỉ dẫn tường minh về việc xử lý ô trống (ví dụ: ghi 'N/A') để tránh làm xô lệch cấu trúc cột hoặc tự ý bịa số liệu.",
  sourceIds: ["anthropic-prompting-best-practices"],
});

/* ── Domain 3: Context and Retrieval ──────────────────────────────────── */

/**
 * Domain 3 - Objective: model-task-fit (hybrid routing cost latency)
 */
const productModelHybridRoutingCostLatency: Question = questionSchema.parse({
  id: "product-model-hybrid-routing-cost-latency",
  type: "single-choice",
  stem: "An enterprise SaaS platform handles 2,000,000 incoming support queries daily. 85% of queries are routine FAQ checks (e.g., reset password, store hours), while 15% involve complex technical debugging of distributed cloud architectures. Which architecture satisfies performance SLAs while minimizing operational costs?",
  choices: [
    {
      id: "route-all-to-opus",
      text: "Route 100% of all queries to Claude 3 Opus to ensure maximum possible intelligence for every request.",
      explanation:
        "Sai: Tuyến đường này gây lãng phí ngân sách khổng lồ cho 85% truy vấn FAQ đơn giản và tăng độ trễ không cần thiết.",
    },
    {
      id: "route-all-to-haiku",
      text: "Route 100% of all queries to Claude 3.5 Haiku to minimize latency and token expenditure across the board.",
      explanation:
        "Sai: Haiku khó giải quyết tối ưu các bài toán kỹ thuật phức tạp về phân tích kiến trúc đám mây phân tán ở 15% ca khó.",
    },
    {
      id: "intelligent-router-haiku-sonnet",
      text: "Implement a lightweight classifier using Claude 3.5 Haiku to route routine FAQ requests to Haiku, and escalate complex technical debugging to Claude 3.5 Sonnet.",
      explanation:
        "Đúng: Mẫu kiến trúc Router Pattern phân tầng: dùng Haiku cho 85% tác vụ đơn giản tốc độ cao, và chuyển 15% tác vụ phức tạp cho Sonnet là chuẩn mực tối ưu chi phí và năng lực của Anthropic.",
    },
    {
      id: "manual-triage-queue",
      text: "Hold all incoming requests in a manual human review queue before sending any prompt to Claude.",
      explanation:
        "Sai: 2.000.000 truy vấn/ngày không thể kiểm duyệt thủ công trước khi gọi API.",
    },
  ],
  correctChoiceIds: ["intelligent-router-haiku-sonnet"],
  correctExplanation:
    "Anthropic khuyến nghị Router Pattern để tối ưu hóa sự đánh đổi giữa hiệu năng và chi phí: Dùng Claude 3.5 Haiku cho các tác vụ phân loại, phản hồi nhanh và chi phí thấp, kết hợp định tuyến các bài toán phân tích kiến trúc sâu sang Claude 3.5 Sonnet.",
  sourceIds: ["anthropic-choosing-model", "anthropic-building-effective-agents"],
});

/**
 * Domain 3 - Objective: context-memory-management (long-context retrieval needle)
 */
const contextMemoryLongContextRetrievalNeedle: Question = questionSchema.parse({
  id: "context-memory-long-context-retrieval-needle",
  type: "multiple-response",
  stem: "A research team needs Claude to analyze a 180,000-token legal repository containing 40 interrelated contracts. Which two practices optimize retrieval accuracy and minimize needle-in-a-haystack degradation? Select two.",
  choices: [
    {
      id: "place-question-at-the-end",
      text: "Place the core query and instruction at the very end of the prompt, after the full repository context.",
      explanation:
        "Đúng: Anthropic chứng minh trong tài liệu Long Context rằng việc đặt câu hỏi/chỉ thị ở cuối prompt giúp mô hình tập trung chú ý (attention recency) tốt nhất vào mục tiêu truy vấn.",
    },
    {
      id: "structure-with-xml-metadata",
      text: "Structure each document inside individual `<document id='...'>` tags with explicit title and section metadata.",
      explanation:
        "Đúng: Đóng gói tài liệu vào các thẻ XML có thuộc tính metadata giúp mô hình dễ dàng định vị vị trí và trích dẫn nguồn chuẩn xác trong ngữ cảnh dài 200K token.",
    },
    {
      id: "place-question-at-the-start-only",
      text: "Put the question only at the top of the prompt and leave the end with raw unformatted text.",
      explanation:
        "Sai: Đặt câu hỏi ở đầu và không nhắc lại ở cuối ngữ cảnh 180K token dễ khiến mô hình bị suy giảm chú ý (primacy fade).",
    },
    {
      id: "shuffle-chunks-randomly",
      text: "Randomly split and shuffle document paragraphs to prevent Claude from developing positional bias.",
      explanation:
        "Sai: Xáo trộn ngẫu nhiên văn bản pháp lý làm phá vỡ mạch logic và ngữ cảnh điều khoản, gây giảm sút nghiêm trọng chất lượng phân tích.",
    },
  ],
  correctChoiceIds: [
    "place-question-at-the-end",
    "structure-with-xml-metadata",
  ],
  correctExplanation:
    "Anthropic Long Context Best Practices hướng dẫn rõ: (1) Cấu trúc tài liệu bằng các thẻ `<document id='...'>` rõ ràng, và (2) Luôn đặt câu hỏi và yêu cầu truy xuất ở cuối prompt sau toàn bộ ngữ cảnh để tối ưu hóa trọng số chú ý.",
  sourceIds: ["anthropic-context-windows-doc", "anthropic-prompting-best-practices"],
});

/* ── Domain 4: Claude Models, Tool Use, and Workflows ─────────────────── */

/**
 * Domain 4 - Objective: workflow-solution-design (tool use error handling fallback)
 */
const workflowToolUseErrorHandlingFallback: Question = questionSchema.parse({
  id: "workflow-tool-use-error-handling-fallback",
  type: "single-choice",
  stem: "An agentic workflow calls a third-party weather API tool, but the external server intermittently returns HTTP 503 Service Unavailable. How should the workflow orchestrator be designed to handle this failure robustly?",
  choices: [
    {
      id: "crash-and-terminate-session",
      text: "Crash the entire application immediately and display an unhandled exception stack trace to the user.",
      explanation:
        "Sai: Làm sập ứng dụng mang lại trải nghiệm tiêu cực và vi phạm nguyên tắc thiết kế hệ thống kiên cường (resilient design).",
    },
    {
      id: "feed-error-back-to-claude-with-retry",
      text: "Return a structured tool error response back into the conversation context (e.g., status 503, retry-after), allowing Claude to inform the user gracefully or try an alternate data source.",
      explanation:
        "Đúng: Theo hướng dẫn Tool Use của Anthropic, khi công cụ gặp sự cố, hệ thống nên gửi kết quả lỗi có cấu trúc (`is_error: true` hoặc thông báo lỗi tường minh) trở lại vào conversation để Claude diễn giải và tìm phương án dự phòng (graceful fallback).",
    },
    {
      id: "invent-synthetic-weather-data",
      text: "Instruct the tool executor to invent realistic-looking sunny weather data so Claude does not notice the downtime.",
      explanation:
        "Sai: Tự ý bịa đặt số liệu thời tiết vi phạm tính trung thực của dữ liệu và nguyên tắc an toàn.",
    },
    {
      id: "infinite-blocking-loop",
      text: "Freeze the user thread in an infinite blocking sleep loop until the third-party server recovers.",
      explanation:
        "Sai: Vòng lặp vô hạn làm treo tiến trình và làm cạn kiệt tài nguyên hệ thống.",
    },
  ],
  correctChoiceIds: ["feed-error-back-to-claude-with-retry"],
  correctExplanation:
    "Anthropic tài liệu Building Effective Agents nhấn mạnh nguyên lý xử lý lỗi trong Tool Use: Khi tool thất bại, chuyển thông tin lỗi có cấu trúc về cho Claude để mô hình chủ động xử lý, xin lỗi người dùng một cách lịch thiệp, hoặc kích hoạt fallback tool thay vì để ứng dụng crash.",
  sourceIds: ["anthropic-building-effective-agents"],
});

/**
 * Domain 4 - Objective: workflow-research-planning (evaluator-optimizer stopping criterion)
 */
const workflowEvaluatorOptimizerStoppingCriterion: Question = questionSchema.parse({
  id: "workflow-evaluator-optimizer-stopping-criterion",
  type: "multiple-response",
  stem: "A software engineering team is implementing an Evaluator-Optimizer loop where Claude writes code and an evaluator LLM inspects it against a rubric. Which two design guardrails are essential to prevent infinite loops and runaway API costs? Select two.",
  choices: [
    {
      id: "maximum-iteration-ceiling",
      text: "Enforce a strict maximum iteration limit (e.g., max 3 or 4 revision cycles) that triggers escalation if the rubric threshold is not met.",
      explanation:
        "Đúng: Luôn phải có giới hạn số vòng lặp tối đa (hard iteration ceiling) để tránh lặp vô tận và kiểm soát chi phí API.",
    },
    {
      id: "quantitative-satisfaction-threshold",
      text: "Define explicit, measurable rubric criteria (e.g., all unit tests pass, zero security vulnerabilities) as the deterministic exit condition.",
      explanation:
        "Đúng: Tiêu chí dừng phải rõ ràng và định lượng được, giúp vòng lặp thoát ngay khi output đạt chuẩn mà không cần chạy thừa vòng lặp.",
    },
    {
      id: "run-forever-until-perfection",
      text: "Allow the loop to run indefinitely until the code achieves 100% aesthetic perfection according to arbitrary subjective criteria.",
      explanation:
        "Sai: Chạy không giới hạn với tiêu chí chủ quan sẽ dẫn tới hiện tượng dao động (oscillation) và cạn kiệt ngân sách token.",
    },
    {
      id: "disable-evaluator-feedback-context",
      text: "Omit previous critique history so the generator LLM starts from scratch on each loop.",
      explanation:
        "Sai: Xóa lịch sử góp ý khiến mô hình lặp lại chính những lỗi trước đó thay vì cải tiến từng bước.",
    },
  ],
  correctChoiceIds: [
    "maximum-iteration-ceiling",
    "quantitative-satisfaction-threshold",
  ],
  correctExplanation:
    "Anthropic trong bài viết 'Building Effective Agents' chỉ ra rằng mẫu thiết kế Evaluator-Optimizer bắt buộc phải có hai thành phần kiểm soát: (1) Tiêu chí đạt chuẩn rõ ràng (clear stopping criteria) và (2) Giới hạn số lần lặp tối đa (max iteration limit) để bảo vệ chi phí và thời gian xử lý.",
  sourceIds: ["anthropic-building-effective-agents"],
});

/* ── Domain 5: Configuration and Knowledge Management ─────────────────── */

/**
 * Domain 5 - Objective: config-project-instructions (workspace sharing conflict resolution)
 */
const configWorkspaceSharingConflictResolution: Question = questionSchema.parse({
  id: "config-workspace-sharing-conflict-resolution",
  type: "single-choice",
  stem: "A cross-functional product team shares a Claude Enterprise Project. The design team adds instructions demanding 'vibrant, emotive narrative prose', while the engineering team adds instructions demanding 'concise, technical bullet points with no adjectives'. Claude produces erratic, inconsistent outputs. How should the project configuration be restructured?",
  choices: [
    {
      id: "leave-both-and-let-claude-guess",
      text: "Keep both sets of instructions in the project brief and let Claude guess which style to use based on the user's name.",
      explanation:
        "Sai: Chỉ thị mâu thuẫn trực tiếp trong Project Instructions khiến mô hình dao động và tạo ra kết quả thiếu nhất quán.",
    },
    {
      id: "split-into-dedicated-projects",
      text: "Split the workspace into two dedicated Projects ('Product Design Studio' and 'Engineering Specs'), each with focused Project Knowledge and aligned custom instructions.",
      explanation:
        "Đúng: Anthropic khuyến nghị chia tách thành các Project riêng biệt theo từng miền nghiệp vụ/mục tiêu khi các yêu cầu về văn phong, vai trò hoặc tài liệu đối lập nhau.",
    },
    {
      id: "write-5000-word-compromise",
      text: "Write a 5,000-word instruction attempting to blend emotive prose with strict technical syntax in every single sentence.",
      explanation:
        "Sai: Cố gắng dung hòa hai phong cách đối nghịch trong một câu khiến output trở nên gượng gạo và khó hiểu.",
    },
    {
      id: "disable-project-instructions-completely",
      text: "Delete all Project instructions and require every user to type full company context from scratch in every chat.",
      explanation:
        "Sai: Bỏ Project instructions làm mất đi lợi ích cốt lõi của tính năng Claude Projects trong việc lưu trữ ngữ cảnh dùng chung.",
    },
  ],
  correctChoiceIds: ["split-into-dedicated-projects"],
  correctExplanation:
    "Tài liệu quản lý Claude Projects của Anthropic nêu rõ: Project Instructions nên tập trung vào một vai trò và mục tiêu nhất quán. Khi hai bộ phận có yêu cầu phong cách đối nghịch nhau, giải pháp kiến trúc chuẩn là phân tách thành hai Project chuyên biệt với tài liệu và chỉ dẫn phù hợp cho từng nhóm.",
  sourceIds: ["anthropic-projects-overview", "anthropic-projects-manage"],
});

/**
 * Domain 5 - Objective: config-knowledge-connectors (connector sync staleness alert)
 */
const configConnectorSyncStalenessAlert: Question = questionSchema.parse({
  id: "config-connector-sync-staleness-alert",
  type: "multiple-response",
  stem: "An enterprise deploys a Claude Knowledge Connector linked to their Google Drive repository. Employees report that Claude is referencing an expired travel expense policy that was superseded yesterday. Which two administrative factors explain this behavior? Select two.",
  choices: [
    {
      id: "sync-latency-or-interval",
      text: "The connector index operates on a periodic sync schedule or sync queue, meaning updates to the remote drive are not instantaneous.",
      explanation:
        "Đúng: Các Knowledge Connectors lập chỉ mục theo chu kỳ đồng bộ (sync interval/pipeline); thay đổi tức thời trên nguồn từ xa có thể cần thời gian để index hoàn tất.",
    },
    {
      id: "duplicate-unarchived-files",
      text: "The superseded document remains in the shared Drive folder and was not archived or removed from the connector's indexing scope.",
      explanation:
        "Đúng: Nếu tài liệu cũ vẫn nằm trong thư mục nguồn mà không được dọn dẹp hoặc gắn nhãn lưu trữ, bộ tìm kiếm sẽ vẫn truy xuất được văn bản hết hạn đó.",
    },
    {
      id: "claude-memorizes-forever",
      text: "Claude permanently bakes all indexed files into its neural network weights, making deletion impossible.",
      explanation:
        "Sai: Knowledge Connectors dùng cơ chế RAG (truy xuất ngữ cảnh tại runtime), không huấn luyện (fine-tune/train) lại trọng số mô hình.",
    },
    {
      id: "google-drive-unsupported",
      text: "Google Drive is unsupported by Claude connectors.",
      explanation:
        "Sai: Google Workspace / Google Drive là connector chính thức được hỗ trợ trong hệ sinh thái Claude Enterprise.",
    },
  ],
  correctChoiceIds: ["sync-latency-or-interval", "duplicate-unarchived-files"],
  correctExplanation:
    "Vấn đề dữ liệu cũ (staleness) trong Knowledge Connectors thường bắt nguồn từ hai yếu tố: (1) Độ trễ chu kỳ đồng bộ hóa (sync schedule latency) và (2) Việc quản trị tài nguyên kém, để sót tài liệu cũ song song với tài liệu mới mà không lưu trữ/xóa.",
  sourceIds: [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
    "anthropic-projects-rag",
  ],
});

/* ── Domain 6: Governance, Security, and Responsible AI ───────────────── */

/**
 * Domain 6 - Objective: governance-data-privacy (PII redaction pre-processing guardrail)
 */
const governancePiiRedactionPreProcessingGuardrail: Question = questionSchema.parse({
  id: "governance-pii-redaction-pre-processing-guardrail",
  type: "single-choice",
  stem: "A banking application uses Claude to summarize customer loan inquiry transcripts. Under banking secrecy laws, customer National ID numbers and credit card CVVs must never reach third-party external LLM APIs. What is the most reliable governance architecture?",
  choices: [
    {
      id: "prompt-only-please-do-not-read",
      text: "Include a system prompt asking Claude: 'Please ignore any National ID numbers or CVVs you happen to see in the prompt'.",
      explanation:
        "Sai: Yêu cầu mô hình 'bỏ qua' vẫn khiến dữ liệu nhạy cảm được gửi qua đường truyền tới API, vi phạm quy định cấm dữ liệu nhạy cảm rời khỏi hạ tầng nội bộ.",
    },
    {
      id: "client-side-pii-tokenization-scrubber",
      text: "Implement a deterministic, automated PII redaction/tokenization scrubber in the local pre-processing pipeline before the payload is sent to the Claude API.",
      explanation:
        "Đúng: Kiến trúc bảo mật phòng vệ theo chiều sâu (Defense-in-depth) đòi hỏi khử định danh (PII redaction/tokenization) ngay tại hạ tầng nội bộ của doanh nghiệp trước khi payload rời khỏi ranh giới mạng.",
    },
    {
      id: "encrypt-prompt-with-aes",
      text: "Encrypt the entire prompt with AES-256 and ask Claude to decrypt it in its neural activations without the key.",
      explanation:
        "Sai: Mô hình ngôn ngữ không thể giải mã văn bản mã hóa nếu không có khóa giải mã, dẫn đến vô nghĩa.",
    },
    {
      id: "trust-post-processing-only",
      text: "Send the raw data to Claude and redact the PII only from the final generated output.",
      explanation:
        "Sai: Redact ở đầu ra không ngăn được việc dữ liệu nhạy cảm đã bị truyền lên API ở đầu vào.",
    },
  ],
  correctChoiceIds: ["client-side-pii-tokenization-scrubber"],
  correctExplanation:
    "Theo hướng dẫn Quản trị và Bảo mật Dữ liệu của Anthropic, việc bảo vệ thông tin nhận dạng cá nhân (PII) trong các ngành tài chính/y tế nghiêm ngặt phải thực hiện bằng giải pháp khử định danh tiền xử lý (pre-processing scrubber) trên hạ tầng an toàn trước khi gọi LLM.",
  sourceIds: ["anthropic-privacy-policy", "anthropic-claude-constitution"],
});

/**
 * Domain 6 - Objective: governance-ethics (jailbreak refusal neutrality)
 */
const governanceJailbreakRefusalNeutrality: Question = questionSchema.parse({
  id: "governance-jailbreak-refusal-neutrality",
  type: "multiple-response",
  stem: "A malicious actor attempts a 'roleplay jailbreak' by instructing Claude to act as an unconstrained villain and generate ransomware code. When Claude safely declines, what two characteristics define a compliant refusal according to Claude's Constitution? Select two.",
  choices: [
    {
      id: "objective-neutral-tone",
      text: "The refusal is delivered in an objective, neutral, and matter-of-fact tone without moralizing, lecturing, or scolding the user.",
      explanation:
        "Đúng: Hiến pháp Claude (Constitutional AI) nhấn mạnh việc từ chối các yêu cầu gây hại phải luôn giữ thái độ trung tính, điềm tĩnh, không phán xét đạo đức hay giảng giải.",
    },
    {
      id: "clear-transparent-boundary",
      text: "The refusal clearly states what Claude cannot do (e.g., cannot generate malware or exploit code) while offering safe, educational alternatives if applicable.",
      explanation:
        "Đúng: Từ chối chuẩn mực nêu rõ ranh giới khả năng (không tạo mã độc) và có thể gợi ý hướng nghiên cứu bảo mật hợp pháp (defensive cybersecurity).",
    },
    {
      id: "aggressive-user-shaming",
      text: "Claude berates the user for violating ethical standards and threatens to report them to law enforcement.",
      explanation:
        "Sai: Claude tuyệt đối không đe dọa hay chỉ trích gay gắt người dùng; điều này vi phạm nguyên tắc 'non-preachy refusal'.",
    },
    {
      id: "silent-infinite-hang",
      text: "The model returns an empty HTTP 200 response without explaining why the request was not fulfilled.",
      explanation:
        "Sai: Trả về rỗng không giải thích gây khó hiểu cho hệ thống tích hợp và người dùng.",
    },
  ],
  correctChoiceIds: ["objective-neutral-tone", "clear-transparent-boundary"],
  correctExplanation:
    "Claude's Constitution quy định cách xử lý từ chối chuẩn mực (principled refusal): (1) Giữ thái độ khách quan, trung tính, không giảng đạo lý (anti-preachiness), và (2) Nêu rõ ràng lý do từ chối về mặt kỹ thuật/chính sách và đề xuất giải pháp an toàn thay thế.",
  sourceIds: ["anthropic-claude-constitution", "anthropic-usage-policy"],
});

/* ── Domain 7: Troubleshooting and Optimization ───────────────────────── */

/**
 * Domain 7 - Objective: optimize-workflows (streaming TTFT bottleneck)
 */
const troubleshootStreamingTimeToFirstTokenBottleneck: Question = questionSchema.parse({
  id: "troubleshoot-streaming-time-to-first-token-bottleneck",
  type: "single-choice",
  stem: "A customer-facing chat application experiences a frustrating 6-second delay before users see the first word of Claude's response. The development team has already enabled Server-Sent Events (SSE) streaming. Investigation reveals the prompt includes a 12,000-token un-cached conversation history followed by an instruction to write a 1,000-word CoT before replying. What is the primary architectural remedy to reduce Time to First Token (TTFT)?",
  choices: [
    {
      id: "enable-prompt-caching-on-static-history",
      text: "Enable Prompt Caching on the static conversation history and trim unnecessary CoT requirements for simple customer conversational turns.",
      explanation:
        "Đúng: Prompt Caching giúp hạ giảm thời gian xử lý prefill của 12.000 token lịch sử xuống gần như tức thì, kết hợp tinh gọn chuỗi suy luận cho các câu thoại đơn giản sẽ giảm mạnh TTFT.",
    },
    {
      id: "switch-from-streaming-to-blocking",
      text: "Disable streaming and wait for the entire 1,000-word response to finish before sending it to the client.",
      explanation:
        "Sai: Chuyển sang blocking sẽ làm người dùng phải chờ lâu hơn nữa (10-15 giây) trước khi nhìn thấy bất kỳ phản hồi nào.",
    },
    {
      id: "increase-max-tokens-to-8192",
      text: "Increase `max_tokens` parameter from 1000 to 8192.",
      explanation:
        "Sai: Tăng max_tokens không làm tăng tốc độ xử lý TTFT mà còn có thể làm tăng thời gian chờ.",
    },
    {
      id: "compress-client-browser-font",
      text: "Compress the CSS font family loaded on the user's web browser.",
      explanation:
        "Sai: Font chữ trình duyệt không liên quan đến thời gian tính toán LLM token latency trên máy chủ.",
    },
  ],
  correctChoiceIds: ["enable-prompt-caching-on-static-history"],
  correctExplanation:
    "Theo tài liệu Tối ưu hóa Độ trễ của Anthropic, Time to First Token (TTFT) bị ảnh hưởng chủ yếu bởi thời gian prefill của context đầu vào. Sử dụng Prompt Caching cho đoạn lịch sử dài (>1024 tokens) giảm thời gian prefill tới 80%+, đồng thời lược bỏ các bước suy luận thừa giúp phản hồi đầu tiên xuất hiện gần như lập tức.",
  sourceIds: ["anthropic-context-windows-doc", "anthropic-choosing-model"],
});

/**
 * Domain 7 - Objective: troubleshoot-diagnose (prompt caching break investigation)
 */
const troubleshootPromptCachingBreakInvestigation: Question = questionSchema.parse({
  id: "troubleshoot-prompt-caching-break-investigation",
  type: "multiple-response",
  stem: "A developer notices that their API bill spiked because Claude's Prompt Caching hit rate suddenly dropped from 95% to 0%, even though the 50-page system prompt has not changed. Which two dynamic modifications at the beginning of the API request payload explain this cache invalidation? Select two.",
  choices: [
    {
      id: "dynamic-timestamp-in-system-prompt",
      text: "Injecting the current dynamic timestamp (e.g., `Current time: 2026-10-29 14:02:11`) at the very top of the system prompt prefix.",
      explanation:
        "Đúng: Prompt Caching hoạt động theo nguyên tắc tiền tố giống hệt từng byte (exact byte-for-byte prefix match). Đưa timestamp động vào đầu system prompt sẽ làm thay đổi hash của toàn bộ phần phía sau, khiến cache bị trượt 100%.",
    },
    {
      id: "random-unique-session-id-prefix",
      text: "Inserting a newly generated UUID tracking id before the static system guidelines.",
      explanation:
        "Đúng: Chèn UUID ngẫu nhiên vào trước khối tĩnh phá vỡ tính tương đồng tiền tố, dẫn đến cache miss hoàn toàn.",
    },
    {
      id: "keeping-system-prompt-identical",
      text: "Keeping the system prompt completely byte-identical across calls.",
      explanation:
        "Sai: Giữ nguyên văn bản từng byte sẽ giúp cache hit, không phải nguyên nhân gây drop về 0%.",
    },
    {
      id: "placing-dynamic-user-input-at-the-end",
      text: "Placing dynamic user queries after the cached system breakpoint.",
      explanation:
        "Sai: Đặt dữ liệu biến đổi ở cuối sau điểm breakpoint cache là cách làm đúng chuẩn để duy trì cache hit.",
    },
  ],
  correctChoiceIds: [
    "dynamic-timestamp-in-system-prompt",
    "random-unique-session-id-prefix",
  ],
  correctExplanation:
    "Anthropic Prompt Caching dựa trên so khớp tiền tố chính xác (exact prefix matching). Bất kỳ dữ liệu biến thiên nào (như dynamic timestamp, request UUID, ngẫu nhiên hóa) đặt ở phần đầu của payload sẽ làm vô hiệu hóa toàn bộ cache block phía sau. Dữ liệu động phải luôn được đặt ở phần đuôi sau cache breakpoint.",
  sourceIds: ["anthropic-context-windows-doc", "anthropic-prompting-best-practices"],
});

/* ── Export Expansion D Bank Entries ───────────────────────────────────── */

export const expansionDQuestionBank: QuestionBankEntry[] = [
  // Domain 1 (2 items)
  reviewedEntry(promptingFewShotDistributionalDiversity, "prompting-create-effective-prompts", [
    "anthropic-prompting-best-practices",
  ]),
  reviewedEntry(promptingCotXmlThinkingSeparation, "prompting-iterate", [
    "anthropic-prompting-best-practices",
    "anthropic-structured-outputs-doc",
  ]),

  // Domain 2 (3 items)
  reviewedEntry(outputAutomatedVsHumanEvalTradeoff, "output-evaluate-accuracy", [
    "anthropic-evaluation-docs",
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(outputAdversarialCounterfactualProbe, "output-edit-adapt", [
    "anthropic-evaluation-docs",
    "anthropic-reduce-hallucinations-doc",
  ]),
  reviewedEntry(outputMarkdownTableSchemaFidelity, "output-format-selection", [
    "anthropic-prompting-best-practices",
  ]),

  // Domain 3 (2 items)
  reviewedEntry(productModelHybridRoutingCostLatency, "model-task-fit", [
    "anthropic-choosing-model",
    "anthropic-building-effective-agents",
  ]),
  reviewedEntry(contextMemoryLongContextRetrievalNeedle, "context-memory-management", [
    "anthropic-context-windows-doc",
    "anthropic-prompting-best-practices",
  ]),

  // Domain 4 (2 items)
  reviewedEntry(workflowToolUseErrorHandlingFallback, "workflow-solution-design", [
    "anthropic-building-effective-agents",
  ]),
  reviewedEntry(workflowEvaluatorOptimizerStoppingCriterion, "workflow-research-planning", [
    "anthropic-building-effective-agents",
  ]),

  // Domain 5 (2 items)
  reviewedEntry(configWorkspaceSharingConflictResolution, "config-project-instructions", [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
  ]),
  reviewedEntry(configConnectorSyncStalenessAlert, "config-knowledge-connectors", [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
    "anthropic-projects-rag",
  ]),

  // Domain 6 (2 items)
  reviewedEntry(governancePiiRedactionPreProcessingGuardrail, "governance-data-privacy", [
    "anthropic-privacy-policy",
    "anthropic-claude-constitution",
  ]),
  reviewedEntry(governanceJailbreakRefusalNeutrality, "governance-ethics", [
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ]),

  // Domain 7 (2 items)
  reviewedEntry(troubleshootStreamingTimeToFirstTokenBottleneck, "optimize-workflows", [
    "anthropic-context-windows-doc",
    "anthropic-choosing-model",
  ]),
  reviewedEntry(troubleshootPromptCachingBreakInvestigation, "troubleshoot-diagnose", [
    "anthropic-context-windows-doc",
    "anthropic-prompting-best-practices",
  ]),
];
