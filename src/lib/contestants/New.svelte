<script lang="ts">
    import {getContext} from 'svelte'
    import EditableList from '$lib/editable/EditableList.svelte'
    import Add from '$lib/svg/Add.svelte'
    import {createId, capitalizeWords} from '$lib/tournament'

    const popup = getContext<() => Popup>('popup')()

    const tournament = getContext<Tournament>('tournament')
    const contestants = tournament.contestants

    const addingContestant = tournament.settings.addingContestant

    let {addingType, teamName, personName, members} = addingContestant
    $: addingContestant.addingType = addingType
    $: addingContestant.teamName = teamName
    $: addingContestant.personName = personName

    const addContestant = () => {
        teamName = teamName.trim()
        personName = personName.trim()

        const id = createId(Object.keys(contestants))
        const contestant = createContestant(id)

        if (contestant.name === '')
            return popup('Name benötigt')
        if (Object.values(contestants).find(({name}) => name === contestant.name))
            return popup(`${contestant.name} existiert bereits`)
        if (contestant.type === 'team' && contestant.members.length < 2)
            return popup('Es müssen mindestens zwei Teammitglieder sein')

        contestants[id] = contestant

        teamName = ''
        personName = ''
        addingContestant.members.splice(0, addingContestant.members.length)
    }
    const createContestant = (id: string): Contestant => {
        if (addingType === 'team') {
            if (teamName !== '') teamName = capitalizeWords(teamName)
            return {
                id,
                type: 'team',
                name: teamName,
                members: [...members]
            }
        }
        if (personName !== '') personName = capitalizeWords(personName)
        return {
            id,
            type: 'person',
            name: personName
        }
    }
    const handleKeyDownPerson = ({key}: KeyboardEvent) => {
        if (key !== 'Enter') return
        addContestant()
    }
</script>

<h2>Teams oder einzelne Personen hinzufügen</h2>
<section class="buttons">
    <button class="btn" class:active={addingType === 'team'} on:click={() => addingType = 'team'}>Team</button>
    <button class="btn" class:active={addingType === 'person'} on:click={() => addingType = 'person'}>Person</button>
    <button class="svg btn" on:click={addContestant}><Add/></button>
</section>
<section class="name">
    {#if addingType === 'team'}
        <label for="team-name">Name</label>
        <input id="team-name" type="text" bind:value={teamName}>
    {:else}
        <label for="person-name">Name</label>
        <input id="person-name" type="text" on:keydown={handleKeyDownPerson} bind:value={personName}>
    {/if}
</section>
{#if addingType === 'team'}
    <div class="team-members">
        <EditableList list={members} heading="Team Mitglieder"/>
    </div>
{/if}


<style>
    .buttons {
        display: flex;
        align-items: center;
        margin-top: 1rem;
    }
    .buttons button {
        margin: 0 .5rem;
    }
    .name {
        margin-top: 1rem;
    }
    label {
        margin-right: 1rem;
    }
    .team-members {
        margin-top: 1rem;
        min-width: 35ch;
        font-size: 1.3rem;
    }
</style>