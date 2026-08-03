import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Circle, GripVertical } from 'lucide-react';
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

interface TaskBoardProps {
  tasks: any[];
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskClick: (task: any) => void;
}

const COLUMNS = [
  { id: 'OPEN', label: 'To Do', color: 'bg-neutral-100 text-neutral-700', icon: <Circle size={16} /> },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: <Clock size={16} /> },
  { id: 'REVIEW', label: 'In Review', color: 'bg-orange-100 text-orange-700', icon: <AlertCircle size={16} /> },
  { id: 'DONE', label: 'Done', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={16} /> }
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
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-xl shadow-sm border ${isDragging ? 'border-primary-400' : 'border-neutral-200'} cursor-pointer hover:shadow-md hover:border-primary-300 transition-all group`}
      onClick={() => onTaskClick(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase tracking-wider">
          {task.project?.title || 'Bounty'}
        </span>
        <div 
          className="text-neutral-300 group-hover:text-neutral-500 cursor-grab active:cursor-grabbing"
          {...attributes} 
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>
      </div>
      <h4 className="font-semibold text-neutral-800 text-sm mb-3 leading-snug">{task.title}</h4>
      <div className="flex justify-between items-center border-t border-neutral-100 pt-3">
        <span className="text-green-600 font-black text-sm">{task.budget?.toLocaleString() || 0} ₫</span>
      </div>
    </div>
  );
};

const DroppableColumn = ({ id, col, children }: { id: string, col: any, children: React.ReactNode }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 flex flex-col bg-neutral-50/50 rounded-2xl border ${isOver ? 'border-primary-400 bg-primary-50/20' : 'border-neutral-200/60'} h-full transition-colors`}
    >
      <div className="p-4 flex items-center justify-between border-b border-neutral-200/50">
        <div className="flex items-center gap-2 font-bold text-neutral-800">
          <div className={`p-1.5 rounded-md ${col.color}`}>{col.icon}</div>
          {col.label}
        </div>
        <span className="bg-white text-neutral-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-neutral-100">
          {col.count}
        </span>
      </div>
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
        {children}
      </div>
    </div>
  );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskMove, onTaskClick }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
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

    const activeIdVal = active.id;
    const overIdVal = over.id;
    
    // Find if dropped over a column
    const isOverColumn = COLUMNS.some(c => c.id === overIdVal);
    
    if (isOverColumn) {
      const task = tasks.find(t => t.id === activeIdVal);
      if (task && task.status !== overIdVal) {
        onTaskMove(activeIdVal as string, overIdVal as string);
      }
    } else {
      // Find if dropped over another task
      const overTask = tasks.find(t => t.id === overIdVal);
      const activeTask = tasks.find(t => t.id === activeIdVal);
      
      if (activeTask && overTask && activeTask.status !== overTask.status) {
        onTaskMove(activeIdVal as string, overTask.status);
      }
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto custom-scrollbar h-[calc(100vh-200px)] pb-4 items-start">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => (t.status === col.id) || (col.id === 'OPEN' && !COLUMNS.map(c=>c.id).includes(t.status)));
          
          return (
            <DroppableColumn key={col.id} id={col.id} col={{...col, count: colTasks.length}}>
              <SortableContext 
                id={col.id}
                items={colTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {colTasks.map(task => (
                  <SortableTask key={task.id} task={task} onTaskClick={onTaskClick} />
                ))}
              </SortableContext>
            </DroppableColumn>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="bg-white p-4 rounded-xl shadow-lg border border-primary-400 rotate-2 opacity-80 w-80">
            <h4 className="font-semibold text-neutral-800 text-sm mb-3 leading-snug">{activeTask.title}</h4>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
