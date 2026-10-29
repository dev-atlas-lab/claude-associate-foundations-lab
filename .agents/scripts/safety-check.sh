#!/usr/bin/env python3
import json
import re
import sys

try:
    raw = sys.stdin.read().strip()
    payload = json.loads(raw) if raw else {}
except Exception:
    payload = {}

cmd = payload.get("toolCall", {}).get("args", {}).get("CommandLine", "") or ""

# 1. Prompt before any file deletion or destructive git commands
delete_pattern = re.compile(
    r"(^|[;&|]\s*)(rm|unlink|shred|git\s+(rm|clean|reset\s+--hard|checkout\s+--|restore))\b"
)
if delete_pattern.search(cmd):
    print(json.dumps({
        "decision": "force_ask",
        "reason": "Command deletes or resets files. Please confirm before proceeding."
    }))
    sys.exit(0)

# 2. Prompt before modifying protected files via shell redirection or in-place edits
protected_files_pattern = re.compile(
    r"(\.env|vercel\.json|package\.json|package-lock\.json|tsconfig.*\.json|docs/(EXAM_BLUEPRINT|PRODUCT_SPEC|CONTENT_COVERAGE_MATRIX)\.md|src/domain/|src/content/)"
)
write_redirect_pattern = re.compile(r"(>|tee\b|sed\s+-i|mv\b|cp\b)")
if protected_files_pattern.search(cmd) and write_redirect_pattern.search(cmd):
    print(json.dumps({
        "decision": "force_ask",
        "reason": "Command modifies or overwrites important project files. Approval required."
    }))
    sys.exit(0)

# 3. Auto-approve safe commands
print(json.dumps({"decision": "allow"}))
