<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import Checkbox from '$lib/Checkbox.svelte'
    export let settings: Settings
    export let settingsStore: Readable<Settings>
    export let groupsStore: Readable<Groups>

    $: luckyLoserPossible = Math.log2($settingsStore.winnerPerGroup * Object.keys($groupsStore).length) % 1 !== 0

    const dispatch = createEventDispatcher()
    const assignRandom = () => {
        dispatch('assignrandom')
    }
</script>

<section class="inputs">
    <label for="winner-per-group">Gewinner pro Gruppe</label>
    <input id="winner-per-group" type="text" bind:value={settings.winnerPerGroup}>
    {#if luckyLoserPossible}
        <div class="label">Lucky Loser</div>
        <Checkbox bind:value={settings.luckyLoser}/>
    {/if}
    <button class="btn randomize" on:click={assignRandom}>Zufällig verteilen</button>
</section>

<style>
    .inputs {
        display: grid;
        grid-template-columns: auto auto;
        grid-template-rows: 2.5rem 2.5rem 2.5rem;
        grid-column-gap: 1rem;
        align-items: center;
        margin-top: 1rem;
    }
    .inputs label, .inputs div {
        justify-self: right;
    }
    .randomize {
        grid-column: 1 / 3;
        justify-self: center;
    }
</style>