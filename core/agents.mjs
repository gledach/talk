/* Who counts as a local AI coding agent.
 *
 * The process name is not enough. The leak this tool exists for was
 * Cursor.exe --type=utility --utility-sub-type=node.mojom.NodeService.
 * VS Code uses that same utility subtype, so the subtype alone is not a tag.
 * A process is an agent when it, or any parent, matches. */

const NAME = /^(cursor|claude|grok|codex|windsurf|aider)(\.exe)?$/i;
const CMD = /\\cursor\\|claude|anthropic|grok|openai|codex|copilot/i;

export function selfMatch(proc) {
  if (!proc) return false;
  if (NAME.test(String(proc.name ?? ''))) return true;
  if (CMD.test(String(proc.commandLine ?? ''))) return true;
  return false;
}

/** ancestors[0] is the process itself, then its parent, and so on. */
export function isAgent(ancestors) {
  if (!Array.isArray(ancestors)) return false;
  return ancestors.some(selfMatch);
}
