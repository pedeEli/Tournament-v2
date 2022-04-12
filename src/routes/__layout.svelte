<script lang="ts">
  import '../app.css'
  import Navbar from '$lib/Navbar.svelte'
  import {page} from '$app/stores'

  $: isIndex = $page.url.pathname.match(/^\/(index)?$/i)
</script>

<div class="wrapper">
  {#if !isIndex}
    <Navbar/>
  {/if}
  <main>
    <slot/>
  </main>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>