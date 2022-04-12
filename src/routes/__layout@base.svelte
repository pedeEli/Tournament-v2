<script lang="ts">
  import Navbar from '$lib/Navbar.svelte'
</script>

<div class="wrapper">
  <Navbar/>
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
  }
</style>