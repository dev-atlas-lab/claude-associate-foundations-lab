import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all five verified Domain 4 objectives.
 * It teaches a full workflow-design progression: requirements, research and
 * planning, solution options, integration and piloting, and stakeholder
 * communication. Examples are original workplace scenarios. Workflow patterns
 * are checked against Anthropic's engineering guidance; the lesson avoids
 * framework-specific or time-sensitive tooling claims.
 */
export const workflowDesignLesson: Lesson = lessonSchema.parse({
  id: "workflow-design",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 6,
  kind: "curriculum",
  contentStatus: "published",
  title: "Thiết kế workflow: từ yêu cầu đến pilot có kiểm tra",
  englishTitle: "Workflow design: from requirements to a checked pilot",
  summary:
    "Học cách dùng Claude để phân tích yêu cầu, nghiên cứu và lập kế hoạch, tạo nhiều phương án thiết kế, tích hợp vào quy trình hiện có bằng một pilot nhỏ có đo lường, và truyền đạt giá trị cùng giới hạn cho stakeholder. Bài nhấn mạnh workflow có đường đi xác định, human checkpoint và bằng chứng trước khi mở rộng.",
  level: "intermediate",
  estimatedMinutes: 24,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Nội dung kỹ thuật được đối chiếu với tài liệu Anthropic về building effective agents, evaluation criteria, prompting best practices, research và Claude's Constitution (truy cập 27/10/2026). Năm objective lấy từ Exam Guide v1.0. Các tình huống là ví dụ gốc, không phải câu hỏi chính thức của kỳ thi.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-building-effective-agents",
      "anthropic-evaluation-docs",
      "anthropic-prompting-best-practices",
      "anthropic-research-help",
      "anthropic-claude-constitution",
      "anthropic-usage-policy",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "workflow-requirements-analysis",
      "workflow-research-planning",
      "workflow-solution-design",
      "workflow-integrate",
      "workflow-stakeholder-communication",
    ],
    note: "Bài học được viết cho cả năm objective đã xác minh của Domain 4 trong Exam Guide v1.0. Mapping xác nhận phạm vi bài học, không phải tuyên bố rằng Domain 4 đã được bao phủ đầy đủ hoặc rằng mọi quy trình đều nên dùng Claude.",
  },
  objectives: [
    "Phân tích yêu cầu và use case thành actor, mục tiêu, ràng buộc, ngoại lệ và câu hỏi mở có thể kiểm tra.",
    "Dùng Claude cho research và planning với nguồn, citation và giả định được tách khỏi dữ kiện.",
    "Tạo và so sánh nhiều phương án thiết kế, nêu rõ trade-off, giả định và rủi ro.",
    "Tích hợp Claude vào workflow hiện có bằng một pilot nhỏ, có human checkpoint và baseline đo lường.",
    "Truyền đạt giá trị, phạm vi và giới hạn của Claude cho stakeholder bằng bằng chứng thay vì lời hứa.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Workflow là gì, và vì sao nên bắt đầu đơn giản",
      paragraphs: [
        "Anthropic phân biệt workflow với agent trong hệ thống agentic: workflow là hệ thống trong đó LLM và tool được điều phối qua các đường đi xác định trước; agent là hệ thống trong đó model tự quyết định quy trình và cách dùng tool. Khuyến nghị cốt lõi là tìm giải pháp đơn giản nhất có thể và chỉ tăng độ phức tạp khi nó thực sự cải thiện kết quả (Anthropic, “Building effective agents”).",
        "Trong bối cảnh công việc kinh doanh, điều này có nghĩa là đừng bắt đầu bằng một “AI agent tự trị”. Hãy bắt đầu bằng việc hiểu quy trình hiện tại, xác định bước nào thực sự cần suy luận hoặc tổng hợp, rồi thiết kế đường đi nhỏ nhất có thể kiểm tra được. Một workflow tốt có điểm bắt đầu, điểm kết thúc, đầu ra rõ ràng và chỗ con người can thiệp.",
      ],
    },
    {
      kind: "list",
      heading: "Năm bước từ vấn đề đến vận hành",
      items: [
        "Frame vấn đề: ai đang làm gì, mất bao lâu, lỗi nào đang xảy ra, và kết quả nào sẽ được cải thiện.",
        "Phân tích yêu cầu: actor, mục tiêu, ràng buộc, ngoại lệ, quyết định bắt buộc và câu hỏi mở.",
        "Research và planning: thu thập bằng chứng, xác định giả định, chọn cách đo và lập kế hoạch pilot.",
        "Thiết kế và tích hợp: tạo nhiều phương án, chọn điểm bắt đầu nhỏ, thêm human checkpoint và đo baseline.",
        "Truyền đạt và mở rộng: báo cáo kết quả đo được, failure mode, giới hạn và bước tiếp theo có kiểm soát.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Requirements: tách điều đã biết khỏi giả định",
      paragraphs: [
        "Phân tích yêu cầu không phải là viết ra một giải pháp thật dài. Đó là quá trình biến ghi chú, email và phỏng vấn thành một mô tả có thể kiểm tra: ai tham gia, họ cần đạt gì, ràng buộc nào không thể vi phạm, ngoại lệ nào phải xử lý, và câu hỏi nào còn mở. Anthropic khuyến nghị chỉ dẫn rõ ràng, context và tiêu chí thành công cụ thể; evaluation cũng cần test case phản ánh phân bố thực tế và edge case (Anthropic, “Prompting best practices”; “Define success criteria and build evaluations”).",
        "Điểm quan trọng là traceability. Mỗi yêu cầu nên chỉ ra nó đến từ ghi chú nào, ai xác nhận, và còn thiếu gì. Nếu Claude bịa thêm yêu cầu để tài liệu trông đầy đủ, đó là hallucination và có thể dẫn đến thiết kế sai. Hãy yêu cầu Claude đánh dấu “chưa đủ dữ liệu” thay vì lấp chỗ trống.",
      ],
    },
    {
      kind: "list",
      heading: "Checklist requirements",
      items: [
        "Actor: ai thực hiện, ai phê duyệt, ai chịu hậu quả, ai là người review cuối.",
        "Goal: kết quả kinh doanh hoặc trải nghiệm nào cần cải thiện, không chỉ là “dùng AI”.",
        "Constraint: thời gian, ngân sách, dữ liệu, quy định, hệ thống hiện có và điều không được thay đổi.",
        "Exception: trường hợp nào phải chuyển sang người, trường hợp nào phải dừng, trường hợp nào không được tự động.",
        "Open question: điều gì chưa biết, ai cần trả lời, và điều gì sẽ làm thay đổi thiết kế.",
        "Traceability: mỗi mục có nguồn hoặc người xác nhận; không có yêu cầu nào chỉ vì “nghe hợp lý”.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Research và planning: bằng chứng trước khi chọn giải pháp",
      paragraphs: [
        "Research hữu ích khi câu hỏi cần nhiều nguồn hiện hành và câu trả lời cần citation. Anthropic mô tả Research chạy nhiều lượt tìm kiếm nối tiếp, có thể dùng web và các connector, và tạo báo cáo tổng hợp dài hơn có citation. Tuy vậy, citation không tự động đúng hoặc còn hiện hành; người dùng vẫn phải kiểm tra nguồn trước khi dùng cho quyết định (Anthropic, “Use research on Claude”; “Define success criteria and build evaluations”).",
        "Trong planning, hãy tách ba lớp: dữ kiện đã xác minh, giả định cần kiểm tra, và khuyến nghị. Một kế hoạch tốt nói rõ điều gì sẽ được đo, ai chịu trách nhiệm, khi nào dừng hoặc chuyển hướng, và điều gì sẽ khiến kế hoạch thất bại. Đừng biến một bản tổng hợp trôi chảy thành kế hoạch chỉ vì nó nghe có lý.",
      ],
    },
    {
      kind: "list",
      heading: "Research và planning có kỷ luật",
      items: [
        "Đặt câu hỏi nghiên cứu, tiêu chí nguồn và deadline trước khi yêu cầu tổng hợp.",
        "Yêu cầu citation cho từng claim quan trọng và một mục riêng cho gap, mâu thuẫn và giả định.",
        "Tách fact khỏi recommendation; ghi rõ recommendation dựa trên giả định nào.",
        "Chọn một vài chỉ số đo được cho pilot, không dùng “nhanh hơn” hoặc “tốt hơn” mà không có mốc.",
        "Ghi lại điều kiện dừng: khi nào pilot đủ tốt để mở rộng, khi nào phải sửa, khi nào phải dừng.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Solution design: nhiều phương án, tiêu chí rõ",
      paragraphs: [
        "Claude có thể mở rộng không gian phương án, làm rõ giả định và surface rủi ro, nhưng không nên là người ra quyết định cuối. Một thiết kế tốt thường có ít nhất hai hoặc ba phương án với trade-off rõ: làm thủ công, tự động một phần, hoặc tự động nhiều bước. Anthropic mô tả pattern evaluator-optimizer, trong đó một lượt tạo output và một lượt đánh giá theo tiêu chí rõ rồi lặp lại; pattern này chỉ hữu ích khi tiêu chí đánh giá rõ và việc cải tiến có giá trị đo được (Anthropic, “Building effective agents”).",
        "Với mỗi phương án, hãy ghi rõ: bước nào do Claude làm, bước nào do người làm, dữ liệu nào đi vào, output nào đi ra, điểm nào có thể sai, và cách phát hiện sai. Đừng để một phương án nghe mạch lạc che mất việc nó chưa được kiểm thử.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Workflow hay agent?",
      body: "Nếu các bước có thể mô tả trước và cần kết quả nhất quán, workflow là lựa chọn mặc định. Agent phù hợp khi không thể biết trước số bước hoặc đường đi, và khi bạn có thể test trong môi trường an toàn với guardrail, stopping condition và human checkpoint. Đừng chọn agent chỉ vì nghe tiên tiến hơn.",
    },
    {
      kind: "paragraphs",
      heading: "Tích hợp: chọn điểm bắt đầu nhỏ, đo được",
      paragraphs: [
        "Tích hợp vào quy trình hiện có không phải là thay toàn bộ quy trình trong một lần. Hãy map quy trình hiện tại, chọn một bước có phạm vi rõ, dễ đảo ngược, có tiêu chí chấp nhận và có baseline. Anthropic khuyến nghị đo hiệu suất và lặp lại; với agent, họ nhấn mạnh khả năng dừng tại checkpoint hoặc khi gặp blocker, cùng stopping condition để giữ kiểm soát (Anthropic, “Building effective agents”).",
        "Human checkpoint nên đặt ở bước có hậu quả lớn, khó đảo ngược hoặc cần đánh giá chuyên môn. Không phải mọi bước đều cần con người phê duyệt, nhưng bước quyết định cuối, bước gửi ra bên ngoài và bước thay đổi dữ liệu quan trọng thường cần. Claude's Constitution nhấn mạnh việc không được làm suy yếu human oversight; đây là nguyên tắc thiết kế, không chỉ là yêu cầu tuân thủ.",
      ],
    },
    {
      kind: "list",
      heading: "Tiêu chí chọn pilot đầu tiên",
      items: [
        "Có giá trị đủ rõ nhưng phạm vi hẹp: một bước, một nhóm người dùng, một loại tài liệu.",
        "Có thể đảo ngược hoặc có human review trước khi tác động ra bên ngoài.",
        "Có baseline về chất lượng, thời gian và chi phí để so sánh sau khi thay đổi.",
        "Có tiêu chí chấp nhận và failure mode được định nghĩa trước, không chỉ “cảm thấy tốt hơn”.",
        "Có người chịu trách nhiệm vận hành, escalation và quyết định dừng.",
        "Có đủ dữ liệu đại diện, gồm cả case khó và ngoại lệ, để kiểm thử.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Truyền đạt giá trị và giới hạn",
      paragraphs: [
        "Stakeholder không cần một demo đẹp; họ cần biết điều gì đã được kiểm thử, kết quả đo được là gì, lỗi nào đã biết, ai review, và bước tiếp theo là gì. Một báo cáo trung thực nói rõ phạm vi, giả định, failure mode và điều kiện áp dụng. Anthropic xem tiêu chí thành công và evaluation là nền tảng để biết output có đạt yêu cầu; Claude's Constitution nhấn mạnh human oversight và tránh tuyên bố gây hiểu nhầm về năng lực.",
        "Đừng hứa thay thế toàn bộ nhân sự, cắt giảm chi phí chưa đo, hoặc “chính xác 100%”. Những tuyên bố đó không có bằng chứng và làm xói mòn niềm tin. Nếu pilot chỉ cải thiện một bước, hãy nói đúng như vậy. Giá trị của Claude thường đến từ việc giảm công việc lặp lại, tăng tốc bản nháp và giúp con người tập trung vào quyết định, không phải từ việc thay thế mọi vai trò.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Đừng bán một kết quả chưa đo",
      body: "Nếu chưa có baseline và pilot, bạn chưa có bằng chứng về hiệu quả. Hãy trình bày giả thuyết, phạm vi test, tiêu chí thành công và rủi ro; đừng biến mong muốn thành cam kết. Với use case high-risk, còn cần kiểm tra chính sách, human review và disclosure theo Usage Policy.",
    },
    {
      kind: "paragraphs",
      heading: "Vòng lặp vận hành sau pilot",
      paragraphs: [
        "Sau pilot, hãy so sánh kết quả với baseline theo từng case, không chỉ theo điểm trung bình. Phân loại lỗi thuộc yêu cầu, prompt/context, thiết kế bước hay model. Nếu một thay đổi cải thiện trung bình nhưng làm hỏng một case quan trọng, đó là regression và cần xử lý trước khi mở rộng. Ghi lại quyết định, phiên bản prompt, dữ liệu test và người phê duyệt để lần sau có thể tái tạo.",
        "Workflow tốt là workflow có thể giải thích, đo và dừng. Khi mở rộng, hãy tăng phạm vi từng bước và giữ các checkpoint đã chứng minh hiệu quả. Đừng thêm agent hoặc tự động hóa chỉ vì có thể.",
      ],
    },
  ],
  keyTerms: [
    {
      en: "Workflow",
      vi: "Quy trình có đường đi xác định",
      note: "LLM và tool được điều phối qua các bước đã định trước.",
    },
    {
      en: "Agent",
      vi: "Hệ thống tự điều phối",
      note: "Model tự quyết định quy trình và cách dùng tool; cần guardrail và điểm dừng.",
    },
    {
      en: "Requirements analysis",
      vi: "Phân tích yêu cầu",
      note: "Biến ghi chú thành actor, mục tiêu, ràng buộc, ngoại lệ và câu hỏi mở có thể kiểm tra.",
    },
    {
      en: "Use case",
      vi: "Tình huống sử dụng",
      note: "Mô tả ai làm gì, trong điều kiện nào, để đạt kết quả gì.",
    },
    {
      en: "Pilot",
      vi: "Chạy thử có kiểm soát",
      note: "Triển khai phạm vi nhỏ để đo hiệu quả và phát hiện lỗi trước khi mở rộng.",
    },
    {
      en: "Baseline",
      vi: "Mốc so sánh",
      note: "Chất lượng, thời gian và chi phí hiện tại trước khi thay đổi.",
    },
    {
      en: "Human checkpoint",
      vi: "Điểm con người kiểm tra",
      note: "Bước dừng để con người xem xét, phê duyệt hoặc can thiệp.",
    },
    {
      en: "Evaluator-optimizer",
      vi: "Tạo và đánh giá lặp lại",
      note: "Một lượt tạo output, một lượt đánh giá theo tiêu chí, rồi cải tiến.",
    },
    {
      en: "Stakeholder",
      vi: "Bên liên quan",
      note: "Người dùng, người phê duyệt, người chịu tác động hoặc người ra quyết định.",
    },
  ],
  scenario: {
    title: "Tình huống: thiết kế lại quy trình tiếp nhận yêu cầu bảo hiểm",
    setup:
      "Một công ty bảo hiểm nhận yêu cầu bồi thường qua email và PDF. Nhân viên hiện đọc thủ công, nhập vào hệ thống và chuyển cho chuyên viên. Thời gian xử lý trung bình là 3 ngày; lỗi phổ biến là bỏ sót tài liệu và nhập sai số hợp đồng. Ban lãnh đạo muốn “dùng AI để tự động hóa toàn bộ”.",
    steps: [
      "Map quy trình hiện tại và xác định bước nào thực sự gây chậm, lỗi hoặc chi phí cao nhất.",
      "Phân tích yêu cầu: actor, tài liệu bắt buộc, quy tắc phê duyệt, ngoại lệ, dữ liệu nhạy cảm và câu hỏi mở.",
      "Research các pattern phù hợp và kiểm tra chính sách nội bộ, yêu cầu high-risk và human review trước khi thiết kế.",
      "Tạo ba phương án: chỉ trích xuất dữ liệu, trích xuất và soạn bản nháp, hoặc tự động nhiều bước với checkpoint.",
      "Chọn pilot đầu tiên là trích xuất tài liệu và đối chiếu số hợp đồng, vì bước này hẹp, dễ kiểm tra và có human review.",
      "Đo baseline về độ chính xác trường dữ liệu, thời gian xử lý và số lần phải sửa; chạy trên 100 hồ sơ đại diện gồm cả hồ sơ thiếu tài liệu.",
      "Review kết quả với stakeholder, phân loại lỗi và quyết định có mở rộng sang bước soạn bản nháp hay không.",
      "Trình bày giá trị đã đo, failure mode, giới hạn và bước tiếp theo; không cam kết thay thế toàn bộ chuyên viên.",
    ],
    takeaway:
      "Thiết kế workflow là bài toán hiểu quy trình, không phải bài toán chọn model. Một pilot nhỏ với yêu cầu rõ, human checkpoint và baseline trung thực thường tạo ra nhiều thông tin hơn một kế hoạch tự động hóa toàn bộ nhưng chưa được kiểm chứng.",
  },
  questions: [
    {
      id: "workflow-design-lesson-pilot",
      type: "single-choice",
      stem: "A team wants to integrate Claude into a claims intake workflow. Which first pilot is most defensible?",
      choices: [
        {
          id: "bounded-reversible-step",
          text: "A bounded, reversible document-check step with clear acceptance criteria, a human checkpoint, and a baseline for accuracy and cycle time.",
          explanation:
            "Đúng: phạm vi hẹp, dễ đảo ngược, có tiêu chí và baseline giúp đo hiệu quả và phát hiện lỗi trước khi mở rộng.",
        },
        {
          id: "final-denial-decision",
          text: "The final claim-denial decision, because it saves the most time.",
          explanation:
            "Sai: đây là bước có hậu quả lớn và khó đảo ngược; không nên là pilot đầu tiên khi chưa có bằng chứng và kiểm soát.",
        },
        {
          id: "all-steps-at-once",
          text: "Every step at once so the team can learn quickly.",
          explanation:
            "Sai: tự động hóa toàn bộ ngay lập tức khuếch đại lỗi và khiến không thể xác định nguyên nhân.",
        },
        {
          id: "visible-step-without-baseline",
          text: "The most visible customer-facing step, without measuring the current process.",
          explanation:
            "Sai: thiếu baseline thì không biết thay đổi có cải thiện chất lượng, thời gian hay chi phí hay không.",
        },
      ],
      correctChoiceIds: ["bounded-reversible-step"],
      correctExplanation:
        "Pilot đầu tiên nên là một bước hẹp, dễ đảo ngược, có tiêu chí chấp nhận và human checkpoint. Cần baseline trước khi thay đổi để so sánh chất lượng và thời gian. Anthropic khuyến nghị bắt đầu đơn giản, đo hiệu suất và chỉ tăng độ phức tạp khi có cải thiện rõ ràng; bước quyết định cuối hoặc toàn bộ quy trình là phạm vi quá lớn cho lần chạy thử đầu.",
      sourceIds: [
        "anthropic-building-effective-agents",
        "anthropic-evaluation-docs",
        "anthropic-claude-constitution",
      ],
    },
  ],
  relatedQuestionIds: [
    "workflow-requirements-extraction",
    "workflow-research-current-scan",
    "workflow-research-planning-practices",
    "workflow-solution-options",
    "workflow-solution-iteration",
    "workflow-integration-checkpoints",
    "workflow-stakeholder-brief",
    "workflow-stakeholder-evidence",
    "workflow-requirements-artifacts",
    "workflow-integration-first-pilot",
  ],
  takeaways: [
    "Bắt đầu bằng quy trình và vấn đề, không bằng agent hay model; workflow có đường đi xác định là mặc định cho công việc đã hiểu rõ.",
    "Requirements tốt gồm actor, mục tiêu, ràng buộc, ngoại lệ, câu hỏi mở và traceability; không bịa yêu cầu để lấp gap.",
    "Research và planning phải tách dữ kiện, giả định và khuyến nghị; citation vẫn cần được kiểm tra.",
    "Solution design tạo nhiều phương án với trade-off và human decision, rồi kiểm thử theo yêu cầu và edge case.",
    "Tích hợp bằng pilot nhỏ, có baseline, tiêu chí chấp nhận, human checkpoint và khả năng dừng.",
    "Truyền đạt giá trị bằng kết quả đo được, phạm vi, failure mode và trách nhiệm con người; không hứa thay thế toàn bộ.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-building-effective-agents",
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-research-help",
    "anthropic-claude-constitution",
    "anthropic-usage-policy",
  ],
});
