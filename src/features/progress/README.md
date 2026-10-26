# Progress feature

Use versioned localStorage data for progress, quiz attempts, bookmarks, and exam history.

Requirements:
- Never show fabricated activity.
- Handle malformed, missing, and older-version data safely.
- Keep storage access behind a small typed abstraction.
- Provide a user-confirmed reset option.
- Explain that progress is local to the current browser and is not cloud-synced.
