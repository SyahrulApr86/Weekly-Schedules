import React from 'react';
import { Clock, Trash2, Calendar } from 'lucide-react';
import type { DaySchedule } from '../types';

interface ScheduleDisplayProps {
  schedule: DaySchedule;
  onDeleteSchedule: (id: string) => void;
}

const timeSlots = Array.from({ length: 24 }, (_, i) => 
  `${i.toString().padStart(2, '0')}:00`
);

export function ScheduleDisplay({ schedule, onDeleteSchedule }: ScheduleDisplayProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getScheduleForTimeSlot = (day: string, time: string) => {
    return schedule[day]?.filter(item => {
      const slotTime = new Date(`2024-01-01T${time}`);
      const startTime = new Date(`2024-01-01T${item.startTime}`);
      const endTime = new Date(`2024-01-01T${item.endTime}`);
      return slotTime >= startTime && slotTime < endTime;
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr>
            <th className="p-4 border-b border-r bg-gray-50 font-semibold text-gray-600 sticky left-0 z-10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </div>
            </th>
            {days.map(day => (
              <th key={day} className="p-4 border-b bg-gray-50 font-semibold text-gray-600 min-w-[200px]">
                <div className="flex items-center gap-2 justify-center">
                  <Calendar className="w-4 h-4" />
                  {day}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(time => (
            <tr key={time} className="group">
              <td className="p-3 border-r text-sm font-medium text-gray-600 bg-gray-50 whitespace-nowrap sticky left-0 z-10 group-hover:bg-gray-100">
                {time}
              </td>
              {days.map(day => {
                const activities = getScheduleForTimeSlot(day, time);
                return (
                  <td key={day} className="p-2 border-r border-b border-gray-100">
                    {activities?.map(activity => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-2 rounded-lg mb-1 text-sm transition-transform hover:scale-[1.02] relative group/item"
                        style={{ backgroundColor: activity.color }}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700 font-medium">
                            {activity.startTime}-{activity.endTime}
                            <br />
                            {activity.activity}
                          </span>
                        </div>
                        <button
                          onClick={() => onDeleteSchedule(activity.id)}
                          className="opacity-0 group-hover/item:opacity-100 text-red-600 hover:text-red-800 transition-all absolute -right-1 -top-1 bg-white rounded-full p-1 shadow-sm hover:shadow-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}