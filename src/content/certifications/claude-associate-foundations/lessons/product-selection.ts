import { lessonSchema, type Lesson } from "../../../../domain";

/**
 * Exam-mapped curriculum lesson for all four verified Domain 3 objectives.
 * It teaches product-surface selection, model-tier selection, task fit, and
 * context management from Anthropic's product documentation. Product details
 * are treated as time-sensitive; the lesson teaches the decision framework
 * rather than freezing current menus, model names, prices, or limits.
 */
export const productSelectionLesson: Lesson = lessonSchema.parse({
  id: "product-selection",
  certificationId: "claude-associate-foundations",
  blueprintId: "ccao-f-v1",
  order: 5,
  kind: "curriculum",
  contentStatus: "published",
  title: "Chọn product và model: bề mặt phù hợp, năng lực và context",
  englishTitle: "Product and model selection: surface fit, capability tiers, and context",
  summary:
    "Học cách chọn đúng bề mặt sản phẩm (Chat, Projects, Research, Artifacts), chọn model theo mức năng lực thay vì theo tên, và quản lý context bằng cách chọn khi nào giữ, tóm tắt, khởi động lại hoặc lưu bền. Bài dùng các tình huống công việc gốc và nhấn mạnh rằng chi tiết sản phẩm có thể thay đổi.",
  level: "foundation",
  estimatedMinutes: 20,
  verification: {
    status: "verified",
    checkedAt: "2026-10-27",
    note: "Nội dung kỹ thuật được đối chiếu với tài liệu Anthropic về Projects, RAG cho Projects, Research, Artifacts, models, context windows, compaction và context engineering (truy cập 27/10/2026). Bốn objective lấy từ Exam Guide v1.0. Tên model, giá, giới hạn và chi tiết UI được xem là dữ liệu có thể thay đổi, không phải nội dung thi cố định.",
    sourceIds: [
      "ccao-f-exam-guide-v1",
      "anthropic-projects-overview",
      "anthropic-projects-manage",
      "anthropic-projects-rag",
      "anthropic-research-help",
      "anthropic-artifacts-doc",
      "anthropic-models-overview",
      "anthropic-choosing-model",
      "anthropic-context-windows-doc",
      "anthropic-compaction-doc",
      "anthropic-context-engineering-blog",
    ],
  },
  examMapping: {
    status: "verified",
    objectiveIds: [
      "product-feature-selection",
      "model-family-selection",
      "model-task-fit",
      "context-memory-management",
    ],
    note: "Bài học được viết cho cả bốn objective đã xác minh của Domain 3 trong Exam Guide v1.0. Mapping xác nhận phạm vi bài học, không phải tuyên bố rằng Domain 3 đã được bao phủ đầy đủ như một kỳ thi thu nhỏ.",
  },
  objectives: [
    "Chọn bề mặt sản phẩm phù hợp với tính chất công việc: Chat, Projects, Research hoặc Artifacts.",
    "Phân biệt các dòng model theo mức năng lực, tốc độ và chi phí thay vì học thuộc tên model.",
    "Chọn model theo yêu cầu task và kiểm thử bằng prompt, dữ liệu và edge case thật.",
    "Quản lý context bằng cách chọn giữ, tóm tắt, khởi động lại hoặc lưu bền thông tin cần thiết.",
  ],
  sections: [
    {
      kind: "paragraphs",
      heading: "Chọn bề mặt trước, chọn model sau",
      paragraphs: [
        "Một lỗi phổ biến là bắt đầu bằng câu hỏi “model nào mạnh nhất?”. Trong công việc thật, câu hỏi trước đó là: công việc này cần một cuộc trò chuyện ngắn, một workspace có knowledge dùng lại, một cuộc điều tra nhiều nguồn, hay một deliverable dài có thể chỉnh sửa? Bề mặt sản phẩm quyết định context nào được giữ lại và output sẽ được dùng như thế nào. Anthropic mô tả Projects như workspace tự chứa với chat history và knowledge base riêng; Research như quá trình tìm kiếm nhiều bước có citation; và Artifacts như output tự chứa, lớn và có thể chỉnh sửa (Anthropic, “What are projects?”, “Use research on Claude”, “What are artifacts and how do I use them?”).",
        "Chỉ sau khi đã xác định bề mặt phù hợp mới nên hỏi model nào đủ năng lực cho bước đó. Một model mạnh hơn không bù được việc chọn sai nơi lưu knowledge hoặc thiếu quy trình kiểm tra.",
      ],
    },
    {
      kind: "list",
      heading: "Bốn bề mặt và dấu hiệu nên dùng",
      items: [
        "Chat: câu hỏi ngắn, một lần, hoặc công việc đang khám phá mà chưa cần lưu cấu hình. Phù hợp khi chi phí thiết lập cao hơn giá trị công việc.",
        "Projects: công việc lặp lại với bộ nguồn ổn định, quy tắc chung và template cố định. Project knowledge giữ tài liệu dùng chung; project instructions giữ cách làm việc cho mọi chat trong project.",
        "Research: câu hỏi cần quét nhiều nguồn hiện hành, tổng hợp và citation. Research chạy nhiều lượt tìm kiếm nối tiếp và có thể dùng web cùng các connector được bật trên nền tảng hỗ trợ.",
        "Artifacts: deliverable lớn, tự chứa, có thể chỉnh sửa hoặc tái sử dụng, ví dụ tài liệu, code, diagram hoặc công cụ tương tác. Artifact là format output, không phải nơi lưu nguồn.",
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: "Project không phải chat dài hơn",
      body: "Anthropic nêu rõ rằng một chat mới không tự nhận toàn bộ context của chat khác; project knowledge và instructions là cơ chế dùng chung, còn project memory có thể giữ lại một số thông tin nhưng không thay thế cấu hình. Tên và mô tả project cũng không được cung cấp cho Claude như instruction. Muốn Claude dùng một quy tắc, hãy đặt quy tắc đó trong project instructions hoặc knowledge, không chỉ đặt tên project thật hay.",
    },
    {
      kind: "paragraphs",
      heading: "Model family là các mức năng lực, không phải bảng xếp hạng cố định",
      paragraphs: [
        "Exam Guide v1.0 nhắc đến các dòng Haiku, Sonnet và Opus. Cách học hữu ích là hiểu chúng như những điểm cân bằng khác nhau giữa năng lực, độ trễ và chi phí, không phải một danh sách bất biến. Anthropic mô tả các model khác nhau về positioning, latency, price, context window và output limit; danh sách model, giá và giới hạn cần được kiểm tra lại trong tài liệu chính thức vì chúng thay đổi (Anthropic, “Models overview”).",
        "Vì vậy, đừng học thuộc “model X luôn tốt nhất cho task Y”. Hãy học tiêu chí: task cần mức suy luận nào, sai sót tốn kém ra sao, độ trễ nào còn chấp nhận được, chi phí cho mỗi kết quả đúng là bao nhiêu, và context cần bao lớn. Tên model chỉ là cách gọi một mức năng lực tại một thời điểm.",
      ],
    },
    {
      kind: "list",
      heading: "Hai hướng chọn model",
      items: [
        "Efficiency-first: bắt đầu bằng model nhanh, rẻ hơn, kiểm thử trên dữ liệu thật, rồi chỉ nâng cấp khi có khoảng trống năng lực cụ thể. Phù hợp với khối lượng lớn, tác vụ tương đối đều và yêu cầu độ trễ thấp.",
        "Capability-first: bắt đầu bằng model đủ năng lực cho task khó hoặc sai sót tốn kém, đánh giá trên case đại diện, rồi tối ưu chi phí và effort nếu chất lượng vẫn đạt. Phù hợp với phân tích nhiều bước, tài liệu dài hoặc quyết định có hậu quả lớn.",
        "Trong cả hai hướng, quyết định cuối cùng phải dựa trên benchmark nội bộ với prompt, dữ liệu và edge case thật, không dựa vào tên, giá niêm yết hay tuyên bố chung.",
      ],
    },
    {
      kind: "paragraphs",
      heading: "Chọn theo task, không theo cảm giác",
      paragraphs: [
        "Anthropic khuyến nghị cân bằng capabilities, speed, cost và effort. Một thay đổi nhỏ trong prompt, ví dụ thêm tiêu chí hoặc ví dụ, có thể hiệu quả hơn việc đổi model. Vì vậy hãy xem việc tinh chỉnh prompt và chọn model là hai đòn bẩy của cùng một quyết định, không phải hai cuộc thi riêng.",
        "Một quy trình ngắn gọn: định nghĩa tiêu chí chất lượng và ngưỡng chấp nhận; chọn hai hoặc ba ứng viên; chạy trên cùng bộ case đại diện, gồm cả case khó; so sánh chất lượng, độ trễ, chi phí và failure mode; chỉ chuẩn hóa khi kết quả đủ ổn định. Đừng tối ưu chi phí trước khi biết chất lượng có đạt yêu cầu hay không.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Đừng đóng băng chi tiết sản phẩm",
      body: "Tên model, giá token, context window, output limit, tên menu và điều kiện dùng thử có thể thay đổi. Bài học này dạy cách ra quyết định; trước khi triển khai thật, hãy kiểm tra lại tài liệu chính thức thay vì lặp lại một con số đã cũ.",
    },
    {
      kind: "paragraphs",
      heading: "Context và memory: giữ gì, bỏ gì, lưu ở đâu",
      paragraphs: [
        "Context window là toàn bộ văn bản model có thể tham chiếu, bao gồm system prompt, mọi message, tool result, hình ảnh, tài liệu, định nghĩa tool, output và cả phần thinking. Prompt prefix được cache vẫn chiếm chỗ trong context. Khi số token tăng, độ chính xác và khả năng hồi tưởng có thể giảm; Anthropic gọi hiện tượng này là context rot (Anthropic, “Context windows”; “Effective context engineering for AI agents”).",
        "Vì vậy quản lý context không chỉ là “xóa bớt cho vừa giới hạn”. Đó là quyết định thông tin nào cần giữ nguyên, thông tin nào có thể tóm tắt, thông tin nào nên lưu bền ngoài cuộc trò chuyện, và khi nào nên bắt đầu lại với một context sạch. Compaction tóm tắt hội thoại dài để tiếp tục làm việc; project knowledge giữ tài liệu dùng chung; memory của project giữ thông tin riêng cho project (Anthropic, “Compaction”; “How can I create and manage projects?”).",
      ],
    },
    {
      kind: "list",
      heading: "Checklist quản lý context",
      items: [
        "Xác định thông tin bền vững: facts, quyết định, ràng buộc, thuật ngữ và người phụ trách. Đây là phần phải được giữ hoặc lưu lại trước khi tóm tắt.",
        "Tách tài liệu tham chiếu dài khỏi hội thoại: đưa vào project knowledge hoặc retrieval thay vì dán lại ở mọi lượt.",
        "Tóm tắt các lượt cũ khi chúng không còn cần chi tiết, nhưng giữ nguyên quyết định, ngoại lệ và open question.",
        "Loại bỏ output, draft và tool result đã lỗi thời; chúng chiếm chỗ và có thể gây nhiễu.",
        "Khi bắt đầu context mới, dùng một bản bàn giao ngắn thay vì kể lại toàn bộ lịch sử.",
        "Kiểm tra lại sau khi chuyển context: các quyết định cũ có còn được áp dụng đúng không, và có thông tin nào bị mất không.",
      ],
    },
    {
      kind: "callout",
      tone: "caution",
      title: "Project knowledge không phải lúc nào cũng được truy xuất toàn bộ",
      body: "Project knowledge có thể được mở rộng bằng RAG trên một số gói trả phí, và Anthropic mô tả RAG tự bật khi knowledge tiến gần giới hạn context. Nhưng điều đó không có nghĩa là mọi tài liệu sẽ luôn được đưa vào mọi câu trả lời. Hãy kiểm tra gói, giới hạn hiện tại và chất lượng retrieval; đặt tên file rõ ràng và chỉ giữ nguồn còn hiệu lực.",
    },
  ],
  keyTerms: [
    {
      en: "Product surface",
      vi: "Bề mặt sản phẩm",
      note: "Cách người dùng tương tác với Claude: chat, project, research hoặc artifact.",
    },
    {
      en: "Project",
      vi: "Workspace có knowledge và instruction riêng",
      note: "Giữ tài liệu và quy tắc dùng chung cho nhiều chat lặp lại.",
    },
    {
      en: "Research",
      vi: "Điều tra nhiều bước có citation",
      note: "Chạy nhiều lượt tìm kiếm nối tiếp và tổng hợp nguồn hiện hành.",
    },
    {
      en: "Artifact",
      vi: "Output tự chứa, có thể chỉnh sửa",
      note: "Phù hợp với tài liệu, code, diagram hoặc công cụ dài và có thể tái sử dụng.",
    },
    {
      en: "Model family",
      vi: "Dòng model theo mức năng lực",
      note: "Khác nhau về năng lực, độ trễ, chi phí, context và output limit.",
    },
    {
      en: "Capability tier",
      vi: "Mức năng lực",
      note: "Cách chọn model theo yêu cầu task thay vì theo tên hoặc độ mới.",
    },
    {
      en: "Context window",
      vi: "Cửa sổ ngữ cảnh",
      note: "Toàn bộ token model có thể tham chiếu, gồm cả output và thinking.",
    },
    {
      en: "Compaction",
      vi: "Tóm tắt để tiếp tục",
      note: "Rút gọn hội thoại dài thành bản tóm tắt để làm việc tiếp.",
    },
    {
      en: "RAG",
      vi: "Retrieval-augmented generation",
      note: "Truy xuất phần tài liệu liên quan thay vì đưa toàn bộ knowledge vào context.",
    },
    {
      en: "Baseline",
      vi: "Mốc so sánh",
      note: "Kết quả hiện tại dùng để đo tác động của việc đổi model hoặc prompt.",
    },
  ],
  scenario: {
    title: "Tình huống: báo cáo thị trường định kỳ",
    setup:
      "Một nhóm chiến lược tạo báo cáo thị trường mỗi quý từ 20 PDF đã được phê duyệt và một template cố định. Mỗi quý, nhóm cũng cần thêm một phần ngắn về tin tức thị trường hiện tại. Bản nháp gần nhất dùng một chat mới, dán lại toàn bộ PDF, bỏ sót hai tài liệu và trích dẫn tin tức không kiểm chứng.",
    steps: [
      "Xác định bề mặt: project cho 20 PDF và template vì đây là công việc lặp lại với nguồn ổn định.",
      "Đưa các PDF vào project knowledge; đặt template, giọng điệu và quy tắc citation trong project instructions.",
      "Dùng research cho phần tin tức hiện tại, yêu cầu citation và nêu rõ nguồn nào chưa được xác minh.",
      "Chọn model theo hướng efficiency-first cho bản nháp, nhưng benchmark trên 5 báo cáo cũ và các case thiếu nguồn.",
      "Nếu chất lượng chưa đạt, thử tăng mức năng lực hoặc cải thiện prompt trước khi mặc định dùng model mạnh nhất.",
      "Quản lý context: giữ decisions và số liệu chốt trong bản bàn giao; tóm tắt thảo luận cũ; loại bỏ draft đã thay thế.",
      "Trước khi publish, kiểm tra citation, số liệu và các phần bắt buộc; ghi lại nguồn nào đã được xác minh.",
    ],
    takeaway:
      "Chọn bề mặt theo cách công việc được lặp lại và tái sử dụng; chọn model theo tiêu chí và benchmark; quản lý context bằng thông tin bền vững thay vì giữ mọi thứ. Đây là ba quyết định khác nhau, và quyết định đúng ở bề mặt thường tiết kiệm nhiều công hơn việc chọn model mạnh hơn.",
  },
  questions: [
    {
      id: "product-selection-lesson-fit",
      type: "single-choice",
      stem: "A team produces a quarterly market report from a stable set of approved PDFs and a fixed template, but each quarter also needs a short update on current market news. Which combination fits best?",
      choices: [
        {
          id: "project-plus-research",
          text: "A project that holds the approved PDFs and template instructions, plus research with citation checks for the current-news update.",
          explanation:
            "Đúng: project giữ nguồn ổn định và quy tắc dùng chung; research phù hợp cho phần tin tức hiện hành cần nhiều nguồn và citation.",
        },
        {
          id: "new-chat-every-time",
          text: "A new standalone chat each quarter with every PDF pasted manually and no saved instructions.",
          explanation:
            "Sai: cách này lặp lại cấu hình mỗi quý, dễ bỏ sót tài liệu và không giữ được template hay quy tắc citation.",
        },
        {
          id: "research-everything",
          text: "Research mode for the entire report, including the stable PDFs, so every quarter starts from scratch.",
          explanation:
            "Sai: research dành cho điều tra nhiều nguồn hiện hành; dùng nó cho bộ PDF ổn định làm tăng chi phí và biến thiên không cần thiết.",
        },
        {
          id: "artifact-only",
          text: "An artifact alone, rebuilt from memory each quarter without the source PDFs.",
          explanation:
            "Sai: artifact là format output, không phải nơi lưu nguồn; thiếu knowledge khiến báo cáo không bám tài liệu.",
        },
      ],
      correctChoiceIds: ["project-plus-research"],
      correctExplanation:
        "Công việc có hai phần khác nhau. Phần lặp lại với nguồn ổn định nên dùng project knowledge và project instructions. Phần tin tức hiện hành nên dùng research, nơi Claude chạy nhiều lượt tìm kiếm và tổng hợp có citation; citation vẫn phải được kiểm tra trước khi dùng. Artifact có thể là format của báo cáo cuối, nhưng không thay thế nguồn và instruction.",
      sourceIds: [
        "anthropic-projects-overview",
        "anthropic-research-help",
        "anthropic-artifacts-doc",
      ],
    },
  ],
  relatedQuestionIds: [
    "product-feature-recurring-report",
    "product-feature-fit-choices",
    "model-family-speed-cost",
    "model-family-tradeoffs",
    "model-task-fit-complex",
    "model-task-fit-practices",
    "context-summarize-and-restart",
    "context-high-signal-practices",
  ],
  takeaways: [
    "Chọn bề mặt sản phẩm theo cách công việc được lặp lại, tìm kiếm hoặc tái sử dụng; đừng bắt đầu bằng tên model.",
    "Project giữ knowledge và instructions dùng chung; một chat mới không tự nhận toàn bộ transcript, project memory không thay thế cấu hình, và tên project không phải instruction.",
    "Model family là các mức năng lực và trade-off; tên, giá, context và giới hạn cần được kiểm tra lại.",
    "Efficiency-first và capability-first là hai hướng hợp lý cho hai loại rủi ro khác nhau; benchmark trên dữ liệu thật là bước quyết định.",
    "Quản lý context là chọn giữ, tóm tắt, khởi động lại hoặc lưu bền đúng thông tin, không chỉ cắt bớt token.",
  ],
  sourceIds: [
    "ccao-f-exam-guide-v1",
    "anthropic-projects-overview",
    "anthropic-projects-manage",
    "anthropic-projects-rag",
    "anthropic-research-help",
    "anthropic-artifacts-doc",
    "anthropic-models-overview",
    "anthropic-choosing-model",
    "anthropic-context-windows-doc",
    "anthropic-compaction-doc",
    "anthropic-context-engineering-blog",
  ],
});
