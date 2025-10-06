type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export function logJson(level: LogLevel, msg: string, extra: Record<string, any> = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    level,
    msg,
    time: timestamp,
    ...extra
  };

  // In development, use pretty console logging
  if (process.env.NODE_ENV === 'development') {
    const emoji = { info: '📝', warn: '⚠️', error: '❌', debug: '🔍' };
    console.log(`${emoji[level]} [${level.toUpperCase()}] ${msg}`, extra);
  } else {
    // In production, use JSON for log aggregation systems
    console.log(JSON.stringify(logEntry));
  }
}
