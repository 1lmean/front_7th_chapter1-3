import { useDroppable } from '@dnd-kit/core';
import React from 'react';

function Droppable(props: { children: React.ReactNode; id: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });
  const style: React.CSSProperties = {
    color: isOver ? 'green' : undefined,
    display: 'block',
    width: '100%',
    height: '100%',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}

export default Droppable;
