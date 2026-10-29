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
      heading: "Bản chất của Workflow và nguyên lý thiết kế tối giản",
      paragraphs: [
        "Trong nghiên cứu “Building effective agents”, Anthropic phân biệt rạch ròi giữa Workflow và Agent: Workflow là hệ thống trong đó mô hình LLM và các công cụ (tools) được phối hợp nhịp nhàng thông qua các luồng điều khiển xác định trước (code paths định hình sẵn); trong khi đó, Agent là hệ thống mà mô hình tự chủ hoàn toàn trong việc lập kế hoạch và quyết định cách gọi tools. Khuyến nghị cốt lõi của Anthropic dành cho kỹ sư là luôn bắt đầu với mẫu thiết kế đơn giản nhất có thể và chỉ gia tăng độ phức tạp khi có minh chứng thực nghiệm cho thấy kết quả được cải thiện rõ rệt.",
        "Trong môi trường sản xuất thực tế, điều này đồng nghĩa với việc không nên vội vã triển khai ngay một “Autonomous AI Agent” cồng kềnh. Hãy bắt đầu bằng việc hiểu sâu sắc quy trình nghiệp vụ hiện hữu, xác định chính xác mắt xích nào thực sự đòi hỏi năng lực suy luận của Claude, sau đó thiết kế một luồng thực thi nhỏ gọn nhất có thể kiểm thử được. Một workflow chuẩn mực luôn có điểm đầu vào xác định, đầu ra đo lường được và bố trí các điểm kiểm soát có chuyên viên con người can thiệp (human-in-the-loop checkpoints).",
      ],
    },
    {
      kind: "list",
      heading: "Năm giai đoạn từ bài toán nghiệp vụ đến vận hành",
      items: [
        "Frame vấn đề: Ai đang thực hiện, tốn bao nhiêu thời gian, sai sót thường trực là gì, và chỉ số kinh doanh nào cần tối ưu hóa.",
        "Phân tích yêu cầu (Requirements): Xác định actors, mục tiêu, ràng buộc pháp lý/bảo mật, trường hợp ngoại lệ và câu hỏi mở.",
        "Nghiên cứu & Lập kế hoạch (Research & Planning): Thu thập dữ kiện, cô lập giả định, chọn metrics đo lường và thiết kế thử nghiệm pilot.",
        "Thiết kế giải pháp & Tích hợp: Xây dựng các phương án kiến trúc, triển khai pilot quy mô nhỏ, tích hợp human checkpoint và đo đạc baseline.",
        "Truyền thông & Mở rộng: Báo cáo kết quả định lượng cho stakeholders, công khai các failure modes, giới hạn kỹ thuật và lộ trình mở rộng có kiểm soát.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Phân tích yêu cầu: Tách bạch dữ kiện đã kiểm chứng khỏi giả định",
      paragraphs: [
        "Phân tích yêu cầu kỹ thuật không phải là việc soạn ra một bản thiết kế giải pháp dài dòng. Đó là quá trình chuyển hóa ghi chú thô, email nghiệp vụ và phỏng vấn người dùng thành một bộ đặc tả có thể kiểm thử độc lập: những ai tham gia vào quy trình, họ cần đạt kết quả gì, ràng buộc nào không thể thương lượng, ngoại lệ nào bắt buộc xử lý thủ công, và những vấn đề nào còn đang bỏ ngỏ. Anthropic khuyến nghị đưa ra các tiêu chí thành công cụ thể, có thể định lượng; đồng thời bộ kiểm thử (evaluation suite) phải phản ánh đúng phân bố dữ liệu thực tế và các edge cases (Anthropic, “Prompting best practices”; “Define success criteria and build evaluations”).",
        "Tính truy xuất nguồn gốc (Traceability) là nguyên tắc sống còn: mỗi yêu cầu kỹ thuật phải dẫn chiếu được đến ghi chú cuộc họp, biên bản nghiệp vụ hoặc người xác nhận cụ thể. Tránh hiện tượng model tự suy diễn hoặc bịa đặt thêm yêu cầu không có trong dữ kiện (hallucination). Hãy chỉ định rõ trong prompt để Claude gắn nhãn `[INSUFFICIENT_DATA]` hoặc `[CHƯA_ĐỦ_DỮ_LIỆU]` thay vì tự ý bổ sung các giả định chưa được kiểm chứng.",
      ],
    },
    {
      kind: "list",
      heading: "Checklist rà soát yêu cầu kỹ thuật (Requirements Checklist)",
      items: [
        "Actor: Ai trực tiếp thực hiện, ai phê duyệt, ai chịu trách nhiệm giải trình và ai là người review cuối.",
        "Goal: Kết quả nghiệp vụ cụ thể cần giải quyết (không chỉ dừng lại ở mong muốn trừu tượng là “ứng dụng AI”).",
        "Constraint: Thời gian đáp ứng, ngân sách token, chính sách dữ liệu nhạy cảm, hệ sinh thái sẵn có và các quy định bắt buộc.",
        "Exception: Trường hợp ngoại lệ nào cần kích hoạt cơ chế chuyển tiếp con người (human escalation / handover) và bước nào cấm tự động hóa hoàn toàn.",
        "Open question: Thông tin nào còn thiếu, bộ phận nào có thẩm quyền giải đáp, và giả định nào có thể làm đảo lộn thiết kế kiến trúc.",
        "Traceability: Mọi yêu cầu đều có căn cứ nguồn hoặc chữ ký xác nhận của stakeholder; loại bỏ triệt để các yêu cầu chỉ dựa trên suy đoán.",
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
      kind: "diagram",
      heading: "Mô phỏng kiến trúc: Các mẫu thiết kế Workflow & Trạm kiểm soát Human Checkpoint",
      diagramId: "workflow-patterns-simulator",
      intro: "Trực quan hóa và tương tác với 4 mô hình thiết kế workflow phổ biến theo tài liệu Anthropic: Routing, Parallelization, Orchestrator-Workers và Evaluator-Optimizer loop.",
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
      vi: "Workflow (luồng quy trình công việc định sẵn)",
      note: "Hệ thống điều phối model và các công cụ (tools) qua các bước logic được lập trình trước rõ ràng.",
    },
    {
      en: "Agent",
      vi: "Agent (tác nhân AI tự chủ)",
      note: "Hệ thống trong đó model tự chủ quyết định bước đi tiếp theo và cách sử dụng công cụ; luôn cần guardrails và stopping conditions chặt chẽ.",
    },
    {
      en: "Requirements analysis",
      vi: "Requirements analysis (phân tích yêu cầu bài toán)",
      note: "Chuyển hóa nhu cầu kinh doanh thành các chủ thể (actors), mục tiêu, ràng buộc, ca ngoại lệ và tiêu chí đo lường cụ thể.",
    },
    {
      en: "Use case",
      vi: "Use case (tình huống ứng dụng thực tế)",
      note: "Mô tả ai sử dụng Claude, trong điều kiện nào, cần đạt được mục tiêu gì và xử lý rủi ro ra sao.",
    },
    {
      en: "Pilot",
      vi: "Pilot (thử nghiệm quy mô nhỏ)",
      note: "Triển khai thử nghiệm trong phạm vi hẹp để đo lường hiệu năng thực tế và phát hiện lỗi trước khi rollout diện rộng.",
    },
    {
      en: "Baseline",
      vi: "Baseline (mốc đo lường ban đầu)",
      note: "Chỉ số về độ chính xác, thời gian xử lý và chi phí hiện tại dùng làm căn cứ đánh giá sau khi áp dụng AI.",
    },
    {
      en: "Human checkpoint",
      vi: "Human checkpoint (điểm kiểm soát con người)",
      note: "Bước dừng bắt buộc để chuyên gia con người thẩm định, phê duyệt hoặc can thiệp trước khi hành động có hiệu lực thực tế.",
    },
    {
      en: "Evaluator-optimizer",
      vi: "Mô hình Evaluator-Optimizer (tạo và đánh giá lặp lại)",
      note: "Kiến trúc gồm một lượt sinh nội dung và một lượt đánh giá độc lập theo tiêu chuẩn định sẵn để liên tục hoàn thiện output.",
    },
    {
      en: "Stakeholder",
      vi: "Stakeholder (các bên liên quan)",
      note: "Người dùng trực tiếp, quản lý phê duyệt, bộ phận pháp chế hoặc khách hàng chịu tác động từ giải pháp AI.",
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
    "workflow-solution-handoff-controls",
    "workflow-routing-intent-classification",
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
