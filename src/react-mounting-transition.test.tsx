import { useEffect, useState } from 'react';
import { create, act } from 'react-test-renderer';
import { MountingTransition } from './react-mounting-transition';

describe('MountingTransition', () => {
  test('unmounted => mounted', async () => {
    const handler = jest.fn(() => null);

    function ExampleComponent() {
      const [mounted, setMounted] = useState(false);

      useEffect(() => {
        setMounted(true);
      }, []);

      return (
        <MountingTransition mounted={mounted} timeout={100}>
          {handler}
        </MountingTransition>
      );
    }

    create(<ExampleComponent />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(handler.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "active": false,
      "state": "exit-final",
    },
  ],
  Array [
    Object {
      "active": false,
      "state": "enter-begin",
    },
  ],
  Array [
    Object {
      "active": true,
      "state": "enter-final",
    },
  ],
]
`);
  });

  test('mounted => unmounted', async () => {
    const handler = jest.fn(() => null);

    function ExampleComponent() {
      const [mounted, setMounted] = useState(true);

      useEffect(() => {
        setMounted(false);
      }, []);

      return (
        <MountingTransition mounted={mounted} timeout={100}>
          {handler}
        </MountingTransition>
      );
    }

    create(<ExampleComponent />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(handler.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "active": false,
      "state": "enter-begin",
    },
  ],
  Array [
    Object {
      "active": false,
      "state": "exit-begin",
    },
  ],
  Array [
    Object {
      "active": false,
      "state": "exit-final",
    },
  ],
]
`);
  });

  test('mounted => mount', async () => {
    const handler = jest.fn(() => null);

    function ExampleComponent() {
      return (
        <MountingTransition mounted timeout={100}>
          {handler}
        </MountingTransition>
      );
    }

    create(<ExampleComponent />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(handler.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "active": false,
      "state": "enter-begin",
    },
  ],
]
`);
  });

  test('unmounted => unmount', async () => {
    const handler = jest.fn(() => null);

    function ExampleComponent() {
      return (
        <MountingTransition mounted={false} timeout={100}>
          {handler}
        </MountingTransition>
      );
    }

    create(<ExampleComponent />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(handler.mock.calls).toMatchInlineSnapshot(`Array []`);
  });
});
