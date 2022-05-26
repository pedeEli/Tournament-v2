<script lang="ts">
    import {onDestroy, getContext} from 'svelte'
    import {page} from '$app/stores'
    import Navbar from '$lib/Navbar.svelte'
    import {manageTimeAndState, managePhaseChangeFromConfigure} from '$lib/matches'
    import {manageState} from '$lib/groups'
    import {toStoreKey} from '$lib/tournament'
    import {manageFinaleMatches, managePhaseChangeToFinale, propagateFinaleWinners} from '$lib/finale'

    $: useGrid = $page.url.pathname.startsWith('/tournament')

    const {matches, groups, state, settings, finales} = getContext<Tournament>('tournament')

    const cleanUp1 = manageTimeAndState(matches)

    let cleanUp2: () => void
    if (state.phase === 'configure') {
        const unsub1 = managePhaseChangeFromConfigure(groups, matches, settings, state)
        const unsub2 = toStoreKey(state, 'phase').subscribe(phase => phase !== 'configure' && cleanUp2())
        cleanUp2 = () => {
            unsub1()
            unsub2()
        }
    }

    let cleanUp3: () => void
    if (state.phase !== 'finale') {
        const unsub1 = manageState(groups, matches, settings, state)
        const unsub2 = manageFinaleMatches(matches, groups, finales, state, settings)
        const unsub3 = managePhaseChangeToFinale(matches, finales, state)
        const unsub4 = toStoreKey(state, 'phase').subscribe(phase => phase === 'finale' && cleanUp3())
        cleanUp3 = () => {
            unsub1()
            unsub2()
            unsub3()
            unsub4()
        }
    }

    const cleanUp4 = propagateFinaleWinners(matches, finales)

    onDestroy(() => {
        cleanUp1()
        cleanUp2 && cleanUp2()
        cleanUp3 && cleanUp3()
        cleanUp4()
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