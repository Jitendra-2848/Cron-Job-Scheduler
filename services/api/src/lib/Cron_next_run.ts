import { CronExpressionParser } from "cron-parser";

export function getNextRunAt(cronExpression: string): Date {
  const interval = CronExpressionParser.parse(cronExpression, {
    currentDate: new Date(),
  });

  return interval.next().toDate();
}
