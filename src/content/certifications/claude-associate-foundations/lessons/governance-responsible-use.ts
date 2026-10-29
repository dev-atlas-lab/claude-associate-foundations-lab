import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all four verified Domain 6 objectives.
 * It teaches use-case triage, data sensitivity, organizational governance, and
 * ethical judgment from Anthropic's published policies and Constitution. It is
 * explicit that this is review guidance, not legal advice, and that an
 * organization's own policy can be stricter than the provider's policy.
 */
export const governanceResponsibleUseLesson: Lesson = lessonSchema.parse({
  id: "governance-responsible-use",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 7,
  kind: "curriculum",
  contentStatus: "published",
  title: "Quản trị và sử dụng có trách nhiệm: use case, dữ liệu và con người",
  englishTitle: "Governance and responsible use: use cases, data, and human accountability",
  summary:
    "Học cách đánh giá một use case có phù hợp hay không, phân loại dữ liệu trước khi đưa vào Claude, áp dụng chính sách và quy trình phê duyệt của tổ chức, và giữ con người chịu trách nhiệm ở các quyết định quan trọng. Bài dạy nguyên tắc rà soát, không phải tư vấn pháp lý.",
  level: "foundation",
  estimatedMinutes: 22,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Nội dung được đối chiếu với Usage Policy, Privacy Policy, Claude's Constitution, tài liệu reduce hallucinations, connector Help Center và evaluation guidance (truy cập 27/10/2026). Bốn objective lấy từ Exam Guide v1.0. Đây là nguyên tắc quản trị và rà soát, không phải tư vấn pháp lý; chính sách của tổ chức và luật áp dụng có thể yêu cầu cao hơn.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-usage-policy",
      "anthropic-privacy-policy",
      "anthropic-claude-constitution",
      "anthropic-reduce-hallucinations-doc",
      "anthropic-evaluation-docs",
      "anthropic-connectors-help",
      "anthropic-google-workspace-connectors",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "governance-use-case-fit",
      "governance-data-privacy",
      "governance-policies",
      "governance-ethics",
    ],
    note: "Bài học được viết cho cả bốn objective đã xác minh của Domain 6 trong Exam Guide v1.0. Mapping xác nhận phạm vi bài học, không phải tuyên bố rằng mọi yêu cầu pháp lý hoặc chính sách cụ thể đã được bao phủ.",
  },
  objectives: [
    "Phân loại use case phù hợp, cần kiểm soát cao, hoặc không nên dùng Claude.",
    "Áp dụng phân loại dữ liệu, tối thiểu hóa và kiểm tra quyền trước khi đưa dữ liệu vào Claude.",
    "Liên kết use case với chính sách tổ chức, phê duyệt, logging, escalation và review định kỳ.",
    "Nhận diện các câu hỏi đạo đức về minh bạch, công bằng, trách nhiệm con người và tác động đến người khác.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Quản trị bắt đầu từ quyết định, không từ công cụ",
      paragraphs: [
        "Câu hỏi quản trị không phải “Claude có làm được việc này không?” mà là “Chúng ta có nên dùng AI cho quyết định này, với dữ liệu này, theo chính sách nào, và ai chịu trách nhiệm?”. Anthropic nêu rằng Usage Policy áp dụng cho bất kỳ ai gửi input vào sản phẩm hoặc dịch vụ của Anthropic, và người xây dựng hoặc triển khai agent phải bảo đảm chúng tuân thủ chính sách. Đây là trách nhiệm của tổ chức triển khai, không chỉ của nhà cung cấp.",
        "Vì vậy, hãy xem việc đánh giá use case là một bước thiết kế, không phải thủ tục sau khi đã chọn xong. Nếu use case không phù hợp, đổi prompt hoặc model không sửa được vấn đề.",
      ],
    },
    {
      kind: "list",
      heading: "Bốn câu hỏi trước khi dùng Claude",
      items: [
        "Use case: ai bị ảnh hưởng, quyết định nào được đưa ra, hậu quả nếu sai là gì, và có cần con người phê duyệt không.",
        "Dữ liệu: dữ liệu thuộc mức nhạy cảm nào, có quyền sử dụng không, có thể giảm thiểu hoặc che bớt không, và retention/training settings ra sao.",
        "Chính sách: tổ chức có cho phép use case này không, cần phê duyệt của ai, có yêu cầu logging, disclosure hoặc human review không.",
        "Đạo đức: việc dùng AI có minh bạch không, có đối xử công bằng không, có làm suy yếu trách nhiệm con người hoặc gây hại không.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Use case phù hợp và high-risk",
      paragraphs: [
        "Một use case phù hợp thường có mục tiêu rõ, đầu vào và đầu ra kiểm tra được, người chịu trách nhiệm xác định, và cơ chế review tương xứng với hậu quả. Các use case như tóm tắt tài liệu nội bộ, soạn bản nháp, brainstorm hoặc trích xuất dữ liệu từ tài liệu đã được phê duyệt thường dễ kiểm soát hơn quyết định về con người hoặc quyền lợi.",
        "Anthropic liệt kê các lĩnh vực high-risk gồm legal, medical, finance, credit, insurance, housing, employment, education, healthcare access, public benefits và legal status decisions. Với high-risk use, Usage Policy yêu cầu một qualified human in the loop, disclosure rằng AI được sử dụng, và independent safety limits cho các hành động vật lý. Consumer-facing chatbot cũng phải nói rõ người dùng đang tương tác với AI.",
        "High-risk không có nghĩa là cấm tuyệt đối. Nó có nghĩa là cần kiểm soát mạnh hơn: phê duyệt, human review, giải thích, khả năng khiếu nại hoặc sửa sai, giám sát và bằng chứng. Chính sách của tổ chức có thể cấm một số use case ngay cả khi nhà cung cấp cho phép.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "High-risk cần thiết kế, không chỉ disclaimer",
      body: "Một dòng “kết quả do AI tạo” không thay thế human review ở quyết định về tín dụng, tuyển dụng, bảo hiểm, y tế hoặc pháp lý. Cần xác định ai có thẩm quyền review, bằng chứng nào được kiểm tra, ai chịu trách nhiệm và người bị ảnh hưởng có cách nào phản hồi hoặc sửa sai.",
    },
    {
      kind: "diagram",
      heading: "Mô phỏng trực quan: Phòng vệ Injection, Jailbreak & Trách nhiệm giải trình",
      diagramId: "safety-guardrails-simulator",
      intro: "Trực quan hóa và thử nghiệm cơ chế phòng vệ 3 lớp của Anthropic: phân tách dữ liệu người dùng không tin cậy bằng thẻ XML, ngăn chặn Prompt Injection / Role Hijacking, và duy trì Human-in-the-loop checkpoint.",
    },
    {
      kind: "paragraphs",
      heading: "Dữ liệu: phân loại, tối thiểu hóa, quyền truy cập",
      paragraphs: [
        "Privacy Policy của Anthropic mô tả việc thu thập input và output, bao gồm nội dung được tải lên hoặc truy xuất qua dịch vụ được kết nối. Người dùng chịu trách nhiệm có quyền và sự cho phép cần thiết trước khi tải nội dung lên hoặc cấp quyền truy cập dịch vụ bên thứ ba. Input và output có thể được dùng để huấn luyện và cải thiện model trừ khi người dùng chọn không tham gia, với một số trường hợp ngoại lệ như safety review. Các tích hợp bên thứ ba xử lý dữ liệu theo chính sách riêng của họ.",
        "Vì vậy, đừng bắt đầu bằng việc dán toàn bộ tài liệu. Hãy phân loại dữ liệu, xác định mục đích tối thiểu, che hoặc bỏ phần không cần thiết, chọn tài khoản và workspace được phê duyệt, và kiểm tra quyền của connector. Connector thừa hưởng quyền của người dùng trong dịch vụ nguồn; Owner có thể hạn chế hành động như cho đọc nhưng chặn ghi, nhưng hạn chế không bao giờ cấp quyền nhiều hơn hệ thống nguồn cho phép.",
      ],
    },
    {
      kind: "list",
      heading: "Checklist trước khi đưa dữ liệu vào Claude",
      items: [
        "Phân loại: dữ liệu công khai, nội bộ, bí mật, hay chứa dữ liệu cá nhân hoặc thông tin nhạy cảm.",
        "Mục đích: phần nào thực sự cần cho task; phần nào có thể bỏ, che hoặc thay bằng dữ liệu tổng hợp.",
        "Quyền: tổ chức và khách hàng có cho phép dùng dữ liệu này cho mục đích đó không.",
        "Môi trường: tài khoản, workspace hoặc project nào được phê duyệt; connector nào được phép truy cập.",
        "Retention và training: cài đặt nào đang áp dụng; có yêu cầu xóa hoặc giới hạn lưu trữ không.",
        "Phục hồi: nếu dữ liệu bị lộ hoặc dùng sai, ai cần được thông báo và quy trình xử lý là gì.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Xóa chat không phải xóa mọi bản sao",
      body: "Privacy Policy nói rằng xóa hội thoại loại bỏ nó khỏi history ngay lập tức và khỏi hệ thống back-end trong một khoảng thời gian được nêu. Điều đó không có nghĩa là mọi bản sao ở hệ thống khác, bản backup hoặc dịch vụ bên thứ ba biến mất ngay. Hãy kiểm tra chính sách lưu trữ và quy trình của tổ chức trước khi giả định dữ liệu đã bị xóa hoàn toàn.",
    },
    {
      kind: "paragraphs",
      heading: "Chính sách và quản trị vận hành",
      paragraphs: [
        "Chính sách của nhà cung cấp là mức tối thiểu, không thay thế chính sách của tổ chức. Một quy trình quản trị làm việc được thường có: phân loại use case, người phê duyệt, đánh giá rủi ro, yêu cầu human review, disclosure, logging, escalation, đào tạo người dùng và review định kỳ khi chính sách hoặc sản phẩm thay đổi. Anthropic cũng nêu rằng chính sách và sản phẩm có thể thay đổi; tổ chức cần theo dõi và cập nhật hướng dẫn.",
        "Đừng để người dùng tự phê duyệt ngoại lệ hoặc bỏ qua audit trail vì “AI chỉ hỗ trợ”. Nếu quyết định quan trọng, cần biết ai đã review, dựa trên bằng chứng nào, và có gì thay đổi so với quy trình cũ. Với dữ liệu và connector, hãy kiểm tra permission model và action restriction thay vì giả định rằng kết nối là an toàn.",
      ],
    },
    {
      kind: "list",
      heading: "Mẫu rà soát một use case",
      items: [
        "Mục đích và lợi ích dự kiến, cùng chỉ số đo được nếu thành công.",
        "Người bị ảnh hưởng, mức độ tổn hại nếu sai, và khả năng sửa sai hoặc khiếu nại.",
        "Dữ liệu đầu vào, mức nhạy cảm, quyền sử dụng và cách giảm thiểu.",
        "Mức độ tự động: chỉ gợi ý, con người phê duyệt, hay tự động có giám sát.",
        "Yêu cầu disclosure, human review, logging và escalation.",
        "Người phê duyệt, ngày review tiếp theo, và điều kiện dừng.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Đạo đức: minh bạch, công bằng, trách nhiệm",
      paragraphs: [
        "Claude's Constitution nêu các định hướng như unbiased và even-handed với chủ đề chính trị, xã hội; trình bày multiple perspectives; dùng neutral terminology; tránh selective emphasis và deceptive framing; hỗ trợ đối xử công bằng; không tạo điều kiện cho phân biệt đối xử bất hợp pháp dựa trên protected characteristics; và không làm suy yếu human oversight. Đây là nền tảng cho các câu hỏi đạo đức, không phải một quy trình đánh giá công bằng toàn diện.",
        "Trong thực tế, hãy hỏi: người bị ảnh hưởng có biết AI được dùng không? Họ có cơ hội phản hồi không? Output có đang áp đặt tiêu chuẩn khác nhau cho các nhóm tương tự không? Có ai chịu trách nhiệm cuối không? Nếu câu trả lời là “không” hoặc “không rõ”, đó là tín hiệu cần dừng và thiết kế lại.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Đây là nguyên tắc, không phải tư vấn pháp lý",
      body: "Bài học này giúp bạn đặt câu hỏi và thiết kế kiểm soát. Nó không xác định nghĩa vụ pháp lý cụ thể của tổ chức bạn. Với dữ liệu cá nhân, tín dụng, y tế, tuyển dụng hoặc báo cáo tài chính, hãy tham vấn bộ phận pháp chế, bảo mật và compliance, đồng thời kiểm tra luật áp dụng tại địa phương.",
    },
  ],
  keyTerms: [
    {
      en: "Use-case fit",
      vi: "Use-case fit (đánh giá mức độ phù hợp bài toán)",
      note: "Phân tích tương quan giữa giá trị mang lại và rủi ro tiềm ẩn, cân nhắc quyền lợi của người chịu ảnh hưởng trước khi áp dụng AI.",
    },
    {
      en: "High-risk use",
      vi: "High-risk use case (tình huống rủi ro cao)",
      note: "Các lĩnh vực có hậu quả pháp lý hoặc tác động nghiêm trọng đến con người như tài chính, tín dụng, y tế, tuyển dụng và thẩm định pháp lý.",
    },
    {
      en: "Human in the loop",
      vi: "Human-in-the-loop (con người tham gia kiểm soát)",
      note: "Quy trình thiết kế bắt buộc phải có chuyên gia con người thẩm định, can thiệp hoặc phê duyệt trước khi kích hoạt hành động nhạy cảm.",
    },
    {
      en: "Data minimization",
      vi: "Data minimization (nguyên tắc dữ liệu tối thiểu)",
      note: "Chỉ nạp vào prompt hoặc Project đúng phần dữ liệu thực sự cần thiết; tuyệt đối không đưa thông tin nhạy cảm/PII thừa thãi.",
    },
    {
      en: "Retention",
      vi: "Data retention (chính sách lưu trữ dữ liệu)",
      note: "Quy định rõ ràng về thời hạn và vị trí lưu trữ dữ liệu sau khi gửi đi hoặc xử lý xong, đảm bảo tuân thủ quyền riêng tư.",
    },
    {
      en: "Disclosure",
      vi: "AI Disclosure (công khai minh bạch việc dùng AI)",
      note: "Thông báo rõ ràng cho người dùng biết họ đang trò chuyện với trợ lý AI hoặc nội dung họ đang xem được tạo ra có sự trợ giúp của AI.",
    },
    {
      en: "Accountability",
      vi: "Accountability (trách nhiệm giải trình)",
      note: "Xác định rõ ràng cá nhân hoặc tổ chức chịu trách nhiệm pháp lý cuối cùng cho kết quả đầu ra và quyết định từ hệ thống AI.",
    },
    {
      en: "Governance",
      vi: "AI Governance (quản trị AI và tuân thủ)",
      note: "Hệ thống chính sách nội bộ, quy trình phê duyệt, ghi nhật ký (logging), cơ chế khiếu nại (escalation) và đánh giá định kỳ.",
    },
  ],
  scenario: {
    title: "Tình huống: trợ lý chăm sóc khách hàng có quyền hoàn tiền",
    setup:
      "Một công ty muốn dùng Claude làm trợ lý chăm sóc khách hàng. Trợ lý có thể đọc lịch sử mua hàng, trả lời câu hỏi, đề xuất hoàn tiền và thay đổi địa chỉ giao hàng. Công ty muốn giảm thời gian phản hồi nhưng chưa có chính sách rõ về dữ liệu, quyền hành động và escalation.",
    steps: [
      "Phân loại use case: tư vấn thông thường ít rủi ro; hoàn tiền và thay đổi địa chỉ có tác động tài chính và quyền riêng tư nên cần kiểm soát cao hơn.",
      "Xác định dữ liệu cần thiết: chỉ lấy thông tin đơn hàng liên quan, không đưa toàn bộ hồ sơ khách hàng vào context.",
      "Kiểm tra chính sách: ai được phê duyệt hoàn tiền, hạn mức nào, trường hợp nào phải chuyển người, và cần log gì.",
      "Thiết kế quyền hành động: cho phép đọc và soạn phản hồi; yêu cầu con người phê duyệt trước khi hoàn tiền hoặc đổi địa chỉ.",
      "Thêm disclosure rằng người dùng đang tương tác với AI, cùng lối thoát sang nhân viên thật.",
      "Kiểm tra connector và quyền truy cập; giới hạn hành động ghi nếu chưa cần thiết.",
      "Đo tỷ lệ trả lời đúng, thời gian xử lý, số lần escalation và sự cố; review định kỳ.",
      "Trình bày cho stakeholder: lợi ích đã đo, giới hạn, human review và điều kiện mở rộng quyền tự động.",
    ],
    takeaway:
      "Một trợ lý hữu ích không cần có mọi quyền. Thiết kế tốt tách phần tư vấn khỏi phần hành động, giới hạn dữ liệu, yêu cầu con người phê duyệt ở bước có hậu quả, và giữ khả năng giải thích khi có sự cố.",
  },
  questions: [
    {
      id: "governance-lesson-assistant-actions",
      type: "single-choice",
      stem: "A team proposes a customer-facing Claude assistant that can issue refunds and change account details. Which design is most responsible?",
      choices: [
        {
          id: "limit-actions-and-review",
          text: "Let Claude read and draft responses, require human approval for refunds and account changes, disclose the AI interaction, and log actions.",
          explanation:
            "Đúng: tách tư vấn khỏi hành động có hậu quả, thêm human approval, disclosure và logging là thiết kế kiểm soát phù hợp.",
        },
        {
          id: "allow-all-actions",
          text: "Allow every action so customers get faster service.",
          explanation:
            "Sai: hoàn tiền và thay đổi tài khoản có hậu quả tài chính và quyền riêng tư; không nên tự động không kiểm soát.",
        },
        {
          id: "hide-ai-disclosure",
          text: "Hide the AI disclosure to make the assistant feel more human.",
          explanation:
            "Sai: che giấu việc dùng AI làm giảm minh bạch và có thể gây hiểu nhầm cho người dùng.",
        },
        {
          id: "remove-human-review",
          text: "Remove human review because the model is consistent.",
          explanation:
            "Sai: tính nhất quán không thay thế trách nhiệm con người ở hành động có hậu quả lớn.",
        },
      ],
      correctChoiceIds: ["limit-actions-and-review"],
      correctExplanation:
        "Thiết kế có trách nhiệm tách phần tư vấn khỏi phần hành động. Cho Claude đọc và soạn phản hồi là phạm vi tương đối an toàn; hoàn tiền và thay đổi tài khoản cần con người phê duyệt, disclosure và logging. Usage Policy nhấn mạnh human in the loop và minh bạch; Claude's Constitution nhấn mạnh không làm suy yếu human oversight.",
      sourceIds: [
        "anthropic-usage-policy",
        "anthropic-claude-constitution",
        "anthropic-connectors-help",
      ],
    },
  ],
  relatedQuestionIds: [
    "governance-human-oversight",
    "governance-customer-assistant-safeguards",
    "governance-privacy-confidential-upload",
    "governance-privacy-controls",
    "governance-privacy-third-party-connector",
    "governance-policy-hiring-screening",
    "governance-policy-operations",
    "governance-policy-exception-escalation",
    "governance-use-case-triage",
    "governance-ethics-considerations",
  ],
  takeaways: [
    "Quản trị bắt đầu bằng use case, dữ liệu, chính sách và trách nhiệm con người, không bằng việc chọn model.",
    "High-risk use không bị cấm tuyệt đối nhưng cần qualified human review, disclosure và kiểm soát mạnh hơn; chính sách tổ chức có thể nghiêm hơn.",
    "Phân loại và tối thiểu hóa dữ liệu, kiểm tra quyền connector, retention và training settings trước khi đưa dữ liệu vào Claude.",
    "Chính sách nhà cung cấp là mức tối thiểu; tổ chức cần phê duyệt, logging, escalation, đào tạo và review định kỳ.",
    "Đạo đức gồm minh bạch, đối xử công bằng, bằng chứng có thể review và không làm suy yếu trách nhiệm con người.",
    "Bài học là nguyên tắc rà soát, không phải tư vấn pháp lý; với dữ liệu nhạy cảm, hãy tham vấn pháp chế và compliance.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-usage-policy",
    "anthropic-privacy-policy",
    "anthropic-claude-constitution",
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ],
});
