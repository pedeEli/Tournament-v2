<script lang="ts">
  import {page} from '$app/stores'
  import Navbar from '$lib/Navbar.svelte'
  
  $: useGrid = $page.url.pathname.startsWith('/tournament')
</script>

<div class="wrapper">
  <Navbar/>
  <main class:use-grid={useGrid}>
    <slot/>
  </main>
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: var(--nav-height) calc(100vh - var(--nav-height));
  }
  main {
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
  }
  .use-grid {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 5rem calc(100% - 5rem);
  }
</style>