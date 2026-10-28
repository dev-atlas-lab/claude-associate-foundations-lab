import { questionSchema, type Question, type QuestionBankEntry } from "../../../domain";
import { reviewedEntry } from "./bank-helpers";

/**
 * Reviewed Domain 5 bank: Configuration and Knowledge Management.
 *
 * Scope: all four verified Domain 5 objectives. The items stay at the level the
 * official Anthropic documentation supports: how project knowledge, project
 * instructions, connectors, system-level instructions, and maintenance routines
 * behave. Product UI details and plan limits can change, so questions focus on
 * durable configuration decisions rather than screenshots or exact quotas.
 */

const projectConfigBrief: Question = questionSchema.parse({
  id: "config-project-brief-setup",
  type: "single-choice",
  stem: "You manage a recurring client account in Claude. Every chat in the client's project must follow the same brand voice and use the approved product brief. A colleague asks where to put the brief and the voice rules so they apply to future chats. What should you do?",
  choices: [
    {
      id: "project-knowledge-instructions",
      text: "Upload the brief to project knowledge and save the voice rules as project instructions, then start chats inside the project.",
      explanation:
        "Đúng: tài liệu trong project knowledge được dùng cho mọi chat trong project, còn project instructions được lưu một lần và áp dụng cho tất cả chat sau đó.",
    },
    {
      id: "paste-in-one-chat",
      text: "Paste the brief and the voice rules into the first chat and rely on later chats to remember them.",
      explanation:
        "Sai: dán vào một chat không tạo cấu hình dùng chung. Project memory có thể giữ lại một số thông tin, nhưng không bảo đảm và không thay thế knowledge/instructions; chat mới có thể không có đủ brief hoặc voice rules.",
    },
    {
      id: "project-description",
      text: "Put the voice rules in the project description, because Claude reads it before every chat.",
      explanation:
        "Sai: tên và mô tả project không được cung cấp cho Claude. Chúng dùng để con người quản lý project, không phải chỉ dẫn cho model.",
    },
    {
      id: "new-project-per-chat",
      text: "Create a separate project for each chat and re-upload the brief every time.",
      explanation:
        "Sai: tạo project mới cho từng chat làm mất lợi ích của knowledge và instructions dùng chung, đồng thời tăng nguy cơ mỗi chat dùng một phiên bản tài liệu khác nhau.",
    },
  ],
  correctChoiceIds: ["project-knowledge-instructions"],
  correctExplanation:
    "Project knowledge giữ tài liệu nguồn dùng chung cho mọi chat trong project; project instructions giữ các quy tắc hành vi, giọng điệu và ràng buộc. Đặt brief trong knowledge và voice rules trong instructions giúp cấu hình có thể tái sử dụng, cập nhật một chỗ và không phụ thuộc vào việc người dùng nhớ dán lại nội dung.",
  sourceIds: [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
  ],
});

const projectContextScope: Question = questionSchema.parse({
  id: "config-project-context-scope",
  type: "multiple-response",
  stem: "Which three statements about context in a Claude project are accurate? Select three.",
  choices: [
    {
      id: "knowledge-shared",
      text: "Files added to project knowledge are available across chats within that project.",
      explanation:
        "Đúng: knowledge base là nguồn context dùng chung cho các chat trong cùng project.",
    },
    {
      id: "instructions-shared",
      text: "Saved project instructions apply to every chat in the project.",
      explanation:
        "Đúng: project instructions được lưu ở cấp project và áp dụng cho tất cả chat bên trong.",
    },
    {
      id: "chat-context-isolated",
      text: "A new chat does not receive the full transcript of another chat; shared configuration belongs in project knowledge or project instructions.",
      explanation:
        "Đúng: transcript đầy đủ không tự lan sang chat khác. Project memory có thể giữ một số thông tin, nhưng knowledge và instructions mới là cấu hình dùng chung đáng tin cậy.",
    },
    {
      id: "description-visible",
      text: "The project name and description are passed to Claude as hidden instructions.",
      explanation:
        "Sai: tài liệu Anthropic nói rõ Claude không có quyền truy cập tên và mô tả project.",
    },
    {
      id: "memory-cross-project",
      text: "A project automatically uses memory saved in every other project in the account.",
      explanation:
        "Sai: mỗi project có memory riêng và không dùng memory của project khác; account memory là cơ chế khác và có thể tắt cho project.",
    },
    {
      id: "free-unlimited",
      text: "Free accounts can create an unlimited number of projects.",
      explanation:
        "Sai: tài khoản miễn phí bị giới hạn số project, nên không thể dùng project mới cho mọi tác vụ.",
    },
  ],
  correctChoiceIds: ["knowledge-shared", "instructions-shared", "chat-context-isolated"],
  correctExplanation:
    "Ba cơ chế cần phân biệt là knowledge base, project instructions và context của từng chat. Knowledge và instructions dùng chung ở cấp project; một chat mới không tự nhận toàn bộ transcript của chat khác, dù project memory có thể giữ lại một số thông tin. Vì vậy, đừng giả định Claude sẽ luôn nhớ một quyết định chỉ vì nó đã xuất hiện trong một cuộc trò chuyện trước đó; hãy đưa thông tin cần dùng chung vào knowledge hoặc instructions.",
  sourceIds: [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
  ],
});

const connectorRollout: Question = questionSchema.parse({
  id: "config-connector-rollout",
  type: "single-choice",
  stem: "A Team-plan organization wants Claude to search Google Drive, Gmail, and Calendar without employees uploading exports manually. What is the correct rollout sequence?",
  choices: [
    {
      id: "owner-enables-user-authenticates",
      text: "An Owner or Primary Owner enables the connectors for the organization, then each employee authenticates their own Google account.",
      explanation:
        "Đúng: bật connector ở cấp tổ chức chỉ làm connector available; mỗi người vẫn phải tự đăng nhập để Claude dùng đúng quyền của tài khoản đó.",
    },
    {
      id: "enable-grants-all-files",
      text: "The Owner enables the connectors once, and every employee immediately gets access to all organization files.",
      explanation:
        "Sai: bật connector không cấp quyền truy cập file. Claude thừa hưởng quyền của từng tài khoản nguồn, nên người không có quyền trong Drive vẫn không đọc được file đó.",
    },
    {
      id: "users-connect-personal",
      text: "Employees connect their personal Google accounts so the organization does not need to manage access.",
      explanation:
        "Sai: dùng tài khoản cá nhân có thể đưa dữ liệu công việc ra ngoài kiểm soát của tổ chức; đây cũng là rủi ro mà các cơ chế quản trị connector được thiết kế để giảm.",
    },
    {
      id: "export-and-upload",
      text: "Employees keep exporting email and calendar data to spreadsheets, then upload those files to each project.",
      explanation:
        "Sai: cách này vẫn là nhập thủ công, tạo bản sao dữ liệu ngoài nguồn gốc và dễ lỗi thời; nó không giải quyết mục tiêu dùng connector.",
    },
  ],
  correctChoiceIds: ["owner-enables-user-authenticates"],
  correctExplanation:
    "Với Team và Enterprise, connector phải được Owner hoặc Primary Owner bật ở cấp tổ chức trước; sau đó từng người dùng xác thực tài khoản của mình. Claude mirror quyền của tài khoản nguồn, nên việc bật connector không mở rộng quyền đọc dữ liệu và cũng không thay thế bước đăng nhập cá nhân.",
  sourceIds: [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ],
});

const connectorPermissionModel: Question = questionSchema.parse({
  id: "config-connector-permission-model",
  type: "multiple-response",
  stem: "Which three statements correctly describe connector permissions and action controls? Select three.",
  choices: [
    {
      id: "inherits-source-permissions",
      text: "Claude can only reach files, messages, or records that the connected user can already access in the source system.",
      explanation:
        "Đúng: connector thừa hưởng quyền của người dùng trong dịch vụ nguồn, không vượt qua permission của hệ thống đó.",
    },
    {
      id: "owners-restrict-writes",
      text: "On Team and Enterprise plans, an Owner can allow reads while blocking write or delete actions.",
      explanation:
        "Đúng: Owner có thể đặt các nhóm quyền ở mức Always allow, Needs approval hoặc Blocked, ví dụ cho phép đọc email nhưng chặn gửi.",
    },
    {
      id: "approval-before-send",
      text: "By default, Claude asks for approval before actions such as sending email or sharing a Drive file.",
      explanation:
        "Đúng: các hành động gửi, chia sẻ, di chuyển hoặc xóa mặc định cần người dùng phê duyệt, trừ khi tổ chức cấu hình khác.",
    },
    {
      id: "enable-grants-everything",
      text: "Enabling a connector at the organization level gives every member access to every file in the source system.",
      explanation:
        "Sai: bật connector chỉ làm dịch vụ available; quyền dữ liệu vẫn do tài khoản nguồn của từng người quyết định.",
    },
    {
      id: "connector-expands-access",
      text: "A connector can grant a user more access than that user has in Google Drive or Gmail.",
      explanation:
        "Sai: giới hạn hành động trong Claude chỉ thu hẹp quyền, không bao giờ cấp thêm quyền so với hệ thống nguồn.",
    },
    {
      id: "synced-content-shareable",
      text: "On Team and Enterprise plans, a chat containing synced connector content can be shared with the whole organization without restriction.",
      explanation:
        "Sai: tài liệu Anthropic nêu rõ chat có nội dung đồng bộ từ connector không thể chia sẻ, và connector chỉ dùng trong private project.",
    },
  ],
  correctChoiceIds: [
    "inherits-source-permissions",
    "owners-restrict-writes",
    "approval-before-send",
  ],
  correctExplanation:
    "Mô hình quyền của connector có ba lớp: quyền của tài khoản nguồn, chính sách bật/tắt ở cấp tổ chức, và quy tắc hành động trong Claude. Claude không thể đọc dữ liệu mà người dùng không có quyền, Owner có thể thu hẹp hành động ghi, và các hành động nhạy cảm mặc định cần phê duyệt. Cả ba lớp đều chỉ giới hạn quyền, không mở rộng quyền.",
  sourceIds: [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ],
});

const systemInstructionQuality: Question = questionSchema.parse({
  id: "config-system-instruction-quality",
  type: "single-choice",
  stem: "Which system-level instruction is most likely to produce consistent and safe responses from a billing support assistant?",
  choices: [
    {
      id: "role-sources-escalation",
      text: "You are a Tier 1 support assistant for Acme's billing portal. Answer only from the supplied policy pages, use plain language, and escalate refund or legal questions to a human agent.",
      explanation:
        "Đúng: chỉ dẫn nêu role, phạm vi nguồn, phong cách và đường escalation, nên vừa định hướng hành vi vừa đặt giới hạn rõ ràng.",
    },
    {
      id: "be-helpful",
      text: "Be as helpful as possible and answer every question confidently.",
      explanation:
        "Sai: quá mơ hồ và còn khuyến khích sự tự tin quá mức, trong khi không có nguồn, phạm vi hay quy tắc escalation.",
    },
    {
      id: "never-say-unknown",
      text: "Never say you do not know. If a policy is missing, infer the most likely answer.",
      explanation:
        "Sai: chỉ dẫn này trực tiếp khuyến khích bịa thông tin khi thiếu nguồn, làm tăng nguy cơ hallucination trong tình huống ảnh hưởng đến khách hàng.",
    },
    {
      id: "contradictory-rules",
      text: "Always give a refund immediately, never discuss refunds, and keep every answer under one sentence while explaining all policy details.",
      explanation:
        "Sai: các quy tắc mâu thuẫn và không khả thi khiến model phải chọn hoặc bỏ qua một phần chỉ dẫn, dẫn đến hành vi không nhất quán.",
    },
  ],
  correctChoiceIds: ["role-sources-escalation"],
  correctExplanation:
    "Một system-level instruction tốt tập trung vào hành vi ổn định: vai trò, người dùng, nguồn được phép, giới hạn và cách escalation. Nó không cần nhồi toàn bộ chính sách, nhưng phải đủ cụ thể để model biết khi nào trả lời, khi nào từ chối và khi nào chuyển cho con người.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-projects-manage",
  ],
});

const systemInstructionComponents: Question = questionSchema.parse({
  id: "config-system-instruction-components",
  type: "multiple-response",
  stem: "Which three elements belong in an effective system-level instruction? Select three.",
  choices: [
    {
      id: "role-and-audience",
      text: "The assistant's role and the audience it is serving.",
      explanation:
        "Đúng: role và audience định hướng giọng điệu, mức chi tiết và cách diễn đạt phù hợp.",
    },
    {
      id: "sources-and-uncertainty",
      text: "Which sources to rely on and what to do when information is missing or uncertain.",
      explanation:
        "Đúng: ràng buộc nguồn và cách xử lý uncertainty giúp giảm bịa đặt và làm phản hồi có thể kiểm chứng.",
    },
    {
      id: "escalation-and-format",
      text: "Escalation rules and the expected response format or length.",
      explanation:
        "Đúng: quy tắc escalation chỉ rõ khi nào chuyển sang con người; format giúp output ổn định và dễ dùng.",
    },
    {
      id: "entire-policy-verbatim",
      text: "The entire policy manual pasted verbatim into every instruction.",
      explanation:
        "Sai: nhồi toàn bộ tài liệu làm instruction dài, khó bảo trì và dễ lẫn với knowledge; chỉ nên đưa quy tắc hành vi cốt lõi, còn tài liệu để trong knowledge base.",
    },
    {
      id: "share-secrets",
      text: "Customer passwords and API keys so the assistant can verify identity.",
      explanation:
        "Sai: không bao giờ đưa bí mật vào instruction; đây là rủi ro bảo mật và vi phạm nguyên tắc tối thiểu hóa dữ liệu.",
    },
    {
      id: "all-caps",
      text: "Every sentence in all caps to make the rules more forceful.",
      explanation:
        "Sai: viết hoa toàn bộ không làm chỉ dẫn rõ hơn và có thể làm giảm khả năng tuân thủ các phần quan trọng khác.",
    },
  ],
  correctChoiceIds: ["role-and-audience", "sources-and-uncertainty", "escalation-and-format"],
  correctExplanation:
    "System-level instruction nên mô tả vai trò, nguồn được phép, cách xử lý thiếu thông tin, giới hạn và format. Tài liệu dài nên nằm trong knowledge base; instruction giữ phần hành vi ổn định và ngắn gọn để con người có thể review, cập nhật và kiểm thử.",
  sourceIds: [
    "anthropic-prompting-best-practices",
    "anthropic-projects-manage",
  ],
});

const knowledgeRefresh: Question = questionSchema.parse({
  id: "config-knowledge-refresh",
  type: "single-choice",
  stem: "A compliance policy changed last week. The shared project still contains the old PDF in project knowledge, and its project instructions cite the old deadline. What is the best maintenance action?",
  choices: [
    {
      id: "replace-update-retest",
      text: "Replace the obsolete PDF, update the instruction that cites the deadline, and re-test representative questions before the team relies on the project.",
      explanation:
        "Đúng: xử lý cả nguồn knowledge và instruction, rồi chạy lại các câu hỏi đại diện để xác nhận project trả lời theo phiên bản mới.",
    },
    {
      id: "tell-claude-ignore",
      text: "Leave both files in place and add a chat message telling Claude to ignore the old version.",
      explanation:
        "Sai: một tin nhắn trong chat không sửa knowledge hay instruction dùng chung, và chat khác vẫn có thể đọc tài liệu cũ.",
    },
    {
      id: "delete-project",
      text: "Delete the whole project and ask the team to rebuild it from memory.",
      explanation:
        "Sai: xóa project làm mất cấu hình, quyền và knowledge đã được review; hành động này quá mức so với việc cập nhật nguồn.",
    },
    {
      id: "wait-for-rag",
      text: "Wait for RAG to activate automatically, because retrieval will find the new policy on the web.",
      explanation:
        "Sai: RAG chỉ tìm trong knowledge của project và không tự thay thế tài liệu cũ bằng nguồn mới trên web.",
    },
  ],
  correctChoiceIds: ["replace-update-retest"],
  correctExplanation:
    "Bảo trì cấu hình là thay đổi có kiểm soát: xóa hoặc thay nguồn lỗi thời, sửa instruction tham chiếu đến nó, rồi kiểm thử lại các câu hỏi đại diện. Chỉ thêm một lời nhắc trong chat không đủ vì knowledge và instructions được dùng chung cho mọi chat trong project.",
  sourceIds: [
    "anthropic-projects-manage",
    "anthropic-projects-rag",
  ],
});

const maintenanceCadence: Question = questionSchema.parse({
  id: "config-maintenance-cadence",
  type: "multiple-response",
  stem: "Which three practices keep a shared project configuration trustworthy over time? Select three.",
  choices: [
    {
      id: "named-owner",
      text: "Assign a named owner who reviews knowledge sources and instructions on a set schedule.",
      explanation:
        "Đúng: có người chịu trách nhiệm và lịch review giúp phát hiện tài liệu lỗi thời trước khi người dùng gặp lỗi.",
    },
    {
      id: "remove-and-version",
      text: "Remove obsolete files and record which version of a source the project is supposed to use.",
      explanation:
        "Đúng: xóa nguồn cũ và ghi phiên bản giúp tránh trộn lẫn chính sách cũ với chính sách mới.",
    },
    {
      id: "regression-tests",
      text: "Re-run a small set of representative questions after any material change.",
      explanation:
        "Đúng: kiểm thử hồi quy cho thấy thay đổi knowledge hoặc instruction có làm hỏng câu trả lời quan trọng hay không.",
    },
    {
      id: "never-change",
      text: "Never change a configuration that has already produced a good answer once.",
      explanation:
        "Sai: nguồn và chính sách thay đổi; cấu hình tốt trong quá khứ có thể trở nên sai hoặc lỗi thời.",
    },
    {
      id: "conflicting-copies",
      text: "Keep several conflicting copies of each policy so Claude can choose the most convenient one.",
      explanation:
        "Sai: nhiều bản mâu thuẫn làm tăng khả năng trích dẫn sai và khiến việc kiểm chứng không thể thực hiện nhất quán.",
    },
    {
      id: "rely-on-memory",
      text: "Rely on project memory to remember which documents are current instead of maintaining the sources.",
      explanation:
        "Sai: memory không thay thế việc quản lý nguồn; tài liệu lỗi thời vẫn nằm trong knowledge và có thể được dùng.",
    },
  ],
  correctChoiceIds: ["named-owner", "remove-and-version", "regression-tests"],
  correctExplanation:
    "Một cấu hình đáng tin cậy cần ownership, vệ sinh nguồn dữ liệu và kiểm thử sau thay đổi. Người phụ trách review theo lịch, tài liệu cũ bị xóa hoặc thay thế có ghi phiên bản, và bộ câu hỏi đại diện được chạy lại để phát hiện regression trước khi project tiếp tục được dùng.",
  sourceIds: [
    "anthropic-projects-manage",
    "anthropic-projects-rag",
    "anthropic-prompting-best-practices",
  ],
});

export const domainFiveQuestionBank: QuestionBankEntry[] = [
  reviewedEntry(projectConfigBrief, "config-project-instructions", [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
  ]),
  reviewedEntry(projectContextScope, "config-project-instructions", [
    "anthropic-projects-overview",
    "anthropic-projects-manage",
  ]),
  reviewedEntry(connectorRollout, "config-knowledge-connectors", [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ]),
  reviewedEntry(connectorPermissionModel, "config-knowledge-connectors", [
    "anthropic-connectors-help",
    "anthropic-google-workspace-connectors",
  ]),
  reviewedEntry(systemInstructionQuality, "config-system-instructions", [
    "anthropic-prompting-best-practices",
    "anthropic-projects-manage",
  ]),
  reviewedEntry(systemInstructionComponents, "config-system-instructions", [
    "anthropic-prompting-best-practices",
    "anthropic-projects-manage",
  ]),
  reviewedEntry(knowledgeRefresh, "config-maintain", [
    "anthropic-projects-manage",
    "anthropic-projects-rag",
  ]),
  reviewedEntry(maintenanceCadence, "config-maintain", [
    "anthropic-projects-manage",
    "anthropic-projects-rag",
    "anthropic-prompting-best-practices",
  ]),
];
