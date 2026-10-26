import { useState, type CSSProperties } from "react";

type Segment = {
  id: string;
  label: string;
  percent: number;
  color: string;
  detail: string;
  tip: string;
};

/**
 * Percentages are an illustrative split, not an Anthropic rule. The numbers
 * exist to make the "one shared budget" idea visible.
 */
const segments: Segment[] = [
  {
    id: "system",
    label: "System prompt & tool definitions",
    percent: 15,
    color: "var(--accent)",
    detail:
      "Vai trò, quy tắc và mô tả tool được gửi ở mọi lượt. Đây là phần nên giữ ổn định vì nó chứa ràng buộc quan trọng nhất.",
    tip: "Giữ system prompt ngắn nhưng đủ chặt; đừng lặp lại cùng một quy tắc ở mọi message.",
  },
  {
    id: "documents",
    label: "Reference documents",
    percent: 35,
    color: "var(--info)",
    detail:
      "Tài liệu, PDF, ảnh hoặc kết quả truy xuất. Đây thường là phần phình to nhanh nhất khi nhồi cả kho tài liệu vào request.",
    tip: "Chỉ đưa những đoạn liên quan; đánh số hoặc gắn nhãn nguồn để model trích dẫn đúng.",
  },
  {
    id: "history",
    label: "Conversation history",
    percent: 20,
    color: "var(--ok)",
    detail:
      "Các lượt trước được giữ lại đầy đủ và cộng dồn qua từng lượt. Lịch sử dài vừa tốn token vừa làm loãng instruction.",
    tip: "Tóm tắt các lượt cũ thành ghi chú ngắn, hoặc dùng compaction khi hội thoại kéo dài.",
  },
  {
    id: "question",
    label: "Current question",
    percent: 5,
    color: "var(--warn)",
    detail:
      "Câu hỏi hiện tại thường rất nhỏ so với phần còn lại. Nếu nó bị chôn giữa tài liệu dài, model dễ trả lời lệch trọng tâm.",
    tip: "Đặt câu hỏi rõ ràng ở cuối, ngay trước khi yêu cầu model trả lời.",
  },
  {
    id: "output",
    label: "Reserved for output",
    percent: 25,
    color: "var(--accent-strong)",
    detail:
      "Input và output chia sẻ cùng một cửa sổ. Phần dự phòng này quyết định model còn bao nhiêu chỗ để trả lời hoặc suy luận.",
    tip: "Chừa chỗ cho output trước khi thêm tài liệu; đặt max_tokens lớn không tạo thêm ngân sách.",
  },
];

export function ContextWindowDiagram({ intro }: { intro: string }) {
  const [activeId, setActiveId] = useState(segments[0].id);
  const active = segments.find((segment) => segment.id === activeId) ?? segments[0];

  return (
    <figure className="diagram">
      <div className="diagram-bar" aria-hidden="true">
        {segments.map((segment) => (
          <span
            key={segment.id}
            className="diagram-seg"
            data-active={segment.id === activeId}
            style={
              {
                "--seg-color": segment.color,
                width: `${segment.percent}%`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="diagram-legend" role="group" aria-label="Context budget parts">
        {segments.map((segment) => (
          <button
            key={segment.id}
            type="button"
            className="diagram-legend-item"
            aria-pressed={segment.id === activeId}
            onClick={() => setActiveId(segment.id)}
            style={{ "--seg-color": segment.color } as CSSProperties}
          >
            <span className="diagram-swatch" aria-hidden="true" />
            <span className="diagram-legend-label">{segment.label}</span>
            <span className="diagram-legend-value">{segment.percent}%</span>
          </button>
        ))}
      </div>

      <div className="diagram-detail" aria-live="polite">
        <h3 className="diagram-detail-title">{active.label}</h3>
        <p className="diagram-detail-text">{active.detail}</p>
        <p className="diagram-tip">
          <strong>Practice tip</strong>
          {active.tip}
        </p>
      </div>

      <figcaption>{intro}</figcaption>
    </figure>
  );
}
