<script lang="ts">
  import {onDestroy, getContext} from 'svelte'
  import {page} from '$app/stores'
  import Navbar from '$lib/Navbar.svelte'
  import {manageTimeAndState} from '$lib/matches'
  import {manageState} from '$lib/groups'

  $: useGrid = $page.url.pathname.startsWith('/tournament')

  const {matches, groups} = getContext<Tournament>('tournament')

  const cleanUp1 = manageTimeAndState(matches)
  const cleanUp2 = manageState(groups, matches)
  onDestroy(() => {
    cleanUp1()
    cleanUp2()
  })
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