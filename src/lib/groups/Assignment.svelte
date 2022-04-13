<script lang="ts">
    import Add from '$lib/svg/Add.svelte'
    import EditableList from '$lib/editable/EditableList.svelte'
    import {createId} from '$lib/tournament'
    import {getAssignedContestants} from '$lib/tournament'

    export let contestants: Contestants
    export let contestantsList: Contestant[]
    export let groups: Groups
    export let groupsStore: Readable<Groups>

    $: assignedContestants = getAssignedContestants(Object.values($groupsStore))

    const addGroup = () => {
        const ids = Object.keys($groupsStore)
        const id = createId(ids)
        groups[id] = {
            id,
            name: `Group ${ids.length + 1}`,
            matches: [],
            members: []
        }
    }
    const removeGroup = (id: string) => () => {
        delete groups[id]
        renameAllGroups()
    }
    const renameAllGroups = () => {
        Object.values(groups).forEach((group, index) => group.name = `Group ${index + 1}`)
    }

    let grabbedContestant: string | false = false
    let top: number
    let left: number

    const startDrag = (id: string) => ({clientX, clientY}: MouseEvent) => {
        grabbedContestant = id
        left = clientX
        top = clientY
    }
    const handleMouseMove = ({clientX, clientY}: MouseEvent) => {
        if (!grabbedContestant) return
        left = clientX
        top = clientY
    }
    const handleDrop = (id: string) => () => {
        if (!grabbedContestant) return
        groups[id].members.push(grabbedContestant)
        grabbedContestant = false
    }
</script>

<svelte:body on:click={() => grabbedContestant = false} on:mousemove={handleMouseMove}/>

<section class="selection">
    <div class="contestants card">
        <h2>Contestants</h2>
        {#each contestantsList.filter(({id}) => !assignedContestants.find(contestant => contestant === id)) as {id, name} (id)}
            <div on:mousedown={startDrag(id)} class="contestant card">{name}</div>
        {/each}
    </div>
    <div class="groups card">
        <header>
            <h2>Gruppen</h2>
            <button on:click={addGroup} class="btn svg"><Add/></button>
        </header>
        <div class="groups-wrapper">
            {#each Object.values($groupsStore) as {id, name} (id)}
                <EditableList
                    on:mouseup={handleDrop(id)}
                    on:delete={removeGroup(id)}
                    heading={name}
                    list={groups[id].members}
                    mapper={(mid) => contestants[mid].name}
                    addButton={false}
                    deleteButton
                />
            {/each}
        </div>
    </div>
</section>

{#if grabbedContestant}
    <div class="card grabbed" style="top: {top}px; left: {left}px;">
        {contestants[grabbedContestant].name}
    </div>
{/if}


<style>
    header {
        display: flex;
        justify-content: center;
    }
    .selection {
        display: flex;
        margin-top: 1.5rem;
        align-items: flex-start;
    }
    .contestants {
        margin-right: 1rem;
    }
    .contestant {
        margin-top: .3rem;
        user-select: none;
        cursor: pointer;
    }
    header {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    header button {
        margin-left: 1rem;
    }
    .groups {
        min-width: 20ch;
    }
    .contestant {
        display: flex;
        align-items: center;
    }
    .grabbed {
        position: fixed;
        background-color: hsl(var(--gray-clr));
    }
    .groups-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        max-width: 100ch;
        gap: .5rem;
    }
</style>