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

  const getTimeInMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getScheduleForTimeSlot = (day: string, time: string) => {
    if (!schedule[day]) return null;
    
    const slotMinutes = getTimeInMinutes(time);
    
    return schedule[day].filter(item => {
      const startMinutes = getTimeInMinutes(item.startTime);
      const endMinutes = getTimeInMinutes(item.endTime);
      
      // Only return activities that start in this time slot
      const slotStart = Math.floor(slotMinutes / 60) * 60;
      const slotEnd = slotStart + 59;
      return startMinutes >= slotStart && startMinutes <= slotEnd;
    });
  };

  const calculatePosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const minutePercentage = (minutes / 60) * 100;
    return minutePercentage;
  };

  const calculateHeight = (startTime: string, endTime: string) => {
    const startMinutes = getTimeInMinutes(startTime);
    const endMinutes = getTimeInMinutes(endTime);
    const durationInHours = (endMinutes - startMinutes) / 60;
    return durationInHours;
  };

  const calculateWidth = (day: string, startTime: string, endTime: string) => {
    if (!schedule[day]) return 100;

    const currentStartMinutes = getTimeInMinutes(startTime);
    const currentEndMinutes = getTimeInMinutes(endTime);

    // Find overlapping events
    const overlappingEvents = schedule[day].filter(item => {
      const itemStartMinutes = getTimeInMinutes(item.startTime);
      const itemEndMinutes = getTimeInMinutes(item.endTime);

      return (
        (itemStartMinutes <= currentEndMinutes && itemEndMinutes >= currentStartMinutes) ||
        (currentStartMinutes <= itemEndMinutes && currentEndMinutes >= itemStartMinutes)
      );
    });

    return overlappingEvents.length > 0 ? 100 / overlappingEvents.length : 100;
  };

  const calculateLeftOffset = (day: string, startTime: string, endTime: string, currentId: string) => {
    if (!schedule[day]) return 0;

    const currentStartMinutes = getTimeInMinutes(startTime);
    const currentEndMinutes = getTimeInMinutes(endTime);

    // Find overlapping events
    const overlappingEvents = schedule[day].filter(item => {
      const itemStartMinutes = getTimeInMinutes(item.startTime);
      const itemEndMinutes = getTimeInMinutes(item.endTime);

      return (
        (itemStartMinutes <= currentEndMinutes && itemEndMinutes >= currentStartMinutes) ||
        (currentStartMinutes <= itemEndMinutes && currentEndMinutes >= itemStartMinutes)
      );
    });

    if (overlappingEvents.length <= 1) return 0;

    const eventIndex = overlappingEvents.findIndex(event => event.id === currentId);
    const width = 100 / overlappingEvents.length;
    return width * eventIndex;
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
            <tr key={time} className="group h-16">
              <td className="p-3 border-r text-sm font-medium text-gray-600 bg-gray-50 whitespace-nowrap sticky left-0 z-10 group-hover:bg-gray-100">
                {time}
              </td>
              {days.map(day => (
                <td 
                  key={`${day}-${time}`}
                  className="border-r border-b border-gray-100 relative p-0"
                >
                  {getScheduleForTimeSlot(day, time)?.map(activity => {
                    const topOffset = calculatePosition(activity.startTime);
                    const height = calculateHeight(activity.startTime, activity.endTime);
                    const width = calculateWidth(day, activity.startTime, activity.endTime);
                    const leftOffset = calculateLeftOffset(day, activity.startTime, activity.endTime, activity.id);
                    
                    return (
                      <div
                        key={activity.id}
                        className="absolute rounded-lg text-sm transition-transform hover:scale-[1.02] group/item"
                        style={{ 
                          backgroundColor: activity.color,
                          top: `${topOffset}%`,
                          height: `${height * 64}px`, // 64px is the height of one hour slot
                          width: `${width}%`,
                          left: `${leftOffset}%`,
                        }}
                      >
                        <div className="p-2 h-full flex flex-col overflow-hidden">
                          <div className="flex items-start gap-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 font-medium whitespace-nowrap">
                              {activity.startTime}-{activity.endTime}
                            </span>
                          </div>
                          <div className="text-gray-700 font-medium pl-6 overflow-hidden text-ellipsis">
                            {activity.activity}
                          </div>
                          <button
                            onClick={() => onDeleteSchedule(activity.id)}
                            className="opacity-0 group-hover/item:opacity-100 text-red-600 hover:text-red-800 transition-all absolute -right-1 -top-1 bg-white rounded-full p-1 shadow-sm hover:shadow-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}