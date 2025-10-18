import { useState, useEffect } from 'react';
import './App.css';
import {
  CreatePage,
  GetPages,
  UpdatePage,
  DeletePage,
} from '../wailsjs/go/main/App';
import { EventsOn } from '../wailsjs/runtime';
import { Sidebar } from './components/Sidebar';

export default function App() {
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load pages when the app starts
  useEffect(() => {
    GetPages()
      .then((loadedPages) => {
        setPages(loadedPages || []);
        if (loadedPages && loadedPages.length > 0) {
          setActivePage(loadedPages[0]);
        }
      })
      .catch(console.error);
  }, []);

  // Auto-save page content when it changes
  useEffect(() => {
    if (!activePage) return;

    const saveTimer = setTimeout(async () => {
      try {
        await UpdatePage(activePage.id, activePage.title, activePage.content);
        // Update the pages array to reflect the changes
        setPages((currentPages) =>
          currentPages.map((page) =>
            page.id === activePage.id ? activePage : page
          )
        );
      } catch (error) {
        console.error('Failed to save page:', error);
      }
    }, 500);

    return () => clearTimeout(saveTimer);
  }, [activePage]);

  const handleContentChange = (e) => {
    if (activePage) {
      const updatedPage = {
        ...activePage,
        content: e.target.value,
        updatedAt: new Date().toISOString(),
      };
      setActivePage(updatedPage);
      // Update the pages array immediately for UI consistency
      setPages((currentPages) =>
        currentPages.map((page) =>
          page.id === updatedPage.id ? updatedPage : page
        )
      );
    }
  };

  const handleCreatePage = async (title) => {
    try {
      const newPage = await CreatePage(title);
      setPages((currentPages) => [...currentPages, newPage]);
      setActivePage(newPage);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  const handlePageSelect = (page) => {
    // Find the most up-to-date version of the page from the pages array
    const currentPage = pages.find((p) => p.id === page.id);
    setActivePage(currentPage || page);
  };

  const handlePageRename = async (pageId, newTitle) => {
    try {
      await UpdatePage(pageId, newTitle, activePage.content);
      setPages(
        pages.map((p) => (p.id === pageId ? { ...p, title: newTitle } : p))
      );
      if (activePage.id === pageId) {
        setActivePage({ ...activePage, title: newTitle });
      }
    } catch (error) {
      console.error('Failed to rename page:', error);
    }
  };

  const handlePageDelete = async (pageId) => {
    try {
      await DeletePage(pageId);
      const updatedPages = pages.filter((p) => p.id !== pageId);
      setPages(updatedPages);
      if (activePage.id === pageId) {
        setActivePage(updatedPages[0] || null);
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  useEffect(() => {
    // Set up menu event listeners
    const cleanup = [
      EventsOn('menu:new', () => {
        handleCreatePage('New Page');
      }),

      EventsOn('menu:cut', () => {
        const textarea = document.getElementById('input');
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          if (start !== end) {
            const selectedText = textarea.value.substring(start, end);
            navigator.clipboard.writeText(selectedText).then(() => {
              const newContent =
                textarea.value.substring(0, start) +
                textarea.value.substring(end);
              handleContentChange({ target: { value: newContent } });
            });
          }
        }
      }),

      EventsOn('menu:copy', () => {
        const textarea = document.getElementById('input');
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          if (start !== end) {
            const selectedText = textarea.value.substring(start, end);
            navigator.clipboard.writeText(selectedText);
          }
        }
      }),

      EventsOn('menu:paste', () => {
        const textarea = document.getElementById('input');
        if (textarea) {
          navigator.clipboard.readText().then((text) => {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const currentContent = textarea.value;
            const newContent =
              currentContent.substring(0, start) +
              text +
              currentContent.substring(end);
            handleContentChange({ target: { value: newContent } });
          });
        }
      }),
    ];

    // Cleanup function to unsubscribe from all events
    return () => cleanup.forEach((unsubscribe) => unsubscribe());
  }, []);

  function greet() {
    Greet(name).then(updateResultText);
  }

  return (
    <div id="App">
      <Sidebar
        pages={pages}
        activePage={activePage}
        onPageSelect={handlePageSelect}
        onPageCreate={handleCreatePage}
        onPageRename={handlePageRename}
        onPageDelete={handlePageDelete}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <textarea
        name="input"
        id="input"
        onChange={handleContentChange}
        value={activePage?.content || ''}
        placeholder={
          activePage
            ? 'Start typing...'
            : 'Create or select a page to start typing...'
        }
        autoFocus
      ></textarea>
    </div>
  );
}
