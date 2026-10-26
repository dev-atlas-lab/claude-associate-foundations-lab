import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="not-found">
      <p className="eyebrow">404 · PAGE NOT FOUND</p>
      <h1>This lesson hasn’t been mapped yet.</h1>
      <p>The learning route may be added as the curriculum is implemented.</p>
      <Link className="primary-button" to="/">Return to dashboard</Link>
    </section>
  );
}
