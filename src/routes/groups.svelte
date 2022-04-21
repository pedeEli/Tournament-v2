<script lang="ts">
    import {getContext} from 'svelte'
    import Checkbox from '$lib/Checkbox.svelte'
    import Settings from '$lib/groups/Settings.svelte'
    import Assignment from '$lib/groups/Assignment.svelte'
    import {toStore} from '$lib/tournament'
    import {reassignMatchesAfterRandomize} from '$lib/groups'

    const tournament = getContext<Tournament>('tournament')
    const {settings, groups, contestants, matches, state} = tournament
    const contestantsList = Object.values(contestants)
    const settingsStore = toStore(settings)
    const groupsStore = toStore(groups)

    
    const assignRandom = () => {
        const groupsIds = Object.keys(groups)
        if (!groupsIds.length) return
        groupsIds.forEach(id => groups[id].members.splice(0))

        let index = 0
        const unassigned = contestantsList.map(({id}) => id)
        for (let i = 0; i < contestantsList.length; i++) {
            const randomIndex = Math.floor(Math.random() * unassigned.length)
            const contestant = unassigned[randomIndex]
            const group = groups[groupsIds[index]]
            group.members.push(contestant)
            unassigned.splice(randomIndex, 1)
            index = (index + 1) % groupsIds.length
        }
        reassignMatchesAfterRandomize(Object.values(groups), matches)
    }
</script>

<h1>
    Gruppen configurieren
    <Checkbox disabled={state.phase === 'playing'} bind:value={settings.haveGroups}/>
</h1>
{#if $settingsStore.haveGroups}
    <div class="contestant-count">Es gibt insgesamt {contestantsList.length} Teilnehmer</div>
    <Settings on:assignrandom={assignRandom} {settings} {settingsStore} {groupsStore} {state}/>
    <Assignment {contestants} {contestantsList} {groups} {groupsStore} {matches} {state}/>
{/if}

<style>
    h1 {
        display: flex;
        gap: 1rem;
        align-items: center;
    }
</style>