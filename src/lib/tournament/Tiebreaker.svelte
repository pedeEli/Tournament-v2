<script lang="ts">
    import {toStoreKey} from '$lib/tournament';

    export let group: Group
    export let contestants: Contestants
    export let settings: Settings

    let winnersStore = toStoreKey(group, 'winners')
    $: originalSelection = Array.isArray($winnersStore) ? [] : [...$winnersStore.selection]
    $: stateStore = toStoreKey(group, 'state')
    const getInfo = (winners: GroupWinners, selection: string[]) => {
        if (Array.isArray(winners))
            return
        const remaining = settings.winnerPerGroup - winners.definite.length
        const diff = remaining - selection.length
        const prompt = `Es ${diff === 1 ? 'muss' : 'müssen'} ${diff === 0 ? 'keine mehr' : `noch ${diff === 1 ? 'einer' : diff}`} ausgewählt werden.`
        return {diff, prompt, ...winners}
    }

    $: selection = originalSelection
    $: info = getInfo($winnersStore, selection)

    const toggle = (id: string) => () => {
        if (Array.isArray($winnersStore))
            return
        const index = selection.findIndex(id_ => id === id_)
        if (index === -1)
            return selection = [...selection, id]
        selection = [...selection.slice(0, index), ...selection.slice(index + 1)]
    }

    const submit = () => {
        group.state = 'finished'
        if (Array.isArray(group.winners))
            return
        group.winners.selection = selection   
    }
</script>

{#if info}
    <section class="card">
        <h3>
            <span>Tiebreaker</span>
            <button class="btn" disabled={info.diff !== 0 || ($stateStore === 'finished' && originalSelection.every(mid => selection.includes(mid)))} on:click={submit}>
                {#if $stateStore === 'tie'} Bestätigen {:else} Ändern {/if}
            </button>
        </h3>
        <div class="prompt">{info.prompt}</div>
        <div class="contestants">
            {#each info.options as id}
                {@const {name} = contestants[id]}
                {@const active = selection.includes(id)}
                <button class="btn contestant" class:active disabled={info.diff === 0 && !active} title={name} on:click={toggle(id)}>{name}</button>
            {/each}
        </div>
    </section>
{/if}

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