import { render, fireEvent, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import '@testing-library/jest-dom';

const createMockFunction = () => {
  return { mock: { calls: [] }, mockImplementation: () => {} };
};

describe('Sidebar', () => {
  const mockPages = [
    { id: '1', title: 'Page 1', content: 'Content 1' },
    { id: '2', title: 'Page 2', content: 'Content 2' },
  ];

  const mockProps = {
    pages: mockPages,
    activePage: mockPages[0],
    onPageSelect: mockFn(),
    onPageCreate: mockFn(),
    onPageRename: mockFn(),
    onPageDelete: mockFn(),
    isCollapsed: false,
    onToggleCollapse: mockFn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sidebar with pages', () => {
    render(<Sidebar {...mockProps} />);

    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByText('Page 2')).toBeInTheDocument();
  });

  test('handles page selection', () => {
    render(<Sidebar {...mockProps} />);

    fireEvent.click(screen.getByText('Page 2'));
    expect(mockProps.onPageSelect).toHaveBeenCalledWith(mockPages[1]);
  });

  test('creates new page', () => {
    render(<Sidebar {...mockProps} />);

    fireEvent.click(screen.getByText('+ New Page'));
    expect(mockProps.onPageCreate).toHaveBeenCalled();
  });

  test('handles collapse toggle', () => {
    render(<Sidebar {...mockProps} />);

    const collapseButton = screen.getByRole('button', { name: '' }); // The collapse button has no text
    fireEvent.click(collapseButton);
    expect(mockProps.onToggleCollapse).toHaveBeenCalled();
  });

  test('renders in collapsed state', () => {
    render(<Sidebar {...mockProps} isCollapsed={true} />);

    expect(screen.queryByText('Page 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Page 2')).not.toBeInTheDocument();
  });
});
