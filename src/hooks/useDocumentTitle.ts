import { useEffect } from "react";

const SITE_NAME = "Claude Foundations Lab";

/** Keep the browser tab honest about the current route. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
