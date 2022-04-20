<script lang="ts">
    export let matchStore: Readable<Match>
    export let won: (a: number, b: number) => boolean
    export let name: string
    export let side: 'left' | 'right'

    $: ({state, leftScore, rightScore} = $matchStore)

    $: color = state !== 'closed'
        ? ''
        : leftScore === rightScore
        ? 'draw'
        : won(leftScore, rightScore)
        ? 'win'
        : 'loss'
</script>

<div class="card {color} {side}" title={name}>
    {#if state === 'closed' && side === 'right'}
        <div class="score">({rightScore})</div>
    {/if}
    <div class="name">{name}</div>
    {#if state === 'closed' && side === 'left'}
        <div class="score">({leftScore})</div>
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