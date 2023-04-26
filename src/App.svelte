<script lang="ts">
  window.$(document).ready(function() {
    window.$('#summernote').summernote({
      height: 500,
      focus: true,
      dialogsInBody: true,
      dialogsFade: true,
      codemirror: {
        theme: 'monokai'
      },
      callbacks: {
        onInit: () => {
          document.querySelector('[contenteditable="true"] > p').remove();

          const draft = localStorage.getItem('draft');
          const initialContent = '<p><br></p>';

          if (draft && draft !== initialContent) {
            window.$('#summernote').summernote('pasteHTML', draft);
          } else {
            window.$('#summernote').summernote('justifyLeft');
          }
        },
        onChange: (contents) => {
          if (contents) {
            localStorage.setItem('draft', contents);
          }
        }
      }
    }).data("summernote");
  });
</script>

<main>
  <img
    src="/logo.webp"
    alt="Rinkt logo"
    class="logo"
  />
  <form method="post">
    <textarea id="summernote" name="editordata"></textarea>
  </form>
</main>

<style>
</style>
