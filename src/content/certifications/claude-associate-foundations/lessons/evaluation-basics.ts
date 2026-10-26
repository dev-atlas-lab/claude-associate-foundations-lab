import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * The first exam-mapped curriculum lesson. It teaches the six verified Domain 2
 * objectives and connects them to the reviewed practice bank. Technical claims
 * are limited to what the cited Anthropic sources actually support; bias is
 * treated as a framing/equal-treatment review lens, not as a complete fairness
 * audit.
 */
export const evaluationBasicsLesson: Lesson = lessonSchema.parse({
  id: "evaluation-basics",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 2,
  kind: "curriculum",
  contentStatus: "published",
  title: "Đánh giá output: accuracy, evidence và human review",
  englishTitle: "Evaluating outputs: accuracy, evidence, and human review",
  summary:
    "Học cách kiểm tra output của Claude bằng bằng chứng: phân biệt accuracy với completeness, nhận diện hallucination và bias, fact-check từng claim, quyết định khi nào cần human review, rồi edit và chọn format phù hợp.",
  level: "foundation",
  estimatedMinutes: 18,
  verification: {
    status: "verified",
    checkedAt: "2026-10-26",
    note: "Nội dung kỹ thuật được đối chiếu với tài liệu Anthropic về reduce hallucinations, evaluation criteria, prompting, structured outputs, artifacts và Claude's Constitution (truy cập 26/10/2026). Sáu objective lấy từ Exam Guide v1.0. Phần bias chỉ ở mức framing và equal treatment mà nguồn hiện có hỗ trợ; đây không phải fairness audit đầy đủ và không phải tuyên bố về kết quả đánh giá model.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-reduce-hallucinations-doc",
      "anthropic-evaluation-docs",
      "anthropic-prompting-best-practices",
      "anthropic-structured-outputs-doc",
      "anthropic-artifacts-doc",
      "anthropic-claude-constitution",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "output-evaluate-accuracy",
      "output-identify-hallucinations",
      "output-fact-check",
      "output-human-review",
      "output-edit-adapt",
      "output-format-selection",
    ],
    note: "Bài học được viết cho cả sáu objective đã xác minh của Domain 2 trong Exam Guide v1.0. Mapping này xác nhận phạm vi bài học, không phải tuyên bố rằng Domain 2 đã được bao phủ đầy đủ như một kỳ thi thu nhỏ. Bias được dạy ở mức framing/equal treatment, dựa trên Claude's Constitution; chưa có nguồn đánh giá fairness chuyên sâu nào được dùng.",
  },
  objectives: [
    "Đánh giá output theo accuracy, completeness và relevance thay vì chỉ theo độ trôi chảy.",
    "Nhận diện hallucination, inconsistency và các dấu hiệu bias/framing thiên lệch.",
    "Fact-check từng claim bằng quote hoặc nguồn cụ thể, và rút lại claim không có bằng chứng.",
    "Quyết định khi nào cần human review hoặc additional verification.",
    "Edit, adapt và so sánh các output cho đúng audience mà không làm thay đổi sự thật.",
    "Chọn format phù hợp: câu trả lời inline, structured data hay artifact/tài liệu dài.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Output trôi chảy chưa chắc đã đúng",
      paragraphs: [
        "Một output dễ đọc, tự tin và có cấu trúc đẹp vẫn có thể sai. Anthropic định nghĩa hallucination là văn bản factually incorrect hoặc inconsistent với context được cung cấp (Anthropic, “Reduce hallucinations”). Vì vậy bước đầu tiên không phải là hỏi “câu này nghe có ổn không?”, mà là hỏi “claim nào đang được đưa ra, và bằng chứng nào hỗ trợ claim đó?”.",
        "Đánh giá output là một bài kiểm tra có chủ đích: xác định yêu cầu, tách các claim có thể kiểm chứng, đối chiếu với nguồn, rồi mới đánh giá cách trình bày. Anthropic xem task fidelity, relevance/coherence, tone/style, context utilization và các tiêu chí khác là những chiều đánh giá riêng; một output có thể đúng facts nhưng vẫn thiếu thông tin hoặc không phù hợp audience (Anthropic, “Define success criteria and build evaluations”).",
      ],
    },
    {
      kind: "list",
      heading: "Ba câu hỏi trước khi tin một output",
      items: [
        "Accuracy: claim hoặc con số này có khớp với nguồn đáng tin cậy không?",
        "Completeness: các phần, ràng buộc, edge case và thông tin bắt buộc đã có đủ chưa?",
        "Relevance: output có trả lời đúng câu hỏi và đúng mục đích của người dùng không, hay chỉ là nội dung nghe có vẻ liên quan?",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Đừng biến “nhất quán” thành “đúng”",
      body: "Hai câu trả lời giống nhau có thể cùng sai. Anthropic ghi rõ rằng Best-of-N, iterative refinement và kiểm tra chéo có thể phát hiện inconsistency nhưng không loại bỏ hallucination; critical information vẫn phải được validate. Hãy dùng nhất quán như một tín hiệu điều tra, không phải bằng chứng cuối cùng.",
    },
    {
      kind: "paragraphs",
      heading: "Hallucination, inconsistency và bias khác nhau thế nào?",
      paragraphs: [
        "Hallucination là claim bịa đặt hoặc trái với nguồn. Inconsistency là hai phần trong cùng output, hoặc hai lần chạy, mâu thuẫn nhau. Bias trong bài này là cách output chọn lọc, đóng khung hoặc đối xử không công bằng giữa các bên — không chỉ là một sắc thái cảm xúc. Ba lỗi này cần cách sửa khác nhau: thay claim sai bằng nguồn đúng, làm rõ chỗ mâu thuẫn, hoặc cân bằng lại evidence và tiêu chuẩn đánh giá.",
        "Claude's Constitution nói Anthropic muốn Claude unbiased và even-handed, trình bày balanced information, đại diện nhiều góc nhìn và dùng neutral terminology khi chủ đề có tranh luận. Tài liệu cũng yêu cầu tránh selective emphasis và deceptive framing, đồng thời đối xử equal and fair với mọi người. Đây là cơ sở để nhận diện một số dấu hiệu bias trong output, nhưng không thay thế một quy trình fairness evaluation đầy đủ.",
      ],
    },
    {
      kind: "list",
      heading: "Bias review nhanh: nhìn vào lựa chọn và tiêu chuẩn",
      items: [
        "Evidence selection: output chỉ có bằng chứng ủng hộ một phía và bỏ qua dữ liệu trái chiều có liên quan?",
        "Framing: các bên được gọi bằng nhãn trung tính hay bằng từ mang tính đánh giá, trong khi hành vi giống nhau?",
        "Equal treatment: hai người hoặc hai nhóm có cùng bằng chứng nhưng bị áp tiêu chuẩn, giọng điệu hoặc kết luận khác nhau?",
        "Protected characteristics: có suy luận về năng lực, thái độ hoặc độ tin cậy từ tuổi tác, giới tính, sức khỏe hay đặc điểm được bảo vệ khác không?",
        "Limitation: nếu không có đủ dữ liệu để kết luận công bằng, hãy ghi rõ giới hạn thay vì biến một góc nhìn thành kết luận chắc chắn.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Fact-check là một quy trình, không phải một lần đọc",
      paragraphs: [
        "Anthropic khuyến nghị biến câu trả lời thành thứ có thể audit: yêu cầu quote trực tiếp, gắn mỗi claim với nguồn, và nếu không tìm thấy quote hỗ trợ thì phải retract claim đó. Với tài liệu dài, hãy trích quote trước rồi mới phân tích; với claim quan trọng, hãy kiểm tra lại sau khi draft (Anthropic, “Reduce hallucinations”).",
        "Fact-check tốt không dừng ở việc “có citation”. Citation phải thật sự tồn tại, nói đúng điều được claim, và không bị cắt khỏi ngữ cảnh. Nếu nguồn mâu thuẫn hoặc đã lỗi thời, hãy đánh dấu là chưa giải quyết thay vì chọn nguồn thuận tiện nhất.",
      ],
    },
    {
      kind: "list",
      heading: "Quy trình kiểm chứng từng claim",
      items: [
        "Tách output thành các claim kiểm chứng được: số liệu, ngày tháng, trích dẫn, quan hệ nhân quả và khuyến nghị.",
        "Xác định nguồn gốc: tài liệu người dùng cung cấp, nguồn chính thức, hay kiến thức chung của model?",
        "Tìm đoạn nguồn cụ thể và quote nguyên văn; kiểm tra cả đơn vị, phạm vi thời gian và điều kiện áp dụng.",
        "Nếu không có quote hỗ trợ, sửa claim, hạ mức chắc chắn hoặc xóa claim; không giữ lại chỉ vì câu văn nghe hợp lý.",
        "Ghi lại claim nào đã được xác minh, claim nào còn mở, và ai cần kiểm tra tiếp.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Khi nào cần human review?",
      paragraphs: [
        "Anthropic nói rõ: dù đã dùng các kỹ thuật giảm hallucination, critical information vẫn nên được validate, đặc biệt trong high-stakes decisions (Anthropic, “Reduce hallucinations”). Human review càng quan trọng khi output ảnh hưởng đến sức khỏe, pháp lý, tài chính, an toàn, quyền riêng tư hoặc quyết định công khai khó đảo ngược.",
        "Evaluation cũng cho thấy không phải tiêu chí nào cũng tự động hóa tốt. Tone, relevance và các trường hợp ambiguous có thể cần expert rubric hoặc human judgment. Hãy escalation khi nguồn mâu thuẫn, dữ liệu đã lỗi thời, hậu quả lớn, hoặc khi con người sẽ phải chịu trách nhiệm cho quyết định cuối cùng.",
      ],
    },
    {
      kind: "list",
      heading: "Tín hiệu cần additional verification hoặc human review",
      items: [
        "High-stakes: y tế, pháp lý, tài chính, an toàn, tuyển dụng hoặc quyền riêng tư.",
        "Nguồn mâu thuẫn: hai hệ thống, hai tài liệu hoặc hai lần chạy cho ra kết quả khác nhau.",
        "Nguồn lỗi thời hoặc không đáng tin: quy định cũ, dữ liệu chưa cập nhật, nguồn không rõ xuất xứ.",
        "Quyết định công khai hoặc khó đảo ngược: thông báo an toàn, chính sách, nội dung gửi khách hàng.",
        "Đánh giá chủ quan: tone, mức độ phù hợp văn hóa, công bằng hoặc tác động đến một nhóm người.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Edit và adapt mà không làm sai lệch sự thật",
      paragraphs: [
        "Editing cho audience không có nghĩa là thay đổi facts. Anthropic xem tone/style và mức độ phù hợp với target audience là tiêu chí đánh giá; prompting guidance cũng khuyến nghị nói rõ format, constraint và context để output đi đúng hướng (Anthropic, “Define success criteria and build evaluations”; “Prompting best practices”). Khi rút gọn cho executive, hãy giữ số liệu, điều kiện và uncertainty; thay đổi cấu trúc và thuật ngữ, rồi so lại với bản gốc.",
        "Khi có nhiều draft, đừng chọn theo độ dài hay giọng tự tin. Hãy kiểm tra từng draft với nguồn, so sánh theo tiêu chí audience, giữ nội dung đúng từ cả hai, rồi kiểm tra bản merge xem có claim mới hoặc nghĩa bị thay đổi không.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Chọn format theo cách nội dung sẽ được dùng",
      paragraphs: [
        "Format không phải trang trí. Nếu một hệ thống downstream sẽ parse dữ liệu, structured output giúp response đúng schema và tránh lỗi parse (Anthropic, “Structured outputs”). Nếu nội dung dài, self-contained và sẽ được chỉnh sửa hoặc tái sử dụng, artifact hoặc tài liệu có thể chỉnh sửa thường phù hợp hơn một tin nhắn chat (Anthropic, “What are artifacts and how do I use them?”).",
        "Ngược lại, một câu trả lời ngắn hoặc một cập nhật trạng thái không cần artifact. Hãy chọn format nhỏ nhất vẫn phục vụ đúng người đọc và đúng bước tiếp theo: inline cho hội thoại ngắn, bảng/JSON cho dữ liệu có cấu trúc, prose cho nội dung cần đọc liền mạch, và artifact/document cho tài liệu dài cần lưu lại.",
      ],
    },
    {
      kind: "list",
      heading: "Checklist trước khi dùng một output",
      items: [
        "Xác định người đọc, quyết định cần đưa ra và mức độ rủi ro của output.",
        "Tách các claim quan trọng và kiểm tra từng claim với nguồn cụ thể.",
        "Đánh giá completeness theo yêu cầu, edge case và thông tin bắt buộc.",
        "Soát framing: có góc nhìn bị bỏ qua, nhãn loaded hoặc tiêu chuẩn đối xử khác nhau không?",
        "Quyết định có cần human review không; nếu có, ghi rõ người review và câu hỏi cần xác nhận.",
        "Edit cho audience mà vẫn giữ facts, số liệu và uncertainty; so lại với bản gốc.",
        "Chọn format phù hợp với cách nội dung sẽ được đọc, parse hoặc tái sử dụng.",
        "Ghi lại giới hạn: claim chưa xác minh, nguồn mâu thuẫn và phần cần kiểm tra tiếp.",
      ],
    },
  ],
  keyTerms: [
    {
      en: "Accuracy",
      vi: "Độ chính xác",
      note: "Mức độ claim, số liệu và mô tả khớp với nguồn đáng tin cậy.",
    },
    {
      en: "Completeness",
      vi: "Độ đầy đủ",
      note: "Mức độ output bao phủ yêu cầu, ràng buộc, edge case và thông tin bắt buộc.",
    },
    {
      en: "Relevance",
      vi: "Độ liên quan",
      note: "Mức độ output trả lời đúng câu hỏi và mục đích của người dùng.",
    },
    {
      en: "Hallucination",
      vi: "Thông tin bịa hoặc không nhất quán",
      note: "Văn bản factually incorrect hoặc inconsistent với context được cung cấp.",
    },
    {
      en: "Inconsistency",
      vi: "Mâu thuẫn nội bộ",
      note: "Hai phần của output, hoặc hai lần chạy, đưa ra thông tin không khớp nhau.",
    },
    {
      en: "Framing bias",
      vi: "Thiên lệch do cách đóng khung",
      note: "Chọn lọc bằng chứng, dùng nhãn loaded hoặc trình bày một phía làm thay đổi cách người đọc hiểu vấn đề.",
    },
    {
      en: "Fact-check",
      vi: "Kiểm chứng thông tin",
      note: "Đối chiếu từng claim với nguồn cụ thể và sửa hoặc rút lại claim không có bằng chứng.",
    },
    {
      en: "Human review",
      vi: "Con người rà soát",
      note: "Bước chuyên gia hoặc người có thẩm quyền kiểm tra output trước khi dùng, đặc biệt trong high-stakes decisions.",
    },
    {
      en: "Structured output",
      vi: "Output có cấu trúc",
      note: "Response tuân theo schema như JSON để hệ thống downstream parse và xử lý.",
    },
    {
      en: "Artifact",
      vi: "Sản phẩm tách khỏi hội thoại",
      note: "Nội dung lớn, self-contained, có thể chỉnh sửa và tái sử dụng, mở bên cạnh cuộc trò chuyện.",
    },
  ],
  scenario: {
    title: "Tình huống: báo cáo khảo sát khách hàng",
    setup:
      "Một nhóm product nhận một bản tóm tắt khảo sát khách hàng do Claude viết. Bản nháp rất trôi chảy, nhưng có một tỉ lệ phần trăm không khớp với file dữ liệu, thiếu ý kiến của nhóm khách hàng mới, và dùng từ ngữ quá kỹ thuật cho ban lãnh đạo. Nhóm cần quyết định có đưa bản này vào cuộc họp hay không.",
    steps: [
      "Tách các claim chính: tỉ lệ phần trăm, số người trả lời, các phát hiện và khuyến nghị.",
      "Đối chiếu từng con số với file dữ liệu gốc; đánh dấu claim không có nguồn hỗ trợ.",
      "Kiểm tra completeness theo đề bài: nhóm khách hàng mới, câu hỏi mở và các edge case đã được phản ánh chưa?",
      "Soát framing: bản tóm tắt có chỉ chọn phát hiện ủng hộ kết luận ban đầu và bỏ qua phát hiện trái chiều không?",
      "Quyết định phần nào cần human review: con số tài chính, khuyến nghị ảnh hưởng khách hàng và cách diễn giải nhóm khách hàng mới.",
      "Viết lại cho ban lãnh đạo, giữ nguyên facts và uncertainty; so lại với bản gốc và nguồn.",
      "Chọn format: bảng số liệu cho phần dữ liệu, bản brief ngắn cho cuộc họp, và tài liệu dài hơn cho phần cần chỉnh sửa tiếp.",
    ],
    takeaway:
      "Một output tốt không chỉ là output đọc trôi chảy. Nó phải đứng vững trước câu hỏi: claim này có bằng chứng nào, thông tin nào còn thiếu, cách trình bày có công bằng không, ai cần review, và format nào giúp người đọc ra quyết định đúng.",
  },
  questions: [
    {
      id: "evaluation-lesson-review-order",
      type: "single-choice",
      stem: "A market brief is fluent and well formatted, but one statistic has no source, a required competitor is missing, and the tone is too technical for the sales team. Which review plan addresses the draft's problems in the right order?",
      choices: [
        {
          id: "tone-first",
          text: "Rewrite the tone for sales first, then publish because the structure is already clear.",
          explanation:
            "Sai: tone dễ đọc không xác minh số liệu và không bổ sung competitor còn thiếu.",
        },
        {
          id: "verify-then-adapt",
          text: "Verify the unsupported statistic and the required competitor section, then adapt the language for sales and re-check the revision against the source.",
          explanation:
            "Đúng: xử lý accuracy và completeness trước, sau đó adapt audience và kiểm tra lại để tránh factual drift.",
        },
        {
          id: "delete-problems",
          text: "Delete the statistic and the competitor section so the brief is shorter and easier to read.",
          explanation:
            "Sai: xóa nội dung cần thiết không giải quyết completeness; cần tìm bằng chứng hoặc ghi rõ giới hạn.",
        },
        {
          id: "second-draft",
          text: "Generate a second draft and keep the one with more confident language.",
          explanation:
            "Sai: giọng tự tin không thay thế kiểm chứng số liệu và kiểm tra yêu cầu.",
        },
      ],
      correctChoiceIds: ["verify-then-adapt"],
      correctExplanation:
        "Thứ tự hợp lý là xử lý factual accuracy và completeness trước, rồi mới edit cho audience và kiểm tra lại bản sửa. Nếu đổi tone trước, người đọc vẫn nhận một brief thiếu dữ liệu hoặc có số liệu không nguồn.",
      sourceIds: [
        "anthropic-reduce-hallucinations-doc",
        "anthropic-evaluation-docs",
      ],
    },
  ],
  relatedQuestionIds: [
    "output-accuracy-review-plan",
    "output-hallucination-signals",
    "output-fact-check-retention",
    "output-human-review-high-stakes",
    "output-edit-preserve-facts",
    "output-format-fit-deliverable",
    "output-bias-one-sided-framing",
  ],
  takeaways: [
    "Đánh giá output theo claim và bằng chứng, không theo độ trôi chảy hay độ tự tin.",
    "Hallucination, inconsistency và bias là ba lỗi khác nhau và cần cách sửa khác nhau.",
    "Fact-check từng claim bằng quote hoặc nguồn cụ thể; retract claim không có bằng chứng.",
    "Escalate sang human review khi hậu quả lớn, nguồn mâu thuẫn, nguồn lỗi thời hoặc đánh giá chủ quan.",
    "Edit cho audience phải giữ facts và uncertainty; chọn format theo cách nội dung sẽ được dùng.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-reduce-hallucinations-doc",
    "anthropic-evaluation-docs",
    "anthropic-prompting-best-practices",
    "anthropic-structured-outputs-doc",
    "anthropic-artifacts-doc",
    "anthropic-claude-constitution",
  ],
});
