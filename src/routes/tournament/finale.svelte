<script lang="ts">
    import {getContext} from 'svelte'
    import {toStoreKey} from '$lib/tournament'
    import FinaleMatch from '$lib/tournament/FinaleMatch.svelte'

    const {state, contestants, matches} = getContext<Tournament>('tournament')
    
    const match = matches[Object.keys(matches)[0]]

    const phaseStore = toStoreKey(state, 'phase')
    $: wrongPhase = $phaseStore === 'groups' || $phaseStore === 'configure'
</script>


{#if wrongPhase}
    <div class="wrong-phase">
        Gruppen Phase muss zuerst beendet werden
    </div>
{:else}
    <div class="temp">
        <FinaleMatch {match} {contestants} height="5rem"/>
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
    .temp {
        display: flex;
        flex-direction: column;
    }
</style>