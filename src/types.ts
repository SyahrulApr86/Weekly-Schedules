export interface ScheduleItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  color: string;
  details?: string;
}

export type DaySchedule = {
  [key: string]: ScheduleItem[];
};