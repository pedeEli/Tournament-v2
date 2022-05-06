<script lang="ts">
    import {toStore} from '$lib/tournament'
    import GroupMatchName from '$lib/tournament/GroupMatchName.svelte'
    
    export let match: Match
    export let contestants: Contestants
    export let height: string

    const leftName = contestants[match.left].name
    const rightName = contestants[match.right].name
    const matchStore = toStore(match)

</script>

<section class="match">
    <GroupMatchName {matchStore} name={leftName} side="left" won={(a, b) => a > b}/>
    <div class="line-wrapper" style="height: {height};">
        <div class="line"></div>
    </div>
    <GroupMatchName {matchStore} name={rightName} side="left" won={(a, b) => a < b}/>
</section>

<style>
    .match {
        display: inline-flex;
        flex-direction: column;
        padding: 1.5rem;
        max-width: 30ch;
    }
    .match:hover {
        --bg-clr: hsl(var(--light-gray-clr));
    }
    .line-wrapper {
        display: flex;
        padding: .5rem;
        justify-content: center;
    }
    .line {
        width: .5rem;
        border-radius: 100vh;
        background-color: hsl(var(--light-gray-clr));
    }
</style>