import React, { useState, useEffect } from 'react';
import { ChecklistItem } from '../types';

interface ChecklistSidebarProps {
  isOpen: boolean;
}

const ChecklistSidebar: React.FC<ChecklistSidebarProps> = ({ isOpen }) => {
  const [checklists, setChecklists] = useState<string[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<string>('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    // In a real app, you would fetch this from a server or a file system.
    setChecklists(['text_to_image.md']);
    setSelectedChecklist('text_to_image.md');
  }, []);

  useEffect(() => {
    if (selectedChecklist) {
      // In a real app, you would fetch this content. For this demo, it's hardcoded.
      const markdownContent = `
# Creation of an image from a text
This is a short checklist of tasks to complete for creating an image from a text description:

## 1. Brainstorming and Conceptualization
Description: Start by generating a clear idea or concept for your image. Think about the subject, the setting, the mood, and any specific details you want to include.
You can use Gemini 2.5 Flash or Pro to help you in this journey. You can ground this
brainstorming and conceptualization with marketing documents for example, that you share
with Gemini for a more aligned output.

## 2. Text Prompt Creation
Description: Write a detailed text description of the image you want to create. Be as specific as possible, using descriptive adjectives and phrases to convey your vision.
You can start with a simple prompt, and use the image attributes toolbar to enrich your
description with specific angle of view, lense type, and paper grain effect.

## 3. Image Generation
Description: Use Imagen3 to turn your text prompt into an image.

## 4. Review and Refinement
Description: Once the image is generated, review it to see if it matches your expectations. If not, refine your text prompt and generate new versions until you're happy with the result.
      `;

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

      setChecklistItems(parseMarkdown(markdownContent));
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
          {checklists.map((checklist) => (
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
