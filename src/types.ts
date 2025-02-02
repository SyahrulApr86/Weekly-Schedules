export interface ScheduleItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  color: string;
  details?: string;
  groupId: string;
}

export interface ScheduleGroup {
  id: string;
  name: string;
  createdAt: string;
}

export type DaySchedule = {
  [key: string]: ScheduleItem[];
};