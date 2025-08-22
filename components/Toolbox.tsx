
import React from 'react';
import { Tool } from '../types';
import PencilIcon from './icons/PencilIcon';
import LineIcon from './icons/LineIcon';
import SquareIcon from './icons/SquareIcon';
import TypeIcon from './icons/TypeIcon';
import TrashIcon from './icons/TrashIcon';
import UploadIcon from './icons/UploadIcon';
import PointerIcon from './icons/PointerIcon';

interface ToolboxProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
  color: string;
  setColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  onClear: () => void;
  onUndo: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  imageLoaded: boolean;
}

const ToolButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ label, icon, isActive, onClick, disabled }) => (
  <button
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md ${
      isActive ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {icon}
  </button>
);


const Toolbox: React.FC<ToolboxProps> = ({ 
    tool, setTool, color, setColor, lineWidth, setLineWidth, onClear, onUndo, onImageUpload, imageLoaded 
}) => {
  const tools = [
    { id: Tool.MOVE, label: 'Select & Move', icon: <PointerIcon /> },
    { id: Tool.PENCIL, label: 'Pencil', icon: <PencilIcon /> },
    { id: Tool.LINE, label: 'Line', icon: <LineIcon /> },
    { id: Tool.RECTANGLE, label: 'Rectangle', icon: <SquareIcon /> },
    { id: Tool.TEXT, label: 'Text', icon: <TypeIcon /> }
  ];

  return (
    <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <input type="file" id="imageUploadToolbox" accept="image/*" onChange={onImageUpload} className="hidden" />
        <label htmlFor="imageUploadToolbox" title={imageLoaded ? 'Change Image' : 'Upload Image'} className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors">
            <UploadIcon />
        </label>

        <div className="h-6 w-px bg-gray-600"></div>

        {tools.map((t) => (
          <ToolButton
            key={t.id}
            label={t.label}
            icon={t.icon}
            isActive={tool === t.id}
            onClick={() => setTool(t.id)}
            disabled={!imageLoaded && t.id !== Tool.MOVE}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                {['#FFFFFF', '#000000', '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#34C759', '#007AFF', '#5856D6'].map(c => (
                    <button
                        key={c}
                        title={c}
                        onClick={() => setColor(c)}
                        disabled={!imageLoaded}
                        className={`w-6 h-6 rounded-full border-2 transition-all disabled:cursor-not-allowed ${
                            color.toUpperCase() === c.toUpperCase()
                                ? 'border-white ring-2 ring-offset-1 ring-offset-gray-800 ring-blue-500'
                                : 'border-gray-600 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
            <label htmlFor="line-width" className="text-sm shrink-0">Size</label>
            <div className="flex items-center gap-2">
                {[2, 5, 10].map(size => (
                    <button
                        key={size}
                        title={`${size}px`}
                        onClick={() => setLineWidth(size)}
                        disabled={!imageLoaded}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed ${
                            lineWidth === size
                            ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        <div className="text-xs">{size}</div>
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button onClick={onUndo} disabled={!imageLoaded} className="text-sm px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">Undo</button>
        <ToolButton
          label="Clear All"
          icon={<TrashIcon />}
          isActive={false}
          onClick={onClear}
          disabled={!imageLoaded}
        />
      </div>
    </div>
  );
};

export default Toolbox;