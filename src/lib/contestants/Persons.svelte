<script lang="ts">
    import {getContext} from 'svelte'
    import Minus from '$lib/svg/Minus.svelte'
    import EditableText from '$lib/editable/EditableText.svelte'
    
    export let persons: string[]

    const {removeContestant, renameContestant, getContestantName} = getContext<ContestantsContext>('functions')
</script>
{#if persons.length}
    <section class="persons">
        <h2>Persons</h2>
        {#each persons as id (id)}
            <div class="person">
                <button on:click={removeContestant(id)} class="btn svg small-svg"><Minus/></button>
                <EditableText load={getContestantName(id)} save={renameContestant(id)} width="13ch"/>
            </div>
        {/each}
    </section>
{/if}


<style>
    .persons {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-width: 20ch;
    }
    .person {
        display: flex;
        align-items: center;
    }
    .person {
        margin-top: .7rem;
    }
    .person button {
        margin-right: .4rem;
    }
</style>