import { ArrowUpRight, BookOpen, BrainCircuit, Clock3, Layers3, Target } from "lucide-react";

const domains = [
  { number: "01", title: "Output Evaluation and Validation", weight: "Verify against official guide", tone: "peach" },
  { number: "02", title: "Workflow Integration and Solution Design", weight: "Verify against official guide", tone: "blue" },
  { number: "03", title: "Governance, Risk, and Responsible Use", weight: "Verify against official guide", tone: "green" },
  { number: "04", title: "Prompting and Task Execution", weight: "Verify against official guide", tone: "lilac" },
];

export function DashboardPage() {
  return (
    <div className="page-content">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">YOUR LEARNING SPACE</p>
          <h1>Understand the concepts.<br /><span>Think like the exam.</span></h1>
          <p className="welcome-copy">
            Build a strong mental model, explore ideas visually, and practice making decisions in English.
          </p>
        </div>
        <div className="orbit-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-core"><BrainCircuit size={34} /></div>
          <span className="orbit-node node-one" />
          <span className="orbit-node node-two" />
          <span className="orbit-node node-three" />
        </div>
      </section>

      <section className="stat-grid" aria-label="Learning overview">
        <article className="stat-card">
          <div className="stat-icon"><BookOpen size={18} /></div>
          <p>LESSONS COMPLETED</p>
          <strong>— <small>/ to be started</small></strong>
        </article>
        <article className="stat-card">
          <div className="stat-icon"><Target size={18} /></div>
          <p>QUIZ ACCURACY</p>
          <strong>— <small>no attempts yet</small></strong>
        </article>
        <article className="stat-card">
          <div className="stat-icon"><Clock3 size={18} /></div>
          <p>STUDY TIME</p>
          <strong>— <small>no activity yet</small></strong>
        </article>
      </section>

      <section className="section-heading">
        <div>
          <p className="eyebrow">THE CURRICULUM</p>
          <h2>Explore the exam domains</h2>
          <p>Coverage and objectives will be verified against Anthropic’s official exam guide.</p>
        </div>
        <Layers3 size={22} className="section-icon" />
      </section>

      <section className="domain-grid">
        {domains.map((domain) => (
          <article className="domain-card" key={domain.number}>
            <div className={`domain-number ${domain.tone}`}>{domain.number}</div>
            <div className="domain-content">
              <h3>{domain.title}</h3>
              <p>{domain.weight}</p>
              <span className="domain-link">Curriculum research pending <ArrowUpRight size={15} /></span>
            </div>
          </article>
        ))}
      </section>
      <p className="scaffold-note">Starter scaffold · Progress indicators are intentionally empty until real learning data exists.</p>
    </div>
  );
}
