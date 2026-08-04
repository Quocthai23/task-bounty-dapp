import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Circle, 
  GripVertical,
  Building2,
  ExternalLink,
  Coins,
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';

export interface ProjectGroup {
  id: string;
  title: string;
  companyName?: string;
  currency?: string;
  budget?: number;
  status?: string;
  ownerId?: string;
  tasks: any[];
}

interface JobSwimlaneBoardProps {
  projectGroups: ProjectGroup[];
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskClick: (task: any) => void;
  onQuickAddTask?: (projectId: string) => void;
  collapsedMap: Record<string, boolean>;
  onToggleCollapse: (projectId: string) => void;
}

const COLUMNS = [
  { id: 'OPEN', label: 'To Do (Cần làm)', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400', icon: <Circle size={14} /> },
  { id: 'IN_PROGRESS', label: 'In Progress (Đang làm)', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', dot: 'bg-blue-500', icon: <Clock size={14} /> },
  { id: 'REVIEW', label: 'In Review (Đang duyệt)', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', dot: 'bg-amber-500', icon: <AlertCircle size={14} /> },
  { id: 'DONE', label: 'Done (Hoàn thành)', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', dot: 'bg-emerald-500', icon: <CheckCircle2 size={14} /> }
];

const SortableTask = ({ task, onTaskClick }: { task: any, onTaskClick: (task: any) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const budget = Number(task.budget || 0);

  // Parse tags
  let tagsList: string[] = [];
  if (Array.isArray(task.tags)) tagsList = task.tags;
  else if (typeof task.tags === 'string' && task.tags.trim()) {
    try {
      const p = JSON.parse(task.tags);
      tagsList = Array.isArray(p) ? p : [task.tags];
    } catch {
      tagsList = task.tags.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  // Parse attachments
  let attCount = 0;
  if (Array.isArray(task.attachments)) attCount = task.attachments.length;
  else if (typeof task.attachments === 'string' && task.attachments.trim()) {
    try {
      const p = JSON.parse(task.attachments);
      attCount = Array.isArray(p) ? p.length : 1;
    } catch {}
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/task relative bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-xs border ${
        isDragging ? 'border-blue-500 shadow-md ring-2 ring-blue-400/20' : 'border-slate-200/80 dark:border-slate-700/80'
      } cursor-pointer hover:shadow-md hover:border-blue-400/80 transition-all`}
      onClick={() => onTaskClick(task)}
    >
      {/* Top row: Priority / Bounty + Grip */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
            task.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300' :
            task.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' :
            task.priority === 'Low' ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400' :
            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
          }`}>
            {task.priority || 'Moderate'}
          </span>
          {task.isEscrowed ? (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800" title="Đã ký quỹ vào Ví Fiat-Bridge">
              <ShieldCheck className="w-3 h-3" /> Escrow
            </span>
          ) : (
            Number(task.budget) > 0 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800" title="Chưa khóa quỹ Escrow">
                <ShieldCheck className="w-3 h-3 text-amber-500" /> Chưa Ký Quỹ
              </span>
            )
          )}
        </div>

        <div 
          className="text-slate-300 dark:text-slate-600 group-hover/task:text-slate-500 dark:group-hover/task:text-slate-400 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          {...attributes} 
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
      </div>

      {/* Task Title */}
      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1.5 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Tags preview */}
      {tagsList.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tagsList.slice(0, 2).map((t, idx) => (
            <span key={idx} className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              #{t}
            </span>
          ))}
          {tagsList.length > 2 && (
            <span className="text-[9px] text-slate-400 font-bold">+{tagsList.length - 2}</span>
          )}
        </div>
      )}

      {/* Footer: Bounty Amount + Attachments + Assignee */}
      <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700/60 pt-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
            {budget > 0 ? `${budget.toLocaleString()} ₫` : 'Bounty'}
          </span>
          {attCount > 0 && (
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5" title={`${attCount} tệp đính kèm`}>
              📎 {attCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
          {task.assignee ? (
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-black">
                {task.assignee.firstName?.charAt(0) || task.assignee.email?.charAt(0) || 'U'}
              </span>
              <span className="max-w-[70px] truncate">{task.assignee.firstName || task.assignee.email?.split('@')[0]}</span>
            </span>
          ) : (
            <span className="text-slate-400 italic text-[10px]">Chưa gán</span>
          )}
        </div>
      </div>
    </div>
  );
};

const DroppableColumn = ({ 
  columnId, 
  col, 
  projectId,
  children,
  onQuickAddTask
}: { 
  columnId: string; 
  col: any; 
  projectId: string;
  children: React.ReactNode;
  onQuickAddTask?: (projectId: string) => void;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id: `${projectId}::${columnId}` });
  
  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 min-w-[240px] max-w-[320px] flex flex-col bg-slate-50/60 dark:bg-slate-900/50 rounded-2xl border ${
        isOver 
          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-2 ring-blue-400/20' 
          : 'border-slate-200/70 dark:border-slate-800'
      } transition-colors pb-2`}
    >
      {/* Column Header */}
      <div className="p-3 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
          <span>{col.label}</span>
        </div>
        <span className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700 shadow-2xs">
          {col.count}
        </span>
      </div>

      {/* Column Tasks Scrollable Area */}
      <div className="p-2.5 flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-[120px] max-h-[360px]">
        {children}
        {col.count === 0 && (
          <div className="h-20 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-400 font-medium">
            Kéo task vào đây
          </div>
        )}
      </div>

      {/* Quick Add in Column */}
      {columnId === 'OPEN' && onQuickAddTask && (
        <button
          onClick={() => onQuickAddTask(projectId)}
          className="mx-2.5 mt-1 py-1.5 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm Task Mới</span>
        </button>
      )}
    </div>
  );
};

export const JobSwimlaneBoard: React.FC<JobSwimlaneBoardProps> = ({
  projectGroups,
  onTaskMove,
  onTaskClick,
  onQuickAddTask,
  collapsedMap,
  onToggleCollapse
}) => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTaskId = String(active.id);
    const overTarget = String(over.id);

    // Over target could be column id like "projectId::OPEN" or another taskId
    if (overTarget.includes('::')) {
      const [, targetStatus] = overTarget.split('::');
      if (targetStatus && COLUMNS.some(c => c.id === targetStatus)) {
        onTaskMove(activeTaskId, targetStatus);
        return;
      }
    }

    // Dropped over another task
    for (const group of projectGroups) {
      const overTask = group.tasks.find(t => String(t.id) === overTarget);
      if (overTask) {
        onTaskMove(activeTaskId, overTask.status);
        return;
      }
    }
  };

  // Find active task for drag overlay
  let activeTaskObj: any = null;
  if (activeId) {
    for (const g of projectGroups) {
      const found = g.tasks.find(t => String(t.id) === String(activeId));
      if (found) {
        activeTaskObj = found;
        break;
      }
    }
  }

  if (projectGroups.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600">
          <Building2 className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Bạn chưa tham gia Job nào
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Khám phá các nhiệm vụ trên trang Discover hoặc tạo Job mới của bạn để bắt đầu làm việc.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Khám Phá Nhiệm Vụ (Discover)
        </button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {projectGroups.map(group => {
          const isCollapsed = Boolean(collapsedMap[group.id]);
          const totalTasks = group.tasks.length;
          const doneTasks = group.tasks.filter(t => t.status === 'DONE').length;
          const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

          return (
            <div 
              key={group.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
            >
              {/* ================================================================= */}
              {/* JOB SWIMLANE HEADER (Click to Expand / Collapse)                  */}
              {/* ================================================================= */}
              <div 
                onClick={() => onToggleCollapse(group.id)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/80 select-none"
              >
                {/* Left: Chevron + Project Title + Meta */}
                <div className="flex items-center gap-3">
                  <button 
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 transition-transform duration-200"
                    title={isCollapsed ? "Mở rộng" : "Thu gọn"}
                  >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {group.title}
                      </h3>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                        {group.companyName || 'TaskBounty'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {group.status === 'IN_PROGRESS' ? '🟢 Đang hoạt động' : '📁 Dự án'} • Tổng cộng {totalTasks} nhiệm vụ
                    </p>
                  </div>
                </div>

                {/* Right: Progress Bar + Bounty + Quick Action */}
                <div 
                  className="flex items-center gap-4 shrink-0 self-end md:self-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {doneTasks}/{totalTasks} Hoàn thành
                    </span>
                    <div className="w-20 sm:w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-600">{progressPercent}%</span>
                  </div>

                  {/* Quick Add Task */}
                  {onQuickAddTask && (
                    <button
                      onClick={() => onQuickAddTask(group.id)}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus size={14} /> Thêm Task
                    </button>
                  )}

                  {/* Manage Job Link */}
                  <button
                    onClick={() => navigate(`/manage-jobs`)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Quản lý Job"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>

              {/* ================================================================= */}
              {/* KANBAN SWIMLANE COLUMNS (Expandable / Collapsible)                 */}
              {/* ================================================================= */}
              {!isCollapsed && (
                <div className="p-4 sm:p-5 overflow-x-auto custom-scrollbar animate-in fade-in duration-200">
                  <div className="flex gap-4 min-w-[980px] items-start">
                    {COLUMNS.map(col => {
                      const colTasks = group.tasks.filter(t => 
                        (t.status === col.id) || (col.id === 'OPEN' && !COLUMNS.map(c => c.id).includes(t.status))
                      );

                      return (
                        <DroppableColumn 
                          key={col.id} 
                          columnId={col.id}
                          col={{ ...col, count: colTasks.length }}
                          projectId={group.id}
                          onQuickAddTask={onQuickAddTask}
                        >
                          <SortableContext 
                            id={`${group.id}::${col.id}`}
                            items={colTasks.map(t => String(t.id))}
                            strategy={verticalListSortingStrategy}
                          >
                            {colTasks.map(task => (
                              <SortableTask 
                                key={task.id} 
                                task={task} 
                                onTaskClick={onTaskClick} 
                              />
                            ))}
                          </SortableContext>
                        </DroppableColumn>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTaskObj ? (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border-2 border-blue-500 rotate-2 opacity-90 w-72">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-2 leading-snug line-clamp-2">
              {activeTaskObj.title}
            </h4>
            <div className="font-mono font-bold text-emerald-600 text-xs">
              {Number(activeTaskObj.budget || 0).toLocaleString()} ₫
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default JobSwimlaneBoard;
