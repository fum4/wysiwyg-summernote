<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import DOMPurify from 'isomorphic-dompurify';

  import { initializeCef, getContentFromHost, sendContentToHost } from './cefUtils';

  const defaultContent = '<div style="text-align: left;"><br /></div>'; // TODO: check <br />

  function showHelperTooltip() {
    window.$('.reset-button').tooltip('enable');

    if (!localStorage.getItem('hideTextEditorResetTooltip')) {
      setTimeout(() => {
        window.$('.reset-button').tooltip('show');

        setTimeout(() => {
          window.$('.reset-button').tooltip('hide');
          localStorage.setItem('hideTextEditorResetTooltip', 'true');
        }, 7000);
      }, 500); // wait for layout shifts
    }
  }

  // function convertImageToBase64(img: HTMLImageElement) {
  //   const canvas = document.createElement('canvas');
  //   const ctx = canvas.getContext('2d');
  //
  //   img.crossOrigin = 'anonymous';
  //   canvas.width = img.width;
  //   canvas.height = img.height;
  //
  //   ctx.drawImage(img, 0, 0);
  //
  //   img.src = canvas.toDataURL('image/png');
  // }
  //
  // function convertImagesToBase64() {
  //   const images = getEditorHTMLNode().querySelectorAll('img');
  //
  //   images.forEach((img) => {
  //     if (img.src.startsWith('http') || img.src.startsWith('cid:')) {
  //       convertImageToBase64(img);
  //     }
  //   });
  // }

  function saveDraft() {
    try {
      localStorage.setItem('textEditorDraft', getEditorContent());
    } catch(e) {}
  }

  function clearDraft() {
    try {
      localStorage.removeItem('textEditorDraft');
    } catch(e) {}
  }

  function getDraft() {
    try {
      return localStorage.getItem('textEditorDraft');
    } catch(e) {
      return null;
    }
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

    return getDraft() || defaultContent;
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
        onInit: async() => {
          getEditorHTMLNode().innerHTML = '';

          const initialContent = await getInitialContent();

          window.$('#summernote').summernote('pasteHTML', initialContent);
        }
      }
    });
  }

  async function exportAsHTML(ev) {
    ev.preventDefault();
    // convertImagesToBase64();

    const content = getEditorContent();

    if (content) {
      const sanitizedContent = DOMPurify.sanitize(content);

      try {
        await sendContentToHost(sanitizedContent);
        clearEditor();
      } catch(e) {
        console.error('Failed to send content to host.', e);
      }
    }
  }

  onMount(async() => {
    try {
      await initializeCef();
    } catch(e) {
      console.info('Cef not initialized. Running in isolation from host');
      console.error(e);
    }

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
