import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {HomeScreen} from '../HomeScreen';

const navigation = {
  navigate: jest.fn(),
} as never;

test('el host explica la arquitectura y ofrece abrir el mini app', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <HomeScreen
        navigation={navigation}
        route={{key: 'home', name: 'Home'}}
      />,
    );
  });

  expect(tree!.root.findByProps({testID: 'host-title'}).props.children).toBe(
    'Super App · Host',
  );
  expect(tree!.root.findByProps({testID: 'open-mini'})).toBeTruthy();
});
