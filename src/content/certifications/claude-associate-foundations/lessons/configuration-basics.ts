import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all four verified Domain 5 objectives.
 * Product details (menus, plan limits, connector availability) change faster
 * than the exam blueprint, so the lesson teaches durable configuration
 * decisions and points readers to current official documentation for UI steps.
 */
export const configurationBasicsLesson: Lesson = lessonSchema.parse({
  id: "configuration-basics",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 3,
  kind: "curriculum",
  contentStatus: "published",
  title: "Cấu hình Claude: project, knowledge, connector và bảo trì",
  englishTitle: "Configuring Claude: projects, knowledge, connectors, and maintenance",
  summary:
    "Học cách biến Claude thành một workspace có cấu hình rõ ràng: project instructions, knowledge base, connector và system-level instructions. Trọng tâm là biết thông tin nào nên đặt ở đâu, quyền nào cần kiểm soát, và cách bảo trì cấu hình khi nguồn hoặc chính sách thay đổi.",
  level: "foundation",
  estimatedMinutes: 20,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Nội dung kỹ thuật được đối chiếu với tài liệu Anthropic Help Center về projects, RAG cho projects, connectors và Google Workspace connectors, cùng hướng dẫn prompting chính thức (truy cập 27/10/2026). Bốn objective lấy từ Exam Guide v1.0. Chi tiết UI, giới hạn plan và danh sách connector có thể thay đổi; bài học không khẳng định một menu hay quota cố định.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-projects-overview",
      "anthropic-projects-manage",
      "anthropic-projects-rag",
      "anthropic-connectors-help",
      "anthropic-google-workspace-connectors",
      "anthropic-prompting-best-practices",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "config-project-instructions",
      "config-knowledge-connectors",
      "config-system-instructions",
      "config-maintain",
    ],
    note: "Bài học được viết cho cả bốn objective đã xác minh của Domain 5 trong Exam Guide v1.0. Mapping xác nhận phạm vi bài học, không phải tuyên bố rằng Domain 5 đã được bao phủ đầy đủ như một kỳ thi thu nhỏ.",
  },
  objectives: [
    "Cấu hình project với knowledge sources và instructions dùng chung cho nhiều chat.",
    "Quản lý connector, quyền truy cập nguồn và các hành động nhạy cảm.",
    "Viết system-level instructions rõ vai trò, nguồn, giới hạn và escalation.",
    "Duy trì cấu hình khi tài liệu, chính sách hoặc thành viên thay đổi.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Cấu hình là một phần của chất lượng câu trả lời",
      paragraphs: [
        "Khi cùng một câu hỏi nhận được câu trả lời khác nhau giữa các chat, nguyên nhân thường không nằm ở model mà ở cấu hình: tài liệu nguồn không được đưa vào knowledge, instruction bị dán riêng trong một chat, hoặc connector đang dùng sai quyền. Domain 5 kiểm tra khả năng thiết lập và bảo trì những yếu tố đó một cách có chủ đích.",
        "Anthropic mô tả project là một workspace tự chứa, có lịch sử chat và knowledge base riêng. Tài liệu trong project knowledge được dùng làm context cho các chat trong project, còn project instructions được lưu một lần và áp dụng cho mọi chat. Điểm quan trọng: context của một chat không tự động được chia sẻ sang chat khác trừ khi nội dung đó được đưa vào knowledge base (Anthropic, “What are projects?”; “How can I create and manage projects?”).",
      ],
    },
    {
      kind: "list",
      heading: "Bốn lớp cấu hình cần phân biệt",
      items: [
        "Project knowledge: tài liệu nguồn, file, đoạn code hoặc ghi chú được dùng làm context cho các chat trong project.",
        "Project instructions: quy tắc hành vi, giọng điệu, audience và format áp dụng cho mọi chat trong project.",
        "System-level instructions: chỉ dẫn nền tảng cho vai trò và giới hạn của assistant, đặc biệt khi xây dựng một sản phẩm hoặc workflow có nhiều người dùng.",
        "Connectors: kết nối tới dịch vụ bên ngoài như Google Drive, Gmail hoặc Calendar, kèm quyền và quy tắc hành động.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Tên và mô tả project không phải instruction",
      body: "Theo tài liệu Anthropic, Claude không có quyền truy cập tên và mô tả project. Đừng đặt quy tắc quan trọng ở đó với hy vọng model sẽ đọc. Hãy dùng project instructions cho hành vi và project knowledge cho tài liệu nguồn.",
    },
    {
      kind: "paragraphs",
      heading: "Project knowledge: đặt nguồn ở nơi mọi chat nhìn thấy",
      paragraphs: [
        "Knowledge base phù hợp với tài liệu ổn định và được tái sử dụng: brand guide, product brief, chính sách đã được phê duyệt, hoặc bộ câu hỏi thường gặp. Khi tài liệu nằm trong knowledge, chat mới trong project có thể dùng lại mà không cần dán lại. Ngược lại, một quyết định chỉ xuất hiện trong chat cũ sẽ không tự động có mặt ở chat mới.",
        "Với các gói trả phí, khi knowledge tiến gần giới hạn context, Claude có thể tự động chuyển sang RAG để mở rộng dung lượng và chỉ truy xuất phần liên quan. Đây là cơ chế tự động, không phải lý do để bỏ qua việc quản lý nguồn: file trùng lặp, tên file mơ hồ và tài liệu lỗi thời vẫn làm giảm chất lượng retrieval (Anthropic, “Retrieval augmented generation (RAG) for projects”).",
      ],
    },
    {
      kind: "list",
      heading: "Checklist khi đưa tài liệu vào knowledge",
      items: [
        "Tài liệu có phải nguồn được phê duyệt và còn hiệu lực không?",
        "Tên file có mô tả nội dung, phiên bản và ngày ban hành không?",
        "Có bản trùng hoặc bản cũ gây mâu thuẫn không?",
        "Tài liệu có chứa dữ liệu mật hoặc thông tin cá nhân không cần thiết không?",
        "Ai sẽ chịu trách nhiệm cập nhật hoặc xóa tài liệu khi có phiên bản mới?",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Project instructions: quy tắc hành vi, không phải kho tài liệu",
      paragraphs: [
        "Project instructions nên trả lời các câu hỏi ổn định: assistant đóng vai gì, phục vụ ai, được dùng nguồn nào, phải từ chối hoặc chuyển người khi nào, và output cần format ra sao. Hướng dẫn prompting của Anthropic nhấn mạnh chỉ dẫn rõ ràng, có context và ví dụ khi cần; instruction càng cụ thể thì hành vi càng nhất quán (Anthropic, “Prompting best practices”).",
        "Không nên dán toàn bộ chính sách vào instruction. Tài liệu dài thuộc về knowledge; instruction giữ phần hành vi cốt lõi. Cách tách này giúp con người review, cập nhật và kiểm thử từng lớp mà không phải sửa một khối văn bản khổng lồ mỗi lần chính sách thay đổi.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Instruction dài không đồng nghĩa instruction tốt",
      body: "Một instruction nhồi quá nhiều quy tắc, đặc biệt khi các quy tắc mâu thuẫn hoặc lặp lại, có thể khiến model bỏ sót phần quan trọng. Hãy giữ instruction ngắn, có thứ bậc, và kiểm tra bằng các câu hỏi đại diện sau mỗi thay đổi.",
    },
    {
      kind: "paragraphs",
      heading: "Connector: quyền nguồn, quyền tổ chức và quyền hành động",
      paragraphs: [
        "Connector cho phép Claude truy cập ứng dụng, lấy dữ liệu và thực hiện hành động trong dịch vụ được kết nối. Claude thừa hưởng quyền của từng người dùng từ dịch vụ nguồn: nếu một người không truy cập được file, channel hoặc record trong hệ thống gốc thì connector cũng không thể chạm tới (Anthropic, “Use connectors to extend Claude's capabilities”).",
        "Trên Team và Enterprise, Owner hoặc Primary Owner phải bật connector ở cấp tổ chức, nhưng từng người vẫn phải tự xác thực tài khoản. Bật connector không cấp quyền truy cập file và cũng không thay thế đăng nhập cá nhân. Owner có thể giới hạn hành động, ví dụ cho phép đọc email nhưng chặn gửi; các giới hạn này chỉ thu hẹp quyền, không bao giờ mở rộng quyền so với hệ thống nguồn.",
        "Với Google Workspace, Gmail, Calendar và Drive mặc định yêu cầu phê duyệt trước các hành động như gửi email hoặc chia sẻ, di chuyển, xóa file. Dữ liệu lấy qua connector được lưu cùng chat và có thể xóa bằng cách xóa chat; Anthropic cũng nêu rõ chính sách không dùng dữ liệu connector để huấn luyện, kèm caveat cho tài khoản tiêu dùng đã chọn chia sẻ nội dung sao chép để cải thiện model (Anthropic, “Use Google Workspace connectors”).",
      ],
    },
    {
      kind: "list",
      heading: "Câu hỏi trước khi bật một connector",
      items: [
        "Connector có cần thiết cho công việc, hay chỉ tiện hơn upload thủ công?",
        "Dữ liệu nguồn có mức độ nhạy cảm nào, và chính sách tổ chức có cho phép không?",
        "Ai phê duyệt ở cấp tổ chức, và từng người đã xác thực đúng tài khoản chưa?",
        "Hành động ghi nào nên chặn hoặc bắt buộc phê duyệt?",
        "Chat chứa dữ liệu đồng bộ có được phép chia sẻ không?",
      ],
    },
    {
      kind: "paragraphs",
      heading: "System-level instructions: ổn định, rõ giới hạn, có escalation",
      paragraphs: [
        "System-level instruction là lớp chỉ dẫn nền tảng cho assistant. Một instruction tốt nêu vai trò và audience, nguồn được phép, cách xử lý khi thiếu thông tin, giới hạn cần từ chối, và đường escalation. Ví dụ: “Bạn là trợ lý Tier 1 cho cổng thanh toán; chỉ trả lời từ các trang chính sách được cung cấp; câu hỏi hoàn tiền hoặc pháp lý phải chuyển cho nhân viên”.",
        "Điều cần tránh cũng quan trọng: đừng yêu cầu model “không bao giờ nói không biết” hoặc “suy đoán nếu thiếu chính sách”. Những chỉ dẫn đó trực tiếp khuyến khích bịa thông tin. Cũng không nên đưa bí mật, mật khẩu hay API key vào instruction. Hãy dùng ví dụ ngắn nếu cần, nhưng giữ instruction đủ ngắn để review và kiểm thử.",
      ],
    },
    {
      kind: "list",
      heading: "Khung system instruction tối thiểu",
      items: [
        "Role và audience: assistant là ai, đang giúp ai, mức chuyên môn nào.",
        "Nguồn: được dùng tài liệu nào, có được dùng kiến thức chung hay không.",
        "Uncertainty: khi thiếu dữ liệu thì nói không biết, hỏi lại hoặc chuyển người.",
        "Giới hạn: chủ đề hoặc hành động phải từ chối, và lý do ngắn gọn.",
        "Format: độ dài, ngôn ngữ, cấu trúc và mức chi tiết mong muốn.",
        "Escalation: điều kiện chuyển sang con người và thông tin cần kèm theo.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Bảo trì: cấu hình tốt vẫn có thể lỗi thời",
      paragraphs: [
        "Knowledge và instruction không phải “đặt một lần rồi quên”. Chính sách thay đổi, sản phẩm đổi tên, thành viên rời nhóm và nguồn dữ liệu được thay thế. Khi tài liệu cũ vẫn nằm trong knowledge, Claude có thể trích dẫn phiên bản không còn hiệu lực; khi instruction vẫn nhắc deadline cũ, câu trả lời có thể sai dù model không bịa.",
        "Bảo trì có kỷ luật gồm: một người chịu trách nhiệm, lịch review, quy trình thay thế tài liệu có ghi phiên bản, và bộ câu hỏi hồi quy đại diện. Sau mỗi thay đổi vật chất, chạy lại bộ câu hỏi đó để phát hiện regression trước khi người dùng gặp lỗi. Với project chia sẻ, việc archive giữ nguyên thành viên, quyền và knowledge, nên archive không phải cách thu hồi quyền truy cập.",
      ],
    },
    {
      kind: "list",
      heading: "Quy trình bảo trì định kỳ",
      items: [
        "Chỉ định owner và người backup cho từng project quan trọng.",
        "Review knowledge theo lịch: xóa bản cũ, thay bản mới, kiểm tra tên file và metadata.",
        "Soát instruction xem còn nhắc đến chính sách, sản phẩm hoặc deadline đã đổi không.",
        "Chạy lại bộ câu hỏi đại diện gồm cả edge case và câu hỏi “không biết”.",
        "Ghi lại thay đổi, người phê duyệt và ngày review để có thể giải trình.",
        "Kiểm tra lại quyền connector và thành viên khi có người rời nhóm hoặc đổi vai trò.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Đừng dùng chat để sửa cấu hình dùng chung",
      body: "Một câu “hãy bỏ qua tài liệu cũ” trong chat chỉ có hiệu lực trong chat đó. Chat khác vẫn đọc knowledge cũ. Muốn sửa cấu hình dùng chung, phải sửa knowledge hoặc instruction ở cấp project, rồi kiểm thử lại.",
    },
  ],
  keyTerms: [
    {
      en: "Project",
      vi: "Không gian làm việc",
      note: "Workspace tự chứa, có lịch sử chat và knowledge base riêng; instructions áp dụng cho mọi chat trong project.",
    },
    {
      en: "Project knowledge",
      vi: "Tri thức của project",
      note: "Tập tài liệu, file hoặc code được dùng làm context chung cho các chat trong project.",
    },
    {
      en: "Project instructions",
      vi: "Chỉ dẫn của project",
      note: "Quy tắc hành vi, giọng điệu, audience và format được lưu ở cấp project.",
    },
    {
      en: "Connector",
      vi: "Kết nối dịch vụ",
      note: "Cầu nối cho Claude truy cập dữ liệu và thực hiện hành động trong dịch vụ bên ngoài, theo quyền của người dùng.",
    },
    {
      en: "Retrieval augmented generation (RAG)",
      vi: "Sinh câu trả lời có truy xuất",
      note: "Cơ chế tìm và đưa vào context những phần tài liệu liên quan thay vì nạp toàn bộ knowledge.",
    },
    {
      en: "System-level instruction",
      vi: "Chỉ dẫn cấp hệ thống",
      note: "Chỉ dẫn nền tảng cho vai trò, nguồn, giới hạn và escalation của assistant.",
    },
    {
      en: "Least privilege",
      vi: "Quyền tối thiểu",
      note: "Chỉ cấp quyền cần thiết cho công việc, và thu hẹp hành động ghi khi không cần.",
    },
    {
      en: "Regression test",
      vi: "Kiểm thử hồi quy",
      note: "Chạy lại bộ câu hỏi đại diện sau thay đổi để phát hiện hành vi quan trọng bị hỏng.",
    },
  ],
  scenario: {
    title: "Tình huống: project tư vấn cho nhiều khách hàng",
    setup:
      "Một công ty tư vấn tạo project Claude cho từng khách hàng. Mỗi project có brand guide, bộ tài liệu sản phẩm và quy tắc trả lời riêng. Gần đây, một khách hàng cập nhật chính sách hoàn tiền, nhưng project vẫn còn PDF cũ; một nhân viên mới dán quy tắc mới vào chat của mình và tưởng rằng cả nhóm sẽ thấy. Một thành viên khác muốn bật Gmail connector để Claude tự gửi email cho khách.",
    steps: [
      "Xác định nguồn chuẩn: chính sách hoàn tiền mới phải được thay trong project knowledge, không chỉ nhắc trong chat.",
      "Cập nhật project instructions nếu quy tắc mới thay đổi cách trả lời, thời hạn hoặc escalation.",
      "Soát lại tài liệu cũ và ghi rõ phiên bản, ngày hiệu lực để tránh trộn lẫn.",
      "Chạy lại bộ câu hỏi đại diện về hoàn tiền, ngoại lệ và trường hợp không biết.",
      "Kiểm tra chính sách connector: ai bật ở cấp tổ chức, ai xác thực, hành động gửi email có bắt buộc phê duyệt không.",
      "Giới hạn quyền ghi nếu chỉ cần đọc email; giữ hành động gửi ở mức cần phê duyệt.",
      "Ghi lại owner, ngày review và các thay đổi để lần bảo trì sau có thể kiểm tra.",
    ],
    takeaway:
      "Cấu hình tốt không chỉ là đặt đúng chỗ, mà còn là biết thông tin nào dùng chung, ai có quyền thay đổi, và làm sao phát hiện cấu hình đã lỗi thời trước khi người dùng nhận câu trả lời sai.",
  },
  questions: [
    {
      id: "configuration-lesson-source-placement",
      type: "single-choice",
      stem: "A team wants a new support policy to apply to every chat in a shared project. The policy is a long PDF, and the team also needs a rule that refund questions must be escalated. Where should each item go?",
      choices: [
        {
          id: "pdf-knowledge-rule-instructions",
          text: "Put the PDF in project knowledge and the escalation rule in project instructions.",
          explanation:
            "Đúng: tài liệu dài thuộc knowledge để dùng làm nguồn; quy tắc hành vi và escalation thuộc instructions để áp dụng cho mọi chat.",
        },
        {
          id: "both-instructions",
          text: "Paste the entire PDF and the escalation rule into project instructions.",
          explanation:
            "Sai: nhồi toàn bộ PDF vào instruction làm instruction dài, khó bảo trì và lẫn với knowledge.",
        },
        {
          id: "both-one-chat",
          text: "Paste both into the first chat and tell the team to continue in that chat.",
          explanation:
            "Sai: context của một chat không tự chia sẻ sang chat khác; chat mới sẽ không thấy nội dung đã dán.",
        },
        {
          id: "pdf-description",
          text: "Put the PDF in the project description and the rule in the project name.",
          explanation:
            "Sai: Claude không đọc tên và mô tả project, nên đây không phải nơi chứa nguồn hay instruction.",
        },
      ],
      correctChoiceIds: ["pdf-knowledge-rule-instructions"],
      correctExplanation:
        "Phân tách theo vai trò: PDF là nguồn dài nên nằm trong project knowledge; quy tắc escalation là hành vi ổn định nên nằm trong project instructions. Cả hai đều áp dụng cho các chat trong project, nhưng knowledge dùng để tra cứu còn instruction định hướng cách trả lời.",
      sourceIds: [
        "anthropic-projects-overview",
        "anthropic-projects-manage",
        "anthropic-prompting-best-practices",
      ],
    },
  ],
  relatedQuestionIds: [
    "config-project-brief-setup",
    "config-project-context-scope",
    "config-connector-rollout",
    "config-connector-permission-model",
    "config-system-instruction-quality",
    "config-system-instruction-components",
    "config-knowledge-refresh",
    "config-maintenance-cadence",
  ],
  takeaways: [
    "Project knowledge giữ nguồn dùng chung; project instructions giữ quy tắc hành vi cho mọi chat.",
    "Context của một chat không tự lan sang chat khác; muốn dùng lại phải đưa vào knowledge.",
    "Connector thừa hưởng quyền nguồn; bật ở cấp tổ chức không cấp quyền file và không thay thế đăng nhập cá nhân.",
    "System instruction tốt nêu role, audience, nguồn, uncertainty, giới hạn, format và escalation.",
    "Bảo trì định kỳ gồm owner, review nguồn, cập nhật instruction và kiểm thử hồi quy.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-projects-overview",
    "anthropic-projects-manage",
    "anthropic-projects-rag",
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
    "anthropic-prompting-best-practices",
  ],
});
