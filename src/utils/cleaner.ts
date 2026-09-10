/**
 * Cleans and formats raw LLM output into a clean, human-readable response.
 */
export function cleanCopilotResponse(rawText: string): string {
  if (!rawText) return '';

  return (
    rawText
      // 1. Unescape escaped characters (e.g. \n -> newline, \" -> ")
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')

      // 2. Fix multiple redundant blank lines (collapse 3+ newlines into 2)
      .replace(/\n{3,}/g, '\n\n')

      // 3. Clean up loose spaces at the end of lines
      .replace(/[ \t]+$/gm, '')

      // 4. Ensure headers have proper spacing above them
      .replace(/([^\n])\n(###?\s+)/g, '$1\n\n$2')

      // 5. Clean up list bullet point spacing
      .replace(/^\s*[\*\-]\s+/gm, '• ')

      // 6. Final trim
      .trim()
  );
}