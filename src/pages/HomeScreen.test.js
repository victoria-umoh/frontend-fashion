import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import API from '../api';
import HomeScreen from './HomeScreen';

jest.mock('react-router-dom', () => {
  const React = jest.requireActual('react');
  return {
    Link: ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children),
    useLocation: () => ({ pathname: '/', hash: '' }),
  };
}, { virtual: true });

jest.mock('../api', () => ({
  get: jest.fn(),
  getImageUrl: (image) => image,
}));

jest.mock('../components/ProductCard', () => () => null);

test('shows a retry option when products cannot be loaded', async () => {
  API.get.mockRejectedValueOnce(new Error('Network Error'));
  API.get.mockResolvedValueOnce({ data: [] });

  render(<HomeScreen />);

  expect(await screen.findByText(/couldn’t load the collection/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

  await waitFor(() => {
    expect(API.get).toHaveBeenCalledTimes(2);
    expect(screen.getByText('No pieces found')).toBeInTheDocument();
  });
});
