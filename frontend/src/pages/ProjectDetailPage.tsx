import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Project, Task, TaskStatus } from '../types';
import { Modal } from '../components/Modal';
import './ProjectDetailPage.css';

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'done', label: 'Done' },
];

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canManageTasks = user?.role === 'admin' || user?.role === 'manager';

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadProject() {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get<Project>(`/projects/${id}`);
      setProject(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function openCreate() {
    setEditing(null);
    setTitle('');
    setDescription('');
    setStatus('todo');
    setFormError('');
    setShowModal(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (editing) {
        await api.patch(`/tasks/${editing.id}`, { title, description, status });
      } else {
        await api.post('/tasks', { title, description, status, projectId: id });
      }
      setShowModal(false);
      await loadProject();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(task: Task) {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      await loadProject();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function moveTask(task: Task, newStatus: TaskStatus) {
    if (task.status === newStatus) return;
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });
      await loadProject();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  if (loading) return <p className="page-sub">Loading project…</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!project) return null;

  const tasksByStatus = (statusKey: TaskStatus) =>
    (project.tasks || []).filter((t) => t.status === statusKey);

  return (
    <div>
      <Link to="/projects" className="back-link">
        ← All projects
      </Link>

      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <p className="page-sub">{project.description || 'No description'}</p>
        </div>
        {canManageTasks && (
          <button className="btn btn-accent" onClick={openCreate}>
            + New task
          </button>
        )}
      </div>

      <div className="board">
        {COLUMNS.map((col) => (
          <div key={col.key} className="board-column">
            <div className="board-column-header">
              <span>{col.label}</span>
              <span className="column-count">{tasksByStatus(col.key).length}</span>
            </div>

            <div className="board-column-body">
              {tasksByStatus(col.key).map((task) => (
                <div key={task.id} className="task-card card">
                  <p className="task-title">{task.title}</p>
                  {task.description && <p className="task-desc">{task.description}</p>}

                  <div className="task-footer">
                    <span className="task-assignee">
                      {task.assignee ? task.assignee.name : 'Unassigned'}
                    </span>
                  </div>

                  <div className="task-actions">
                    <select
                      value={task.status}
                      onChange={(e) => moveTask(task, e.target.value as TaskStatus)}
                      className="task-status-select"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    {canManageTasks && (
                      <>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(task)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {tasksByStatus(col.key).length === 0 && (
                <p className="column-empty">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit task' : 'New task'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
                {COLUMNS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            {formError && <p className="error-text">{formError}</p>}
            <button className="btn btn-accent" type="submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create task'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}