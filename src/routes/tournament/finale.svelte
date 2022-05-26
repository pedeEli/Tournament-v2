<script lang="ts">
    import {getContext} from 'svelte'
    import {toStoreKey} from '$lib/tournament'
    import {generateColumns} from '$lib/finale'
    import FinaleMatch from '$lib/tournament/FinaleMatch.svelte'

    const {state, contestants, matches, finales} = getContext<Tournament>('tournament')

    const phaseStore = toStoreKey(state, 'phase')
    $: wrongPhase = $phaseStore === 'groups' || $phaseStore === 'configure'

    const columns = generateColumns(Object.values(finales))
</script>


{#if wrongPhase}
    <div class="wrong-phase">
        Gruppen Phase muss zuerst beendet werden
    </div>
{:else}
    <div class="finales" style="--columns: {columns.length}; --rows: {columns[0].length};">
        {#each columns as column, columnIndex}
            {#each column as finale, rowIndex}
                {@const rowAdd = columnIndex === 0 ? 1 : 3 * Math.pow(2, columnIndex - 1)}
                <FinaleMatch
                    match={matches[finale.match]}
                    {contestants}
                    column={columnIndex + 1}
                    row={rowIndex * 6 * Math.pow(2, columnIndex) + rowAdd}
                    editable={finale.parent == null || matches[finale.parent]?.state === 'waiting'}
                />
            {/each}
        {/each}
    </div>
{/if}

<style>
    .wrong-phase {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
    }
    .finales {
        display: grid;
        grid-template-columns: repeat(var(--columns), 30ch);
        grid-template-rows: repeat(var(--rows), 2.5rem 2.5rem 2.5rem 2.5rem 2.5rem 2.5rem);
        column-gap: 2rem;
        overflow: auto;
        align-items: center;
    }
</style>