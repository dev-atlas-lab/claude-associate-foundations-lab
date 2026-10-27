import { questionSchema, type Question, type QuestionBankEntry } from "../../../domain";
import { reviewedEntry } from "./bank-helpers";

/**
 * Additional reviewed items for Domain 1 (prompting iteration and task-type
 * adaptation) and Domain 3 (product-feature and model selection).
 *
 * The items avoid naming a fixed public model lineup. Model names, prices, and
 * limits change; the durable exam skill is matching a task to a capability tier
 * and validating the choice with representative tests.
 */

const iterateOnEvidence: Question = questionSchema.parse({
  id: "prompting-iterate-evidence",
  type: "single-choice",
  stem: "A first draft of a customer FAQ is accurate but vague and does not match the support team's tone. What is the strongest next iteration?",
  choices: [
    {
      id: "diagnose-and-target",
      text: "Compare the draft with the success criteria, add the audience, tone examples, and must-answer questions, then rerun on the same input.",
      explanation:
        "Đúng: xác định khoảng cách so với tiêu chí rồi bổ sung đúng thông tin còn thiếu (audience, ví dụ giọng điệu, câu hỏi bắt buộc) và chạy lại trên cùng input để so sánh.",
    },
    {
      id: "restart-randomly",
      text: "Delete the prompt and write a completely different one without checking why the first draft was weak.",
      explanation:
        "Sai: viết lại ngẫu nhiên không cho biết thay đổi nào tạo ra cải thiện, nên khó học được điều gì hiệu quả.",
    },
    {
      id: "make-it-longer",
      text: "Ask for a longer answer and assume more detail will fix the tone.",
      explanation:
        "Sai: độ dài không sửa được vấn đề về audience và giọng điệu; còn có thể làm câu trả lời khó đọc hơn.",
    },
    {
      id: "accept-first",
      text: "Publish the first draft because it is factually accurate.",
      explanation:
        "Sai: accuracy là điều kiện cần nhưng chưa đủ; output vẫn chưa đáp ứng tiêu chí về người đọc và giọng điệu.",
    },
  ],
  correctChoiceIds: ["diagnose-and-target"],
  correctExplanation:
    "Iteration hiệu quả bắt đầu bằng việc so output với tiêu chí thành công, không phải bằng cách đổi prompt ngẫu nhiên. Khi đã biết thiếu audience, tone và các câu hỏi bắt buộc, hãy bổ sung đúng các yếu tố đó rồi chạy lại trên cùng input để thấy tác động thật của thay đổi.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});

const systematicIteration: Question = questionSchema.parse({
  id: "prompting-iterate-systematic",
  type: "multiple-response",
  stem: "Which three actions make prompt iteration systematic rather than trial and error? Select three.",
  choices: [
    {
      id: "baseline-same-cases",
      text: "Keep a baseline prompt and compare revisions on the same representative cases.",
      explanation:
        "Đúng: giữ nguyên bộ test và baseline giúp tách tác động của thay đổi khỏi biến thiên ngẫu nhiên.",
    },
    {
      id: "one-change",
      text: "Change one meaningful variable at a time so its effect can be attributed.",
      explanation:
        "Đúng: thay đổi từng biến giúp biết yếu tố nào cải thiện hoặc làm hỏng kết quả.",
    },
    {
      id: "record-failures",
      text: "Record which cases fail and classify the failure as instruction, context, or task decomposition.",
      explanation:
        "Đúng: phân loại lỗi dẫn đến sửa đúng chỗ thay vì thêm chỉ dẫn mơ hồ.",
    },
    {
      id: "change-everything",
      text: "Change the model, prompt, and output format at the same time to move faster.",
      explanation:
        "Sai: thay nhiều biến cùng lúc khiến không thể biết thay đổi nào tạo ra kết quả.",
    },
    {
      id: "judge-fluency",
      text: "Use how fluent the answer sounds as the main success measure.",
      explanation:
        "Sai: độ trôi chảy không đo được accuracy, completeness hay mức phù hợp với yêu cầu.",
    },
    {
      id: "remove-edge-cases",
      text: "Remove the hardest test cases so the pass rate improves.",
      explanation:
        "Sai: xóa case khó làm sai lệch đánh giá và che giấu điểm yếu thật.",
    },
  ],
  correctChoiceIds: ["baseline-same-cases", "one-change", "record-failures"],
  correctExplanation:
    "Iteration có kỷ luật dựa trên baseline, bộ case đại diện và phân loại lỗi. So sánh trên cùng input, thay đổi từng biến và ghi lại loại thất bại giúp biến phản hồi thành kiến thức có thể tái sử dụng, thay vì chỉnh prompt theo cảm giác.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});

const analysisTaskStrategy: Question = questionSchema.parse({
  id: "prompting-analysis-task-strategy",
  type: "single-choice",
  stem: "A researcher must analyze 40 interview transcripts for recurring themes without losing traceability to the source. Which prompting strategy fits this task best?",
  choices: [
    {
      id: "structured-extraction",
      text: "Ask for structured extraction of themes with supporting quotes and transcript IDs, then synthesize the extracted evidence.",
      explanation:
        "Đúng: trích xuất có cấu trúc kèm quote và ID giữ được traceability, sau đó tổng hợp trên dữ liệu đã được đánh dấu.",
    },
    {
      id: "brainstorm-first",
      text: "Ask for a broad brainstorm of possible themes before reading the transcripts.",
      explanation:
        "Sai: brainstorm trước khi đọc dữ liệu dễ tạo thiên lệch và không gắn theme với bằng chứng cụ thể.",
    },
    {
      id: "one-paragraph",
      text: "Ask for a single paragraph that summarizes all 40 transcripts.",
      explanation:
        "Sai: một đoạn văn ngắn khó giữ được chi tiết, nguồn và sự khác biệt giữa các cuộc phỏng vấn.",
    },
    {
      id: "creative-story",
      text: "Ask Claude to write a creative narrative that makes the findings more engaging.",
      explanation:
        "Sai: mục tiêu là phân tích có thể kiểm chứng, không phải kể chuyện; narrative sáng tạo có thể thêm chi tiết không có trong dữ liệu.",
    },
  ],
  correctChoiceIds: ["structured-extraction"],
  correctExplanation:
    "Với phân tích nhiều tài liệu, chiến lược phù hợp là biến dữ liệu thành cấu trúc có thể kiểm tra: theme, quote hỗ trợ và ID nguồn. Tổng hợp sau khi trích xuất giúp giảm nguy cơ bỏ sót bằng chứng và cho phép người review quay lại đúng đoạn phỏng vấn.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});

const taskTypeAdaptation: Question = questionSchema.parse({
  id: "prompting-adapt-task-types",
  type: "multiple-response",
  stem: "Which three prompt adaptations fit the task type? Select three.",
  choices: [
    {
      id: "drafting-audience",
      text: "For drafting, specify the audience, tone, constraints, and a short example of the desired style.",
      explanation:
        "Đúng: drafting cần audience và ví dụ phong cách để output đúng giọng điệu và mức chi tiết.",
    },
    {
      id: "brainstorm-options",
      text: "For brainstorming, ask for many diverse options first and defer judgment until a later step.",
      explanation:
        "Đúng: tách giai đoạn tạo ý tưởng khỏi giai đoạn chọn lọc giúp tăng độ đa dạng và giảm chốt sớm.",
    },
    {
      id: "analysis-criteria",
      text: "For analysis, define the comparison criteria and require evidence for each conclusion.",
      explanation:
        "Đúng: tiêu chí rõ và yêu cầu bằng chứng giúp phân tích có thể kiểm chứng thay vì chỉ là nhận định chung.",
    },
    {
      id: "research-memory-only",
      text: "For research, rely on the model's memory and skip source citations to save time.",
      explanation:
        "Sai: research cần nguồn hiện hành và citation; bỏ nguồn làm tăng nguy cơ thông tin lỗi thời hoặc bịa.",
    },
    {
      id: "drafting-no-audience",
      text: "For drafting, omit the audience so Claude can decide who should read it.",
      explanation:
        "Sai: thiếu audience khiến output khó đúng tone và mức chi tiết; đây là thông tin then chốt của task.",
    },
    {
      id: "brainstorm-one-answer",
      text: "For brainstorming, ask for one safe answer so the team can decide quickly.",
      explanation:
        "Sai: yêu cầu một đáp án an toàn triệt tiêu mục tiêu tạo nhiều lựa chọn của brainstorming.",
    },
  ],
  correctChoiceIds: ["drafting-audience", "brainstorm-options", "analysis-criteria"],
  correctExplanation:
    "Mỗi loại task cần một cách đặt vấn đề khác nhau: drafting cần audience và ví dụ, brainstorming cần độ đa dạng và hoãn đánh giá, analysis cần tiêu chí và bằng chứng. Research thì cần nguồn và citation, không thể thay bằng trí nhớ của model.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});

const recurringReportFeature: Question = questionSchema.parse({
  id: "product-feature-recurring-report",
  type: "single-choice",
  stem: "A team produces the same quarterly market report from a stable set of PDFs and a fixed template. Which Claude feature fits this work best?",
  choices: [
    {
      id: "project-knowledge-instructions",
      text: "A project that holds the PDFs in project knowledge and the template and house style in project instructions.",
      explanation:
        "Đúng: công việc lặp lại với nguồn ổn định và format cố định là trường hợp điển hình của project knowledge và project instructions.",
    },
    {
      id: "one-off-chat",
      text: "A new standalone chat for every quarter, with the PDFs pasted in manually.",
      explanation:
        "Sai: chat mới không giữ knowledge hay instruction dùng chung, nên mỗi quý phải lặp lại cấu hình và dễ sai format.",
    },
    {
      id: "research-every-time",
      text: "Research mode every quarter, even though the source PDFs are already approved and stable.",
      explanation:
        "Sai: research phù hợp để thu thập và tổng hợp nhiều nguồn hiện hành; dùng nó khi đã có bộ nguồn ổn định làm tăng chi phí và biến thiên không cần thiết.",
    },
    {
      id: "artifact-only",
      text: "An artifact with no project or source documents, rebuilt from memory each quarter.",
      explanation:
        "Sai: artifact là format output, không phải nơi lưu nguồn và instruction; thiếu knowledge khiến báo cáo không bám tài liệu.",
    },
  ],
  correctChoiceIds: ["project-knowledge-instructions"],
  correctExplanation:
    "Công việc định kỳ với nguồn ổn định và template cố định nên dùng project: knowledge giữ tài liệu nguồn, instructions giữ format và quy tắc. Research và artifact có thể hỗ trợ nhưng không thay thế cấu hình dùng chung cho quy trình lặp lại.",
  sourceIds: [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
    "anthropic-artifacts-doc",
  ],
});

const featureFitChoices: Question = questionSchema.parse({
  id: "product-feature-fit-choices",
  type: "multiple-response",
  stem: "Which three feature choices fit the described work? Select three.",
  choices: [
    {
      id: "research-current",
      text: "Research for a current multi-source briefing that needs citations and synthesis across the web and connected tools.",
      explanation:
        "Đúng: research chạy nhiều lượt tìm kiếm, tổng hợp nguồn và tạo báo cáo có citation.",
    },
    {
      id: "artifact-reusable",
      text: "An artifact for a document or code file that will be edited, iterated on, and reused.",
      explanation:
        "Đúng: artifact phù hợp với nội dung self-contained, dài và có nhu cầu chỉnh sửa hoặc tái sử dụng.",
    },
    {
      id: "project-recurring",
      text: "A project with knowledge and instructions for recurring work with stable source documents.",
      explanation:
        "Đúng: project giữ context và quy tắc dùng chung cho nhiều chat lặp lại.",
    },
    {
      id: "chat-long-workspace",
      text: "A single long chat as the permanent workspace for a client across many months.",
      explanation:
        "Sai: chat dài dần mất tín hiệu và không có knowledge/instruction dùng chung; project phù hợp hơn cho workspace lâu dài.",
    },
    {
      id: "research-quick-fact",
      text: "Research for a single quick factual lookup that one short answer can resolve.",
      explanation:
        "Sai: research dành cho điều tra nhiều bước; một câu hỏi đơn giản không cần và có thể tiêu tốn usage nhanh hơn.",
    },
    {
      id: "artifact-status",
      text: "An artifact for a one-line status update in an ongoing chat.",
      explanation:
        "Sai: status ngắn nên trả lời inline; artifact dành cho nội dung lớn, self-contained và có thể tái sử dụng.",
    },
  ],
  correctChoiceIds: ["research-current", "artifact-reusable", "project-recurring"],
  correctExplanation:
    "Chọn feature theo tính chất công việc: research cho điều tra nhiều nguồn hiện hành, artifact cho deliverable dài có thể chỉnh sửa, project cho công việc lặp lại với nguồn và quy tắc ổn định. Chat thường và câu trả lời inline vẫn là lựa chọn đúng cho tác vụ ngắn, một lần.",
  sourceIds: [
    "anthropic-research-help",
    "anthropic-artifacts-doc",
    "anthropic-projects-overview",
  ],
});

const familySpeedCost: Question = questionSchema.parse({
  id: "model-family-speed-cost",
  type: "single-choice",
  stem: "A support team classifies thousands of short tickets each day. Accuracy matters, but latency and cost are tight. Which starting approach fits Anthropic's model-selection guidance?",
  choices: [
    {
      id: "efficiency-first",
      text: "Start with a faster, lower-cost model, test it on real tickets, and upgrade only if it misses the quality bar.",
      explanation:
        "Đúng: cách tiếp cận efficiency-first bắt đầu với model nhanh, rẻ hơn, kiểm thử kỹ rồi chỉ nâng cấp khi có khoảng trống năng lực cụ thể.",
    },
    {
      id: "largest-first",
      text: "Start with the largest, most expensive model and never evaluate a cheaper option.",
      explanation:
        "Sai: bắt đầu bằng model mạnh nhất có thể vượt yêu cầu và tăng chi phí, độ trễ mà không có eval chứng minh cần thiết.",
    },
    {
      id: "newest-only",
      text: "Choose the newest model name regardless of the task or measured results.",
      explanation:
        "Sai: tên model và thời điểm phát hành không thay thế đánh giá trên dữ liệu thật của task.",
    },
    {
      id: "random-choice",
      text: "Rotate models randomly each week to see which one feels better.",
      explanation:
        "Sai: thay đổi ngẫu nhiên không tạo baseline hay tiêu chí so sánh, nên không thể kết luận model nào phù hợp.",
    },
  ],
  correctChoiceIds: ["efficiency-first"],
  correctExplanation:
    "Với tác vụ khối lượng lớn, độ trễ thấp và tương đối đơn giản, hướng efficiency-first thường hợp lý: bắt đầu bằng model nhanh, rẻ, kiểm thử trên ticket thật, rồi nâng cấp nếu chất lượng chưa đạt. Quyết định cuối cùng phải dựa trên eval, không dựa vào tên hay giá niêm yết.",
  sourceIds: [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ],
});

const familyTradeoffs: Question = questionSchema.parse({
  id: "model-family-tradeoffs",
  type: "multiple-response",
  stem: "Which three statements about Claude model families are defensible? Select three.",
  choices: [
    {
      id: "tradeoffs",
      text: "Families differ in the balance of capability, latency, and cost.",
      explanation:
        "Đúng: các dòng model được định vị khác nhau về năng lực, tốc độ và giá, nên chọn theo yêu cầu task.",
    },
    {
      id: "check-current",
      text: "The current lineup, prices, and limits should be checked in official documentation because they change.",
      explanation:
        "Đúng: tên model, giá và giới hạn được cập nhật theo thời gian; tài liệu chính thức là nguồn cần kiểm tra.",
    },
    {
      id: "benchmark",
      text: "A model should be tested on real prompts and edge cases before the team standardizes on it.",
      explanation:
        "Đúng: benchmark trên dữ liệu thật, gồm cả edge case, là cách kiểm tra mức phù hợp thay vì suy đoán.",
    },
    {
      id: "haiku-always-best",
      text: "The smallest family is always the most accurate choice.",
      explanation:
        "Sai: model nhỏ thường tối ưu cho tốc độ và chi phí, không phải lúc nào cũng đạt độ chính xác cao nhất cho task phức tạp.",
    },
    {
      id: "opus-always-cheapest",
      text: "The largest family is always the cheapest per token.",
      explanation:
        "Sai: model mạnh hơn thường có giá cao hơn; không thể mặc định là rẻ nhất.",
    },
    {
      id: "name-forever",
      text: "A model's family name guarantees its quality for every future task.",
      explanation:
        "Sai: hiệu quả phụ thuộc task, prompt, dữ liệu và phiên bản model; tên dòng không phải bằng chứng về chất lượng.",
    },
  ],
  correctChoiceIds: ["tradeoffs", "check-current", "benchmark"],
  correctExplanation:
    "Model family là một trade-off, không phải bảng xếp hạng cố định. Các dòng khác nhau về năng lực, tốc độ và chi phí; tên, giá và giới hạn thay đổi theo thời gian. Vì vậy hãy kiểm tra tài liệu chính thức và benchmark trên prompt thật, gồm cả edge case, trước khi chuẩn hóa.",
  sourceIds: [
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ],
});

const complexAnalysisModel: Question = questionSchema.parse({
  id: "model-task-fit-complex",
  type: "single-choice",
  stem: "A finance team needs a multi-step analysis of long contracts where errors are costly. Which model-selection approach is best?",
  choices: [
    {
      id: "capability-first",
      text: "Start with a capability-first model, evaluate it on representative contracts, then optimize cost and effort if quality allows.",
      explanation:
        "Đúng: task phức tạp, hậu quả lớn phù hợp với capability-first; sau khi đạt chuẩn chất lượng mới tối ưu chi phí và effort.",
    },
    {
      id: "cheapest-no-eval",
      text: "Choose the cheapest model immediately and skip evaluation to save budget.",
      explanation:
        "Sai: tiết kiệm trước khi kiểm tra chất lượng có thể dẫn đến lỗi tốn kém hơn nhiều, đặc biệt với hợp đồng và phân tích tài chính.",
    },
    {
      id: "largest-no-eval",
      text: "Choose the largest model and never measure whether it meets the task's requirements.",
      explanation:
        "Sai: model mạnh nhất vẫn cần eval trên task thật; không có phép đo thì không biết chất lượng hay chi phí có hợp lý.",
    },
    {
      id: "marketing",
      text: "Choose based on a vendor marketing claim rather than the team's own test set.",
      explanation:
        "Sai: tuyên bố marketing không thay thế benchmark trên prompt, dữ liệu và edge case của chính team.",
    },
  ],
  correctChoiceIds: ["capability-first"],
  correctExplanation:
    "Khi lỗi gây hậu quả lớn và task cần suy luận nhiều bước, nên bắt đầu từ model đủ năng lực, đánh giá trên hợp đồng đại diện, rồi mới tối ưu chi phí hoặc effort nếu chất lượng vẫn đạt. Đây là hướng capability-first được Anthropic mô tả, kết hợp với eval trước khi chuẩn hóa.",
  sourceIds: [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ],
});

const modelSelectionPractices: Question = questionSchema.parse({
  id: "model-task-fit-practices",
  type: "multiple-response",
  stem: "Which three are sound model-selection practices? Select three.",
  choices: [
    {
      id: "criteria",
      text: "Define criteria for capability, speed, cost, and acceptable quality before comparing models.",
      explanation:
        "Đúng: tiêu chí rõ giúp so sánh có căn cứ và tránh chọn theo cảm giác.",
    },
    {
      id: "real-benchmarks",
      text: "Benchmark candidates on real prompts, including edge cases and failure modes.",
      explanation:
        "Đúng: dữ liệu thật và edge case cho thấy model có đáp ứng đúng môi trường sử dụng hay không.",
    },
    {
      id: "quality-cost",
      text: "Compare output quality and total cost before committing to a model.",
      explanation:
        "Đúng: quyết định cần cân bằng chất lượng với chi phí, không tối ưu một phía.",
    },
    {
      id: "always-newest",
      text: "Always select the newest model without running a local evaluation.",
      explanation:
        "Sai: mới không đồng nghĩa phù hợp; vẫn cần eval trên task và dữ liệu của team.",
    },
    {
      id: "cost-before-quality",
      text: "Optimize for the lowest cost first and only check quality if users complain.",
      explanation:
        "Sai: hạ chi phí trước khi kiểm tra chất lượng có thể che giấu lỗi và gây chi phí sửa chữa lớn hơn.",
    },
    {
      id: "ignore-edge",
      text: "Exclude edge cases from the benchmark so the results look consistent.",
      explanation:
        "Sai: bỏ edge case làm benchmark không phản ánh rủi ro thật và dễ chọn sai model.",
    },
  ],
  correctChoiceIds: ["criteria", "real-benchmarks", "quality-cost"],
  correctExplanation:
    "Chọn model là một quyết định kỹ thuật có thể đo: đặt tiêu chí, benchmark trên prompt thật gồm edge case, rồi so sánh chất lượng với tổng chi phí. Không nên dựa vào độ mới, giá niêm yết hay tuyên bố chung khi chưa có eval nội bộ.",
  sourceIds: [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ],
});

export const promptingExpansionQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(iterateOnEvidence, "prompting-iterate", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(systematicIteration, "prompting-iterate", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(analysisTaskStrategy, "prompting-adapt-strategies", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
  reviewedEntry(taskTypeAdaptation, "prompting-adapt-strategies", [
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ]),
];

export const productSelectionExpansionQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(recurringReportFeature, "product-feature-selection", [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
    "anthropic-artifacts-doc",
  ]),
  reviewedEntry(featureFitChoices, "product-feature-selection", [
    "anthropic-research-help",
    "anthropic-artifacts-doc",
    "anthropic-projects-overview",
  ]),
  reviewedEntry(familySpeedCost, "model-family-selection", [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ]),
  reviewedEntry(familyTradeoffs, "model-family-selection", [
    "anthropic-models-overview",
    "anthropic-choosing-model",
  ]),
  reviewedEntry(complexAnalysisModel, "model-task-fit", [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ]),
  reviewedEntry(modelSelectionPractices, "model-task-fit", [
    "anthropic-choosing-model",
    "anthropic-models-overview",
  ]),
];
