import React from 'react';
import { Plus, Check, X, Pencil } from 'lucide-react';
import type { ScheduleGroup } from '../types';

interface ScheduleGroupListProps {
  groups: ScheduleGroup[];
  selectedGroupId: string | null;
  editingGroupId: string | null;
  editingGroupName: string;
  showNewGroupInput: boolean;
  newGroupName: string;
  onSelectGroup: (id: string) => void;
  onStartEdit: (group: ScheduleGroup) => void;
  onUpdateGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onShowNewInput: () => void;
  onHideNewInput: () => void;
  onNewNameChange: (name: string) => void;
  onCreateGroup: () => void;
  onEditNameChange: (name: string) => void;
  onCancelEdit: () => void;
}

export function ScheduleGroupList({
  groups,
  selectedGroupId,
  editingGroupId,
  editingGroupName,
  showNewGroupInput,
  newGroupName,
  onSelectGroup,
  onStartEdit,
  onUpdateGroup,
  onDeleteGroup,
  onShowNewInput,
  onHideNewInput,
  onNewNameChange,
  onCreateGroup,
  onEditNameChange,
  onCancelEdit,
}: ScheduleGroupListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Schedules</h2>
        <button
          onClick={onShowNewInput}
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
            onChange={(e) => onNewNameChange(e.target.value)}
            placeholder="Enter schedule name"
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCreateGroup();
            }}
          />
          <button
            onClick={onCreateGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create
          </button>
          <button
            onClick={onHideNewInput}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`rounded-lg flex items-center ${
              selectedGroupId === group.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {editingGroupId === group.id ? (
              <div className="flex items-center gap-1 p-1">
                <input
                  type="text"
                  value={editingGroupName}
                  onChange={(e) => onEditNameChange(e.target.value)}
                  className="px-2 py-1 rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUpdateGroup(group.id, editingGroupName);
                    } else if (e.key === 'Escape') {
                      onCancelEdit();
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={() => onUpdateGroup(group.id, editingGroupName)}
                  className="p-1 hover:bg-blue-100 rounded-full"
                >
                  <Check className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={onCancelEdit}
                  className="p-1 hover:bg-blue-100 rounded-full"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <div
                  onClick={() => onSelectGroup(group.id)}
                  className="px-4 py-2 cursor-pointer"
                >
                  {group.name}
                </div>
                {!group.isDefault && (
                  <div className="flex items-center gap-1 pr-2">
                    <button
                      onClick={() => onStartEdit(group)}
                      className={`p-1 rounded-full ${
                        selectedGroupId === group.id
                          ? 'hover:bg-blue-700'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteGroup(group.id)}
                      className={`p-1 rounded-full ${
                        selectedGroupId === group.id
                          ? 'hover:bg-blue-700'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}