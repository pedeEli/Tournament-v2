<script lang="ts">
    import {getContext} from 'svelte'
    import EditableList from '$lib/editable/EditableList.svelte'

    export let teams: string[]

    const {getContestantName, removeContestant, renameContestant} = getContext<ContestantsContext>('functions')
    const contestants = getContext<Tournament>('tournament').contestants

    const loadMembers = (id: string) => {
        const team = contestants[id] as Team
        return team.members
    }
</script>
{#if teams.length}
    <section class="teams">
        <h2>Teams</h2>
        <div class="teams-wrapper">
            {#each teams as id (id)}
                <EditableList
                    deleteButton
                    on:delete={removeContestant(id)}
                    loadHeading={getContestantName(id)}
                    saveHeading={renameContestant(id)}
                    list={loadMembers(id)}
                />
            {/each}
        </div>
    </section>
{/if}

<style>
    .teams {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
    .teams-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: .5rem;
    }
</style>