<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import DOMPurify from 'isomorphic-dompurify';

  const defaultContent = '<div style="text-align: left;"><br></div>';

  function showHelperTooltip() {
    window.$('.reset-button').tooltip('enable');

    if (!localStorage.getItem('hideTextEditorResetTooltip')) {
      setTimeout(() => {
        window.$('.reset-button').tooltip('show');

        setTimeout(() => {
          window.$('.reset-button').tooltip('hide');
          localStorage.setItem('hideTextEditorResetTooltip', 'true');
        }, 7000);
      }, 500); // Need to wait for layout shifts to stabilize
    }
  }

  function convertImageToBase64(img: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.crossOrigin = 'anonymous';
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    img.src = canvas.toDataURL('image/png');
  }

  function convertAllImagesToBase64() {
    const images = getEditorHTMLNode().querySelectorAll('img');

    images.forEach((img) => {
      if (img.src.startsWith('http') || img.src.startsWith('cid:')) {
        convertImageToBase64(img);
      }
    });
  }

  function saveDraft() {
    localStorage.setItem('textEditorDraft', getEditorContent());
  }

  function clearDraft() {
    localStorage.removeItem('textEditorDraft');
  }

  function getDraft() {
    return localStorage.getItem('textEditorDraft');
  }

  function getEditorContent() {
    return getEditorHTMLNode().innerHTML;
  }

  function getEditorHTMLNode(): HTMLDivElement {
    return document.querySelector('[contenteditable="true"]');
  }

  function clearEditor() {
    getEditorHTMLNode().innerHTML = defaultContent;
    getEditorHTMLNode().focus();
    clearDraft();
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
    convertAllImagesToBase64();

    const content = getEditorContent();

    if (content) {
      const sanitizedContent = DOMPurify.sanitize(content);

      // TODO
      console.log('Saving...', sanitizedContent);

      // clearEditor();
    }
  }

  onMount(() => {
    initializeEditor();
    showHelperTooltip();

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
    <div class="action-buttons">
      <button
        type="button"
        class="reset-button btn btn-outline-secondary"
        data-toggle="tooltip"
        data-offset="0,5px"
        data-placement="left"
        data-fallbackPlacement="top"
        title="If you encounter difficulties try resetting the editor"
        on:click={clearEditor}
      >
        Reset
      </button>
      <button
        type="submit"
        class="submit-button btn btn-primary"
      >
        OK
      </button>
    </div>
  </form>
</main>
