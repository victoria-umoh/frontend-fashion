jest.mock('axios', () => ({
  create: jest.fn(({ baseURL }) => ({ defaults: { baseURL } })),
}), { virtual: true });

import API, { getImageUrl } from './api';

test('resolves relative image paths against the backend URL', () => {
  expect(getImageUrl('/assets/images/item.jpg')).toBe(
    new URL('/assets/images/item.jpg', API.defaults.baseURL).toString()
  );
});

test('preserves absolute image URLs', () => {
  const imageUrl = 'https://images.example.com/item.jpg';

  expect(getImageUrl(imageUrl)).toBe(imageUrl);
});
