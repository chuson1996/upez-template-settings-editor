import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Upload, Copy, Eye, EyeOff, Plus } from 'lucide-react';
import { Field } from './types';
import FieldEditor from './components/FieldEditor';

const FIELD_PROPERTIES = [
  'id', 'type', 'label', 'default', 'options', 'info', 'placeholder', 'highlightingElem', 'content',
  'thumbnail', 'banner', 'subheadline', 'popup_html', 'tooltip_html'
];

function App() {
  const [fields, setFields] = useState<Field[]>([]);
  const [visibleProperties, setVisibleProperties] = useState<Set<string>>(new Set(['id', 'type', 'label', 'default']));
  const [newField, setNewField] = useState<Field>({ id: '', type: 'text', label: '' });
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePropertyVisibility = (property: string) => {
    setVisibleProperties((prevVisible) => {
      const newVisible = new Set(prevVisible);
      if (newVisible.has(property)) {
        newVisible.delete(property);
      } else {
        newVisible.add(property);
      }
      return newVisible;
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items);
  };

  const handleFieldChange = (index: number, updatedField: Field) => {
    const updatedFields = [...fields];
    updatedFields[index] = updatedField;
    setFields(updatedFields);
  };

  const handleAddField = () => {
    if (newField.id && newField.type) {
      setFields([...fields, newField]);
      setNewField({ id: '', type: 'text', label: '' });
      setShowNewFieldForm(false);
    }
  };

  const handleCopyJSON = () => {
    const jsonString = JSON.stringify(fields, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleUploadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json)) {
            setFields(json);
          } else {
            alert('Invalid JSON format. Please upload an array of fields.');
          }
        } catch (error) {
          alert('Error parsing JSON file. Please check the file and try again.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex">
      <div className="w-1/4 bg-white rounded-lg shadow-md p-4 mr-4 overflow-y-auto max-h-screen">
        <h2 className="text-xl font-bold mb-4">Property Visibility</h2>
        {FIELD_PROPERTIES.map((property) => (
          <div key={property} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`visibility-${property}`}
              checked={visibleProperties.has(property)}
              onChange={() => togglePropertyVisibility(property)}
              className="mr-2"
            />
            <label htmlFor={`visibility-${property}`} className="flex items-center cursor-pointer">
              {visibleProperties.has(property) ? (
                <Eye className="w-4 h-4 mr-2" />
              ) : (
                <EyeOff className="w-4 h-4 mr-2" />
              )}
              {property}
            </label>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-white rounded-lg shadow-md p-4 overflow-y-auto max-h-screen">
        <h1 className="text-2xl font-bold mb-4">Field Editor</h1>
        <div className="mb-4 flex space-x-4">
          <button
            onClick={() => setShowNewFieldForm(true)}
            className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Field
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadJSON}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleCopyJSON}
            className="flex items-center bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copySuccess ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
        {showNewFieldForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Add New Field</h3>
            <input
              type="text"
              placeholder="ID"
              value={newField.id}
              onChange={(e) => setNewField({ ...newField, id: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            />
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            >
              <option value="text">Text</option>
              <option value="color">Color</option>
              <option value="button">Button</option>
              <option value="boolean">Boolean</option>
              <option value="select">Select</option>
              <option value="header">Header</option>
            </select>
            <button
              onClick={handleAddField}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Field
            </button>
          </div>
        )}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {fields.map((field, index) => (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="mb-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <FieldEditor
                          field={field}
                          onChange={(updatedField) => handleFieldChange(index, updatedField)}
                          visibleProperties={visibleProperties}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;