/**
 * Turns raw LLM output into a short, readable ops-desk reply.
 * Handles JSON wrappers, code fences, escaped newlines, and noisy markdown.
 */
export function cleanCopilotResponse(rawText: string): string {
  if (!rawText) {
    return '';
  }

  let text = unwrapModelPayload(rawText.trim());

  text = stripCodeFences(text);
  text = unescapeCommonSequences(text);
  text = text.replace(/\r\n/g, '\n');
  text = text.replace(/[ \t]+$/gm, '');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/([^\n])\n(#{1,3}\s+)/g, '$1\n\n$2');
  text = text.replace(/^\s*[-*]\s+/gm, '• ');
  text = text.replace(/^\s{2,}(• )/gm, '$1');

  return text.trim();
}

function unwrapModelPayload(raw: string): string {
  const asQuotedString = tryParseJsonString(raw);
  if (asQuotedString !== null) {
    return asQuotedString;
  }

  const asObject = tryParseJsonObject(raw);
  if (asObject) {
    const nested =
      pickStringField(asObject, ['answer', 'text', 'message', 'content', 'reply']) ??
      JSON.stringify(asObject, null, 2);
    return nested;
  }

  return raw;
}

function tryParseJsonString(raw: string): string | null {
  if (!(raw.startsWith('"') && raw.endsWith('"'))) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

function tryParseJsonObject(raw: string): Record<string, unknown> | null {
  if (!(raw.startsWith('{') && raw.endsWith('}'))) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function pickStringField(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}

function stripCodeFences(text: string): string {
  const fenced = text.match(/^```(?:json|markdown|md|text)?\s*\n?([\s\S]*?)\n?```$/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return text.replace(/```(?:json|markdown|md|text)?\s*/gi, '').replace(/```/g, '');
}

function unescapeCommonSequences(text: string): string {
  return text.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"');
}
