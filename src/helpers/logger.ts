import pino from 'pino';
import type { Logger } from 'pino';
import pretty from 'pino-pretty';
import type { PrettyStream } from 'pino-pretty';

let _stream: PrettyStream | null = null;
let _logger: Logger | null = null;

export function getDevLogger() {
  if (_logger) {
    return _logger;
  }

  _stream = pretty({
    colorize: true,
  });
  _logger = pino(_stream);
  return _logger;
}
