<script lang="ts">
    import {selectedMatch} from '$lib/matches'
    import {toStore} from '$lib/tournament'
    import GroupMatchName from '$lib/tournament/GroupMatchName.svelte';

    export let match: Match
    export let contestants: Contestants

    const matchStore = toStore(match)
    const leftName = contestants[match.left].name
    const rightName = contestants[match.right].name

    const select = () => {
        if (match.state === 'waiting')
            return $selectedMatch = match.id
        $selectedMatch = ''
    }

    $: ({state, leftScore, rightScore} = $matchStore)
    $: diff = leftScore - rightScore
</script>

<section on:click={select}>
    <GroupMatchName side="left" name={leftName} won={(a, b) => a > b} {matchStore}/>
    <div class="line-wrapper">
        <div class="line"></div>
    </div>
    <GroupMatchName side="right" name={rightName} won={(a, b) => a < b} {matchStore}/>
</section>

<style>
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
