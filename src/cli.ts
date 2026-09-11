import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { assertGeminiConfigured } from './config/env.js';
import { logger } from './config/logger.js';
import { getDatabase } from './db/database.js';
import { opsService } from './services/opsService.js';
import { CopilotEngine } from './services/copilotEngine.js';
import { cleanCopilotResponse } from './utils/cleaner.js';

function renderCliMarkdown(text: string): string {
  return text
    .replace(/^#{1,3}\s+(.*)$/gm, '\x1b[1;36m$1\x1b[0m')
    .replace(/\*\*(.*?)\*\*/g, '\x1b[1;37m$1\x1b[0m')
    .replace(/^•\s+(.*)$/gm, ' \x1b[33m•\x1b[0m $1');
}

async function main(): Promise<void> {
  assertGeminiConfigured();
  getDatabase();

  const session = opsService.getOrCreateSession(undefined, 'cli-agent');
  const engine = new CopilotEngine(logger);
  const rl = readline.createInterface({ input, output });

  console.log('Cars24 Ops Copilot CLI');
  console.log(`Session ${session.id}`);
  console.log('Try: Why is C24-ORD-1002 not scheduled for delivery?');
  console.log('Type /exit to quit.\n');

  try {
    for (;;) {
      const line = (await rl.question('agent> ')).trim();
      if (line.length === 0) {
        continue;
      }
      if (line === '/exit' || line === '/quit') {
        break;
      }

      opsService.appendMessage({
        id: crypto.randomUUID(),
        sessionId: session.id,
        role: 'user',
        content: line,
        toolInvocations: null,
        createdAt: new Date().toISOString(),
      });

      try {
        const result = await engine.chat(line, session.id, crypto.randomUUID());
        const answer = cleanCopilotResponse(result.answer);
        opsService.appendMessage({
          id: crypto.randomUUID(),
          sessionId: session.id,
          role: 'assistant',
          content: answer,
          toolInvocations: result.toolInvocations,
          createdAt: new Date().toISOString(),
        });
        console.log(`\n${renderCliMarkdown(answer)}\n`);
      } catch (error) {
        console.error('Copilot request failed:', error instanceof Error ? error.message : error);
      }
    }
  } finally {
    rl.close();
  }
}

void main();
