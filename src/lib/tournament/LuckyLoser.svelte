<script lang="ts">
    import {toStore, toStoreKey} from '$lib/tournament'
    import Tiebreaker from '$lib/tournament/Tiebreaker.svelte'
    
    export let contestants: Contestants
    export let state: State
    export let groups: Groups

    const luckyLoserStore = toStoreKey(state, 'luckyLoser')
    const groupsStore = toStore(groups)

    const handleSubmit = (event: CustomEvent<string[]>) => {
        if (Array.isArray(state.luckyLoser))
            return
        const selection = event.detail
        state.luckyLoser.selection = selection
        state.phase = 'groupsFinished'
    }

    $: show = Object.values($groupsStore).reduce<boolean>((acc, group) => acc && group.state === 'finished', true)
</script>

{#if show && !Array.isArray($luckyLoserStore)}
    <Tiebreaker heading="LuckyLoser Tiebreaker" tiebreaker={$luckyLoserStore} {contestants} on:submit={handleSubmit}/>
{/if}