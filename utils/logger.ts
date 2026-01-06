/**
 * EMPIRION LOGGING PROTOCOL v1.0
 * Standardized reporting for Vercel Build & Runtime monitoring.
 */

export enum LogContext {
  DASHBOARD = "Dashboard-Sync",
  TURNOVER = "Oracle-Turnover",
  SUPABASE = "Supabase-Data-Node",
  SIMULATION = "Simulation-Kernel",
  ADMIN = "Admin-Command",
  AUTH = "Auth-Protocol",
  DATABASE = "Database-Query"
}

export const logError = (context: LogContext, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.error(
    `[EMPIRION CRITICAL] ${timestamp} | Context: ${context} | Message: ${message}`,
    data ? `| Meta: ${JSON.stringify(data)}` : ""
  );
};

export const logInfo = (context: LogContext, message: string) => {
  console.info(`[EMPIRION INFO] ${context} > ${message}`);
};

export const logWarn = (context: LogContext, message: string) => {
  console.warn(`[EMPIRION WARNING] ${context} > ${message}`);
};