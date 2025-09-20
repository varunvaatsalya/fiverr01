export const logger = (message, type = "info") => {
  const colors = {
    info: "\x1b[36m%s\x1b[0m",   // cyan
    warn: "\x1b[33m%s\x1b[0m",   // yellow
    error: "\x1b[31m%s\x1b[0m",  // red
  };

  console.log(colors[type] || colors.info, `[${type.toUpperCase()}] ${message}`);
};