export interface Field {
  id: string;
  content?: string;
  type: string;
  label?: string;
  default?: string | boolean | number;
  options?: { value: string; label: string }[];
  info?: string;
  placeholder?: string;
  highlightingElem?: string;
  thumbnail?: string;
  banner?: string;
  subheadline?: string;
  popup_html?: string;
  tooltip_html?: string;
}

export interface FieldData {
  [key: string]: Field;
}