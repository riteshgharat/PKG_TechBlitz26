type LogLevel = "info" | "warn" | "error" | "debug";

const colors: Record<LogLevel, string> = {
  info: "\x1b[36m",   // cyan
  warn: "\x1b[33m",   // yellow
  error: "\x1b[31m",  // red
  debug: "\x1b[90m",  // gray
};

const reset = "\x1b[0m";

function log(level: LogLevel, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const color = colors[level];
  const prefix = `${color}[${level.toUpperCase()}]${reset} ${timestamp}`;

  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

export const logger = {
  info: (msg: string, data?: unknown) => log("info", msg, data),
  warn: (msg: string, data?: unknown) => log("warn", msg, data),
  error: (msg: string, data?: unknown) => log("error", msg, data),
  debug: (msg: string, data?: unknown) => log("debug", msg, data),
};
