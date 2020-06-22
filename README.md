# React Mounting Transition

> `react-mounting-transition` is a simple lib to help you add transitions to components you dynamically mount to the DOM

## Why is this necessary?

Certain elements are better dynamically added to the DOM on-demand. A good example of this would be the modal.

1. When the modal is opened, it's best to create a brand new containing div and add it to the DOM to avoid z-index issues.
2. For performance reasons, it's good to add the modal elements only when the modal is open to reduce the amount of elements on the first paint.

However, when mounting components dynamically to the DOM, it's hard to add transitions because you have to add different class names at different states of the transition while keeping the component mounted until the transition is finished.

You can think of this lib as a simpler alternative to `react-transition-group` with one specific use case.

## Installation

```
npm i @ricokahler/react-mounting-transition
```

or

```
yarn add @ricokahler/react-mounting-transition
```

### Usage

```tsx
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import MountingTransition from 'components/mounting-transition';

interface Props {
  open: boolean;
  onClose: () => void;
  className?: React.ReactNode;
  children: React.ReactNode;
}

function Modal({ className, children, open, onClose }: Props) {
  const handleMount = async () => {
    // do something useful like handle focus
  };

  const handleUnmount = async () => {
    // do something useful like handle focus
  };

  return (
    <MountingTransition
      mounted={open}
      portal={{ containerClass: 'modal__container' }}
      timeout={250}
      onMount={handleMount}
      onUnmount={handleUnmount}
    >
      {({ active }) => (
        <>
          <div
            className={classNames('modal__backdrop', {
              'modal__backdrop--active': active,
            })}
            onClick={onClose}
          />
          <div
            aria-modal="true"
            className={classNames(className, 'modal', {
              'modal--active': active,
            })}
          >
            {children}
          </div>
        </>
      )}
    </MountingTransition>
  );
}

export default Modal;
```

```css
.modal__container {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  display: flex;
}

.modal__backdrop {
  opacity: 0;
  transition: opacity 250ms;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal__backdrop--active {
  opacity: 1;
}

.modal {
  width: 640px;
  max-width: 100%;
  z-index: 1;
  opacity: 0;
  transition: opacity 250ms;
  margin: auto;
  transform: translateY(100%);
}

.modal--active {
  opacity: 1;
  transform: translateY(0);
}
```
