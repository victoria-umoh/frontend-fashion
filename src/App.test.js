import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: () => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    }),
  },
}), { virtual: true });

jest.mock('react-router-dom', () => {
  const React = jest.requireActual('react');
  return {
    BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    Link: ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children),
    Route: () => null,
    Routes: ({ children }) => React.Children.toArray(children)
      .find((route) => route.props.path === '/')?.props.element || null,
    useLocation: () => ({ pathname: '/', hash: '' }),
    useNavigate: () => () => {},
  };
}, { virtual: true });

jest.mock('./pages/HomeScreen', () => {
  const React = jest.requireActual('react');
  return () => React.createElement('h2', null, 'The collection');
});

test('renders the fashion storefront', async () => {
  render(<App />);

  expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveTextContent(/saint victoria/i);
  expect(await screen.findByRole('heading', { name: /the collection/i })).toBeInTheDocument();
});
