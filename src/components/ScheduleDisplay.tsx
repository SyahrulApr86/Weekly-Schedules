import React, { useState, useRef } from 'react';
import { Clock, Trash2, Calendar, FileText, Pencil, Download } from 'lucide-react';
import { Modal } from './Modal';
import type { DaySchedule, ScheduleItem } from '../types';

interface ScheduleDisplayProps {
  schedule: DaySchedule;
  onDeleteSchedule: (id: string) => void;
  onEditSchedule: (schedule: ScheduleItem) => void;
}

const timeSlots = Array.from({ length: 24 }, (_, i) => 
  `${i.toString().padStart(2, '0')}:00`
);

export function ScheduleDisplay({ schedule, onDeleteSchedule, onEditSchedule }: ScheduleDisplayProps) {
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
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

  const findOverlappingEvents = (day: string, startTime: string, endTime: string) => {
    if (!schedule[day]) return [];

    const currentStartMinutes = getTimeInMinutes(startTime);
    const currentEndMinutes = getTimeInMinutes(endTime);

    return schedule[day].filter(item => {
      const itemStartMinutes = getTimeInMinutes(item.startTime);
      const itemEndMinutes = getTimeInMinutes(item.endTime);

      return (
        Math.max(currentStartMinutes, itemStartMinutes) <
        Math.min(currentEndMinutes, itemEndMinutes)
      );
    });
  };

  const calculateWidth = (day: string, startTime: string, endTime: string) => {
    const overlappingEvents = findOverlappingEvents(day, startTime, endTime);
    return overlappingEvents.length > 0 ? 100 / overlappingEvents.length : 100;
  };

  const calculateLeftOffset = (day: string, startTime: string, endTime: string, currentId: string) => {
    const overlappingEvents = findOverlappingEvents(day, startTime, endTime);
    
    if (overlappingEvents.length <= 1) return 0;

    overlappingEvents.sort((a, b) => {
      const startDiff = getTimeInMinutes(a.startTime) - getTimeInMinutes(b.startTime);
      return startDiff !== 0 ? startDiff : a.id.localeCompare(b.id);
    });

    const eventIndex = overlappingEvents.findIndex(event => event.id === currentId);
    const width = 100 / overlappingEvents.length;
    return width * eventIndex;
  };

  const handleEdit = (event: ScheduleItem) => {
    setSelectedEvent(null);
    onEditSchedule(event);
  };

  const exportToImage = async () => {
    if (!scheduleRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(scheduleRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = 'weekly-schedule.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting schedule:', error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <span>Weekly Timetable</span>
          <span className="text-sm font-normal text-gray-500">(Scroll horizontally to view full schedule)</span>
        </h2>
        <button
          onClick={exportToImage}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          Export Schedule
        </button>
      </div>

      <div ref={scheduleRef} className="overflow-x-auto rounded-xl border border-gray-100">
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
                          className="absolute rounded-lg text-sm transition-transform hover:scale-[1.02] group/item cursor-pointer"
                          style={{ 
                            backgroundColor: activity.color,
                            top: `${topOffset}%`,
                            height: `${height * 64}px`,
                            width: `${width}%`,
                            left: `${leftOffset}%`,
                          }}
                          onClick={() => setSelectedEvent(activity)}
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
                            <div className="opacity-0 group-hover/item:opacity-100 absolute -right-1 -top-1 flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(activity);
                                }}
                                className="text-blue-600 hover:text-blue-800 transition-all bg-white rounded-full p-1 shadow-sm hover:shadow-md"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteSchedule(activity.id);
                                }}
                                className="text-red-600 hover:text-red-800 transition-all bg-white rounded-full p-1 shadow-sm hover:shadow-md"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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

      <Modal
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                {selectedEvent.activity}
              </h3>
              <p className="text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {selectedEvent.day}
              </p>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4" />
              <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
            </div>

            {selectedEvent.details && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Details</span>
                </div>
                <p className="text-gray-600 pl-6 whitespace-pre-wrap">
                  {selectedEvent.details}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => handleEdit(selectedEvent)}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDeleteSchedule(selectedEvent.id)}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}