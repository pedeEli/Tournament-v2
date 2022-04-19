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
</script>

<section on:click class="card">
    <div class="name">{group.name}</div>
    <div class="table">
        <span class="head left">Teilnehmer</span>
        <span class="head right">Siege</span>
        <span class="head right">Diff</span>
        {#each $infos.sort(sortInfos) as {id, wins, diff}, index (id)}
            {@const {name} = contestants[id]}
            <div class="row" class:winner={index < settings.winnerPerGroup}>
                <span class="left overflow" title={name}>{name}</span>
                <span class="right">{wins}</span>
                <span class="right">{diff}</span>
            </div>
        {/each}
    </div>
</section>

<style>
    section {
        cursor: pointer;
    }
    .overflow {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .name {
        margin-bottom: .3rem;
        font-weight: bold;
    }
    .table {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr auto auto;
    }
    span {
        padding: .2rem .6rem;
    }
    .head {
        font-weight: normal;
        font-style: italic;
    }
    .left {
        text-align: left;
    }
    .right {
        text-align: right;
    }
    .row {
        display: contents;
    }
    .winner > span {
        color: hsl(var(--green-clr));
        background-color: hsl(var(--green-clr) / .1);
    }
</style>