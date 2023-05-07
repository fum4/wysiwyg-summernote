<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import DOMPurify from 'isomorphic-dompurify';

  import {
    summernote,
    saveDraft,
    onEditorInit,
    clearEditor,
    getEditorContent,
    showEditorTooltip
  } from './editorUtils';
  import { initializeCef, sendContentToHost } from './cefUtils';

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

  let saveError = false;

  async function initializeApp(showTooltip = true) {
    try {
      await initializeCef();
    } catch(e) {
      console.info('Cef not initialized. Running in isolation from host');
      console.error(e);
    }

    summernote({
      height: 500,
      focus: true,
      dialogsFade: true,
      dialogsInBody: true,
      codemirror: {
        theme: 'monokai'
      },
      callbacks: {
        onInit: onEditorInit,
        onChange: () => saveError = false,
      }
    });

    showTooltip && showEditorTooltip();

    window.addEventListener('beforeunload', saveDraft);
  }

  // Reinitialize app in case of unexpected behaviour
  async function reinitializeApp() {
    clearEditor();

    await initializeApp(false);

    // The editor won't call `onInit` if already initialized
    onEditorInit();
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
        saveError = true;
      }
    }
  }

  onMount(initializeApp);
  onDestroy(() => window.removeEventListener('beforeunload', saveDraft));
</script>

<main>
  <img
    src="/logo.webp"
    alt="Rinkt logo"
    class="logo"
  />

  <form method="post" on:submit={exportAsHTML}>
    <textarea id="summernote" name="editordata"></textarea>
    <div class="bottom-section">
      <div class="error">
        {#if saveError}
          <p class="mb-0 px-2 rounded text-black bg-warning">There was a problem saving the document</p>
        {/if}
      </div>
      <div class="action-buttons">
        <button
          type="button"
          class="reset-button btn btn-outline-secondary"
          data-toggle="tooltip"
          data-offset="0,5px"
          data-placement="left"
          data-fallbackPlacement="top"
          title="If you encounter difficulties try resetting the editor"
          on:click={reinitializeApp}
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
    </div>
  </form>
</main>
