import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Design-vertical-slice sample lesson refined for the Associate audience.
 * The technical content is checked against Anthropic documentation for both
 * workspace workflows (Projects, chat history, uploaded files) and underlying
 * context-window mechanics, while remaining explicitly unmapped (`kind: "sample"`)
 * alongside the seven whole-domain curriculum lessons.
 */
export const contextWindowLesson: Lesson = lessonSchema.parse({
  id: "context-window",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 1,
  kind: "sample",
  contentStatus: "published",
  title: "Context window và ngân sách ngữ cảnh",
  englishTitle: "Context window and context budgeting",
  summary:
    "Hiểu context window như bộ nhớ làm việc (working memory) của Claude trong cả giao diện chat/Projects lẫn workflow API tích hợp, nắm rõ các thành phần chiếm dung lượng token, và chủ động tinh gọn ngữ cảnh thay vì nhồi nhét tài liệu.",
  level: "foundation",
  estimatedMinutes: 11,
  verification: {
    status: "verified",
    checkedAt: "2026-10-29",
    note: "Nội dung kỹ thuật được đối chiếu với tài liệu Anthropic về context window, token counting, compaction, context engineering và quản lý Claude Projects (rà soát 29/10/2026 cho đối tượng Associate). Đây là bài mẫu nền tảng, giữ trạng thái unmapped để tách biệt với 7 bài học toàn domain đã ánh xạ vào blueprint CCAO-F.",
    sourceIds: [
      "anthropic-context-windows-doc",
      "anthropic-token-counting-doc",
      "anthropic-compaction-doc",
      "anthropic-context-engineering-blog",
      "anthropic-projects-manage",
    ],
  },
  examMapping: {
    status: "unmapped",
    objectiveIds: [],
    note: "Bài mẫu nền tảng đã biên tập cho đối tượng Associate để minh hoạ cơ chế context window trước khi học Domain 3 (`product-selection`), giữ trạng thái unmapped để không làm lệch thống kê 7 bài học theo domain.",
  },
  objectives: [
    "Giải thích context window là gì và vì sao nó giới hạn lượng thông tin Claude xử lý trong một lượt hội thoại hoặc request.",
    "Nhận diện các thành phần cùng chia sẻ dung lượng context window trong Claude chat, Projects và workflow tích hợp (system instructions, lịch sử hội thoại, file tài liệu đính kèm/retrieval và nội dung phản hồi).",
    "Chọn chiến lược tối ưu ngữ cảnh (tóm tắt sang chat mới, chọn lọc tài liệu đưa vào Project, hoặc áp dụng compaction) khi luồng trao đổi bắt đầu kéo dài và phân mảnh.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Context window là gì?",
      paragraphs: [
        "Context window là toàn bộ phạm vi văn bản mà model có thể tham chiếu khi tạo câu trả lời — bao gồm cả phần nội dung đang sinh ra. Anthropic mô tả nó như “working memory” (bộ nhớ làm việc tạm thời) của model: không phải kho tri thức huấn luyện vĩnh viễn, mà là không gian ngữ cảnh của riêng phiên làm việc hoặc request hiện tại.",
        "Dù bạn dùng Claude qua giao diện chat/Projects hay qua workflow tích hợp API, mọi thông tin đi kèm lượt gọi đều cùng chia sẻ một bộ nhớ làm việc: system prompt hoặc Project instructions, toàn bộ lịch sử messages trong cuộc hội thoại (kể cả tool result, hình ảnh và file đính kèm), các đoạn tài liệu được nạp từ Project knowledge, và cả output mà Claude sinh ra. Token dùng cho extended thinking cũng tính vào context window này.",
        "Ở cấp độ tích hợp API, mỗi response trả về trường usage cho biết request đã tiêu tốn bao nhiêu token và token counting API cho phép đo lường chính xác trước khi gửi. Ở góc độ người dùng Claude hằng ngày, điều đó có nghĩa là một cuộc chat kéo dài qua quá nhiều chủ đề hoặc đính kèm nguyên file tài liệu lớn sẽ nhanh chóng làm đầy ngân sách token.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Nhiều context hơn không đồng nghĩa với câu trả lời tốt hơn",
      body: "Khi số lượng token tăng quá cao, độ chuẩn xác và khả năng hồi tưởng các ràng buộc cốt lõi có thể suy giảm — Anthropic gọi hiện tượng này là context rot. Việc chắt lọc tài liệu đúng trọng tâm hoặc tóm tắt các quyết định quan trọng sang một phiên chat mới luôn đem lại hiệu quả cao hơn là cố nhồi thêm tài liệu vào một luồng trò chuyện đã loãng.",
    },
    {
      kind: "paragraphs",
      heading: "Token không phải là từ (words)",
      paragraphs: [
        "Token là đơn vị xử lý văn bản cơ bản của model, không tương ứng 1-1 với từ. Cùng một câu văn, tiếng Việt thường tiêu tốn nhiều token hơn tiếng Anh; các bảng biểu dữ liệu lớn, mã nguồn (code), JSON và chuỗi số dài cũng tốn nhiều token hơn văn xuôi thông thường.",
        "Vì vậy, đừng ước tính ngân sách chỉ dựa trên số trang hay số từ. Khi làm việc trong Claude Projects hoặc chat, hãy ưu tiên đưa vào các tài liệu chuẩn hóa, súc tích và giàu tín hiệu (high-signal) thay vì tải lên các bản nháp trùng lặp; khi xây dựng workflow tự động, hãy đo lường thực tế bằng token counting API.",
      ],
    },
    {
      kind: "list",
      heading: "Chiến lược giữ ngữ cảnh tinh gọn và giàu thông tin",
      items: [
        "Đặt quy tắc và vai trò cố định trong Project instructions hoặc system prompt thay vì gõ lặp lại ở mỗi lượt chat.",
        "Khi cuộc hội thoại chuyển sang nhiệm vụ mới hoặc đã qua nhiều vòng thử-sai, hãy tóm tắt các quyết định đã chốt thành ghi chú ngắn rồi mở một cuộc chat mới.",
        "Chỉ đưa những tài liệu hoặc đoạn trích thực sự liên quan (retrieval / curated Project knowledge) thay vì đính kèm toàn bộ kho lưu trữ vào mỗi lượt.",
        "Với các luồng hội thoại hoặc agent chạy dài, áp dụng tóm tắt có cấu trúc, compaction hoặc context editing để tinh giản lịch sử cũ.",
        "Luôn dự trù ngân sách cho output: input và output cùng chia sẻ một context window, nên nếu input quá nặng hoặc đặt max_tokens quá sát trần sẽ làm bó hẹp không gian phản hồi của model.",
      ],
    },
    {
      kind: "diagram",
      heading: "Ngân sách context trong một request",
      diagramId: "context-budget",
      intro:
        "Một request điển hình chia sẻ một context window duy nhất cho cả input và output. Chọn từng phần để xem nó chiếm dung lượng vì lý do gì và nên xử lý ra sao. Tỉ lệ dưới đây là ví dụ minh hoạ, không phải quy định cứng của Anthropic.",
    },
  ],
  keyTerms: [
    {
      en: "Context window",
      vi: "Context window (vùng ngữ cảnh làm việc)",
      note: "Toàn bộ lượng token model có thể tham chiếu trong một request, bao gồm cả phần output được sinh ra.",
    },
    {
      en: "Token",
      vi: "Token (đơn vị xử lý văn bản)",
      note: "Mảnh ký tự/văn bản mà model phân tích. Không tương ứng 1-1 với từ và tiêu hao khác nhau giữa các ngôn ngữ.",
    },
    {
      en: "System prompt",
      vi: "System prompt (chỉ dẫn hệ thống)",
      note: "Phần hướng dẫn đặt ở đầu phiên: định hình vai trò, phạm vi kiến thức và các quy tắc bất biến.",
    },
    {
      en: "Prompt caching",
      vi: "Prompt caching (bộ nhớ đệm prompt)",
      note: "Tái sử dụng phần prefix đã xử lý trước đó để giảm chi phí và độ trễ; lưu ý token đã cache vẫn chiếm dung lượng context window.",
    },
    {
      en: "Compaction",
      vi: "Compaction (cơ chế nén ngữ cảnh)",
      note: "Tự động tóm tắt phần hội thoại cũ để cuộc trò chuyện tiếp tục diễn ra liền mạch khi sắp chạm giới hạn context window.",
    },
    {
      en: "Context rot",
      vi: "Context rot (suy giảm độ tập trung do ngữ cảnh quá dài)",
      note: "Hiện tượng độ chính xác và khả năng hồi tưởng các chỉ dẫn quan trọng bị giảm sút khi ngữ cảnh bị phình to và lẫn nhiều thông tin nhiễu.",
    },
  ],
  scenario: {
    title: "Tình huống: trợ lý hỗ trợ khách hàng",
    setup:
      "Một trợ lý nội bộ trả lời câu hỏi về chính sách công ty. Mỗi lượt, nó nhận toàn bộ 60 trang tài liệu chính sách, lịch sử chat ba ngày và system prompt. Gần đây câu trả lời chậm hơn và đôi khi bỏ qua ràng buộc “không cam kết thời hạn hoàn tiền”.",
    steps: [
      "Đo token của từng phần: system prompt, lịch sử, tài liệu và câu hỏi hiện tại.",
      "Nhận ra tài liệu chiếm phần lớn ngân sách, trong khi mỗi lượt chỉ cần vài đoạn liên quan.",
      "Thay vì gửi cả kho, truy xuất hai hoặc ba đoạn khớp với câu hỏi (retrieval).",
      "Tóm tắt lịch sử cũ thành ghi chú ngắn, giữ nguyên system prompt và ràng buộc.",
      "Chừa chỗ cho output, rồi kiểm tra lại độ dài bằng token counting trước khi gửi.",
    ],
    takeaway:
      "Khi câu trả lời bắt đầu bỏ qua instruction cũ, nguyên nhân thường là ngữ cảnh bị nhiễu chứ không phải model “quên” ngẫu nhiên.",
  },
  questions: [
    {
      id: "context-window-root-cause",
      type: "single-choice",
      stem: "A support assistant receives the entire policy handbook, three days of chat history, and the system prompt on every turn. Replies are slower, and the assistant sometimes ignores the rule “never promise a refund timeline”. Which change addresses the root cause?",
      choices: [
        {
          id: "a",
          text: "Raise the temperature so the assistant explores more phrasings.",
          explanation:
            "Temperature điều chỉnh độ ngẫu nhiên của output, không làm input gọn hơn và không khôi phục instruction bị chìm trong ngữ cảnh.",
        },
        {
          id: "b",
          text: "Retrieve only the relevant policy sections and summarize older turns, keeping the system prompt intact.",
          explanation:
            "Đúng hướng: giảm nhiễu trong context window, giữ instruction quan trọng ổn định, và chừa ngân sách cho output.",
        },
        {
          id: "c",
          text: "Move the system prompt to the end of every user message so it appears last.",
          explanation:
            "Lặp lại system prompt ở mỗi message làm tăng token và dễ tạo mâu thuẫn. Instruction nên nằm trong system prompt ổn định, không phải chèn lặp.",
        },
        {
          id: "d",
          text: "Increase max_tokens so the model has more room to answer.",
          explanation:
            "Tăng max_tokens chỉ mở rộng phần output; nó không làm input gọn hơn mà còn ăn thêm ngân sách của cùng một cửa sổ.",
        },
      ],
      correctChoiceIds: ["b"],
      correctExplanation:
        "Gốc rễ là input quá lớn và nhiều nhiễu: instruction quan trọng bị pha loãng, còn ngân sách bị tài liệu không liên quan chiếm mất. Thu gọn input và giữ system prompt ổn định xử lý đúng nguyên nhân, thay vì chỉ đổi tham số sinh câu trả lời.",
      sourceIds: [
        "anthropic-context-windows-doc",
        "anthropic-context-engineering-blog",
      ],
    },
  ],
  takeaways: [
    "Context window là bộ nhớ làm việc: system prompt, messages, tool, tài liệu và output đều tính chung một ngân sách.",
    "Đo token trước khi gửi; đừng ước lượng bằng số từ hoặc số trang.",
    "Thu gọn và chọn lọc ngữ cảnh thường tốt hơn nhồi thêm tài liệu.",
  ],
  sourceIds: [
    "anthropic-context-windows-doc",
    "anthropic-token-counting-doc",
    "anthropic-compaction-doc",
    "anthropic-context-engineering-blog",
    "anthropic-projects-manage",
  ],
});
