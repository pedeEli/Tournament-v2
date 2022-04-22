<script lang="ts">
    import {getContext} from 'svelte'
    import {toStore} from '$lib/tournament'
    import GroupMatch from '$lib/tournament/GroupMatch.svelte'
    import GroupInfo from '$lib/tournament/GroupInfo.svelte'
    import Tiebreaker from '$lib/tournament/Tiebreaker.svelte'

    const tournament = getContext<Tournament>('tournament')
    const {groups, contestants, matches, settings} = tournament

    const groupsStore = toStore(groups)
    $: groupsList = Object.values($groupsStore)

    let selectedGroup: string | false = false
</script>

<div class="wrapper">
    <section class="groups">
        {#each groupsList as {id} (id)}
            <GroupInfo on:click={() => selectedGroup = id} {id} {groups} {contestants} {matches}/>
        {/each}
    </section>
    {#if selectedGroup}
        <section class="selected-group">
            <h2>{$groupsStore[selectedGroup].name}</h2>
            {#key selectedGroup}
            <Tiebreaker group={groups[selectedGroup]} {contestants} {settings}/>
            {/key}
            <div class="matches">
                {#each $groupsStore[selectedGroup].matches as id (id)}
                    <GroupMatch {contestants} match={matches[id]}/>
                {/each}
            </div>
        </section>
    {/if}
</div>

<style>
    .wrapper {
        display: grid;
        grid-template-columns: minmax(auto, 34ch) minmax(auto, 80ch);
        grid-template-rows: 100%;
        gap: 1rem;
    }
    .groups {
        padding-right: .5rem;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: .5rem;
    }
    .selected-group {
        overflow: auto;
        padding-right: .5rem;
    }
    .matches {
        display: grid;
        grid-template-columns: 1fr 6.5rem 1fr 2rem;
        grid-auto-rows: 4rem;
        align-items: center;
    }
</style>