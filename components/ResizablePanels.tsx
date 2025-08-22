import React, { useState, useRef, useCallback, ReactNode } from 'react';

interface ResizablePanelsProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

const ResizablePanels: React.FC<ResizablePanelsProps> = ({ leftPanel, rightPanel }) => {
  const [leftWidth, setLeftWidth] = useState(50);
  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isResizing.current = true;
    e.preventDefault();
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !containerRef.current) {
      return;
    }
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    if (newLeftWidth > 20 && newLeftWidth < 80) { // Constraint resizing
      setLeftWidth(newLeftWidth);
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div style={{ width: `${leftWidth}%` }} className="h-full">
        {leftPanel}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="w-2 h-full bg-gray-700 cursor-col-resize hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
      >
        <div className="w-px h-8 bg-gray-500"></div>
      </div>
      <div style={{ width: `${100 - leftWidth}%` }} className="h-full">
        {rightPanel}
      </div>
    </div>
  );
};

export default ResizablePanels;