import React from 'react';
import { Field } from '../types';
import { GripVertical } from 'lucide-react';

interface FieldEditorProps {
  field: Field;
  onChange: (updatedField: Field) => void;
  visibleProperties: Set<string>;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onChange, visibleProperties }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...field, [name]: value });
  };

  const renderProperty = (property: string) => {
    if (!visibleProperties.has(property)) return null;

    switch (property) {
      case 'type':
        return (
          <select
            name="type"
            value={field.type}
            onChange={handleChange}
            className="w-full p-1 border rounded text-xs"
          >
            <option value="text">text</option>
            <option value="color">color</option>
            <option value="button">button</option>
            <option value="boolean">boolean</option>
            <option value="select">select</option>
            <option value="header">header</option>
          </select>
        );
      case 'options':
        return (
          <textarea
            name="options"
            value={JSON.stringify(field.options || [])}
            onChange={(e) => {
              try {
                const options = JSON.parse(e.target.value);
                onChange({ ...field, options });
              } catch (error) {
                console.error('Invalid JSON for options:', error);
              }
            }}
            className="w-full p-1 border rounded text-xs"
            rows={3}
          />
        );
      case 'default':
        if (field.type === 'boolean') {
          return (
            <select
              name="default"
              value={field.default?.toString()}
              onChange={handleChange}
              className="w-full p-1 border rounded text-xs"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          );
        } else if (field.type === 'select') {
          return (
            <select
              name="default"
              value={field.default as string}
              onChange={handleChange}
              className="w-full p-1 border rounded text-xs"
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        } else if (field.type === 'color') {
          return (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                name="default"
                value={field.default as string}
                onChange={handleChange}
                placeholder="#RRGGBB"
                className="flex-grow p-1 border rounded text-xs"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
              <div
                className="w-6 h-6 border rounded"
                style={{ backgroundColor: field.default as string }}
              ></div>
            </div>
          );
        }
        // Fall through to default case for other types
      case 'popup_html':
      case 'tooltip_html':
        return (
          <textarea
            name={property}
            value={field[property as keyof Field] as string}
            onChange={handleChange}
            className="w-full p-1 border rounded text-xs"
            rows={3}
          />
        );
      default:
        return (
          <input
            type="text"
            name={property}
            value={field[property as keyof Field] as string}
            onChange={handleChange}
            className="w-full p-1 border rounded text-xs"
          />
        );
    }
  };

  const getFieldHeading = () => {
    if (field.type === 'header') {
      return field.content || field.label || field.id;
    }
    return field.label || field.id;
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <GripVertical className="text-gray-400 w-4 h-4 flex-shrink-0" />
        <span className={`${field.type === 'header' ? 'text-lg font-bold' : 'text-sm'}`}>
          {getFieldHeading()}
        </span>
      </div>
      {Array.from(visibleProperties).map((property) => (
        <div key={property} className="flex items-center space-x-2">
          <span className="w-1/4 text-xs font-medium">{property}:</span>
          <div className="w-3/4">{renderProperty(property)}</div>
        </div>
      ))}
    </div>
  );
};

export default FieldEditor;