export type XaddTemplate = {
  id: string;
  name: string;
  criteria: string[];
  userId?: string;
  createdAt?: string;
};

export type ElementItem = {
  id: string;
  name: string;
  type?: string;
  company?: string;
  category?: string;
  templateId: string | null;
  templateName?: string | null;
  ratings: Record<string, number>;
  userId?: string;
  createdAt?: string;
};

export type AppState = {
  templates: XaddTemplate[];
  elements: ElementItem[];
  theme?: 'light' | 'dark' | 'system';
};
