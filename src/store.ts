import { useState, useEffect } from 'react';
import { AppState, ElementItem, XaddTemplate } from './types';
import { db, auth } from './firebase';
import { collection, onSnapshot, query, setDoc, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError } from './firebase-errors';

const STORAGE_KEY = 'star-compare-local-v2';

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : { templates: [], elements: [], theme: 'system' };
    } catch {
      return { templates: [], elements: [], theme: 'system' };
    }
  });

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    const theme = state.theme || 'system';

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [state.theme]);

  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) {
        // Clear state on logout to prevent stale data
        setState({ templates: [], elements: [], theme: state.theme });
      }
      setLoading(false);
    });
    return () => unsubAuth();
  }, [state.theme]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const qTemplates = query(collection(db, 'users', user.uid, 'templates'));
    const unsubTemplates = onSnapshot(qTemplates, (snap) => {
      const templates = snap.docs.map(d => ({ id: d.id, ...d.data() } as XaddTemplate));
      setState(prev => ({ ...prev, templates }));
      setLoading(false);
    }, (err) => handleFirestoreError(err, 'list', `users/${user.uid}/templates`));

    const qElements = query(collection(db, 'users', user.uid, 'elements'));
    const unsubElements = onSnapshot(qElements, (snap) => {
      const elements = snap.docs.map(d => {
        const data = d.data();
        return { 
          ...data,
          id: d.id, 
          subcategory: data.subcategory || data.configuration || data.type || data.category_old, // fallback for legacy
          company: data.company || data.subcategory_old, 
          category: data.category || ''
        } as ElementItem;
      });
      setState(prev => ({ ...prev, elements }));
    }, (err) => handleFirestoreError(err, 'list', `users/${user.uid}/elements`));

    return () => {
      unsubTemplates();
      unsubElements();
    };
  }, [user]);

  const addTemplate = async (template: Omit<XaddTemplate, 'id'>) => {
    const id = crypto.randomUUID();
    const newTemplate = { id, ...template, userId: user?.uid, createdAt: new Date().toISOString() };
    
    setState(prev => ({ ...prev, templates: [...prev.templates, newTemplate] }));

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'templates', id);
      try {
        await setDoc(docRef, {
          name: template.name,
          criteria: template.criteria,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      } catch (e: any) {
        handleFirestoreError(e, 'create', docRef.path);
      }
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Omit<XaddTemplate, 'id' | 'userId' | 'createdAt'>>) => {
    setState(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.id === id ? { ...t, ...updates } : t)
    }));

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'templates', id);
      try {
        await updateDoc(docRef, updates);
      } catch (e: any) {
        handleFirestoreError(e, 'update', docRef.path);
      }
    }
  };

  const deleteTemplate = async (id: string) => {
    setState(prev => ({
      ...prev,
      templates: prev.templates.filter(t => t.id !== id),
      elements: prev.elements.map(el => el.templateId === id ? { ...el, templateId: null, ratings: {} } : el)
    }));

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'templates', id);
      try {
        await deleteDoc(docRef);
        state.elements.forEach(async (el) => {
          if (el.templateId === id) {
            const elRef = doc(db, 'users', user.uid, 'elements', el.id);
            await updateDoc(elRef, { templateId: '', ratings: {} });
          }
        });
      } catch (e: any) {
        handleFirestoreError(e, 'delete', docRef.path);
      }
    }
  };

  const addElement = async (name: string, subcategory?: string, company?: string, category?: string) => {
    const id = crypto.randomUUID();
    const newElement = { id, name, subcategory, company, category, templateId: null, templateName: null, ratings: {}, userId: user?.uid, createdAt: new Date().toISOString() };
    
    setState(prev => ({ ...prev, elements: [...prev.elements, newElement] }));

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'elements', id);
      try {
        await setDoc(docRef, {
          name,
          subcategory: subcategory || null,
          company: company || null,
          category: category || null,
          templateId: '',
          templateName: null,
          ratings: {},
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      } catch (e: any) {
        handleFirestoreError(e, 'create', docRef.path);
      }
    }
  };

  const renameElement = async (id: string, newName: string, newSubcategory?: string, newCompany?: string, newCategory?: string) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === id ? { ...el, name: newName, subcategory: newSubcategory, company: newCompany, category: newCategory } : el)
    }));

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'elements', id);
      try {
        await updateDoc(docRef, { 
          name: newName, 
          subcategory: newSubcategory || null, 
          company: newCompany || null,
          category: newCategory || null
        });
      } catch (e: any) {
        handleFirestoreError(e, 'update', docRef.path);
      }
    }
  };

  const deleteElement = async (id: string) => {
    setState(prev => ({ ...prev, elements: prev.elements.filter(el => el.id !== id) }));

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'elements', id);
      try {
        await deleteDoc(docRef);
      } catch (e: any) {
        handleFirestoreError(e, 'delete', docRef.path);
      }
    }
  };

  const updateElementTemplate = async (elementId: string, templateId: string) => {
    const templateName = state.templates.find(t => t.id === templateId)?.name || null;
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === elementId ? { ...el, templateId, templateName, ratings: {} } : el)
    }));

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'elements', elementId);
      try {
        await updateDoc(docRef, { templateId, templateName, ratings: {} });
      } catch (e: any) {
        handleFirestoreError(e, 'update', docRef.path);
      }
    }
  };

  const updateElementRatings = async (elementId: string, ratings: Record<string, number>) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === elementId ? { ...el, ratings } : el)
    }));

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'elements', elementId);
      try {
        await updateDoc(docRef, { ratings });
      } catch (e: any) {
        handleFirestoreError(e, 'update', docRef.path);
      }
    }
  };

  const bulkDelete = async (type: 'elements' | 'templates', ids: string[]) => {
    setState(prev => ({
      ...prev,
      [type]: prev[type].filter((item: any) => !ids.includes(item.id))
    }));

    if (user) {
      for (const id of ids) {
        const docRef = doc(db, 'users', user.uid, type, id);
        try { await deleteDoc(docRef); } catch (e) { console.error('Bulk delete error:', e); }
      }
    }
  };

  const deleteMetadata = async (field: 'subcategory' | 'company' | 'category', value: string) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(el => el[field] === value ? { ...el, [field]: '' } : el)
    }));

    if (user) {
      const affectedElements = state.elements.filter(el => el[field] === value);
      for (const el of affectedElements) {
        const docRef = doc(db, 'users', user.uid, 'elements', el.id);
        try {
          await updateDoc(docRef, { [field]: null });
        } catch (e) {
          console.error('Delete metadata error:', e);
        }
      }
    }
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setState(prev => ({ ...prev, theme }));
  };

  return {
    user,
    loading,
    state,
    setTheme,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addElement,
    renameElement,
    deleteElement,
    updateElementTemplate,
    updateElementRatings,
    bulkDelete,
    deleteMetadata
  };
}


