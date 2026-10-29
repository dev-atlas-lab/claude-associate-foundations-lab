import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all four verified Domain 1 objectives.
 * It uses Anthropic's published prompting guidance and the evaluation guidance
 * for success criteria. Examples are original workplace scenarios; no official
 * exam item is reproduced.
 */
export const promptStructureLesson: Lesson = lessonSchema.parse({
  id: "prompt-structure",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 4,
  kind: "curriculum",
  contentStatus: "published",
  title: "Cấu trúc prompt: mục tiêu, context, ràng buộc và vòng lặp cải tiến",
  englishTitle: "Prompt structure: goal, context, constraints, and iteration",
  summary:
    "Học cách viết prompt rõ mục tiêu, đủ context và có tiêu chí thành công; chia nhỏ yêu cầu phức tạp; rồi cải tiến có bằng chứng thay vì thử ngẫu nhiên. Bài cũng chỉ cách chọn chiến lược theo loại task: phân tích, research, drafting và brainstorming.",
  level: "foundation",
  estimatedMinutes: 18,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Nội dung kỹ thuật được đối chiếu với tài liệu Anthropic về prompting best practices và evaluation criteria (truy cập 27/10/2026). Bốn objective lấy từ Exam Guide v1.0. Các ví dụ là tình huống gốc, không phải câu hỏi chính thức của kỳ thi.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-prompting-best-practices",
      "anthropic-evaluation-docs",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "prompting-create-effective-prompts",
      "prompting-task-decomposition",
      "prompting-iterate",
      "prompting-adapt-strategies",
    ],
    note: "Bài học được viết cho cả bốn objective đã xác minh của Domain 1 trong Exam Guide v1.0. Mapping xác nhận phạm vi bài học, không phải tuyên bố rằng Domain 1 đã được bao phủ đầy đủ như một kỳ thi thu nhỏ.",
  },
  objectives: [
    "Viết prompt nêu rõ mục tiêu, audience, nguồn, ràng buộc và format.",
    "Chia nhỏ yêu cầu phức tạp thành bước và artifact trung gian có thể kiểm tra.",
    "Cải tiến prompt bằng tiêu chí, baseline và phân loại lỗi.",
    "Chọn chiến lược phù hợp cho phân tích, research, drafting và brainstorming.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Prompt là bản đặc tả giao việc (Task Specification), không phải câu thần chú",
      paragraphs: [
        "Anthropic khuyến nghị viết chỉ dẫn rõ ràng, cụ thể và có ngữ cảnh (context) đầy đủ. Một cách kiểm tra thực tế rất hiệu quả: thử đưa prompt cho một đồng nghiệp chưa nắm sâu về nghiệp vụ; nếu họ cảm thấy mơ hồ thì Claude chắc chắn cũng sẽ đưa ra kết quả không như ý. Điều này đặc biệt phổ biến trong môi trường doanh nghiệp, nơi các thuật ngữ viết tắt nội bộ và tiêu chuẩn chất lượng ngầm định thường bị bỏ quên không đưa vào prompt (Anthropic, “Prompting best practices”).",
        "Một prompt tốt không nhất thiết phải dài dòng, nhưng cần trả lời dứt khoát 6 câu hỏi: Mục tiêu cụ thể là gì? Ai là đối tượng tiếp nhận? Dữ liệu nguồn nào được phép sử dụng? Ràng buộc nào không được vi phạm? Định dạng đầu ra (format) chi tiết ra sao? Và tiêu chuẩn nào xác định câu trả lời chưa đạt?",
      ],
    },
    {
      kind: "list",
      heading: "Sáu thành phần cốt lõi của một prompt hiệu quả",
      items: [
        "Goal: Kết quả cụ thể người dùng cần giải quyết (tránh chỉ nói chung chung “viết về chủ đề X”).",
        "Audience: Đối tượng tiếp nhận là ai, trình độ chuyên môn, và họ cần thông tin để đưa ra quyết định gì.",
        "Context: Dữ liệu nghiệp vụ, tài liệu nguồn, lịch sử liên quan; nêu rõ nguồn nào được ưu tiên khi có mâu thuẫn.",
        "Constraints: Giới hạn độ dài, ngôn ngữ phản hồi, deadline, điều cấm, mức độ chắc chắn và cách ứng xử khi thiếu dữ liệu.",
        "Format: Văn xuôi, bảng biểu, JSON, checklist hay artifact kỹ thuật; cấu trúc thẻ và mức độ chi tiết.",
        "Success criteria: Tiêu chuẩn nghiệm thu đầu ra và phân loại các lỗi nghiêm trọng không chấp nhận được.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Cung cấp Context và động lực (Motivation) giúp model định hướng chính xác",
      paragraphs: [
        "Anthropic nhấn mạnh rằng việc bổ sung ngữ cảnh hoặc lý do đằng sau mỗi chỉ dẫn sẽ giúp Claude hiểu sâu sắc mục tiêu tác vụ và tự khái quát hóa chính xác hơn. Ví dụ, “không dùng dấu ba chấm” chỉ là một quy tắc bề mặt; nhưng “không dùng dấu ba chấm vì đầu ra sẽ được đọc tự động qua hệ thống Text-to-Speech (TTS)” sẽ giúp model hiểu vì sao quy tắc đó quan trọng và tự động xử lý tốt cả những ký tự đặc biệt tương tự.",
        "Tránh dồn ép context thành một khối văn bản hỗn độn. Với tài liệu dài, nguyên tắc vàng của Anthropic là: đặt dữ liệu tham chiếu ở phần đầu prompt, câu hỏi/yêu cầu thực thi ở cuối cùng, và bọc các phần nội dung trong các thẻ XML có tên nhất quán (`<context>`, `<guidelines>`, `<data>`). Cấu trúc phân tầng rõ ràng giúp model phân biệt rành mạch phần nào là dữ liệu tham chiếu và phần nào là chỉ thị thực thi.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Few-shot Examples: Đa dạng và có cấu trúc thay vì ví dụ đơn lẻ",
      body: "Anthropic đánh giá việc cung cấp ví dụ mẫu (Few-shot Prompting) là phương pháp tin cậy nhất để định hình chính xác định dạng, văn phong (tone) và cấu trúc tư duy. Tuy nhiên, các ví dụ phải thực sự liên quan, đa dạng và có cấu trúc chuẩn mực. Một ví dụ duy nhất có thể khiến model vô tình học vẹt cả những chi tiết ngẫu nhiên không mong muốn; hãy cung cấp từ 3–5 ví dụ đa dạng và bao phủ cả các trường hợp biên (edge cases).",
    },
    {
      kind: "diagram",
      heading: "Bàn thử nghiệm trực quan: Phân tầng cấu trúc Prompt chuẩn Anthropic",
      diagramId: "prompt-layering-workbench",
      intro: "Trực quan hóa và thử nghiệm bật/tắt 5 lớp cấu trúc prompt cốt lõi (System Role, XML Tags, Rubric, Few-shot, Prefill) để theo dõi sự thay đổi về độ rõ ràng và khả năng chống ảo giác.",
    },
    {
      kind: "paragraphs",
      heading: "Tách nhỏ tác vụ phức tạp (Task Decomposition)",
      paragraphs: [
        "Các prompt phức tạp thường thất bại vì nhồi nhét quá nhiều mục tiêu vào một lượt gọi duy nhất: vừa thu thập dữ liệu, vừa phân tích, vừa soạn thảo, vừa tự kiểm tra chất lượng. Phương pháp tách nhỏ tác vụ (Task Decomposition) chia quy trình thành các bước độc lập với đầu ra xác định, cho phép kiểm thử và xác thực từng bước trước khi chuyển dữ liệu sang bước tiếp theo.",
        "Có hai mô hình phân rã tác vụ phổ biến: Mô hình theo giai đoạn (Pipeline: Trích xuất → Chuẩn hóa → Phân tích → Tổng hợp → Rà soát) và Mô hình theo thành phần (Parallel/Map-Reduce: Xử lý độc lập từng tài liệu hoặc nhóm dữ liệu rồi gộp kết quả). Điều kiện tiên quyết là kết quả trung gian (intermediate artifacts) phải hiển thị rõ ràng và có thể kiểm chứng được: bảng dữ liệu, danh sách có ID, JSON có schema hoặc trích dẫn nguồn cụ thể.",
      ],
    },
    {
      kind: "list",
      heading: "Khi nào cần áp dụng Task Decomposition",
      items: [
        "Yêu cầu nghiệp vụ có nhiều định dạng đầu ra hoặc nhiều tiêu chí đánh giá mâu thuẫn nhau.",
        "Dữ liệu đầu vào dung lượng lớn, gồm nhiều tài liệu đa nguồn có khả năng xung đột thông tin.",
        "Có bước nghiệp vụ nhạy cảm bắt buộc chuyên viên con người phải phê duyệt trước khi tiếp tục.",
        "Sai số ở bước đầu tiên có nguy cơ dây chuyền làm sai lệch toàn bộ kết quả phía sau.",
        "Đòi hỏi tính truy xuất nguồn gốc (Traceability): xác định rõ từng kết luận hay con số bắt nguồn từ tài liệu cụ thể nào.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Chia nhỏ hợp lý, tránh chia vụn làm phân mảnh context",
      body: "Việc lạm dụng chia quá nhiều bước vụn vặt sẽ làm tăng độ trễ (latency), tiêu tốn chi phí token và dễ làm thất thoát ngữ cảnh giữa các lượt gọi API. Chỉ nên phân rã tại các điểm có tiêu chí kiểm thử rõ ràng hoặc cần quyết định rẽ nhánh. Nếu hai bước luôn song hành và không có checkpoint trung gian, hãy gộp chúng vào cùng một prompt.",
    },
    {
      kind: "paragraphs",
      heading: "Quy trình lặp cải tiến (Iteration) dựa trên dữ liệu thực nghiệm",
      paragraphs: [
        "Một prompt thực chiến hiếm khi hoàn hảo ngay từ bản thảo đầu tiên. Quy trình lặp (iteration) khoa học bắt đầu bằng việc đối chiếu output với bộ tiêu chí thành công (success criteria), phân loại lỗi cụ thể, rồi mới tiến hành điều chỉnh đúng thành phần gây lỗi. Nếu output thiếu dữ liệu, nguyên nhân có thể do context chưa đầy đủ; nếu output sai định dạng, cần bổ sung schema hoặc few-shot examples; nếu output bỏ sót trường hợp biên, cần mở rộng test case hoặc chia nhỏ bước xử lý.",
        "Anthropic khuyến nghị xây dựng tiêu chí đánh giá cụ thể, đo lường được và có tính khả thi; bộ dữ liệu đánh giá (evaluation set) cần phản ánh phân bố dữ liệu thực tế và các edge cases. Đó chính là nền tảng cho vòng lặp cải tiến: duy trì tập baseline chuẩn, chạy đánh giá trên cùng tập test case, chỉ thay đổi duy nhất một biến số kỹ thuật tại một thời điểm, và đo lường sự dịch chuyển của tỷ lệ lỗi thay vì đánh giá cảm tính.",
      ],
    },
    {
      kind: "list",
      heading: "Vòng lặp cải tiến prompt",
      items: [
        "Định nghĩa tiêu chí và chọn bộ case đại diện, gồm cả case khó.",
        "Lưu baseline và kết quả hiện tại để so sánh công bằng.",
        "Phân loại lỗi: thiếu mục tiêu, thiếu context, thiếu ví dụ, sai format hay thiếu bước.",
        "Sửa một thay đổi có ý nghĩa, chạy lại trên cùng bộ case.",
        "So sánh cải thiện và regression; giữ thay đổi nếu thực sự tốt hơn.",
        "Ghi lại quyết định và lý do để người khác có thể review.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Lựa chọn chiến lược kỹ thuật theo từng loại tác vụ",
      paragraphs: [
        "Không có một công thức prompt duy nhất nào tối ưu cho mọi tác vụ. Tác vụ Phân tích (Analysis) đòi hỏi tiêu chí so sánh chặt chẽ, bằng chứng cụ thể và tính truy xuất (traceability). Tác vụ Nghiên cứu (Research) yêu cầu nguồn cập nhật, trích dẫn chuẩn mực (citations) và phân tách rạch ròi giữa dữ kiện thực tế với giả định suy diễn. Tác vụ Soạn thảo (Drafting) cần xác định rõ đối tượng độc giả, giọng văn (tone), ví dụ mẫu và độ dài. Trong khi đó, tác vụ Động não (Brainstorming) lại cần khuyến khích sự đa dạng ý tưởng và tách rời giai đoạn sinh ý tưởng khỏi giai đoạn sàng lọc khắt khe.",
        "Với phân tích đa tài liệu, hãy yêu cầu Claude trích xuất các chủ đề (themes) kèm nguyên văn trích dẫn và ID nguồn trước khi tổng hợp kết luận. Với tác vụ research, hãy định nghĩa trước câu hỏi nghiên cứu và tiêu chí đánh giá nguồn, sau đó yêu cầu model dẫn nguồn cụ thể và chủ động đánh dấu các lỗ hổng thông tin (flag information gaps). Với drafting, hãy cung cấp văn bản mẫu kèm đối tượng tiếp nhận. Với brainstorming, hãy yêu cầu đề xuất nhiều hướng tiếp cận khác nhau và thông báo rõ tiêu chí thẩm định sẽ được áp dụng ở bước tiếp theo.",
      ],
    },
    {
      kind: "list",
      heading: "Đặc tả kỹ thuật nhanh theo từng nhóm tác vụ",
      items: [
        "Analysis: Thiết lập tiêu chí phân tích cụ thể, yêu cầu minh chứng dữ liệu, tách bạch sự thật (fact) khỏi diễn giải chủ quan.",
        "Research: Nêu rõ câu hỏi nghiên cứu, tiêu chí chọn lọc nguồn, bắt buộc trích dẫn nguồn (citation) và xử lý mâu thuẫn dữ liệu.",
        "Drafting: Định rõ đối tượng tiếp nhận, tone giọng, giới hạn độ dài, cung cấp few-shot examples và các nguyên tắc bảo toàn nội dung gốc.",
        "Brainstorming: Yêu cầu mở rộng các phương án đa chiều, hoãn đánh giá khắt khe trong bước sinh ý tưởng, sau đó mới lọc theo rubric.",
        "Extraction: Cung cấp JSON schema hoặc bảng cấu trúc rõ ràng, quy định cách gán giá trị khi thiếu dữ liệu và xử lý ngoại lệ.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Nguyên tắc cô lập biến số: Tránh thay đổi nhiều yếu tố cùng lúc",
      body: "Nếu bạn đồng thời thay đổi model, cấu trúc prompt, format đầu ra và bộ dữ liệu test case, bạn sẽ hoàn toàn mất khả năng nhận diện yếu tố nào tạo ra sự thay đổi. Hãy giữ vững baseline chuẩn và chỉ biến đổi một yếu tố kỹ thuật duy nhất trong mỗi lần chạy thử nghiệm để có kết luận chính xác.",
    },
  ],
  keyTerms: [
    {
      en: "Prompt",
      vi: "Prompt (câu lệnh / chỉ dẫn đầu vào)",
      note: "Tập hợp chỉ dẫn, bối cảnh và ràng buộc đưa cho model để sinh ra kết quả mong muốn.",
    },
    {
      en: "Context",
      vi: "Context (ngữ cảnh / tài liệu nền)",
      note: "Tài liệu, dữ liệu tham chiếu, ví dụ và thông tin nền tảng giúp model hiểu rõ bài toán.",
    },
    {
      en: "Constraint",
      vi: "Constraint (ràng buộc / giới hạn)",
      note: "Các giới hạn về độ dài, ngôn ngữ, nguồn thông tin, định dạng hoặc hành động bị cấm.",
    },
    {
      en: "Task decomposition",
      vi: "Task decomposition (chia nhỏ tác vụ)",
      note: "Kỹ thuật phân rã yêu cầu phức tạp thành các bước trung gian có đầu ra và điểm kiểm tra rõ ràng.",
    },
    {
      en: "Success criteria",
      vi: "Success criteria (tiêu chí thành công)",
      note: "Các tiêu chuẩn cụ thể, đo lường được để xác định kết quả đầu ra có đạt chất lượng hay không.",
    },
    {
      en: "Baseline",
      vi: "Baseline (mốc đối chuẩn)",
      note: "Phiên bản prompt và kết quả hiện tại dùng làm mốc so sánh trước khi thực hiện cải tiến.",
    },
    {
      en: "Few-shot examples",
      vi: "Few-shot examples (các ví dụ mẫu)",
      note: "Một vài ví dụ mẫu chuẩn chỉnh, đa dạng để định hướng phong cách, cấu trúc và định dạng cho model.",
    },
    {
      en: "Edge case",
      vi: "Edge case (trường hợp biên / ca đặc biệt)",
      note: "Những tình huống hiếm gặp hoặc đầu vào bất thường dễ bị bỏ sót nếu chỉ thử nghiệm các trường hợp lý tưởng.",
    },
  ],
  scenario: {
    title: "Tình huống: brief cạnh tranh cho ban lãnh đạo",
    setup:
      "Một nhóm chiến lược cần brief so sánh ba đối thủ từ 12 tài liệu, trong đó có báo cáo cũ và một bản cập nhật mới. Bản nháp đầu tiên rất dài, trích dẫn chung chung, bỏ sót một đối thủ và không nêu rõ giả định. Nhóm có hai ngày trước buổi họp.",
    steps: [
      "Viết lại mục tiêu: brief giúp ban lãnh đạo quyết định có nên thay đổi định vị sản phẩm hay không.",
      "Xác định audience, độ dài, format và tiêu chí thành công, gồm cả yêu cầu về citation.",
      "Chia nhỏ: trích xuất dữ kiện theo từng đối thủ trước, sau đó mới so sánh và tổng hợp.",
      "Yêu cầu mỗi dữ kiện có nguồn và ngày; đánh dấu tài liệu cũ hoặc mâu thuẫn.",
      "Chạy baseline, phân loại lỗi: thiếu đối thủ, citation yếu, giả định không rõ.",
      "Sửa từng yếu tố: bổ sung danh sách đối thủ, yêu cầu quote, thêm mục giả định và rủi ro.",
      "Chạy lại trên cùng bộ tài liệu và so sánh; kiểm tra edge case là đối thủ mới chỉ có một nguồn.",
      "Chọn format: bảng so sánh cho dữ kiện, prose ngắn cho khuyến nghị, phụ lục cho nguồn.",
    ],
    takeaway:
      "Prompt tốt là một bản giao việc có tiêu chí, context và điểm kiểm tra. Khi task phức tạp, chia nhỏ và iteration có bằng chứng giúp nhóm biết mình đang cải thiện điều gì, thay vì chỉ viết lại prompt và hy vọng output tốt hơn.",
  },
  questions: [
    {
      id: "prompt-structure-lesson-iteration",
      type: "single-choice",
      stem: "A team's prompt produces a competitor brief that is fluent but misses one competitor and cites sources only vaguely. What is the best next step?",
      choices: [
        {
          id: "diagnose-then-target",
          text: "Classify the failures as missing coverage and weak evidence, add a competitor checklist and a quote-first citation rule, then rerun on the same documents.",
          explanation:
            "Đúng: xác định đúng loại lỗi rồi sửa bằng checklist và yêu cầu quote, sau đó chạy lại trên cùng dữ liệu để so sánh.",
        },
        {
          id: "rewrite-random",
          text: "Rewrite the entire prompt from scratch without checking which requirement failed.",
          explanation:
            "Sai: viết lại ngẫu nhiên không cho biết thay đổi nào khắc phục lỗi và dễ làm mất các phần đang hoạt động tốt.",
        },
        {
          id: "longer-output",
          text: "Ask for a longer brief so the missing competitor and citations appear naturally.",
          explanation:
            "Sai: độ dài không bảo đảm bao phủ đủ đối thủ hay citation đúng; cần tiêu chí và ràng buộc rõ.",
        },
        {
          id: "change-model",
          text: "Switch to a different model before checking whether the prompt states the missing requirements.",
          explanation:
            "Sai: đổi model không sửa được yêu cầu còn thiếu; cần chẩn đoán prompt và context trước.",
        },
      ],
      correctChoiceIds: ["diagnose-then-target"],
      correctExplanation:
        "Hai lỗi có nguyên nhân khác nhau: thiếu đối thủ là thiếu coverage, citation mơ hồ là thiếu ràng buộc bằng chứng. Sửa bằng checklist đối thủ và quy tắc quote-first, rồi chạy lại trên cùng tài liệu, giúp kiểm tra thay đổi có thực sự khắc phục cả hai vấn đề.",
      sourceIds: [
        "anthropic-prompting-best-practices",
        "anthropic-evaluation-docs",
      ],
    },
  ],
  relatedQuestionIds: [
    "prompting-specific-brief",
    "prompting-effective-prompt-additions",
    "prompting-decompose-steps",
    "prompting-decomposition-decision",
    "prompting-iterate-evidence",
    "prompting-iterate-systematic",
    "prompting-iterate-rubric-calibration",
    "prompting-analysis-task-strategy",
    "prompting-adapt-task-types",
    "prompting-multilingual-nuance-control",
  ],
  takeaways: [
    "Prompt hiệu quả nêu goal, audience, context, constraints, format và success criteria.",
    "Thêm lý do và ví dụ giúp model hiểu đúng hướng, nhưng ví dụ phải đa dạng và có cấu trúc.",
    "Task phức tạp nên chia theo bước hoặc thành phần có artifact trung gian kiểm tra được.",
    "Iteration dựa trên baseline, tiêu chí và phân loại lỗi, không dựa vào độ trôi chảy.",
    "Chọn chiến lược theo task: phân tích cần tiêu chí, research cần nguồn, drafting cần audience, brainstorming cần đa dạng.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-prompting-best-practices",
    "anthropic-evaluation-docs",
  ],
});
