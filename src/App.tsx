import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { ScheduleForm } from './components/ScheduleForm';
import { ScheduleDisplay } from './components/ScheduleDisplay';
import { Auth } from './components/Auth';
import { Navbar } from './components/Navbar';
import { supabase } from './lib/supabase';
import type { DaySchedule, ScheduleItem } from './types';

export default function App() {
  const [session, setSession] = useState(null);
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

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
          details: item.details,
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
    color: string,
    details: string
  ) => {
    try {
      const { data, error } = await supabase.from('schedules').insert([
        {
          day,
          start_time: startTime,
          end_time: endTime,
          activity,
          color,
          details,
          user_id: session?.user?.id,
        },
      ]);

      if (error) throw error;
      fetchSchedule();
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const handleUpdateSchedule = async (
    id: string,
    day: string,
    startTime: string,
    endTime: string,
    activity: string,
    color: string,
    details: string
  ) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({
          day,
          start_time: startTime,
          end_time: endTime,
          activity,
          color,
          details,
        })
        .eq('id', id);

      if (error) throw error;
      setEditingSchedule(null);
      fetchSchedule();
    } catch (error) {
      console.error('Error updating schedule:', error);
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
      <Navbar user={session.user} onSignOut={handleSignOut} />
      
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingSchedule ? 'Edit Schedule' : 'Welcome Back!'}
              </h2>
              <p className="text-gray-500">
                {editingSchedule ? 'Update your schedule below' : 'Manage your weekly schedule below'}
              </p>
            </div>
          </div>
          <ScheduleForm 
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            editingSchedule={editingSchedule}
            onCancelEdit={() => setEditingSchedule(null)}
          />
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading schedule...</div>
          ) : (
            <ScheduleDisplay 
              schedule={schedule} 
              onDeleteSchedule={handleDeleteSchedule}
              onEditSchedule={setEditingSchedule}
            />
          )}
        </div>
      </div>
    </div>
  );
}