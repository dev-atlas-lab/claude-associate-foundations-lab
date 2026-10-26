import { z } from "zod";
import { glossaryEntrySchema, type GlossaryEntry } from "../../../domain";

/**
 * General study notes, not official exam wording. The glossary is deliberately
 * certification-neutral in shape so another provider can ship its own entries.
 */
export const glossaryEntries: GlossaryEntry[] = z
  .array(glossaryEntrySchema)
  .parse([
    {
      id: "token",
      term: "Token",
      vi: "Đơn vị token",
      definition:
        "Mảnh văn bản mà model xử lý. Token không tương ứng 1-1 với từ và số token cho cùng một nội dung khác nhau giữa các ngôn ngữ.",
      category: "Core concepts",
    },
    {
      id: "context-window",
      term: "Context window",
      vi: "Cửa sổ ngữ cảnh",
      definition:
        "Toàn bộ token model có thể tham chiếu trong một request, gồm system prompt, messages, tài liệu, tool và cả output được sinh ra.",
      category: "Core concepts",
    },
    {
      id: "context-rot",
      term: "Context rot",
      vi: "Suy giảm do ngữ cảnh dài",
      definition:
        "Hiện tượng độ chính xác và khả năng hồi tưởng giảm khi ngữ cảnh dài ra và chứa nhiều thông tin không liên quan.",
      category: "Core concepts",
    },
    {
      id: "prompt",
      term: "Prompt",
      vi: "Câu lệnh đầu vào",
      definition:
        "Nội dung người dùng gửi cho model: câu hỏi, hướng dẫn, dữ liệu kèm theo và định dạng mong muốn của câu trả lời.",
      category: "Core concepts",
    },
    {
      id: "system-prompt",
      term: "System prompt",
      vi: "Chỉ dẫn hệ thống",
      definition:
        "Phần hướng dẫn đặt trước hội thoại, thường mô tả vai trò, ràng buộc và quy tắc cần giữ ổn định qua các lượt.",
      category: "Prompting",
    },
    {
      id: "temperature",
      term: "Temperature",
      vi: "Độ ngẫu nhiên",
      definition:
        "Tham số điều chỉnh mức độ biến thiên của output. Giá trị thấp cho kết quả ổn định hơn; giá trị cao cho nhiều biến thể hơn.",
      category: "Prompting",
    },
    {
      id: "few-shot-examples",
      term: "Few-shot examples",
      vi: "Ví dụ mẫu",
      definition:
        "Đưa một vài cặp đầu vào – đầu ra mẫu trong prompt để model bắt chước định dạng và cách xử lý mong muốn.",
      category: "Prompting",
    },
    {
      id: "hallucination",
      term: "Hallucination",
      vi: "Ảo giác",
      definition:
        "Output nghe hợp lý nhưng sai hoặc không có căn cứ. Cần kiểm chứng bằng nguồn, công cụ hoặc bước review trước khi dùng.",
      category: "Safety",
    },
    {
      id: "prompt-injection",
      term: "Prompt injection",
      vi: "Chèn lệnh vào prompt",
      definition:
        "Tấn công đưa instruction độc hại vào nội dung model đọc, nhằm lấn át instruction của hệ thống. Cần tách dữ liệu khỏi chỉ dẫn và giới hạn quyền của tool.",
      category: "Safety",
    },
    {
      id: "grounding",
      term: "Grounding",
      vi: "Neo thông tin vào nguồn",
      definition:
        "Buộc câu trả lời dựa trên tài liệu hoặc dữ liệu được cung cấp, kèm dẫn chứng, thay vì chỉ dựa vào kiến thức sẵn có của model.",
      category: "Safety",
    },
    {
      id: "rag",
      term: "RAG",
      expansion: "Retrieval-Augmented Generation",
      vi: "Truy xuất tăng cường",
      definition:
        "Truy xuất các đoạn tài liệu liên quan rồi đưa chúng vào ngữ cảnh trước khi sinh câu trả lời, giúp giảm bịa đặt và tiết kiệm context.",
      category: "Operations",
    },
    {
      id: "evaluation",
      term: "Evaluation",
      expansion: "eval",
      vi: "Đánh giá",
      definition:
        "Bộ kiểm thử có tiêu chí rõ ràng để đo chất lượng output. Eval tốt có ví dụ đại diện, tiêu chí chấm và kết quả lặp lại được.",
      category: "Operations",
    },
    {
      id: "tool-use",
      term: "Tool use",
      vi: "Sử dụng công cụ",
      definition:
        "Cho model gọi hàm hoặc dịch vụ bên ngoài (tìm kiếm, tính toán, đọc dữ liệu) và nhận kết quả trả về để hoàn thành tác vụ.",
      category: "Operations",
    },
    {
      id: "compaction",
      term: "Compaction",
      vi: "Nén ngữ cảnh",
      definition:
        "Tóm tắt phần hội thoại cũ để cuộc trò chuyện tiếp tục được khi gần chạm giới hạn context window.",
      category: "Operations",
    },
    {
      id: "latency",
      term: "Latency",
      vi: "Độ trễ",
      definition:
        "Thời gian từ lúc gửi request đến khi nhận được phản hồi. Prompt dài, output dài và nhiều vòng tool thường làm tăng độ trễ.",
      category: "Operations",
    },
  ]);

export const glossaryCategories: string[] = [
  "Core concepts",
  "Prompting",
  "Safety",
  "Operations",
];
