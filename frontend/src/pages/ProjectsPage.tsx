import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Project } from '../types';
import { Modal } from '../components/Modal';
import './ProjectsPage.css';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadProjects() {
    setLoading(true);
    try {
      const { data } = await api.get<Project[]>('/projects');
      setProjects(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function openCreate() {
    setEditing(null);
    setName('');
    setDescription('');
    setFormError('');
    setShowModal(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setName(project.name);
    setDescription(project.description || '');
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (editing) {
        await api.patch(`/projects/${editing.id}`, { name, description });
      } else {
        await api.post('/projects', { name, description });
      }
      setShowModal(false);
      await loadProjects();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(project: Project) {
    if (!confirm(`Delete "${project.name}"? This also deletes its tasks.`)) return;
    try {
      await api.delete(`/projects/${project.id}`);
      await loadProjects();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-sub">Everything your team is working on.</p>
        </div>
        <button className="btn btn-accent" onClick={openCreate}>
          + New project
        </button>
      </div>

      {loading && <p className="page-sub">Loading projects…</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && projects.length === 0 && (
        <div className="empty-state card">
          <h3>No projects yet</h3>
          <p>Create your first project to start organizing tasks.</p>
        </div>
      )}

      <div className="project-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card card">
            <Link to={`/projects/${project.id}`} className="project-card-link">
              <h3>{project.name}</h3>
              <p className="project-desc">{project.description || 'No description'}</p>
            </Link>
            <div className="project-card-footer">
              <span className="task-count">{project.tasks?.length ?? 0} tasks</span>
              <div className="project-card-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(project)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit project' : 'New project'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
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
            {formError && <p className="error-text">{formError}</p>}
            <button className="btn btn-accent" type="submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create project'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}