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
      heading: "Prompt là một bản giao việc, không phải một câu thần chú",
      paragraphs: [
        "Anthropic khuyến nghị viết chỉ dẫn rõ ràng, cụ thể và có context. Một cách kiểm tra thực tế: đưa prompt cho một đồng nghiệp ít biết về task; nếu họ thấy mơ hồ thì Claude cũng sẽ thấy mơ hồ. Điều này đặc biệt đúng với công việc kinh doanh, nơi thuật ngữ nội bộ và tiêu chuẩn chất lượng thường không được nói ra (Anthropic, “Prompting best practices”).",
        "Prompt tốt không cần dài, nhưng cần đủ để trả lời: mục tiêu là gì, ai sẽ đọc, dữ liệu nào được dùng, ràng buộc nào không thể vi phạm, output trông như thế nào, và khi nào thì câu trả lời bị coi là chưa đạt.",
      ],
    },
    {
      kind: "list",
      heading: "Sáu thành phần của một prompt làm việc được",
      items: [
        "Goal: câu trả lời phải giúp người dùng làm gì, không chỉ “viết về chủ đề X”.",
        "Audience: ai đọc, họ đã biết gì, họ cần quyết định gì.",
        "Context: tài liệu, dữ liệu, ví dụ hoặc lịch sử liên quan; nói rõ nguồn nào được ưu tiên.",
        "Constraints: độ dài, ngôn ngữ, deadline, điều cấm, mức chắc chắn và cách xử lý thiếu dữ liệu.",
        "Format: prose, bảng, JSON, checklist hay tài liệu; cấu trúc và mức chi tiết.",
        "Success criteria: dấu hiệu nào cho thấy output đạt, và lỗi nào là nghiêm trọng.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Context và motivation giúp model chọn đúng hướng",
      paragraphs: [
        "Anthropic nhấn mạnh rằng thêm context hoặc lý do đằng sau chỉ dẫn giúp Claude hiểu mục tiêu và tạo câu trả lời đúng hơn. Ví dụ, “không dùng dấu ba chấm” là một quy tắc; “không dùng dấu ba chấm vì câu trả lời sẽ được đọc bằng text-to-speech” giúp model hiểu vì sao quy tắc quan trọng và có thể khái quát đúng.",
        "Đừng biến context thành một đống tài liệu không phân loại. Với tài liệu dài, hãy đặt dữ liệu dài ở đầu, đặt câu hỏi ở cuối, và dùng thẻ XML có tên nhất quán để phân biệt instruction, context, ví dụ và input. Cấu trúc rõ giúp model không nhầm phần nào là dữ liệu, phần nào là mệnh lệnh.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Ví dụ tốt không phải ví dụ duy nhất",
      body: "Anthropic xem ví dụ là một trong những cách đáng tin cậy nhất để định hướng format, tone và cấu trúc. Nhưng ví dụ phải relevant, diverse và có cấu trúc. Một ví dụ duy nhất có thể khiến model bắt chước cả những chi tiết không mong muốn; hãy dùng 3–5 ví dụ nếu cần và bao phủ edge case.",
    },
    {
      kind: "paragraphs",
      heading: "Chia nhỏ task phức tạp",
      paragraphs: [
        "Task lớn thường thất bại vì nhiều mục tiêu bị trộn vào một lần gọi: vừa thu thập dữ liệu, vừa phân tích, vừa viết, vừa kiểm tra. Task decomposition tách các mục tiêu đó thành bước có đầu ra rõ ràng, để mỗi bước có thể được kiểm tra trước khi bước sau dùng kết quả.",
        "Có hai kiểu chia nhỏ hữu ích. Kiểu thứ nhất là chia theo giai đoạn: trích xuất, chuẩn hóa, phân tích, tổng hợp, review. Kiểu thứ hai là chia theo thành phần: mỗi tài liệu, mỗi nhóm khách hàng hoặc mỗi giả định được xử lý riêng rồi hợp nhất. Điều quan trọng là artifact trung gian phải nhìn thấy được: bảng, danh sách, JSON hoặc ghi chú có nguồn.",
      ],
    },
    {
      kind: "list",
      heading: "Khi nào nên chia nhỏ",
      items: [
        "Yêu cầu có nhiều loại đầu ra hoặc nhiều tiêu chí chất lượng khác nhau.",
        "Dữ liệu đầu vào dài, nhiều tài liệu hoặc nhiều nguồn có thể mâu thuẫn.",
        "Có bước cần con người phê duyệt trước khi tiếp tục.",
        "Một lỗi ở bước đầu sẽ lan sang toàn bộ kết quả.",
        "Cần traceability: biết claim nào đến từ tài liệu nào.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Chia nhỏ không phải chia vụn",
      body: "Quá nhiều bước nhỏ làm tăng chi phí, mất context và tạo thêm chỗ sai. Hãy chia theo mục tiêu kiểm tra được, không chia theo số câu. Nếu hai bước luôn được thực hiện cùng nhau và không có điểm quyết định ở giữa, có thể gộp lại.",
    },
    {
      kind: "paragraphs",
      heading: "Iteration: thay đổi có bằng chứng",
      paragraphs: [
        "Một prompt hiếm khi đúng ngay ở lần đầu. Iteration tốt bắt đầu bằng việc so output với tiêu chí thành công, xác định lỗi thuộc loại nào, rồi thay đổi đúng yếu tố. Nếu output thiếu thông tin, có thể thiếu context hoặc thiếu yêu cầu; nếu output sai format, có thể thiếu ví dụ hoặc ràng buộc; nếu output bỏ sót edge case, có thể cần decomposition hoặc test case tốt hơn.",
        "Anthropic khuyến nghị tiêu chí thành công cụ thể, đo được, khả thi và liên quan; evaluation nên có test case phản ánh phân bố thực tế và edge case. Đây cũng là nền tảng cho iteration: giữ baseline, chạy trên cùng bộ case, thay đổi một biến có ý nghĩa, và ghi lại loại lỗi. Đừng đánh giá bằng độ trôi chảy hoặc độ tự tin.",
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
      heading: "Chọn chiến lược theo loại task",
      paragraphs: [
        "Cùng một kỹ thuật không phù hợp cho mọi task. Phân tích cần tiêu chí so sánh, bằng chứng và traceability. Research cần nguồn hiện hành, citation và phân biệt điều đã xác minh với giả định. Drafting cần audience, tone, ví dụ và ràng buộc về độ dài. Brainstorming cần độ đa dạng và một giai đoạn tách biệt để chọn lọc sau, thay vì yêu cầu ngay một đáp án an toàn.",
        "Với phân tích nhiều tài liệu, hãy yêu cầu trích xuất theme kèm quote và ID nguồn trước khi tổng hợp. Với research, hãy định nghĩa câu hỏi và tiêu chí nguồn trước, rồi yêu cầu citation và flag gap. Với drafting, hãy cung cấp audience và một đoạn mẫu. Với brainstorming, hãy yêu cầu nhiều hướng khác nhau và nói rõ tiêu chí đánh giá sẽ dùng ở bước sau.",
      ],
    },
    {
      kind: "list",
      heading: "Adapt nhanh theo task",
      items: [
        "Analysis: nêu tiêu chí, yêu cầu bằng chứng, tách fact khỏi diễn giải.",
        "Research: nêu câu hỏi, tiêu chí nguồn, yêu cầu citation và xử lý mâu thuẫn.",
        "Drafting: nêu audience, tone, độ dài, ví dụ và điều không được thay đổi.",
        "Brainstorming: yêu cầu nhiều lựa chọn đa dạng, hoãn đánh giá, sau đó mới lọc.",
        "Extraction: yêu cầu schema rõ, giá trị thiếu, và cách xử lý ngoại lệ.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Đừng sửa mọi thứ cùng lúc",
      body: "Nếu vừa đổi model, vừa đổi prompt, vừa đổi format và vừa đổi test case, bạn không biết yếu tố nào tạo ra kết quả. Hãy giữ baseline và thay đổi từng biến quan trọng để học được điều gì thực sự hiệu quả.",
    },
  ],
  keyTerms: [
    {
      en: "Prompt",
      vi: "Câu lệnh giao việc",
      note: "Tập chỉ dẫn và context đưa cho model để tạo ra output mong muốn.",
    },
    {
      en: "Context",
      vi: "Ngữ cảnh",
      note: "Tài liệu, dữ liệu, ví dụ và thông tin nền giúp model hiểu task.",
    },
    {
      en: "Constraint",
      vi: "Ràng buộc",
      note: "Giới hạn về nội dung, độ dài, nguồn, format hoặc điều không được làm.",
    },
    {
      en: "Task decomposition",
      vi: "Chia nhỏ tác vụ",
      note: "Tách yêu cầu phức tạp thành bước có đầu ra và điểm kiểm tra rõ ràng.",
    },
    {
      en: "Success criteria",
      vi: "Tiêu chí thành công",
      note: "Mô tả cụ thể, đo được về việc output đạt yêu cầu hay chưa.",
    },
    {
      en: "Baseline",
      vi: "Mốc so sánh",
      note: "Phiên bản prompt và kết quả hiện tại dùng để đo tác động của thay đổi.",
    },
    {
      en: "Few-shot examples",
      vi: "Ví dụ mẫu",
      note: "Một vài ví dụ relevant, diverse và có cấu trúc để định hướng format và tone.",
    },
    {
      en: "Edge case",
      vi: "Trường hợp biên",
      note: "Tình huống hiếm hoặc khó thường bị bỏ sót nếu chỉ test ví dụ đẹp.",
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
    "prompting-analysis-task-strategy",
    "prompting-adapt-task-types",
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
