import React from 'react';
import { useDroppable } from '@dnd-kit/core';

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

  React.useEffect(() => {
    console.log(props.id, isOver);
  }, [isOver]);

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}

export default Droppable;
