<script lang="ts">
    import {getContext} from 'svelte'
    import {selectedMatch, groupByState} from '$lib/matches'
    import {toStore} from '$lib/tournament'
    import RunningMatch from '$lib/tournament/RunningMatch.svelte'

    const tournament = getContext<Tournament>('tournament')
    const {matches, settings, contestants} = tournament
    const matchesStore = toStore(matches)
    
    $: groupedMatches = groupByState($matchesStore)
    $: ({running, pinned, paused, finished} = groupedMatches)

    let runningMatches: RunningMatch[] = []
    let pinnedMatches: RunningMatch[] = []
    let pausedMatches: RunningMatch[] = []
    let finishedMatches: RunningMatch[] = []
    let selected: string
    const selectOrHighlight = (id: string) => {
        selected = ''
        const runningIndex = running?.findIndex(id_ => id === id_)
        if (runningIndex !== undefined && runningIndex !== -1)
            return runningMatches[runningIndex].highlight()
        const pinnedIndex = pinned?.findIndex(id_ => id === id_)
        if (pinnedIndex !== undefined && pinnedIndex !== -1)
            return pinnedMatches[pinnedIndex].highlight()
        const pausedIndex = paused?.findIndex(id_ => id === id_)
        if (pausedIndex !== undefined && pausedIndex !== -1)
            return pausedMatches[pausedIndex].highlight()
        const finishedIndex = finished?.findIndex(id_ => id === id_)
        if (finishedIndex !== undefined && finishedIndex !== -1)
            return finishedMatches[finishedIndex].highlight()
        selected = id
    }
    $: selectOrHighlight($selectedMatch)

    $: show = selected || running || pinned || paused || finished
</script>

{#if show}
    <div class="card">
        {#if selected}
            <h2>Ausgewählt</h2>
            {#key selected}
                <RunningMatch match={matches[selected]} {settings} {contestants}/>
            {/key}
        {/if}
        {#if pinned}
            <h2>Angepinned</h2>
            {#each pinned as id, index (id)}
                <RunningMatch bind:this={pinnedMatches[index]} match={matches[id]} {settings} {contestants}/>
            {/each}
        {/if}
        {#if running}
            <h2>Running</h2>
            {#each running as id, index (id)}
                <RunningMatch bind:this={runningMatches[index]} match={matches[id]} {settings} {contestants}/>
            {/each}
        {/if}
        {#if paused}
            <h2>Pausiert</h2>
            {#each paused as id, index (id)}
                <RunningMatch bind:this={pausedMatches[index]} match={matches[id]} {settings} {contestants}/>
            {/each}
        {/if}
        {#if finished}
            <h2>Beendet</h2>
            {#each finished as id, index (id)}
                <RunningMatch bind:this={finishedMatches[index]} match={matches[id]} {settings} {contestants}/>
            {/each}
        {/if}
    </div>
{/if}

<style>
    h2 {
        font-style: italic;
    }
    div {
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: .7rem;
        scroll-behavior: smooth;
        scroll-padding: 10rem;
    }
</style>