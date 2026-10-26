import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { glossary } from "../features/curriculum/glossary";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function GlossaryPage() {
  useDocumentTitle("Glossary");

  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return glossary;
    }

    return glossary.filter((entry) =>
      [entry.term, entry.expansion ?? "", entry.vi, entry.definition, entry.category]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Reference"
        title="Technical glossary"
        lede="English terms kept intact, with a Vietnamese explanation of what each one actually changes in practice. Definitions are general study notes, not official exam wording."
        meta={<Badge tone="warn">Pending exam review</Badge>}
      />

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
          {normalizedQuery
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
              <button type="button" className="button button--secondary" onClick={() => setQuery("")}>
                Show all terms
              </button>
            }
          >
            Nothing in the glossary matches “{query.trim()}”. Try a shorter term such as{" "}
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
