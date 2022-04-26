<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import {toStoreKey} from '$lib/tournament';

    export let tiebreaker: Tiebreaker
    export let contestants: Contestants
    export let heading = 'Tiebreaker'

    $: originalSelection = [...tiebreaker.selection]
    $: selection = originalSelection
    $: diff = tiebreaker.remaining - selection.length
    $: prompt = `Es ${diff === 1 ? 'muss' : 'müssen'} ${diff === 0 ? 'keine mehr' : `noch ${diff === 1 ? 'einer' : diff}`} ausgewählt werden.`


    const toggle = (id: string) => () => {
        const index = selection.findIndex(id_ => id === id_)
        if (index === -1)
            return selection = [...selection, id]
        selection = [...selection.slice(0, index), ...selection.slice(index + 1)]
    }

    const dispatch = createEventDispatcher()
    const submit = () => {
        dispatch('submit', selection)
    }
</script>

<section class="card">
    <h3>
        <span>{heading}</span>
        <button class="btn" disabled={diff !== 0 || (originalSelection.length !== 0 && originalSelection.every(mid => selection.includes(mid)))} on:click={submit}>
            {#if originalSelection.length === 0} Bestätigen {:else} Ändern {/if}
        </button>
    </h3>
    <div class="prompt">{prompt}</div>
    <div class="contestants">
        {#each tiebreaker.options as id}
            {@const {name} = contestants[id]}
            {@const active = selection.includes(id)}
            <button class="btn contestant" class:active disabled={diff === 0 && !active} title={name} on:click={toggle(id)}>{name}</button>
        {/each}
    </div>
</section>

<style>
    section {
        margin-bottom: 1rem;
        max-width: 50ch;
    }
    h3 {
        margin: 0;
        display: flex;
        align-items: center;
    }
    h3 span {
        font-size: 1.3rem;
        margin-right: auto;
    }
    .contestants {
        display: flex;
        gap: .3rem;
        flex-wrap: wrap;
    }
    .contestant {
        max-width: 20ch;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .prompt {
        margin-block: .5rem;
    }
</style>