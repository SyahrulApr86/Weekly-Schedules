import React, { useState, useEffect } from 'react';
import { CalendarPlus, Clock, BookOpen, FileText, X, Palette } from 'lucide-react';
import { Modal } from './Modal';
import type { ScheduleItem } from '../types';

interface ScheduleFormProps {
  onAddSchedule: (day: string, startTime: string, endTime: string, activity: string, color: string, details: string) => void;
  onUpdateSchedule: (id: string, day: string, startTime: string, endTime: string, activity: string, color: string, details: string) => void;
  editingSchedule: ScheduleItem | null;
  onCancelEdit: () => void;
}

// Reduced to 10 predefined colors
const COLORS = [
  { id: 'light-blue', color: '#E5F6FD' },
  { id: 'soft-purple', color: '#F3E5F5' },
  { id: 'light-green', color: '#E8F5E9' },
  { id: 'light-red', color: '#FFF0F0' },
  { id: 'light-orange', color: '#FFF4E5' },
  { id: 'light-yellow', color: '#FFF8E1' },
  { id: 'pink', color: '#FCE4EC' },
  { id: 'mint-green', color: '#E0F2F1' },
  { id: 'sky-blue', color: '#E1F5FE' },
  { id: 'pearl', color: '#F5F5F5' },
];

const ColorPicker = ({
                       color,
                       setColor,
                       customColor,
                       setCustomColor,
                     }: {
  color: string;
  setColor: (color: string) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setColor(newColor);
  };

  return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            Color Theme
          </label>
          <button
              type="button"
              onClick={() => setShowCustomPicker(!showCustomPicker)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Palette className="w-4 h-4" />
            {showCustomPicker ? 'Hide Custom Color' : 'Custom Color'}
          </button>
        </div>

        {showCustomPicker && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                    type="color"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="w-12 h-12 rounded cursor-pointer"
                />
              </div>
              <input
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  placeholder="#FFFFFF"
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              />
            </div>
        )}

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {COLORS.map((c) => (
              <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setColor(c.color);
                    setCustomColor(c.color);
                  }}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                      color === c.color ? 'border-blue-500 scale-110 shadow-lg' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              />
          ))}
        </div>
      </div>
  );
};

const ScheduleFormContent = ({
                               day,
                               setDay,
                               startTime,
                               setStartTime,
                               endTime,
                               setEndTime,
                               activity,
                               setActivity,
                               details,
                               setDetails,
                               color,
                               setColor,
                               customColor,
                               setCustomColor,
                               isEditing,
                             }: {
  day: string;
  setDay: (day: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  activity: string;
  setActivity: (activity: string) => void;
  details: string;
  setDetails: (details: string) => void;
  color: string;
  setColor: (color: string) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
  isEditing?: boolean;
}) => (
    <div className="space-y-6">
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

      <ColorPicker
          color={color}
          setColor={setColor}
          customColor={customColor}
          setCustomColor={setCustomColor}
      />
    </div>
);

export function ScheduleForm({ onAddSchedule, onUpdateSchedule, editingSchedule, onCancelEdit }: ScheduleFormProps) {
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [activity, setActivity] = useState('');
  const [details, setDetails] = useState('');
  const [color, setColor] = useState(COLORS[0].color);
  const [customColor, setCustomColor] = useState(COLORS[0].color);

  useEffect(() => {
    if (editingSchedule) {
      setDay(editingSchedule.day);
      setStartTime(editingSchedule.startTime);
      setEndTime(editingSchedule.endTime);
      setActivity(editingSchedule.activity);
      setColor(editingSchedule.color);
      setCustomColor(editingSchedule.color);
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
      setColor(COLORS[0].color);
      setCustomColor(COLORS[0].color);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

  return (
      <>
        {/* Create Form */}
        {!editingSchedule && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Activity</h2>

                <ScheduleFormContent
                    day={day}
                    setDay={setDay}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    activity={activity}
                    setActivity={setActivity}
                    details={details}
                    setDetails={setDetails}
                    color={color}
                    setColor={setColor}
                    customColor={customColor}
                    setCustomColor={setCustomColor}
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <CalendarPlus className="w-5 h-5" />
                  Add Schedule
                </button>
              </form>
            </div>
        )}

        {/* Edit Modal */}
        <Modal
            isOpen={editingSchedule !== null}
            onClose={handleCancel}
        >
          {editingSchedule && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Edit Activity</h2>

                <ScheduleFormContent
                    day={day}
                    setDay={setDay}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    activity={activity}
                    setActivity={setActivity}
                    details={details}
                    setDetails={setDetails}
                    color={color}
                    setColor={setColor}
                    customColor={customColor}
                    setCustomColor={setCustomColor}
                    isEditing
                />

                <div className="flex gap-3">
                  <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <CalendarPlus className="w-5 h-5" />
                    Update Schedule
                  </button>
                  <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </form>
          )}
        </Modal>
      </>
  );
}