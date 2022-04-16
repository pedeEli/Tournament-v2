<script lang="ts">
    import {onDestroy} from 'svelte'
    import {writable} from 'svelte/store'
    import {toStore} from '$lib/tournament'
    import {getMatchesOf, calcInfo} from '$lib/groups'

    export let groups: Groups
    export let contestants: Contestants
    export let matches: Matches
    export let id: string
    export let settings: Settings

    const group = groups[id]

    const infos = writable(group.members.map(id => {
        const mmatches = getMatchesOf(group, matches, id)
        return calcInfo(mmatches, id)
    }))
    const matchStores = group.matches.map(mid => toStore(matches[mid]))
    const updateInfo = (id: string) => {
        const mmatches = getMatchesOf(group, matches, id)
        const {wins, diff} = calcInfo(mmatches, id)
        infos.update($infos => {
            const info = $infos.find(info => info.id === id)
            info.wins = wins
            info.diff = diff
            return $infos
        })
    }
    const unsubs = matchStores.map(matchStore => matchStore.subscribe(match => {
        updateInfo(match.left)
        updateInfo(match.right)
    }))

    const sortInfos = (a: GroupMemberInfo, b: GroupMemberInfo) => {
        const d = b.wins - a.wins
        if (d !== 0)
            return d
        return b.diff - a.diff
    }

    onDestroy(() => {
        unsubs.forEach(unsub => unsub())
    })

    //TODO: handle overflowing of long names
</script>

<section on:click class="card">
    <div class="name">{group.name}</div>
    <table>
        <thead>
            <tr>
                <th class="left">Teilnehmer</th>
                <th class="right">Siege</th>
                <th class="right">Diff</th>
            </tr>
        </thead>
        <tbody>
            {#each $infos.sort(sortInfos) as {id, wins, diff}, index (id)}
                <tr class:winner={index < settings.winnerPerGroup}>
                    <td class="left">{contestants[id].name}</td>
                    <td class="right">{wins}</td>
                    <td class="right">{diff}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</section>

<style>
    .name {
        margin-bottom: .3rem;
        font-weight: bold;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    td, th {
        padding: .2rem .6rem;
    }
    th {
        font-weight: normal;
        font-style: italic;
    }
    .left {
        text-align: left;
    }
    .right {
        text-align: right;
    }
    .winner {
        color: hsl(var(--green-clr));
        background-color: hsl(var(--green-clr) / .1);
    }
</style>