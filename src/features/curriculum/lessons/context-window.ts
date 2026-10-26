import { lessonSchema, type Lesson } from "../types";

/**
 * Sample lesson used to validate the lesson layout, diagram, and knowledge
 * check before the curriculum is scaled out. It is intentionally labelled as
 * unmapped to any official exam objective.
 */
export const contextWindowLesson: Lesson = lessonSchema.parse({
  id: "context-window",
  order: 1,
  status: "published",
  title: "Context window và ngân sách ngữ cảnh",
  englishTitle: "Context window and context budgeting",
  summary:
    "Hiểu context window như bộ nhớ làm việc của model, biết thứ gì chiếm chỗ trong đó, và chọn lọc ngữ cảnh thay vì nhồi thêm tài liệu.",
  level: "foundation",
  estimatedMinutes: 9,
  verificationNote:
    "Bài mẫu cho giai đoạn thiết kế. Nội dung dựa trên tài liệu Anthropic về context window và token counting (truy cập 26/10/2026), nhưng chưa được gắn với objective chính thức nào của kỳ thi CCAO-F.",
  objectives: [
    "Giải thích context window là gì và vì sao nó giới hạn lượng thông tin model xử lý trong một request.",
    "Phân biệt phần input và phần output cùng chia sẻ một cửa sổ ngữ cảnh.",
    "Chọn chiến lược làm gọn ngữ cảnh khi hội thoại hoặc tài liệu bắt đầu quá lớn.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Context window là gì?",
      paragraphs: [
        "Context window là toàn bộ văn bản mà model có thể tham chiếu khi tạo câu trả lời — bao gồm cả câu trả lời đang được sinh ra. Anthropic mô tả nó như “working memory” của model: không phải kho dữ liệu huấn luyện, mà là phần ngữ cảnh của request hiện tại.",
        "Vì là bộ nhớ làm việc, mọi thứ gửi kèm đều chiếm chỗ: system prompt, toàn bộ messages (kể cả tool result, ảnh và tài liệu), định nghĩa tool, và cả output mà model sinh ra. Token dùng cho thinking cũng tính vào cửa sổ này.",
        "Mỗi response trả về trường usage cho biết request đã dùng bao nhiêu token. Khi cần biết trước, token counting API cho phép đo một request mà không phải gửi nó đi.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Nhiều context hơn không tự động tốt hơn",
      body: "Khi số token tăng, độ chính xác và khả năng hồi tưởng có thể giảm — Anthropic gọi hiện tượng này là context rot. Chọn lọc nội dung quan trọng thường hiệu quả hơn là nhồi thêm tài liệu.",
    },
    {
      kind: "paragraphs",
      heading: "Token không phải từ",
      paragraphs: [
        "Token là đơn vị văn bản model xử lý, không tương ứng 1-1 với từ. Cùng một ý, tiếng Việt thường tốn nhiều token hơn tiếng Anh; code, JSON và dãy số dài cũng tốn token hơn văn xuôi thông thường.",
        "Vì vậy đừng ước lượng ngân sách bằng cách đếm từ. Hãy đo bằng token counting API, và nhớ rằng con số trả về là ước tính: lượng token thực tế có thể lệch một chút so với lúc gửi thật.",
      ],
    },
    {
      kind: "list",
      heading: "Giữ ngữ cảnh gọn mà vẫn đủ thông tin",
      items: [
        "Đặt instruction quan trọng trong system prompt ổn định thay vì lặp lại ở mỗi lượt.",
        "Tóm tắt các lượt hội thoại cũ thành ghi chú ngắn thay vì gửi lại toàn bộ lịch sử.",
        "Chỉ đưa những đoạn tài liệu thực sự liên quan (retrieval) thay vì cả kho tài liệu.",
        "Với hội thoại rất dài, dùng compaction hoặc context editing để phần cũ được nén lại.",
        "Chừa ngân sách cho output: input và output cùng chia sẻ một cửa sổ, nên đặt max_tokens quá lớn cũng ăn vào chỗ trống.",
      ],
    },
    {
      kind: "diagram",
      heading: "Ngân sách context trong một request",
      diagramId: "context-budget",
      intro:
        "Một request điển hình chia sẻ một cửa sổ duy nhất cho input và output. Chọn từng phần để xem nó chiếm chỗ vì lý do gì và nên xử lý ra sao. Tỉ lệ dưới đây là ví dụ minh hoạ, không phải quy định của Anthropic.",
    },
  ],
  keyTerms: [
    {
      en: "Context window",
      vi: "Cửa sổ ngữ cảnh",
      note: "Toàn bộ token model có thể tham chiếu trong một request, gồm cả phần output được sinh ra.",
    },
    {
      en: "Token",
      vi: "Đơn vị token",
      note: "Mảnh văn bản model xử lý. Không tương ứng 1-1 với từ và khác nhau giữa các ngôn ngữ.",
    },
    {
      en: "System prompt",
      vi: "Chỉ dẫn hệ thống",
      note: "Phần hướng dẫn đặt trước hội thoại: vai trò, ràng buộc và quy tắc cần giữ ổn định.",
    },
    {
      en: "Prompt caching",
      vi: "Bộ nhớ đệm prompt",
      note: "Tái sử dụng phần prefix đã xử lý để giảm chi phí và độ trễ; token đã cache vẫn chiếm cửa sổ ngữ cảnh.",
    },
    {
      en: "Compaction",
      vi: "Nén ngữ cảnh",
      note: "Tóm tắt phần hội thoại cũ để cuộc trò chuyện tiếp tục được khi gần chạm giới hạn cửa sổ.",
    },
    {
      en: "Context rot",
      vi: "Suy giảm do ngữ cảnh dài",
      note: "Độ chính xác và khả năng hồi tưởng giảm khi ngữ cảnh phình to và nhiều nhiễu.",
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
  knowledgeCheck: {
    question:
      "A support assistant receives the entire policy handbook, three days of chat history, and the system prompt on every turn. Replies are slower, and the assistant sometimes ignores the rule “never promise a refund timeline”. Which change addresses the root cause?",
    options: [
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
    correctOptionId: "b",
    correctExplanation:
      "Gốc rễ là input quá lớn và nhiều nhiễu: instruction quan trọng bị pha loãng, còn ngân sách bị tài liệu không liên quan chiếm mất. Thu gọn input và giữ system prompt ổn định xử lý đúng nguyên nhân, thay vì chỉ đổi tham số sinh câu trả lời.",
  },
  takeaways: [
    "Context window là bộ nhớ làm việc: system prompt, messages, tool, tài liệu và output đều tính chung một ngân sách.",
    "Đo token trước khi gửi; đừng ước lượng bằng số từ hoặc số trang.",
    "Thu gọn và chọn lọc ngữ cảnh thường tốt hơn nhồi thêm tài liệu.",
  ],
  sources: [
    {
      label: "Anthropic — Context windows",
      url: "https://platform.claude.com/docs/en/build-with-claude/context-windows",
    },
    {
      label: "Anthropic — Token counting",
      url: "https://platform.claude.com/docs/en/build-with-claude/token-counting",
    },
    {
      label: "Anthropic — Compaction",
      url: "https://platform.claude.com/docs/en/build-with-claude/compaction",
    },
  ],
});
