const { runSlaCheck } = require("./sla.job");
const { runSlaWarningCheck } = require("./notification.job");
const { purgeOldNotifications } = require("./cleanup.job");

const intervals = [];
const runningJobs = new Set();

const asPositiveInteger = (value, fallback) => {
  const number = Number.parseInt(value, 10);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
};

const runSafely = (name, job) => async () => {
  if (runningJobs.has(name)) {
    console.warn(`[jobs] ${name} skipped because the previous run is still active`);
    return;
  }
  runningJobs.add(name);
  try {
    const result = await job();
    console.info(`[jobs] ${name} completed`, result);
  } catch (error) {
    console.error(`[jobs] ${name} failed:`, error.message);
  } finally {
    runningJobs.delete(name);
  }
};

const startJobs = () => {
  if (process.env.NODE_ENV === "test" || process.env.ENABLE_BACKGROUND_JOBS !== "true") {
    return [];
  }
  if (intervals.length) return intervals;

  const slaInterval = asPositiveInteger(process.env.SLA_CHECK_INTERVAL_MS, 60 * 60 * 1000);
  const notificationInterval = asPositiveInteger(process.env.NOTIFICATION_CHECK_INTERVAL_MS, 60 * 60 * 1000);
  const cleanupInterval = asPositiveInteger(process.env.CLEANUP_INTERVAL_MS, 24 * 60 * 60 * 1000);
  const retentionDays = asPositiveInteger(process.env.NOTIFICATION_RETENTION_DAYS, 90);

  intervals.push(
    setInterval(runSafely("SLA warning check", runSlaWarningCheck), notificationInterval),
    setInterval(runSafely("SLA breach check", runSlaCheck), slaInterval),
    setInterval(runSafely("notification cleanup", () => purgeOldNotifications(retentionDays)), cleanupInterval)
  );
  return intervals;
};

const stopJobs = () => {
  while (intervals.length) clearInterval(intervals.pop());
};

module.exports = { startJobs, stopJobs };
