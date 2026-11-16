import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const product = {
  _id: 'product-1',
  name: 'Evening Dress',
  countInStock: 3,
};

const CartHarness = () => {
  const { cartItems, addToCart, removeFromCart } = useCart();

  return (
    <div>
      <button onClick={() => addToCart({ ...product, size: 'S', color: 'Black' })}>Add small</button>
      <button onClick={() => addToCart({ ...product, size: 'M', color: 'Black' })}>Add medium</button>
      <button onClick={() => addToCart({ ...product, size: 'S', color: 'Black' }, 5)}>Add five small</button>
      <button onClick={() => removeFromCart(product._id, 'S', 'Black')}>Remove small</button>
      <output data-testid="cart-lines">{cartItems.length}</output>
      <output data-testid="small-quantity">
        {cartItems.find((item) => item.size === 'S')?.qty || 0}
      </output>
    </div>
  );
};

beforeEach(() => localStorage.clear());

test('keeps variants separate, caps quantity at stock, and removes only one variant', () => {
  render(
    <CartProvider>
      <CartHarness />
    </CartProvider>
  );

  fireEvent.click(screen.getByText('Add small'));
  fireEvent.click(screen.getByText('Add small'));
  fireEvent.click(screen.getByText('Add five small'));
  fireEvent.click(screen.getByText('Add medium'));

  expect(screen.getByTestId('cart-lines')).toHaveTextContent('2');
  expect(screen.getByTestId('small-quantity')).toHaveTextContent('3');

  fireEvent.click(screen.getByText('Remove small'));

  expect(screen.getByTestId('cart-lines')).toHaveTextContent('1');
});
