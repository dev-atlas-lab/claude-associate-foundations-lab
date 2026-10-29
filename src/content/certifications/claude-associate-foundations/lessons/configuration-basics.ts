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
        "Anthropic mô tả project là một workspace tự chứa, có lịch sử chat và knowledge base riêng. Tài liệu trong project knowledge được dùng làm context cho các chat trong project, còn project instructions được lưu một lần và áp dụng cho mọi chat. Điểm quan trọng: một chat mới không tự nhận toàn bộ transcript của chat khác; project memory có thể giữ lại một số thông tin, nhưng knowledge và instructions mới là cấu hình dùng chung đáng tin cậy (Anthropic, “What are projects?”; “How can I create and manage projects?”).",
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
        "Knowledge base phù hợp với tài liệu ổn định và được tái sử dụng: brand guide, product brief, chính sách đã được phê duyệt, hoặc bộ câu hỏi thường gặp. Khi tài liệu nằm trong knowledge, chat mới trong project có thể dùng lại mà không cần dán lại. Ngược lại, một quyết định chỉ xuất hiện trong chat cũ có thể được project memory ghi nhớ, nhưng không bảo đảm; muốn chắc chắn chat mới dùng được, hãy đưa vào knowledge hoặc instructions.",
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
      heading: "Project instructions: Định hình hành vi, không phải nơi lưu trữ tài liệu",
      paragraphs: [
        "Project instructions cần quy định rõ những chuẩn mực vận hành dài hạn: trợ lý AI đóng vai trò gì, phục vụ nhóm người dùng nào, được phép khai thác nguồn tài liệu nào, các trường hợp bắt buộc phải từ chối hoặc chuyển tiếp chuyên viên con người (human escalation), và cấu trúc định dạng chuẩn cho đầu ra. Hướng dẫn prompting của Anthropic nhấn mạnh rằng chỉ dẫn càng tường minh, có ngữ cảnh và kèm ví dụ cụ thể thì hành vi của Claude càng đạt tính nhất quán cao (Anthropic, “Prompting best practices”).",
        "Tránh dán toàn bộ văn bản chính sách hay tài liệu nghiệp vụ vào phần instruction. Tài liệu tham chiếu dung lượng lớn thuộc về Project Knowledge; Project Instructions chỉ nên lưu giữ quy tắc hành vi và chuẩn mực xử lý cốt lõi. Sự phân tách này giúp đội ngũ dễ dàng kiểm thử, bảo trì và cập nhật từng thành phần mà không làm xáo trộn toàn bộ cấu hình hệ thống.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Chỉ dẫn dài dòng không đồng nghĩa với hiệu quả",
      body: "Việc nhồi nhét quá nhiều quy tắc vào instruction, đặc biệt khi các quy tắc có sự chồng chéo hoặc mâu thuẫn ngầm định, có thể khiến Claude bị nhiễu và bỏ sót các ràng buộc trọng yếu. Hãy giữ instruction súc tích, phân cấp thứ tự ưu tiên rõ ràng bằng thẻ XML, và luôn chạy đánh giá lại với bộ câu hỏi test case đại diện sau mỗi lần cập nhật.",
    },
    {
      kind: "paragraphs",
      heading: "Connectors: Quyền truy cập nguồn, quản trị tổ chức và kiểm soát hành động",
      paragraphs: [
        "Connectors cho phép Claude tích hợp trực tiếp vào các ứng dụng doanh nghiệp bên ngoài để đọc dữ liệu và hỗ trợ thực thi tác vụ. Claude tuân thủ nghiêm ngặt cơ chế kế thừa quyền của từng tài khoản người dùng từ hệ thống gốc: nếu một nhân sự không có quyền xem một file, thư mục hoặc bản ghi cụ thể trên hệ thống nguồn, Claude qua connector cũng tuyệt đối không thể truy cập nội dung đó (Anthropic, “Use connectors to extend Claude's capabilities”).",
        "Trên các gói Team và Enterprise, Quản trị viên (Owner / Primary Owner) phải kích hoạt connector ở cấp độ toàn tổ chức, nhưng từng cá nhân vẫn bắt buộc phải tự đăng nhập và xác thực (OAuth). Việc bật connector không tự động cấp thêm quyền đọc file hay thay thế cơ chế bảo mật cá nhân. Quan trọng hơn, Quản trị viên có thể thiết lập chính sách giới hạn hành động (ví dụ: cho phép đọc email nhưng chặn quyền gửi); các chính sách này hoạt động theo nguyên tắc đặc quyền tối thiểu (least privilege), chỉ có thể thu hẹp chứ không bao giờ mở rộng quyền so với quyền hạn trên hệ thống gốc.",
        "Đối với Google Workspace (Gmail, Calendar, Drive), mặc định hệ thống luôn yêu cầu xác nhận phê duyệt từ con người (human confirmation) trước khi thực thi các hành động ghi nhạy cảm như gửi email, chia sẻ, di chuyển hoặc xóa tệp. Dữ liệu truy vấn qua connector được gắn liền với phiên chat và sẽ bị xóa hoàn toàn khi xóa chat. Anthropic cam kết không sử dụng dữ liệu doanh nghiệp từ connector để huấn luyện model (Anthropic, “Use Google Workspace connectors”).",
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
      body: "Một câu “hãy bỏ qua tài liệu cũ” trong chat không phải cách sửa cấu hình dùng chung. Project memory có thể giữ lại câu đó, nhưng không bảo đảm và không thay thế knowledge/instructions; chat khác vẫn có thể đọc knowledge cũ. Muốn sửa cấu hình dùng chung, phải sửa knowledge hoặc instruction ở cấp project, rồi kiểm thử lại.",
    },
  ],
  keyTerms: [
    {
      en: "Project",
      vi: "Claude Projects (không gian làm việc dự án)",
      note: "Workspace chuyên biệt của Claude chứa lịch sử hội thoại, bộ tài liệu tham chiếu và hướng dẫn áp dụng chung cho mọi thành viên trong dự án.",
    },
    {
      en: "Project knowledge",
      vi: "Project knowledge (kho tài liệu tri thức dự án)",
      note: "Tập hợp file tài liệu, dữ liệu hoặc code được đưa vào Project làm nguồn ngữ cảnh nền tảng cho Claude tra cứu.",
    },
    {
      en: "Project instructions",
      vi: "Project instructions (bộ quy tắc / chỉ dẫn dự án)",
      note: "Các chỉ dẫn về vai trò, văn phong, quy tắc bắt buộc và định dạng đầu ra được cấu hình ở cấp độ Project.",
    },
    {
      en: "Connector",
      vi: "Connector (bộ kết nối dịch vụ ngoài)",
      note: "Cầu nối tích hợp cho phép Claude truy xuất dữ liệu hoặc kích hoạt thao tác trên các ứng dụng bên thứ ba theo quyền hạn người dùng.",
    },
    {
      en: "Retrieval augmented generation (RAG)",
      vi: "RAG (Retrieval-Augmented Generation / sinh văn bản kèm truy xuất)",
      note: "Kỹ thuật tự động tìm kiếm và nạp các đoạn thông tin liên quan nhất từ kho tài liệu lớn vào context window thay vì gửi toàn bộ tài liệu cùng lúc.",
    },
    {
      en: "System-level instruction",
      vi: "System-level instruction (chỉ dẫn cấp hệ thống)",
      note: "Chỉ dẫn nền tảng đóng vai trò làm khung xương sống định hình mục tiêu, phạm vi dữ liệu và cơ chế chuyển tiếp (escalation) của trợ lý AI.",
    },
    {
      en: "Least privilege",
      vi: "Least privilege (nguyên tắc đặc quyền tối thiểu)",
      note: "Nguyên tắc bảo mật chỉ cấp đúng và đủ quyền đọc/ghi cần thiết cho tác vụ; hạn chế tối đa các quyền can thiệp dữ liệu nguy hiểm.",
    },
    {
      en: "Regression test",
      vi: "Regression test (kiểm thử hồi quy)",
      note: "Quy trình chạy lại bộ câu hỏi tiêu chuẩn sau mỗi lần cập nhật cấu hình hoặc tài liệu để đảm bảo không làm phát sinh lỗi mới.",
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
            "Sai: dán vào một chat không tạo cấu hình dùng chung. Project memory có thể giữ một số thông tin nhưng không bảo đảm; chat mới có thể không thấy đủ nội dung đã dán.",
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
    "configuration-project-permission-revocation",
  ],
  takeaways: [
    "Project knowledge giữ nguồn dùng chung; project instructions giữ quy tắc hành vi cho mọi chat.",
    "Một chat mới không tự nhận toàn bộ transcript; project memory không thay thế knowledge và instructions dùng chung.",
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
