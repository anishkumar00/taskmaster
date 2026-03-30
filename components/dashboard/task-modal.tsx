"use client";

import { useStore, type Task, type Subtask, type Priority } from "@/lib/store";
import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function TaskModal() {
  const isOpen = useStore((state) => state.isTaskModalOpen);
  const editingTask = useStore((state) => state.editingTask);
  const closeTaskModal = useStore((state) => state.closeTaskModal);
  const addTask = useStore((state) => state.addTask);
  const updateTask = useStore((state) => state.updateTask);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setNotes(editingTask.notes || "");
        setPriority(editingTask.priority);
        setCategory(editingTask.category || "Personal");
        setDueDate(editingTask.due_date ? editingTask.due_date.split("T")[0] : "");
        setTags(editingTask.tags ? editingTask.tags.join(", ") : "");
        setSubtasks(editingTask.subtasks || []);
      } else {
        setTitle("");
        setNotes("");
        setPriority("medium");
        setCategory("Personal");
        setDueDate("");
        setTags("");
        setSubtasks([]);
      }
      setNewSubtask("");
    }
  }, [isOpen, editingTask]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { title: newSubtask.trim(), completed: false }]);
    setNewSubtask("");
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    const taskData = {
      user_id: user.id,
      title: title.trim(),
      notes: notes.trim(),
      priority,
      category,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      subtasks,
      due_date: dueDate || null,
      completed: editingTask ? editingTask.completed : false,
    };

    if (editingTask) {
      // Optimistic update
      updateTask(editingTask.id, taskData);
      
      const { error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', editingTask.id);
        
      if (error) console.error("Error updating task:", error);
    } else {
      const tempId = crypto.randomUUID();
      const newTask: Task = {
        ...taskData,
        id: tempId,
        completed_at: null,
        created_at: new Date().toISOString()
      };
      
      // Optimistic insert
      addTask(newTask);

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();
        
      if (error) {
        console.error("Error creating task:", error);
      } else if (data) {
        // Swap temp ID with real ID silently
        updateTask(tempId, { id: data.id });
      }
    }

    setIsLoading(false);
    closeTaskModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all sm:p-6">
      <div 
        className="relative w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent animate-in fade-in zoom-in-95"
      >
        <button
          onClick={closeTaskModal}
          title="Close Modal"
          aria-label="Close Modal"
          className="absolute right-4 top-4 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 hover:bg-muted"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        <h2 className="text-xl font-bold text-foreground font-syne mb-6">
          {editingTask ? "✏️ Edit Task" : "➕ New Task"}
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Task Title *</label>
            <input
              autoFocus
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-themeGreen"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
              <select
                value={category}
                title="Category"
                aria-label="Category"
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-themeGreen"
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Errands">Errands</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                title="Priority"
                aria-label="Priority"
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-themeGreen"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Due Date</label>
            <input
              type="date"
              title="Due Date"
              aria-label="Due Date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-themeGreen [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add notes..."
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-themeGreen"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. exam, revision"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-themeGreen"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subtasks</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask..."
                className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-themeGreen"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e as any);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="flex items-center justify-center w-10 shrink-0 rounded-md bg-themeCyan text-background hover:bg-themeCyan/90 transition-colors"
                aria-label="Add subtask"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            {subtasks.length > 0 && (
              <div className="mt-2 space-y-2">
                {subtasks.map((st, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md bg-surface pl-3 pr-2 py-1.5 border border-border">
                    <span className="text-sm text-foreground font-mono">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                      aria-label="Remove subtask"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={closeTaskModal}
              className="rounded-md px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="rounded-md bg-themeGreen px-4 py-2 text-sm font-bold text-background hover:bg-themeGreen/90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Saving..." : "Save Task ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
