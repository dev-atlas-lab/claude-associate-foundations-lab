import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { glossary } from "../content";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function GlossaryPage() {
  useDocumentTitle("Glossary");

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const normalizedQuery = query.trim().toLowerCase();

  const categories = useMemo(() => {
    const unique = [...new Set(glossary.map((entry) => entry.category))].sort();
    return ["all", ...unique];
  }, []);

  const countsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set("all", glossary.length);
    for (const entry of glossary) {
      counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
    }
    return counts;
  }, []);

  const results = useMemo(() => {
    let items =
      selectedCategory === "all"
        ? glossary
        : glossary.filter((entry) => entry.category === selectedCategory);

    if (normalizedQuery) {
      items = items.filter((entry) =>
        [entry.term, entry.expansion ?? "", entry.vi, entry.definition, entry.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    }

    return items;
  }, [selectedCategory, normalizedQuery]);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Reference"
        title="Technical glossary"
        lede="English terms kept intact, with a Vietnamese explanation of what each one actually changes in practice. Definitions are general study notes, not official exam wording."
        meta={<Badge tone="info">General study notes</Badge>}
      />

      <div className="study-filters" role="group" aria-label="Filter terms by category">
        {categories.map((cat) => {
          const count = countsByCategory.get(cat) ?? 0;
          const label = cat === "all" ? "All categories" : cat;
          const isSelected = selectedCategory === cat;

          return (
            <button
              type="button"
              className="study-filter"
              key={cat}
              aria-pressed={isSelected}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{label}</span>
              <span className="study-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="search-row">
        <div className="field">
          <label className="field-label" htmlFor="glossary-search">
            Search terms
          </label>
          <input
            id="glossary-search"
            className="text-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. context window, token, RAG"
            autoComplete="off"
          />
        </div>
        {query ? (
          <button type="button" className="button button--ghost" onClick={() => setQuery("")}>
            Clear
          </button>
        ) : null}
        <p className="result-count" role="status">
          {normalizedQuery || selectedCategory !== "all"
            ? `${results.length} of ${glossary.length} terms`
            : `${glossary.length} terms`}
        </p>
      </div>

      <section className="section" aria-label="Glossary entries">
        {results.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching terms"
            actions={
              <button
                type="button"
                className="button button--secondary"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("all");
                }}
              >
                Show all terms
              </button>
            }
          >
            Nothing in the glossary matches “{query.trim() || selectedCategory}”. Try a shorter term such as{" "}
            <span className="mono">token</span> or <span className="mono">context</span>.
          </EmptyState>
        ) : (
          <ul className="glossary-list">
            {results.map((entry) => (
              <li className="glossary-entry" key={entry.term}>
                <div className="glossary-head">
                  <h2 className="glossary-term" lang="en">
                    {entry.term}
                  </h2>
                  {entry.expansion ? (
                    <span className="glossary-expansion">({entry.expansion})</span>
                  ) : null}
                  <Badge>{entry.category}</Badge>
                </div>
                <p className="glossary-vi">{entry.vi}</p>
                <p className="glossary-definition">{entry.definition}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
