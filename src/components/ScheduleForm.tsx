import React, { useState, useEffect } from 'react';
import { CalendarPlus, Clock, BookOpen, FileText, X } from 'lucide-react';
import type { ScheduleItem } from '../types';

interface ScheduleFormProps {
  onAddSchedule: (day: string, startTime: string, endTime: string, activity: string, color: string, details: string) => void;
  onUpdateSchedule: (id: string, day: string, startTime: string, endTime: string, activity: string, color: string, details: string) => void;
  editingSchedule: ScheduleItem | null;
  onCancelEdit: () => void;
}

const COLORS = [
  '#E5F6FD', // Light Blue
  '#FFF4E5', // Light Orange
  '#F5E6FF', // Light Purple
  '#E8F5E9', // Light Green
  '#FFF0F0', // Light Red
  '#FFF8E1', // Light Yellow
  '#F3E5F5', // Light Pink
];

export function ScheduleForm({ onAddSchedule, onUpdateSchedule, editingSchedule, onCancelEdit }: ScheduleFormProps) {
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [activity, setActivity] = useState('');
  const [details, setDetails] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (editingSchedule) {
      setDay(editingSchedule.day);
      setStartTime(editingSchedule.startTime);
      setEndTime(editingSchedule.endTime);
      setActivity(editingSchedule.activity);
      setColor(editingSchedule.color);
      setDetails(editingSchedule.details || '');
    }
  }, [editingSchedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (day && startTime && endTime && activity) {
      if (startTime >= endTime) {
        alert('End time must be after start time');
        return;
      }

      if (editingSchedule) {
        onUpdateSchedule(editingSchedule.id, day, startTime, endTime, activity, color, details);
      } else {
        onAddSchedule(day, startTime, endTime, activity, color, details);
      }

      resetForm();
    }
  };

  const resetForm = () => {
    if (!editingSchedule) {
      setDay('Monday');
      setStartTime('');
      setEndTime('');
      setActivity('');
      setDetails('');
      setColor(COLORS[0]);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <BookOpen className="w-4 h-4" />
            Day of Week
          </label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4" />
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4" />
            End Time
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <BookOpen className="w-4 h-4" />
            Activity
          </label>
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            placeholder="Enter activity name"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="w-4 h-4" />
          Details
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors resize-none h-24"
          placeholder="Enter additional details (optional)"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          Color Theme
        </label>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 ${
                color === c ? 'border-blue-500 scale-110 shadow-lg' : 'border-gray-200'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <CalendarPlus className="w-5 h-5" />
          {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
        </button>
        {editingSchedule && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}