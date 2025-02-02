import React from 'react';
import { Plus, Check, X, Pencil, Calendar, Copy, AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import type { ScheduleGroup } from '../types';

interface ScheduleGroupListProps {
  groups: ScheduleGroup[];
  selectedGroupId: string | null;
  editingGroupId: string | null;
  editingGroupName: string;
  showNewGroupInput: boolean;
  newGroupName: string;
  copyFromGroupId: string | null;
  deleteConfirmGroup: ScheduleGroup | null;
  onSelectGroup: (id: string) => void;
  onStartEdit: (group: ScheduleGroup) => void;
  onUpdateGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onConfirmDeleteGroup: (group: ScheduleGroup) => void;
  onCancelDeleteGroup: () => void;
  onShowNewInput: () => void;
  onHideNewInput: () => void;
  onNewNameChange: (name: string) => void;
  onCreateGroup: () => void;
  onEditNameChange: (name: string) => void;
  onCancelEdit: () => void;
  onCopyFromChange: (groupId: string | null) => void;
}

export function ScheduleGroupList({
                                    groups,
                                    selectedGroupId,
                                    editingGroupId,
                                    editingGroupName,
                                    showNewGroupInput,
                                    newGroupName,
                                    copyFromGroupId,
                                    deleteConfirmGroup,
                                    onSelectGroup,
                                    onStartEdit,
                                    onUpdateGroup,
                                    onDeleteGroup,
                                    onConfirmDeleteGroup,
                                    onCancelDeleteGroup,
                                    onShowNewInput,
                                    onHideNewInput,
                                    onNewNameChange,
                                    onCreateGroup,
                                    onEditNameChange,
                                    onCancelEdit,
                                    onCopyFromChange,
                                  }: ScheduleGroupListProps) {
  return (
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Your Schedules</h2>
          <button
              onClick={onShowNewInput}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            New Schedule
          </button>
        </div>

        {showNewGroupInput && (
            <div className="space-y-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-2">
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
                <div className="flex gap-2">
                  <button
                      onClick={onCreateGroup}
                      className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                      onClick={onHideNewInput}
                      className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {groups.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 text-gray-600 whitespace-nowrap">
                      <Copy className="w-4 h-4" />
                      <span>Copy from:</span>
                    </div>
                    <select
                        value={copyFromGroupId || ''}
                        onChange={(e) => onCopyFromChange(e.target.value || null)}
                        className="w-full sm:w-auto flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                    >
                      <option value="">Don't copy (create empty)</option>
                      {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                      ))}
                    </select>
                  </div>
              )}
            </div>
        )}

        {groups.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first schedule to start organizing your week
              </p>
              {!showNewGroupInput && (
                  <button
                      onClick={onShowNewInput}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Schedule
                  </button>
              )}
            </div>
        ) : (
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
                                onClick={() => onConfirmDeleteGroup(group)}
                                className={`p-1 rounded-full ${
                                    selectedGroupId === group.id
                                        ? 'hover:bg-blue-700'
                                        : 'hover:bg-gray-200'
                                }`}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
              ))}
            </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
            isOpen={deleteConfirmGroup !== null}
            onClose={onCancelDeleteGroup}
        >
          {deleteConfirmGroup && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-red-600">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-semibold">Delete Schedule</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">
                    Are you sure you want to delete "{deleteConfirmGroup.name}"? This will permanently delete all activities in this schedule. This action cannot be undone.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-900 font-medium">{deleteConfirmGroup.name}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                      onClick={onCancelDeleteGroup}
                      className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={() => onDeleteGroup(deleteConfirmGroup.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Schedule
                  </button>
                </div>
              </div>
          )}
        </Modal>
      </div>
  );
}