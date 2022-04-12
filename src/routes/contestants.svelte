<script lang="ts">
    import New from '$lib/contestants/New.svelte'
    import Persons from '$lib/contestants/Persons.svelte'
    import Teams from '$lib/contestants/Teams.svelte'
    import {getContext, setContext} from 'svelte'
    import {toStore, groupByType} from '$lib/tournament'

    const popup = getContext<() => Popup>('popup')()

    const tournament = getContext<Tournament>('tournament')
    const contestants = tournament.contestants
    const contestantsStore = toStore(contestants)

    
    const removeContestant = (id: string) => {
        return () => {
            delete contestants[id]
        }
    }
    const renameContestant = (id: string) => {
        return value => {
            if (value === contestants[id].name) return
            if (Object.values(contestants).find(({name}) => name === value))
                return popup(`${value} already exists`)
            contestants[id].name = value
        }
    }
    const getContestantName = (id: string) => {
        return () => contestants[id].name
    }
    setContext<ContestantsContext>('functions', {removeContestant, renameContestant, getContestantName})

    $: persons = Object.values($contestantsStore).filter(({type}) => type === 'person').map(({id}) => id)
    $: teams = Object.values($contestantsStore).filter(({type}) => type === 'team').map(({id}) => id)
</script>

<New/>
<div class="contestants">
    <Persons bind:persons/>
    <Teams bind:teams/>
</div>

<style>
    .contestants {
        display: flex;
        gap: 1rem;
    }
</style>