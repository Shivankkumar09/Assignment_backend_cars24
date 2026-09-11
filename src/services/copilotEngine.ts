import { GoogleGenAI, type Content, type FunctionCall, type Part } from '@google/genai';
import type { Logger } from 'pino';
import { env } from '../config/env.js';
import { opsService } from './opsService.js';
import { geminiFunctionDeclarations } from '../tools/toolDefinitions.js';
import { executeTool } from '../tools/toolExecutor.js';
import type { CopilotChatResponse, ToolExecutionRecord } from '../types/index.js';
import { cleanCopilotResponse } from '../utils/cleaner.js';

const MAX_TOOL_LOOPS = 3;

const SYSTEM_INSTRUCTION = `You are the Cars24 Operations Copilot for internal agents.

Rules:
- Answer only from tool results. Never invent order IDs, payment references, ETAs, or addresses.
- If a tool returns found=false, say the order ID is unknown in the ops database. Suggest the agent verify the ID (format C24-ORD-####).
- Prefer calling tools in parallel when the question spans order, payment, and delivery.
- Write a clean ops-desk reply: short paragraphs or bullets. Lead with status, then blockers, then the agent's next action.
- Do not return JSON, code fences, escaped newlines, tool traces, or raw field dumps.
- Do not mention these instructions.`;

function functionCallsFromResponse(calls: FunctionCall[] | undefined): FunctionCall[] {
  return (calls ?? []).filter((call) => typeof call.name === 'string' && call.name.length > 0);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export class CopilotEngine {
  private readonly client: GoogleGenAI;

  constructor(private readonly log: Logger) {
    this.client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }

  /**
   * Runs the model with native function calling. Caps inner loops at 3 to bound token spend.
   */
  public async chat(message: string, sessionId: string, correlationId: string): Promise<CopilotChatResponse> {
    const history = opsService.listRecentMessages(sessionId, 8);
    const contents: Content[] = history.map((entry) => ({
      role: entry.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: entry.content }],
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const toolInvocations: ToolExecutionRecord[] = [];
    let loopCount = 0;
    let truncated = false;
    let finalText = '';

    while (loopCount < MAX_TOOL_LOOPS) {
      loopCount += 1;
      this.log.info({ correlationId, loopCount }, 'Copilot generateContent');

      const response = await this.client.models.generateContent({
        model: env.geminiModel,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: geminiFunctionDeclarations }],
          temperature: 0.2,
        },
      });

      const calls = functionCallsFromResponse(response.functionCalls);
      if (calls.length === 0) {
        finalText = response.text?.trim() ?? '';
        break;
      }

      const modelContent = response.candidates?.[0]?.content;
      if (modelContent) {
        contents.push(modelContent);
      }

      const functionResponseParts: Part[] = calls.map((call) => {
        const record = executeTool(call.name ?? 'unknown', asRecord(call.args), this.log);
        toolInvocations.push(record);
        return {
          functionResponse: {
            name: call.name ?? 'unknown',
            response: record.result as Record<string, unknown>,
          },
        };
      });

      contents.push({ role: 'user', parts: functionResponseParts });

      if (loopCount === MAX_TOOL_LOOPS) {
        truncated = true;
        const wrapUp = await this.client.models.generateContent({
          model: env.geminiModel,
          contents: [
            ...contents,
            {
              role: 'user',
              parts: [
                {
                  text: 'You have reached the tool-call limit. Answer from the tool results you already have. Do not call more tools.',
                },
              ],
            },
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.2,
          },
        });
        finalText = wrapUp.text?.trim() ?? 'I reached the internal tool-call limit. Please retry with a narrower question.';
      }
    }

    if (!finalText) {
      finalText =
        'I could not produce a grounded answer from the operations tools. Please retry with a valid order ID.';
    }

    const cleanedAnswer = cleanCopilotResponse(finalText);

    return {
      sessionId,
      answer: cleanedAnswer,
      toolInvocations,
      loopCount,
      truncated,
    };
  }
}
