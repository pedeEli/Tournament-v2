<script lang="ts">
    import {selectedMatch} from '$lib/matches'

    export let match: Match
    export let contestants: Contestants

    $: leftName = contestants[match.left].name
    $: rightName = contestants[match.right].name

    const select = () => {
        if (match.state === 'waiting')
            return $selectedMatch = match.id
        $selectedMatch = ''
    }
</script>

<section on:click={select}>
    <div class="card">{leftName}</div>
    <div class="line-wrapper">
        <div class="line"></div>
    </div>
    <div class="card">{rightName}</div>
</section>

<style>
    section {
        display: contents;
        cursor: pointer;
    }
    section:hover .card {
        background-color: hsl(var(--light-gray-clr));
    }
    .card {
        text-align: center;
        min-width: 20ch;
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
