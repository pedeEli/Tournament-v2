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

    $: show = $selectedMatch || running || pinned || paused || finished
</script>

{#if show}
    <div class="card">
        {#if $selectedMatch}
            <h2>Ausgewählt</h2>
            {#key $selectedMatch}
                <RunningMatch match={matches[$selectedMatch]} {settings} {contestants}/>
            {/key}
        {/if}
        {#if pinned}
            <h2>Angepinned</h2>
            {#each pinned as id (id)}
                <RunningMatch match={matches[id]} {settings} {contestants}/>
            {/each}
        {/if}
        {#if running}
            <h2>Running</h2>
            {#each running as id (id)}
                <RunningMatch match={matches[id]} {settings} {contestants}/>
            {/each}
        {/if}
        {#if paused}
            <h2>Pausiert</h2>
            {#each paused as id (id)}
                <RunningMatch match={matches[id]} {settings} {contestants}/>
            {/each}
        {/if}
        {#if finished}
            <h2>Beendet</h2>
            {#each finished as id (id)}
                <RunningMatch match={matches[id]} {settings} {contestants}/>
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
    }
</style>