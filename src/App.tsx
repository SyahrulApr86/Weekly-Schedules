import React, { useState, useEffect } from 'react';
import { ScheduleForm } from './components/ScheduleForm';
import { ScheduleDisplay } from './components/ScheduleDisplay';
import { ScheduleGroupList } from './components/ScheduleGroupList';
import { Auth } from './components/Auth';
import { Navbar } from './components/Navbar';
import { supabase } from './lib/supabase';
import type { DaySchedule, ScheduleItem, ScheduleGroup } from './types';

function App() {
  const [session, setSession] = useState<any>(null);
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [deleteConfirmSchedule, setDeleteConfirmSchedule] = useState<ScheduleItem | null>(null);
  const [groups, setGroups] = useState<ScheduleGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [copyFromGroupId, setCopyFromGroupId] = useState<string | null>(null);
  const [deleteConfirmGroup, setDeleteConfirmGroup] = useState<ScheduleGroup | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchGroups();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchSchedules();
    }
  }, [selectedGroupId]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_groups')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setGroups(data || []);
      if (data && data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchSchedules = async () => {
    if (!selectedGroupId) return;

    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('group_id', selectedGroupId)
        .order('start_time', { ascending: true });

      if (error) throw error;

      const scheduleByDay: DaySchedule = {};
      (data || []).forEach((item) => {
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
      console.error('Error fetching schedules:', error);
    }
  };

  const onAddSchedule = async (
    day: string,
    startTime: string,
    endTime: string,
    activity: string,
    color: string,
    details: string
  ) => {
    if (!session?.user?.id || !selectedGroupId) return;

    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert([
          {
            user_id: session.user.id,
            group_id: selectedGroupId,
            day,
            start_time: startTime,
            end_time: endTime,
            activity,
            color,
            details,
          },
        ])
        .select()
        .single();

      if (error) throw error;

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
        groupId: selectedGroupId,
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
    if (!session?.user?.id) return;

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
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Update local state
      const newSchedule = { ...schedule };
      
      // Remove from old day
      Object.keys(newSchedule).forEach((d) => {
        newSchedule[d] = newSchedule[d].filter((item) => item.id !== id);
      });

      // Add to new day
      if (!newSchedule[day]) {
        newSchedule[day] = [];
      }
      newSchedule[day].push({
        id,
        day,
        startTime,
        endTime,
        activity,
        color,
        details,
        groupId: selectedGroupId!,
      });

      setSchedule(newSchedule);
      setEditingSchedule(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const onConfirmDeleteSchedule = async (schedule: ScheduleItem) => {
    setDeleteConfirmSchedule(schedule);
  };

  const onDeleteSchedule = async (id: string) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      const newSchedule = { ...schedule };
      Object.keys(newSchedule).forEach((day) => {
        newSchedule[day] = newSchedule[day].filter((item) => item.id !== id);
      });
      setSchedule(newSchedule);
      setDeleteConfirmSchedule(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const onCreateGroup = async () => {
    if (!session?.user?.id || !newGroupName.trim()) return;

    try {
      const { data: newGroup, error } = await supabase
        .from('schedule_groups')
        .insert([
          {
            user_id: session.user.id,
            name: newGroupName.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (copyFromGroupId) {
        // Copy schedules from selected group
        const { data: schedules, error: fetchError } = await supabase
          .from('schedules')
          .select('*')
          .eq('group_id', copyFromGroupId);

        if (fetchError) throw fetchError;

        if (schedules && schedules.length > 0) {
          const newSchedules = schedules.map((schedule) => ({
            user_id: session.user.id,
            group_id: newGroup.id,
            day: schedule.day,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            activity: schedule.activity,
            color: schedule.color,
            details: schedule.details,
          }));

          const { error: insertError } = await supabase
            .from('schedules')
            .insert(newSchedules);

          if (insertError) throw insertError;
        }
      }

      setGroups([...groups, newGroup]);
      setSelectedGroupId(newGroup.id);
      setNewGroupName('');
      setCopyFromGroupId(null);
      setShowNewGroupInput(false);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const onUpdateGroup = async (id: string, name: string) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('schedule_groups')
        .update({ name })
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setGroups(
        groups.map((group) =>
          group.id === id ? { ...group, name } : group
        )
      );
      setEditingGroupId(null);
      setEditingGroupName('');
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const onConfirmDeleteGroup = (group: ScheduleGroup) => {
    setDeleteConfirmGroup(group);
  };

  const onDeleteGroup = async (id: string) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('schedule_groups')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setGroups(groups.filter((group) => group.id !== id));
      if (selectedGroupId === id) {
        const remainingGroups = groups.filter((group) => group.id !== id);
        setSelectedGroupId(remainingGroups.length > 0 ? remainingGroups[0].id : null);
      }
      setDeleteConfirmGroup(null);
    } catch (error) {
      console.error('Error deleting group:', error);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} onSignOut={handleSignOut} />
      
      <main className="max-w-[1400px] mx-auto px-4 py-8 space-y-8">
        <ScheduleGroupList
          groups={groups}
          selectedGroupId={selectedGroupId}
          editingGroupId={editingGroupId}
          editingGroupName={editingGroupName}
          showNewGroupInput={showNewGroupInput}
          newGroupName={newGroupName}
          copyFromGroupId={copyFromGroupId}
          deleteConfirmGroup={deleteConfirmGroup}
          onSelectGroup={setSelectedGroupId}
          onStartEdit={(group) => {
            setEditingGroupId(group.id);
            setEditingGroupName(group.name);
          }}
          onUpdateGroup={onUpdateGroup}
          onDeleteGroup={onDeleteGroup}
          onConfirmDeleteGroup={onConfirmDeleteGroup}
          onCancelDeleteGroup={() => setDeleteConfirmGroup(null)}
          onShowNewInput={() => setShowNewGroupInput(true)}
          onHideNewInput={() => {
            setShowNewGroupInput(false);
            setNewGroupName('');
            setCopyFromGroupId(null);
          }}
          onNewNameChange={setNewGroupName}
          onCreateGroup={onCreateGroup}
          onEditNameChange={setEditingGroupName}
          onCancelEdit={() => {
            setEditingGroupId(null);
            setEditingGroupName('');
          }}
          onCopyFromChange={setCopyFromGroupId}
        />

        {selectedGroupId && (
          <>
            <ScheduleForm
              onAddSchedule={onAddSchedule}
              onUpdateSchedule={onUpdateSchedule}
              editingSchedule={editingSchedule}
              onCancelEdit={() => setEditingSchedule(null)}
            />

            <ScheduleDisplay
              schedule={schedule}
              onDeleteSchedule={onConfirmDeleteSchedule}
              onEditSchedule={setEditingSchedule}
              deleteConfirmSchedule={deleteConfirmSchedule}
              onCancelDelete={() => setDeleteConfirmSchedule(null)}
              onConfirmDelete={(id) => onDeleteSchedule(id)}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;