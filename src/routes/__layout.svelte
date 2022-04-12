<script lang="ts">
  import '../app.css'
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
  }
</style>