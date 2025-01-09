import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { ScheduleForm } from './components/ScheduleForm';
import { ScheduleDisplay } from './components/ScheduleDisplay';
import type { DaySchedule } from './types';

function App() {
  const [schedule, setSchedule] = useState<DaySchedule>(() => {
    const saved = localStorage.getItem('weeklySchedule');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('weeklySchedule', JSON.stringify(schedule));
  }, [schedule]);

  const handleAddSchedule = (day: string, startTime: string, endTime: string, activity: string, color: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] || []),
        {
          id: crypto.randomUUID(),
          day,
          startTime,
          endTime,
          activity,
          color,
        },
      ],
    }));
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      Object.keys(newSchedule).forEach((day) => {
        newSchedule[day] = newSchedule[day].filter((item) => item.id !== id);
      });
      return newSchedule;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        <header className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Schedule Manager</h1>
            <p className="text-gray-500 mt-1">Organize your week efficiently</p>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <ScheduleForm onAddSchedule={handleAddSchedule} />
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span>Weekly Timetable</span>
            <span className="text-sm font-normal text-gray-500">(Scroll horizontally to view full schedule)</span>
          </h2>
          <ScheduleDisplay 
            schedule={schedule} 
            onDeleteSchedule={handleDeleteSchedule} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
