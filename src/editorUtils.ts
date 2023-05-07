import { getContentFromHost } from './cefUtils';

const defaultEditorContent = '<div style="text-align: left;"><br /></div>';

export function summernote(...args) {
  // @ts-ignore
  return window.$('#summernote').summernote(...args);
}

async function getInitialContent() {
  try {
    const hostContent = await getContentFromHost();

    if (hostContent) {
      return hostContent;
    }
  } catch(e) {
    console.error('Failed to retrieve content from host', e);
  }

  return getDraft() || defaultEditorContent;
}

function getDraft() {
  try {
    return localStorage.getItem('textEditorDraft');
  } catch(e) {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem('textEditorDraft');
  } catch(e) {}
}

export function saveDraft() {
  try {
    localStorage.setItem('textEditorDraft', getEditorContent());
  } catch(e) {}
}

function getEditorHTMLNode(): HTMLDivElement {
  return document.querySelector('[contenteditable="true"]');
}

export function getEditorContent() {
  return getEditorHTMLNode().innerHTML;
}

export async function onEditorInit() {
  getEditorHTMLNode().innerHTML = '';

  const initialContent = await getInitialContent();

  summernote('pasteHTML', initialContent);
}

export function clearEditor() {
  getEditorHTMLNode().innerHTML = defaultEditorContent;
  getEditorHTMLNode().focus();

  clearDraft();
}

export function showEditorTooltip() {
  try {
    // @ts-ignore
    const resetButton = window.$('.reset-button');
    const tooltipAlreadyDisplayed = localStorage.getItem('hideTextEditorResetTooltip');

    resetButton.tooltip('enable');

    if (!tooltipAlreadyDisplayed) {
      setTimeout(() => {
        resetButton.tooltip('show');

        setTimeout(() => {
          resetButton.tooltip('hide');
          localStorage.setItem('hideTextEditorResetTooltip', 'true');
        }, 7000);
      }, 500); // wait for layout shifts
    }
  } catch(e) {}
}
