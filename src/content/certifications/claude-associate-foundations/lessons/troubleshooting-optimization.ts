import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all three verified Domain 7 objectives.
 * It teaches a measured diagnose-adjust-optimize loop: reproduce, classify,
 * change one variable, rerun the full suite, and optimize only after a baseline
 * exists. Examples are original workplace scenarios.
 */
export const troubleshootingOptimizationLesson: Lesson = lessonSchema.parse({
  id: "troubleshooting-optimization",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 8,
  kind: "curriculum",
  contentStatus: "published",
  title: "Chẩn đoán và tối ưu: từ output kém đến vòng cải tiến có đo lường",
  englishTitle: "Diagnose and optimize: from weak output to a measured improvement loop",
  summary:
    "Học cách chẩn đoán output kém bằng baseline và phân loại lỗi, điều chỉnh prompt/context/task structure dựa trên bằng chứng, kiểm tra regression, và tối ưu workflow về chất lượng, độ trễ và chi phí mà không đánh đổi âm thầm. Bài nhấn mạnh thay đổi một biến mỗi lần và chạy lại toàn bộ bộ test.",
  level: "intermediate",
  estimatedMinutes: 22,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Nội dung kỹ thuật được đối chiếu với tài liệu Anthropic về evaluation criteria, prompting best practices, reduce hallucinations, context windows, models overview, choosing a model và building effective agents (truy cập 27/10/2026). Ba objective lấy từ Exam Guide v1.0. Các tình huống là ví dụ gốc, không phải câu hỏi chính thức của kỳ thi.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-evaluation-docs",
      "anthropic-prompting-best-practices",
      "anthropic-reduce-hallucinations-doc",
      "anthropic-context-windows-doc",
      "anthropic-models-overview",
      "anthropic-choosing-model",
      "anthropic-building-effective-agents",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "troubleshoot-diagnose",
      "troubleshoot-adjust",
      "optimize-workflows",
    ],
    note: "Bài học được viết cho cả ba objective đã xác minh của Domain 7 trong Exam Guide v1.0. Mapping xác nhận phạm vi bài học, không phải tuyên bố rằng mọi failure mode hoặc mọi kỹ thuật tối ưu đã được bao phủ.",
  },
  objectives: [
    "Chẩn đoán output kém bằng cách tái hiện, so sánh với tiêu chí và phân loại lỗi.",
    "Điều chỉnh prompt, context hoặc cấu trúc task dựa trên bằng chứng và kiểm tra regression.",
    "Tối ưu workflow về chất lượng, độ trễ và chi phí sau khi đã có baseline và tiêu chí chấp nhận.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Chất lượng đầu ra kém chỉ là triệu chứng, không phải nguyên nhân gốc rễ",
      paragraphs: [
        "Khi một phản hồi từ Claude không đạt kỳ vọng, phản xạ thường thấy của người mới là lập tức đổi sang model lớn hơn, tùy tiện tăng temperature hoặc viết prompt dài dòng hơn. Cách xử lý mang tính chắp vá đó đôi khi chỉ che đậy triệu chứng bề mặt mà không giải quyết được gốc rễ vấn đề, thậm chí làm hỏng cả những test case vốn đang chạy tốt. Một quy trình chẩn đoán chuẩn mực bắt đầu bằng việc tái hiện lỗi trên cùng tập dữ liệu đầu vào (input), đối chiếu với tiêu chí đánh giá (rubric / success criteria), rồi xác định chính xác điểm nghẽn nằm ở chỉ dẫn prompt, ngữ cảnh (context), kiến trúc tác vụ (task structure) hay giới hạn của model.",
        "Anthropic khuyến nghị định nghĩa tiêu chí thành công cụ thể, có thể đo lường và xây dựng hệ thống đánh giá (evaluations) dựa trên bộ test case phản ánh phân bố dữ liệu thực tế, bao gồm cả các edge cases (Anthropic, “Define success criteria and build evaluations”). Nếu thiếu tiêu chí rõ ràng và dữ liệu baseline chuẩn, mọi đánh giá chỉ mang tính cảm tính.",
      ],
    },
    {
      kind: "list",
      heading: "Mô hình tam giác chẩn đoán sự cố (Diagnostic Framework)",
      items: [
        "Prompt Instruction: Chỉ dẫn đã nêu rõ mục tiêu, đối tượng tiếp nhận, định dạng output, ràng buộc kỹ thuật và tiêu chí nghiệm thu chưa?",
        "Context & Retrieval: Dữ liệu nguồn, ví dụ mẫu (few-shot), kết quả gọi tool hoặc lịch sử hội thoại có bị thiếu, lỗi thời, xung đột hay quá dài không?",
        "Task Structure: Prompt có đang gộp quá nhiều bước xử lý phức tạp vào một lượt gọi duy nhất khiến model bị quá tải nhận thức không?",
        "Model Selection & Reasoning Effort: Chỉ cân nhắc chuyển đổi model sau khi 3 yếu tố trên đã tối ưu hóa, vì model lớn hơn không thể giải quyết được một yêu cầu mơ hồ.",
        "Evaluation Signal: Test case nào đang thất bại, dạng lỗi cụ thể là gì, và tiêu chí chất lượng nào đang bị vi phạm?",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Quy trình tái hiện lỗi và thiết lập dữ liệu đối chuẩn (Baseline)",
      paragraphs: [
        "Một kết quả thất bại đơn lẻ chưa đủ cơ sở để kết luận lỗi hệ thống. Kỹ sư cần chạy lại cùng prompt và input nhiều lần để kiểm tra tính ổn định của lỗi. Tiếp theo, chạy đánh giá trên một bộ case đại diện: case thông thường, case phức tạp, case thiếu dữ liệu và case có trường hợp biên (edge case). Nếu lỗi xuất hiện nhất quán trên toàn bộ tập dữ liệu, đó là tín hiệu lỗi hệ thống bắt nguồn từ instruction hoặc context. Nếu lỗi chỉ xuất hiện ngẫu nhiên ở một vài input hiếm gặp, đó là trường hợp biên cần bổ sung quy tắc hoặc ví dụ mẫu few-shot.",
        "Luôn ghi lại bộ chỉ số đối chuẩn (baseline metrics) trước khi thay đổi bất kỳ yếu tố nào: tỷ lệ chính xác từng trường, độ trễ phản hồi (latency), chi phí token và danh mục lỗi đã biết. Dữ liệu baseline là bằng chứng thực nghiệm duy nhất chứng minh thay đổi kỹ thuật của bạn thực sự tạo ra cải tiến hay gây ra hiện tượng hồi quy (regression).",
      ],
    },
    {
      kind: "list",
      heading: "Checklist chẩn đoán sự cố thực chiến",
      items: [
        "Rà soát prompt khách quan: Mục tiêu, role, format và các ví dụ minh họa đã đủ sáng rõ chưa?",
        "Kiểm tra context: Có tài liệu tham chiếu lỗi thời, ví dụ sai cấu trúc, quy tắc mâu thuẫn hoặc thông tin quan trọng bị chìm sâu trong context dài không?",
        "Kiểm tra kiến trúc tác vụ: Có nên tách quy trình thành các bước độc lập (Pipeline: Trích xuất → Kiểm thử → Tổng hợp) không?",
        "Đối chiếu output với tiêu chí thành công và tài liệu nguồn; khoanh vùng chính xác phân đoạn nội dung bị sai.",
        "Phân loại lỗi chính xác: Thiếu dữ liệu, hiểu sai yêu cầu, ảo giác (hallucination), sai định dạng, hay chạm giới hạn suy luận của model.",
        "Chỉ thử nghiệm model khác sau khi prompt và context đã chuẩn hóa, đồng thời giữ nguyên các biến số còn lại để so sánh công bằng.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Tránh phản xạ thay đổi model ngay từ bước đầu",
      body: "Một model lớn hơn có thể che đậy lỗi tạm thời trong buổi demo nhưng hoàn toàn không khắc phục được một prompt thiếu tiêu chí đánh giá, context lỗi thời hay quy trình bị dồn nén quá nhiều bước. Đổi model làm tăng đột biến chi phí và độ trễ mà không mang lại sự ổn định lâu dài. Hãy hoàn thiện chỉ dẫn và ngữ cảnh trước, sau đó mới dùng việc chọn model như một biến số được kiểm thử có phương pháp.",
    },
    {
      kind: "paragraphs",
      heading: "Điều chỉnh dựa trên feedback, không dựa trên may mắn",
      paragraphs: [
        "Một vòng điều chỉnh tốt thay đổi một biến, chạy lại toàn bộ bộ test, so sánh từng case và ghi lại kết quả. Nếu thêm một ví dụ giúp case A nhưng làm case B sai, bạn cần biết ngay. Đừng chỉ nhìn điểm trung bình; điểm trung bình có thể tăng trong khi một case quan trọng bị regression.",
        "Anthropic mô tả prompt chaining và các bước trung gian có thể kiểm tra, cùng evaluator-optimizer với tiêu chí đánh giá rõ (Anthropic, “Building effective agents”; “Prompting best practices”). Trong thực tế, điều này có nghĩa là: tách bước khó thành bước nhỏ, kiểm tra output trung gian, và chỉ chuyển sang bước tiếp khi bước trước đạt yêu cầu.",
      ],
    },
    {
      kind: "list",
      heading: "Vòng lặp điều chỉnh",
      items: [
        "Phân loại failure: yêu cầu thiếu, context sai, cấu trúc task sai, hay năng lực model chưa đủ.",
        "Chọn một thay đổi nhỏ nhất có thể kiểm chứng, ví dụ thêm định nghĩa trường hoặc một ví dụ chuẩn.",
        "Chạy lại toàn bộ bộ test, không chỉ case vừa sửa; so sánh per-case với baseline.",
        "Nếu có regression, xem case nào bị ảnh hưởng và quyết định tinh chỉnh, tách quy tắc, hoặc revert.",
        "Chỉ mở rộng khi chất lượng ổn định trên tập đại diện và các case quan trọng đều đạt.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Tối ưu workflow: đo trước, tối ưu sau",
      paragraphs: [
        "Tối ưu không chỉ là giảm chi phí token. Ba chiều thường phải cân bằng là chất lượng, độ trễ và chi phí. Hãy đo cả ba trước khi thay đổi, rồi xác định nút thắt thật: context quá dài, nhiều lần gọi lặp lại, model quá mạnh cho bước đơn giản, output dài không cần thiết, hay bước review thủ công chiếm nhiều thời gian.",
        "Anthropic mô tả các lựa chọn như model nhỏ hơn cho tác vụ đơn giản, prompt caching cho phần prefix lặp lại, batch processing cho tác vụ không cần phản hồi tức thì, và điều chỉnh effort (Anthropic, “Models overview”; “Choosing a model”). Các lựa chọn này chỉ có ý nghĩa khi chất lượng vẫn đạt tiêu chí. Đừng cắt chi phí bằng cách bỏ human review ở bước có hậu quả lớn.",
      ],
    },
    {
      kind: "list",
      heading: "Các đòn bẩy tối ưu",
      items: [
        "Giảm context không cần thiết: bỏ draft cũ, tool result lỗi thời và tài liệu không liên quan; giữ quyết định và ràng buộc.",
        "Tách hoặc gộp bước: tách bước khó để kiểm tra, gộp bước đơn giản để giảm số lần gọi.",
        "Chọn model theo bước: model nhỏ hơn cho phân loại hoặc trích xuất đơn giản, model đủ năng lực cho tổng hợp khó.",
        "Dùng caching hoặc batch khi phù hợp với workload, sau khi kiểm tra tác động đến chất lượng và độ trễ.",
        "Giảm output dư thừa bằng format rõ và giới hạn độ dài cần thiết.",
        "Đo lại sau mỗi thay đổi; tối ưu là vòng lặp, không phải một lần bấm nút.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Tối ưu không phải cắt chất lượng",
      body: "Nếu một thay đổi giảm chi phí nhưng làm tăng lỗi ở case quan trọng, đó không phải tối ưu mà là đánh đổi chưa được chấp nhận. Hãy ghi rõ trade-off, ngưỡng chất lượng tối thiểu và người phê duyệt trước khi hạ model hoặc bỏ bước kiểm tra.",
    },
    {
      kind: "diagram",
      heading: "Công cụ trực quan: So sánh Chi phí Mô hình & Tiết kiệm từ Prompt Caching",
      diagramId: "prompt-caching-cost-calculator",
      intro: "Trực quan hóa sự đánh đổi giữa Model Right-Sizing (Haiku vs. Sonnet vs. Opus) và cơ chế giảm tới 90% chi phí đọc token của Prompt Caching theo độ dài tài liệu và số lượt truy vấn.",
    },
    {
      kind: "paragraphs",
      heading: "Khi nào dừng",
      paragraphs: [
        "Dừng khi chất lượng đạt ngưỡng đã định trên tập đại diện, các case quan trọng không còn regression, và chi phí/độ trễ nằm trong giới hạn chấp nhận. Đừng tiếp tục tối ưu chỉ vì còn có thể; lợi ích biên giảm dần và mỗi thay đổi thêm rủi ro vận hành.",
        "Ghi lại phiên bản prompt, model, dữ liệu test, kết quả và quyết định. Tài liệu này giúp lần sau tái hiện, so sánh và tránh lặp lại lỗi cũ. Nó cũng là bằng chứng để giải thích với stakeholder rằng thay đổi dựa trên đo lường, không dựa trên cảm giác.",
      ],
    },
  ],
  keyTerms: [
    {
      en: "Diagnostic baseline",
      vi: "Diagnostic baseline (mốc đối chuẩn chẩn đoán)",
      note: "Kết quả đo lường hiện tại trên cùng một bộ test case chuẩn trước khi tiến hành bất kỳ chỉnh sửa nào.",
    },
    {
      en: "Failure classification",
      vi: "Failure classification (phân loại căn nguyên lỗi)",
      note: "Phương pháp xác định nguyên nhân cốt lõi: lỗi do chỉ dẫn chưa rõ, thiếu context, cấu trúc task sai hay vượt quá năng lực model.",
    },
    {
      en: "Regression",
      vi: "Regression (lỗi thoái lui / suy giảm chất lượng)",
      note: "Hiện tượng một điều chỉnh mới giúp cải thiện một test case nhưng vô tình làm sai lệch hoặc hỏng các test case vốn đã chạy tốt trước đó.",
    },
    {
      en: "Latency",
      vi: "Latency (độ trễ phản hồi)",
      note: "Khoảng thời gian từ lúc gửi yêu cầu đến khi nhận được kết quả hoàn chỉnh có thể đưa vào sử dụng.",
    },
    {
      en: "Cost per successful outcome",
      vi: "Cost per successful outcome (chi phí trên mỗi kết quả đạt chuẩn)",
      note: "Chỉ số kinh tế thực tế đo lường tổng chi phí token và tài nguyên để tạo ra một kết quả đúng, thay vì chỉ so sánh giá token thô.",
    },
    {
      en: "Right-sizing",
      vi: "Right-sizing (chọn đúng cấp năng lực model)",
      note: "Chiến lược sử dụng đúng model và cấu hình tham số vừa đủ cho yêu cầu nhiệm vụ, tránh lãng phí model quá lớn cho tác vụ đơn giản.",
    },
    {
      en: "Prompt caching",
      vi: "Prompt caching (bộ nhớ đệm prompt)",
      note: "Cơ chế lưu trữ tạm thời phần prefix prompt hoặc tài liệu cố định lặp lại để giảm đáng kể chi phí và thời gian sinh token.",
    },
    {
      en: "Batch processing",
      vi: "Batch processing (xử lý hàng loạt theo mẻ)",
      note: "Phương thức gửi đồng loạt nhiều yêu cầu không yêu cầu phản hồi tức thì để nhận mức chiết khấu chi phí lớn hơn từ Anthropic API.",
    },
  ],
  scenario: {
    title: "Tình huống: báo cáo tuần thiếu trường bắt buộc",
    setup:
      "Một nhóm vận hành dùng Claude để tạo báo cáo tuần từ dữ liệu ticket. Báo cáo thường đúng format nhưng khoảng 30% lần bỏ sót trường “owner” và thỉnh thoảng trích dẫn một ticket không tồn tại. Nhóm đề xuất đổi sang model mạnh nhất và tăng temperature để “linh hoạt hơn”.",
    steps: [
      "Tái hiện lỗi trên 20 ticket đại diện; ghi lại trường nào thiếu, ticket nào bị bịa và tỷ lệ xuất hiện.",
      "Kiểm tra prompt: trường “owner” có định nghĩa, ví dụ và quy tắc khi thiếu dữ liệu không?",
      "Kiểm tra context: có ticket cũ hoặc ví dụ sai format đang được đưa vào không?",
      "Phân loại lỗi: thiếu định nghĩa trường là lỗi instruction; ticket bịa là lỗi grounding/citation.",
      "Sửa một biến: thêm định nghĩa và ví dụ cho trường “owner”, yêu cầu trả “unknown” khi thiếu, và yêu cầu citation cho từng ticket.",
      "Chạy lại toàn bộ 20 case, so sánh per-case với baseline; kiểm tra xem case khác có bị regression không.",
      "Nếu chất lượng đã đạt, thử tối ưu chi phí bằng model nhỏ hơn cho bước trích xuất và giữ model đủ năng lực cho tổng hợp.",
      "Ghi lại kết quả, trade-off và ngưỡng dừng; chỉ mở rộng khi các case quan trọng đều ổn định.",
    ],
    takeaway:
      "Đổi model và temperature không sửa được yêu cầu thiếu hoặc context sai. Một vòng chẩn đoán có baseline, phân loại lỗi và kiểm tra regression thường tìm ra nguyên nhân nhanh hơn và rẻ hơn.",
  },
  questions: [
    {
      id: "troubleshooting-lesson-diagnose-first",
      type: "single-choice",
      stem: "A support prompt works for common tickets but fails on refund exceptions. The team wants to switch to a larger model. What is the best next step?",
      choices: [
        {
          id: "inspect-requirements-and-context",
          text: "Check whether the prompt and context define the exception policy, include representative examples, and reproduce the failure before testing model changes.",
          explanation:
            "Đúng: lỗi tập trung ở exception policy cho thấy cần kiểm tra yêu cầu và context trước; tái hiện giúp biết lỗi có hệ thống hay không.",
        },
        {
          id: "switch-model-immediately",
          text: "Switch to the larger model immediately and keep the same prompt.",
          explanation:
            "Sai: đổi model không sửa được quy tắc ngoại lệ bị thiếu; còn làm mất khả năng xác định nguyên nhân.",
        },
        {
          id: "raise-temperature",
          text: "Raise the temperature so the model explores more possible answers.",
          explanation:
            "Sai: tăng temperature làm output kém ổn định hơn, không bổ sung kiến thức về chính sách hoàn tiền.",
        },
        {
          id: "remove-exception-cases",
          text: "Remove the failing exception cases from the test set.",
          explanation:
            "Sai: loại bỏ case khó làm điểm trung bình đẹp hơn nhưng che mất lỗi thật và tăng rủi ro vận hành.",
        },
      ],
      correctChoiceIds: ["inspect-requirements-and-context"],
      correctExplanation:
        "Khi lỗi tập trung ở một loại ngoại lệ, hãy kiểm tra xem prompt có định nghĩa chính sách, ví dụ và quy tắc xử lý không, rồi tái hiện trên case đại diện. Chỉ sau khi yêu cầu và context rõ mới nên thử model hoặc effort khác. Đổi model trước có thể che triệu chứng nhưng không sửa nguyên nhân và làm tăng chi phí.",
      sourceIds: [
        "anthropic-prompting-best-practices",
        "anthropic-evaluation-docs",
        "anthropic-reduce-hallucinations-doc",
      ],
    },
  ],
  relatedQuestionIds: [
    "troubleshoot-diagnose-prompt",
    "troubleshoot-feedback-loop",
    "optimize-workflow-baseline",
    "optimize-workflow-practices",
    "optimize-workflow-cost-latency-controls",
    "troubleshoot-diagnose-evidence",
    "troubleshoot-adjust-regression",
    "troubleshoot-regression-prompt-pinning",
  ],
  takeaways: [
    "Chẩn đoán bắt đầu bằng tái hiện, tiêu chí thành công và baseline, không bằng đổi model.",
    "Phân loại lỗi thuộc instruction, context, task structure hay năng lực model trước khi sửa.",
    "Điều chỉnh một biến mỗi lần và chạy lại toàn bộ bộ test để phát hiện regression.",
    "Điểm trung bình có thể che case quan trọng bị hỏng; hãy so sánh per-case.",
    "Tối ưu chất lượng, độ trễ và chi phí sau khi có baseline; không đánh đổi âm thầm.",
    "Ghi lại phiên bản, kết quả và trade-off để tái hiện và giải trình.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-reduce-hallucinations-doc",
    "anthropic-context-windows-doc",
    "anthropic-models-overview",
    "anthropic-choosing-model",
    "anthropic-building-effective-agents",
  ],
});
