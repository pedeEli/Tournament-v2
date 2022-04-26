<script lang="ts">
    import {onDestroy, getContext} from 'svelte'
    import {page} from '$app/stores'
    import Navbar from '$lib/Navbar.svelte'
    import {manageTimeAndState, managePhaseChange} from '$lib/matches'
    import {manageState} from '$lib/groups'
    import {toStoreKey} from '$lib/tournament'

    $: useGrid = $page.url.pathname.startsWith('/tournament')

    const {matches, groups, state, settings} = getContext<Tournament>('tournament')

    const cleanUp1 = manageTimeAndState(matches)
    const cleanUp2 = manageState(groups, matches, settings, state)

    let cleanUp3: () => void
    if (state.phase === 'configure') {
        const unsub1 = managePhaseChange(groups, matches, settings, state)
        const unsub2 = toStoreKey(state, 'phase').subscribe(phase => phase !== 'configure' && cleanUp3())
        cleanUp3 = () => {
            unsub1()
            unsub2()
        }
    }

    onDestroy(() => {
      cleanUp1()
      cleanUp2()
      cleanUp3 && cleanUp3()
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