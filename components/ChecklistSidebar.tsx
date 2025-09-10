import React, { useState, useEffect } from 'react';
import { ChecklistItem } from '../types';

interface ChecklistSidebarProps {
  isOpen: boolean;
}

// Use import.meta.glob to import all markdown files from the checklists directory.
// The `eager: true` option makes sure the content is imported synchronously.
// The `as: 'raw'` option imports the files as raw text.
const checklistModules = import.meta.glob('../assets/checklists/*.md', { eager: true, as: 'raw' });

// Extract the file names to be used as checklist identifiers.
const availableChecklists = Object.keys(checklistModules).map(path => {
  const parts = path.split('/');
  return parts[parts.length - 1];
});

const ChecklistSidebar: React.FC<ChecklistSidebarProps> = ({ isOpen }) => {
  const [selectedChecklist, setSelectedChecklist] = useState<string>(availableChecklists[0] || '');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (selectedChecklist) {
      // Construct the key to access the content from the imported modules.
      const modulePath = `../assets/checklists/${selectedChecklist}`;
      const markdownContent = checklistModules[modulePath];

      const parseMarkdown = (content: string) => {
        const items: ChecklistItem[] = [];
        const lines = content.split('\n');
        let currentItem: Partial<ChecklistItem> = {};

        for (const line of lines) {
          if (line.startsWith('## ')) {
            if (currentItem.name) {
              items.push(currentItem as ChecklistItem);
            }
            currentItem = { name: line.substring(3).trim(), description: '', completed: false };
          } else if (line.startsWith('Description: ')) {
            if (currentItem.name) {
              currentItem.description = line.substring(13).trim();
            }
          } else if (currentItem.name && line.trim() !== '') {
            currentItem.description += ' ' + line.trim();
          }
        }
        if (currentItem.name) {
          items.push(currentItem as ChecklistItem);
        }
        return items;
      };

      if (markdownContent) {
        setChecklistItems(parseMarkdown(markdownContent));
      } else {
        // Handle case where content is not found, though with glob it should be.
        setChecklistItems([]);
      }
    } else {
      setChecklistItems([]);
    }
  }, [selectedChecklist]);

  const handleToggleComplete = (index: number) => {
    const newItems = [...checklistItems];
    newItems[index].completed = !newItems[index].completed;
    setChecklistItems(newItems);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 p-6 flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-white">Checklists</h2>
      <div>
        <label htmlFor="checklist-selector" className="block text-sm font-medium text-gray-300 mb-2">
          Select a checklist
        </label>
        <select
          id="checklist-selector"
          value={selectedChecklist}
          onChange={(e) => setSelectedChecklist(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableChecklists.map((checklist) => (
            <option key={checklist} value={checklist}>
              {checklist.replace('.md', '').replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {checklistItems.map((item, index) => (
          <div key={index} className="p-4 bg-gray-900 rounded-lg">
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggleComplete(index)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-gray-700"
              />
              <div className="ml-3 text-sm">
                <label htmlFor={`checklist-item-${index}`} className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                  {item.name}
                </label>
                <p className="text-gray-400 mt-1">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistSidebar;