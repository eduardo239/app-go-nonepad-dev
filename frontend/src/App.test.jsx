import { render, fireEvent, screen, act } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

// Mock functions
const mockGetPages = async () => [];
const mockCreatePage = async () => ({
  id: '1',
  title: 'New Page',
  content: '',
});
const mockUpdatePage = async () => {};
const mockDeletePage = async () => {};
const mockEventsOn = () => {};

// Mock modules
vi.mock('../wailsjs/go/main/App', () => ({
  default: {
    GetPages: mockGetPages,
    CreatePage: mockCreatePage,
    UpdatePage: mockUpdatePage,
    DeletePage: mockDeletePage,
  },
}));

vi.mock('../wailsjs/runtime', () => ({
  default: {
    EventsOn: mockEventsOn,
  },
}));

describe('App', () => {
  const mockPages = [
    { id: '1', title: 'Page 1', content: 'Content 1' },
    { id: '2', title: 'Page 2', content: 'Content 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementations
    const { GetPages } = require('../wailsjs/go/main/App');
    GetPages.mockResolvedValue(mockPages);
  });

  test('loads and displays pages on mount', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByText('Page 2')).toBeInTheDocument();
  });

  test('handles content changes', async () => {
    const { UpdatePage } = require('../wailsjs/go/main/App');

    await act(async () => {
      render(<App />);
    });

    const textarea = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'New content' } });
    });

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(UpdatePage).toHaveBeenCalledWith('1', 'Page 1', 'New content');
  });

  test('creates new page', async () => {
    const { CreatePage } = require('../wailsjs/go/main/App');
    const newPage = { id: '3', title: 'New Page', content: '' };
    CreatePage.mockResolvedValue(newPage);

    await act(async () => {
      render(<App />);
    });

    const newPageButton = screen.getByText('+ New Page');
    await act(async () => {
      fireEvent.click(newPageButton);
    });

    expect(CreatePage).toHaveBeenCalled();
  });
});
