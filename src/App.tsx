import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { ScheduleForm } from './components/ScheduleForm';
import { ScheduleDisplay } from './components/ScheduleDisplay';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import type { DaySchedule } from './types';

export default function App() {
  const [session, setSession] = useState(null);
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchSchedule();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchSchedule();
      } else {
        setSchedule({});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('start_time');

      if (error) {
        throw error;
      }

      const scheduleByDay: DaySchedule = {};
      data.forEach((item) => {
        if (!scheduleByDay[item.day]) {
          scheduleByDay[item.day] = [];
        }
        scheduleByDay[item.day].push({
          id: item.id,
          day: item.day,
          startTime: item.start_time,
          endTime: item.end_time,
          activity: item.activity,
          color: item.color,
        });
      });

      setSchedule(scheduleByDay);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (
    day: string,
    startTime: string,
    endTime: string,
    activity: string,
    color: string
  ) => {
    try {
      const { data, error } = await supabase.from('schedules').insert([
        {
          day,
          start_time: startTime,
          end_time: endTime,
          activity,
          color,
          user_id: session?.user?.id,
        },
      ]);

      if (error) throw error;
      fetchSchedule();
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .match({ id });

      if (error) throw error;
      fetchSchedule();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        <header className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Weekly Schedule Manager</h1>
                <p className="text-gray-500 mt-1">Organize your week efficiently</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Sign Out
            </button>
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
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading schedule...</div>
          ) : (
            <ScheduleDisplay 
              schedule={schedule} 
              onDeleteSchedule={handleDeleteSchedule} 
            />
          )}
        </div>
      </div>
    </div>
  );
}