<script lang="ts">
    import {selectedMatch} from '$lib/matches'
    import {toStore} from '$lib/tournament'
    import GroupMatchName from '$lib/tournament/GroupMatchName.svelte'

    import Play from '$lib/svg/Play.svelte'
    import Pause from '$lib/svg/Pause.svelte'
    import Pin from '$lib/svg/Pin.svelte'
    import Check from '$lib/svg/Check.svelte'

    export let match: Match
    export let contestants: Contestants

    const matchStore = toStore(match)
    const leftName = contestants[match.left].name
    const rightName = contestants[match.right].name

    $: state = $matchStore.state

    const select = () => $selectedMatch = match.id

    const stateIcons = {
        running: Play,
        paused: Pause,
        pinned: Pin,
        finished: Check
    }
</script>

<section on:click={select}>
    <GroupMatchName side="left" name={leftName} won={(a, b) => a > b} {matchStore}/>
    <div class="line-wrapper">
        <div class="line"></div>
    </div>
    <GroupMatchName side="right" name={rightName} won={(a, b) => a < b} {matchStore}/>
    {#if state in stateIcons}
        <div class="svg small-svg">
            <svelte:component this={stateIcons[state]}/>
        </div>
    {:else}
        <div></div>
    {/if}
</section>

<style>
    .svg {
        align-self: center;
        justify-self: center;
    }
    section {
        display: contents;
        cursor: pointer;
    }
    section:hover {
        --bg-clr: hsl(var(--light-gray-clr));
    }
    .line-wrapper {
        height: 100%;
        display: flex;
        align-items: center;
        padding: 0 .5rem;
    }
    .line {
        background-color: hsl(var(--light-gray-clr));
        height: .5rem;
        width: 100%;
        border-radius: 100vh;
    }
</style>
