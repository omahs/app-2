import {i18n} from '../../i18n.config';
import {Proposal} from 'utils/types';
/**
 * Note: This function will return a list of timestamp that we can use to categorize transfers
 * @return a object with milliseconds params
 */
export function getDateSections(): {
  lastWeek: number;
  lastMonth: number;
  lastYear: number;
} {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const lastWeek: number = new Date(date.setDate(diff)).getTime();
  const lastMonth: number = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  ).getTime();
  const lastYear: number = new Date(date.getFullYear(), 0, 1).getTime();

  return {
    lastWeek,
    lastMonth,
    lastYear,
  };
}

export function getDateProposals(
  type: Proposal['type'],
  timestamp: number | string // in seconds
): string | null {
  const currentTimestamp = Math.floor(new Date().getTime() / 1000);
  let days: number, hours: number;
  if (type === 'pending') {
    const leftTimestamp = parseInt(`${timestamp}`) - currentTimestamp;
    days = leftTimestamp / 86400;
    hours = (leftTimestamp % 86400) / 60;
    return i18n.t(`governance.proposals.${type}`, {days, hours}) as string;
  }
  if (type === 'active') {
    const leftTimestamp = currentTimestamp - parseInt(`${timestamp}`);
    days = leftTimestamp / 86400;
    hours = (leftTimestamp % 86400) / 60;
    return i18n.t(`governance.proposals.${type}`, {days, hours}) as string;
  }
  return null;
}
