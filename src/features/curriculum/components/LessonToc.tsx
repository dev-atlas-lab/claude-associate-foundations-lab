import type { OutlineItem } from "../outline";

export function LessonToc({ items }: { items: OutlineItem[] }) {
  return (
    <nav className="toc" aria-label="On this page">
      <p className="toc-title">On this page</p>
      <ul className="toc-list">
        {items.map((item) => (
          <li key={item.id}>
            <a className="toc-link" href={`#${item.id}`}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
