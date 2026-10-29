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
      heading: "Output kém là triệu chứng, không phải chẩn đoán",
      paragraphs: [
        "Khi một câu trả lời sai, phản xạ phổ biến là đổi model, tăng temperature hoặc viết lại prompt thật dài. Cách đó đôi khi che được triệu chứng nhưng không cho biết nguyên nhân, và có thể làm hỏng các case đang tốt. Chẩn đoán tốt bắt đầu bằng việc tái hiện lỗi trên cùng input, so sánh với tiêu chí thành công, rồi xác định lỗi nằm ở yêu cầu, context, cấu trúc task hay năng lực model.",
        "Anthropic khuyến nghị định nghĩa tiêu chí thành công cụ thể, đo được và xây dựng evaluation bằng test case phản ánh phân bố thực tế, gồm cả edge case (Anthropic, “Define success criteria and build evaluations”). Nếu không có tiêu chí và baseline, bạn chỉ đang so sánh cảm giác với cảm giác.",
      ],
    },
    {
      kind: "list",
      heading: "Tam giác chẩn đoán",
      items: [
        "Instruction: prompt có nêu rõ mục tiêu, audience, định dạng, ràng buộc và tiêu chí thành công không?",
        "Context: tài liệu, ví dụ, tool result hoặc lịch sử có thiếu, cũ, mâu thuẫn hoặc quá dài không?",
        "Task structure: một prompt đang gộp quá nhiều bước, hoặc thiếu bước trung gian để kiểm tra không?",
        "Model và effort: chỉ xem xét sau khi ba yếu tố trên đã rõ, vì đổi model không sửa được yêu cầu thiếu.",
        "Evaluation: case nào đang fail, fail như thế nào, và tiêu chí nào bị vi phạm?",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Tái hiện trước khi sửa",
      paragraphs: [
        "Một lần fail không đủ để kết luận. Hãy chạy lại cùng prompt và input vài lần để xem lỗi có ổn định không. Sau đó chạy trên một tập case đại diện: case thường, case khó, case thiếu dữ liệu và case có ngoại lệ. Nếu lỗi xuất hiện ở mọi lần và mọi input tương tự, đó là tín hiệu hệ thống, thường nằm ở instruction hoặc context. Nếu lỗi chỉ xuất hiện ở một input hiếm, có thể là edge case cần bổ sung ví dụ hoặc quy tắc.",
        "Ghi lại baseline trước khi thay đổi: điểm chất lượng, tỷ lệ đúng từng trường, thời gian, chi phí và các lỗi đã biết. Baseline này là bằng chứng để biết thay đổi sau đó có thực sự cải thiện hay chỉ làm bạn thấy yên tâm hơn.",
      ],
    },
    {
      kind: "list",
      heading: "Checklist chẩn đoán",
      items: [
        "Đọc lại prompt như một người mới: mục tiêu, audience, format và ví dụ có rõ không?",
        "Kiểm tra context: có tài liệu cũ, ví dụ sai format, hướng dẫn mâu thuẫn hoặc thông tin bị chôn quá sâu không?",
        "Kiểm tra task structure: có nên tách thành trích xuất, kiểm tra, rồi tổng hợp không?",
        "So sánh output với tiêu chí thành công và nguồn; đánh dấu chính xác phần nào sai.",
        "Phân loại lỗi: thiếu thông tin, hiểu sai yêu cầu, hallucination, format sai, hoặc giới hạn năng lực.",
        "Chỉ sau đó mới thử model khác hoặc mức effort khác, và giữ nguyên các biến còn lại để so sánh.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Đừng đổi model đầu tiên",
      body: "Một model mạnh hơn có thể che lỗi trong một buổi demo nhưng không sửa được prompt thiếu tiêu chí, context lỗi thời hoặc task bị gộp quá nhiều bước. Đổi model làm tăng chi phí và làm mất khả năng biết nguyên nhân thật. Hãy sửa yêu cầu và context trước, rồi mới dùng model như một biến được kiểm thử.",
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
      vi: "Mốc chẩn đoán",
      note: "Kết quả hiện tại trên cùng bộ test trước khi thay đổi.",
    },
    {
      en: "Failure classification",
      vi: "Phân loại lỗi",
      note: "Xác định lỗi thuộc yêu cầu, context, cấu trúc task hay năng lực model.",
    },
    {
      en: "Regression",
      vi: "Hồi quy chất lượng",
      note: "Một thay đổi cải thiện case này nhưng làm hỏng case khác.",
    },
    {
      en: "Latency",
      vi: "Độ trễ",
      note: "Thời gian từ yêu cầu đến khi có kết quả dùng được.",
    },
    {
      en: "Cost per successful outcome",
      vi: "Chi phí cho mỗi kết quả đúng",
      note: "Chi phí cần đo cùng chất lượng, không chỉ giá token.",
    },
    {
      en: "Right-sizing",
      vi: "Chọn đúng mức năng lực",
      note: "Dùng model và effort đủ cho task, không dư thừa.",
    },
    {
      en: "Prompt caching",
      vi: "Cache phần prompt lặp lại",
      note: "Giảm chi phí cho prefix ổn định; vẫn chiếm chỗ trong context.",
    },
    {
      en: "Batch processing",
      vi: "Xử lý theo lô",
      note: "Phù hợp với tác vụ không cần phản hồi tức thì; cần kiểm tra điều kiện áp dụng.",
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
