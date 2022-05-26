<script lang="ts">
    export let matchStore: Readable<Match>
    export let won: (a: number, b: number) => boolean
    export let name: string
    export let side: 'left' | 'right'
    export let orientation = side

    $: ({state, leftScore, rightScore} = $matchStore)

    $: color = state !== 'closed'
        ? ''
        : leftScore === rightScore
        ? 'draw'
        : won(leftScore, rightScore)
        ? 'win'
        : 'loss'
</script>

<div class="card {color} {orientation}" title={name}>
    {#if state === 'closed' && orientation === 'right'}
        <div class="score">({$matchStore[`${side}Score`]})</div>
    {/if}
    <div class="name">
        {#if name} {name} {:else} &nbsp; {/if}
    </div>
    {#if state === 'closed' && orientation === 'left'}
        <div class="score">({$matchStore[`${side}Score`]})</div>
    {/if}
</div>

<style>
    .card {
        overflow: hidden;
        display: flex;
        gap: 1rem;
        background-color: var(--bg-clr);
        border-color: var(--color);
    }
    .score {
        color: var(--color);
    }
    .name {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .left .name {
        text-align: left;
        margin-right: auto;
    }
    .right .name {
        text-align: right;
        margin-left: auto;
    }

    .win {
        --color: hsl(var(--green-clr));
    }
    .loss {
        --color: hsl(var(--red-clr));
    }
    .draw {
        --color: hsl(var(--yellow-clr));
    }
</style>