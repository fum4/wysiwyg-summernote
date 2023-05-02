<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import DOMPurify from 'isomorphic-dompurify';

  const defaultContent = '<div style="text-align: left;"><br></div>';

  function convertImageToBase64(img: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.crossOrigin = 'Anonymous';
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const dataURL = canvas.toDataURL('image/png');

    img.src = dataURL.replace(/^data:image\/?[A-z]*;base64,/);
  }

  function convertAllImagesToBase64() {
    const images = getEditorHTMLNode().querySelectorAll('img');

    images.forEach((img) => {
      if (img.src.startsWith('http')) {
        convertImageToBase64(img);
      }
    });
  }

  function saveDraft() {
    localStorage.setItem('draft', getEditorContent());
  }

  function clearDraft() {
    localStorage.removeItem('draft');
  }

  function getDraft() {
    return localStorage.getItem('draft');
  }

  function getEditorContent() {
    return getEditorHTMLNode().innerHTML;
  }

  function getEditorHTMLNode(): HTMLDivElement {
    return document.querySelector('[contenteditable="true"]');
  }

  function initializeEditor() {
    window.$('#summernote').summernote({
      height: 500,
      focus: true,
      dialogsFade: true,
      dialogsInBody: true,
      codemirror: {
        theme: 'monokai'
      },
      callbacks: {
        onInit: () => {
          getEditorHTMLNode().innerHTML = '';

          const draft = getDraft();

          window.$('#summernote').summernote(
            'pasteHTML',
            draft || defaultContent
          );
        }
      }
    });
  }

  function exportAsHTML(ev) {
    ev.preventDefault();
    // convertAllImagesToBase64();

    const content = getEditorContent();

    if (content) {
      const sanitizedContent = DOMPurify.sanitize(content);

      // TODO: Save export
      console.log('Saving...', sanitizedContent);

      getEditorHTMLNode().innerHTML = defaultContent;
      getEditorHTMLNode().focus();
      clearDraft();
    }
  }

  onMount(() => {
    initializeEditor();
    window.onbeforeunload = saveDraft;
  });

  onDestroy(() => {
    window.onbeforeunload = undefined;
  });
</script>

<main>
  <img
    src="/logo.webp"
    alt="Rinkt logo"
    class="logo"
  />

  <form method="post" on:submit={exportAsHTML}>
    <textarea id="summernote" name="editordata"></textarea>
    <button
      type="submit"
      class="btn btn-primary ml-1"
    >
      OK
    </button>
  </form>
</main>
