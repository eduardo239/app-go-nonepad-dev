import React, { useState } from 'react';
import './Sidebar.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export function Sidebar({
  pages,
  activePage,
  onPageSelect,
  onPageCreate,
  onPageRename,
  onPageDelete,
  isCollapsed,
  onToggleCollapse,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleCreatePage = () => {
    const title = 'New';
    onPageCreate(title);
  };

  const startEditing = (page) => {
    setEditingId(page.id);
    setEditingTitle(page.title);
  };

  const handleRename = (e) => {
    e.preventDefault();
    if (editingId && editingTitle.trim()) {
      onPageRename(editingId, editingTitle.trim());
      setEditingId(null);
    }
  };

  const handleDelete = (pageId) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      onPageDelete(pageId);
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={onToggleCollapse}>
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
        {!isCollapsed && (
          <button className="new-page-btn" onClick={handleCreatePage}>
            New Page
          </button>
        )}
      </div>
      <div className="pages-list">
        {!isCollapsed &&
          pages.map((page) => (
            <div
              key={page.id}
              className={`page-item ${
                activePage?.id === page.id ? 'active' : ''
              }`}
            >
              {editingId === page.id ? (
                <form className="page-item-edit-form" onSubmit={handleRename}>
                  <input
                    className="page-item-edit-form-input"
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={handleRename}
                    autoFocus
                  />
                </form>
              ) : (
                <div className="page-item-content">
                  <span
                    className="page-title font-sans"
                    onClick={() => onPageSelect(page)}
                  >
                    {page.title}
                  </span>
                  <div className="page-actions">
                    <button onClick={() => startEditing(page)}>edit</button>
                    <button onClick={() => handleDelete(page.id)}>del</button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
