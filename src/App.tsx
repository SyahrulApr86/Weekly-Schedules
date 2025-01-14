import React, { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { ScheduleForm } from './components/ScheduleForm';
import { ScheduleDisplay } from './components/ScheduleDisplay';
import { Auth } from './components/Auth';
import { Navbar } from './components/Navbar';
import { supabase } from './lib/supabase';
import type { DaySchedule, ScheduleItem, ScheduleGroup } from './types';

export default function App() {
  const [session, setSession] = useState(null);
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchScheduleGroups();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchScheduleGroups();
      } else {
        setSchedule({});
        setScheduleGroups([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchSchedule(selectedGroupId);
    }
  }, [selectedGroupId]);

  const fetchScheduleGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_groups')
        .select('*')
        .order('created_at');

      if (error) throw error;

      const groups = data.map(group => ({
        id: group.id,
        name: group.name,
        isDefault: group.is_default,
        createdAt: group.created_at,
      }));

      setScheduleGroups(groups);
      
      // Select default group
      const defaultGroup = groups.find(group => group.isDefault);
      if (defaultGroup) {
        setSelectedGroupId(defaultGroup.id);
      }
    } catch (error) {
      console.error('Error fetching schedule groups:', error);
    }
  };

  const createScheduleGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('schedule_groups')
        .insert([
          {
            name: newGroupName.trim(),
            user_id: session?.user?.id,
            is_default: scheduleGroups.length === 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newGroup = {
        id: data.id,
        name: data.name,
        isDefault: data.is_default,
        createdAt: data.created_at,
      };

      setScheduleGroups([...scheduleGroups, newGroup]);
      setSelectedGroupId(data.id);
      setShowNewGroupInput(false);
      setNewGroupName('');
    } catch (error) {
      console.error('Error creating schedule group:', error);
    }
  };

  const deleteScheduleGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('schedule_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      setScheduleGroups(scheduleGroups.filter(group => group.id !== groupId));
      
      // Select another group if available
      const remainingGroups = scheduleGroups.filter(group => group.id !== groupId);
      if (remainingGroups.length > 0) {
        setSelectedGroupId(remainingGroups[0].id);
      } else {
        setSelectedGroupId(null);
        setSchedule({});
      }
    } catch (error) {
      console.error('Error deleting schedule group:', error);
    }
  };

  const fetchSchedule = async (groupId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('group_id', groupId)
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
          groupId: item.group_id,
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
    if (!selectedGroupId) return;

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
          group_id: selectedGroupId,
        },
      ]);

      if (error) throw error;
      fetchSchedule(selectedGroupId);
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
      if (selectedGroupId) {
        fetchSchedule(selectedGroupId);
      }
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
      if (selectedGroupId) {
        fetchSchedule(selectedGroupId);
      }
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
        {/* Schedule Groups Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Your Schedules</h2>
            <button
              onClick={() => setShowNewGroupInput(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Schedule
            </button>
          </div>

          {showNewGroupInput && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter schedule name"
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createScheduleGroup();
                  }
                }}
              />
              <button
                onClick={createScheduleGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewGroupInput(false);
                  setNewGroupName('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {scheduleGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedGroupId === group.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{group.name}</span>
                {scheduleGroups.length > 1 && !group.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScheduleGroup(group.id);
                    }}
                    className={`ml-2 p-1 rounded-full ${
                      selectedGroupId === group.id
                        ? 'hover:bg-blue-700 text-white'
                        : 'hover:bg-gray-300 text-gray-500'
                    }`}
                  >
                    ×
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedGroupId && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}