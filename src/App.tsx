import React, { useState, useEffect } from 'react';
import { ScheduleForm } from './components/ScheduleForm';
import { ScheduleDisplay } from './components/ScheduleDisplay';
import { ScheduleGroupList } from './components/ScheduleGroupList';
import { Auth } from './components/Auth';
import { Navbar } from './components/Navbar';
import { supabase } from './lib/supabase';
import type { DaySchedule, ScheduleItem, ScheduleGroup } from './types';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
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

      setScheduleGroups(data);
      if (data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching schedule groups:', error);
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

      if (error) throw error;

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

  const onAddSchedule = async (
    day: string,
    startTime: string,
    endTime: string,
    activity: string,
    color: string,
    details: string,
    groupId: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert([
          {
            day,
            start_time: startTime,
            end_time: endTime,
            activity,
            color,
            details,
            group_id: groupId,
            user_id: session?.user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const newSchedule = { ...schedule };
      if (!newSchedule[day]) {
        newSchedule[day] = [];
      }
      newSchedule[day].push({
        id: data.id,
        day,
        startTime,
        endTime,
        activity,
        color,
        details,
        groupId,
      });
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const onUpdateSchedule = async (
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

      // Refresh the schedule
      if (selectedGroupId) {
        fetchSchedule(selectedGroupId);
      }
      setEditingSchedule(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const onDeleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const newSchedule: DaySchedule = {};
      Object.keys(schedule).forEach((day) => {
        newSchedule[day] = schedule[day].filter((item) => item.id !== id);
      });
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Error deleting schedule:', error);
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
            is_default: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setScheduleGroups([...scheduleGroups, data]);
      setShowNewGroupInput(false);
      setNewGroupName('');
      setSelectedGroupId(data.id);
    } catch (error) {
      console.error('Error creating schedule group:', error);
    }
  };

  const updateScheduleGroup = async (groupId: string, newName: string) => {
    if (!newName.trim() || !groupId) return;

    try {
      const { error } = await supabase
        .from('schedule_groups')
        .update({ name: newName.trim() })
        .eq('id', groupId);

      if (error) throw error;

      setScheduleGroups(scheduleGroups.map(group => 
        group.id === groupId ? { ...group, name: newName.trim() } : group
      ));
      setEditingGroupId(null);
      setEditingGroupName('');
    } catch (error) {
      console.error('Error updating schedule name:', error);
    }
  };

  const deleteScheduleGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('schedule_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      setScheduleGroups(scheduleGroups.filter(group => group.id !== groupId));
      if (selectedGroupId === groupId) {
        const defaultGroup = scheduleGroups.find(g => g.isDefault);
        setSelectedGroupId(defaultGroup?.id || null);
      }
    } catch (error) {
      console.error('Error deleting schedule group:', error);
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
        <ScheduleGroupList
          groups={scheduleGroups}
          selectedGroupId={selectedGroupId}
          editingGroupId={editingGroupId}
          editingGroupName={editingGroupName}
          showNewGroupInput={showNewGroupInput}
          newGroupName={newGroupName}
          onSelectGroup={setSelectedGroupId}
          onStartEdit={(group) => {
            setEditingGroupId(group.id);
            setEditingGroupName(group.name);
          }}
          onUpdateGroup={updateScheduleGroup}
          onDeleteGroup={deleteScheduleGroup}
          onShowNewInput={() => setShowNewGroupInput(true)}
          onHideNewInput={() => {
            setShowNewGroupInput(false);
            setNewGroupName('');
          }}
          onNewNameChange={setNewGroupName}
          onCreateGroup={createScheduleGroup}
          onEditNameChange={setEditingGroupName}
          onCancelEdit={() => {
            setEditingGroupId(null);
            setEditingGroupName('');
          }}
        />

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <ScheduleForm 
            onAddSchedule={(day, startTime, endTime, activity, color, details) => {
              if (selectedGroupId) {
                onAddSchedule(day, startTime, endTime, activity, color, details, selectedGroupId);
              }
            }}
            onUpdateSchedule={onUpdateSchedule}
            editingSchedule={editingSchedule}
            onCancelEdit={() => setEditingSchedule(null)}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <ScheduleDisplay 
            schedule={schedule}
            onDeleteSchedule={onDeleteSchedule}
            onEditSchedule={setEditingSchedule}
          />
        </div>
      </div>
    </div>
  );
}