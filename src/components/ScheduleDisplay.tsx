import React, { useState, useRef } from 'react';
import { Clock, Trash2, Calendar, FileText, Pencil, Download, Minimize2, Maximize2, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import type { DaySchedule, ScheduleItem } from '../types';

interface ScheduleDisplayProps {
  schedule: DaySchedule;
  onDeleteSchedule: (schedule: ScheduleItem) => void;
  onEditSchedule: (schedule: ScheduleItem) => void;
  deleteConfirmSchedule: ScheduleItem | null;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
}

// Generate time slots for the schedule
const timeSlots = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, '0')}:00`
);

export function ScheduleDisplay({
                                  schedule,
                                  onDeleteSchedule,
                                  onEditSchedule,
                                  deleteConfirmSchedule,
                                  onCancelDelete,
                                  onConfirmDelete,
                                }: ScheduleDisplayProps) {
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null);
  const [isMinimized, setIsMinimized] = useState(true);
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

  const handleDelete = (event: ScheduleItem) => {
    setSelectedEvent(null);
    onDeleteSchedule(event);
  };

  const exportToImage = async () => {
    if (!scheduleRef.current) return;

    try {
      // Before capturing, temporarily modify styles for better export
      const activities = scheduleRef.current.querySelectorAll('.schedule-activity');
      activities.forEach((activity: Element) => {
        if (activity instanceof HTMLElement) {
          activity.style.overflow = 'visible';
          activity.style.zIndex = '10';
          const content = activity.querySelector('.activity-content');
          if (content instanceof HTMLElement) {
            content.style.overflow = 'visible';
            content.style.whiteSpace = 'normal';
          }
        }
      });

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(scheduleRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1920, // Set a larger window width for better rendering
        onclone: (clonedDoc) => {
          // Ensure text is visible in the cloned document
          const clonedActivities = clonedDoc.querySelectorAll('.schedule-activity');
          clonedActivities.forEach((activity: Element) => {
            if (activity instanceof HTMLElement) {
              activity.style.overflow = 'visible';
              activity.style.zIndex = '10';
              const content = activity.querySelector('.activity-content');
              if (content instanceof HTMLElement) {
                content.style.overflow = 'visible';
                content.style.whiteSpace = 'normal';
              }
            }
          });
        }
      });

      // Reset styles after capture
      activities.forEach((activity: Element) => {
        if (activity instanceof HTMLElement) {
          activity.style.overflow = '';
          activity.style.zIndex = '';
          const content = activity.querySelector('.activity-content');
          if (content instanceof HTMLElement) {
            content.style.overflow = '';
            content.style.whiteSpace = '';
          }
        }
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

  // Calculate the earliest and latest times across all schedules
  const getTimeRange = () => {
    let earliestTime = 24;
    let latestTime = 0;

    Object.values(schedule).forEach(daySchedule => {
      daySchedule.forEach(item => {
        const startHour = parseInt(item.startTime.split(':')[0]);
        const endHour = parseInt(item.endTime.split(':')[0]);
        earliestTime = Math.min(earliestTime, startHour);
        latestTime = Math.max(latestTime, endHour);
      });
    });

    // Add padding of 1 hour before and after
    earliestTime = Math.max(0, earliestTime - 1);
    latestTime = Math.min(23, latestTime + 1);

    return { earliestTime, latestTime };
  };

  const { earliestTime, latestTime } = getTimeRange();
  const visibleTimeSlots = isMinimized
      ? timeSlots.slice(earliestTime, latestTime + 1)
      : timeSlots;

  return (
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Weekly Timetable</h2>
            <p className="text-sm font-normal text-gray-500">(Scroll to view full schedule)</p>
            <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium w-full sm:w-auto justify-center"
            >
              {isMinimized ? (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    Show All Hours
                  </>
              ) : (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    Show Active Hours
                  </>
              )}
            </button>
          </div>
          <button
              onClick={exportToImage}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium w-full sm:w-auto justify-center"
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
            {visibleTimeSlots.map(time => (
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
                                  className="schedule-activity absolute rounded-lg text-sm transition-transform hover:scale-[1.02] group/item cursor-pointer"
                                  style={{
                                    backgroundColor: activity.color,
                                    top: `${topOffset}%`,
                                    height: `${height * 64}px`,
                                    width: `${width}%`,
                                    left: `${leftOffset}%`,
                                  }}
                                  onClick={() => setSelectedEvent(activity)}
                              >
                                <div className="activity-content p-2 h-full flex flex-col">
                                  <div className="flex items-start gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700 font-medium whitespace-nowrap">
                                {activity.startTime}-{activity.endTime}
                              </span>
                                  </div>
                                  <div className="text-gray-700 font-medium pl-6 break-words">
                                    {activity.activity}
                                  </div>
                                  <div className="opacity-0 group-hover/item:opacity-100 absolute -right-1 -top-1 flex gap-1">
                                    <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedEvent(null);
                                          onEditSchedule(activity);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 transition-all bg-white rounded-full p-1 shadow-sm hover:shadow-md"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(activity);
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

        {/* Activity Details Modal */}
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
                      onClick={() => {
                        setSelectedEvent(null);
                        onEditSchedule(selectedEvent);
                      }}
                      className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                      onClick={() => handleDelete(selectedEvent)}
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

        {/* Delete Confirmation Modal */}
        <Modal
            isOpen={deleteConfirmSchedule !== null}
            onClose={onCancelDelete}
        >
          {deleteConfirmSchedule && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-red-600">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-semibold">Delete Activity</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">
                    Are you sure you want to delete this activity? This action cannot be undone.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="text-gray-900 font-medium">{deleteConfirmSchedule.activity}</div>
                    <div className="text-gray-600 text-sm">
                      {deleteConfirmSchedule.day} • {deleteConfirmSchedule.startTime} - {deleteConfirmSchedule.endTime}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                      onClick={onCancelDelete}
                      className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={() => onConfirmDelete(deleteConfirmSchedule.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Activity
                  </button>
                </div>
              </div>
          )}
        </Modal>
      </div>
  );
}