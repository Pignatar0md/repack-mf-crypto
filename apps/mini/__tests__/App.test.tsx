import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('el mini app muestra su tarjeta federada', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });

  expect(tree!.root.findByProps({testID: 'mini-title'}).props.children).toBe(
    'Mini App federada',
  );
  expect(tree!.root.findByProps({testID: 'mini-counter'}).props.children).toBe(
    0,
  );

  await ReactTestRenderer.act(() => {
    tree!.root.findByProps({testID: 'mini-tap'}).props.onPress();
  });

  expect(tree!.root.findByProps({testID: 'mini-counter'}).props.children).toBe(
    1,
  );
});
