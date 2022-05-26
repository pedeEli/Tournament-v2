<script lang="ts">
    import {toStore} from '$lib/tournament'
    import {selectedMatch} from '$lib/matches'
    import GroupMatchName from '$lib/tournament/GroupMatchName.svelte'
    
    export let match: Match
    export let contestants: Contestants
    export let column: number
    export let row: number
    export let editable: boolean

    const matchStore = toStore(match)
    $: leftName = contestants[$matchStore.left]?.name ?? ''
    $: rightName = contestants[$matchStore.right]?.name ?? ''
    $: selectable = $matchStore.left && $matchStore.right

    const select = () => {
        if (!selectable || !editable)
            return
        $selectedMatch = match.id
    }

    const lineSpan = column === 1 ? 2 : Math.pow(2, column - 2) * 6 - 2
</script>

<section class="match" class:selectable={selectable && editable} on:click={select} style="--column: {column};">
    <div class="top" style="--row: {row};">
        <GroupMatchName {matchStore} name={leftName} side="left" won={(a, b) => a > b}/>
    </div>
    <div class="line-wrapper" style="--row: {row + 2}; --row-span: {lineSpan};">
        <div class="line"></div>
    </div>
    <div class="bottom" style="--row: {row + 2 + lineSpan};">
        <GroupMatchName {matchStore} name={rightName} side="right" orientation="left" won={(a, b) => a < b}/>
    </div>
</section>

<style>
    .match {
        display: contents;
    }
    .top, .bottom {
        grid-column: var(--column) / span 1;
        grid-row: var(--row) / span 2;
    }
    .match.selectable:hover {
        --bg-clr: hsl(var(--light-gray-clr));
    }
    .line-wrapper {
        display: flex;
        padding: .5rem;
        height: 100%;
        justify-content: center;
        grid-column: var(--column) / span 1;
        grid-row: var(--row) / span var(--row-span);
    }
    .line {
        width: .5rem;
        border-radius: 100vh;
        background-color: hsl(var(--light-gray-clr));
    }
</style>