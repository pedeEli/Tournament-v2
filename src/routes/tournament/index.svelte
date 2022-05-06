<script lang="ts">
    import {getContext} from 'svelte'
    import {readable}  from 'svelte/store'
    import {toStore, toStoreKey} from '$lib/tournament'
    import GroupMatch from '$lib/tournament/GroupMatch.svelte'
    import GroupInfo from '$lib/tournament/GroupInfo.svelte'
    import Tiebreaker from '$lib/tournament/Tiebreaker.svelte'
    import LuckyLoser from '$lib/tournament/LuckyLoser.svelte'

    const tournament = getContext<Tournament>('tournament')
    const {groups, contestants, matches, settings, state} = tournament

    const groupsStore = toStore(groups)
    $: groupsList = Object.values($groupsStore)

    let selectedGroup: string | false = false
    $: tiebreakerStore = selectedGroup
        ? toStoreKey(groups[selectedGroup], 'winners') as Readable<globalThis.Tiebreaker>
        : readable<globalThis.Tiebreaker>()

    const handleSubmit = (event: CustomEvent<string[]>) => {
        const selection = event.detail
        const group = groups[selectedGroup as string]
        if (group.state === 'finished')
            group.state = 'tie'
        group.state = 'finished';
        (group.winners as globalThis.Tiebreaker).selection = selection
    }
</script>

<div class="wrapper">
    <section class="groups">
        {#each groupsList as {id} (id)}
            <GroupInfo on:click={() => selectedGroup = id} {id} {groups} {contestants} {matches} {state} {settings}/>
        {/each}
    </section>
    <section class="selected-group">
        {#if settings.luckyLoser}
            <LuckyLoser {state} {contestants} {groups}/>
        {/if}
        {#if selectedGroup}
            <h2>{$groupsStore[selectedGroup].name}</h2>
            {#if selectedGroup && !Array.isArray($tiebreakerStore)}
                <Tiebreaker on:submit={handleSubmit} tiebreaker={$tiebreakerStore} {contestants}/>
            {/if}
            <div class="matches">
                {#each $groupsStore[selectedGroup].matches as id (id)}
                    <GroupMatch {contestants} match={matches[id]}/>
                {/each}
            </div>
        {/if}
    </section>
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