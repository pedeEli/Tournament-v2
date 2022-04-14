<script lang="ts">
  import Navbar from '$lib/Navbar.svelte'
</script>

<div class="wrapper">
  <Navbar/>
  <div class="main-wrapper">
    <main>
      <slot/>
    </main>
  </div>
</div>

<style>
  .wrapper {
    height: 100%;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: var(--nav-height) 1fr;
  }
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1rem;
  }
  .main-wrapper {
    height: 100%;
    overflow: auto;
  }
</style>