<script lang="ts">
    import {navigating} from '$app/stores'
    import {onMount} from 'svelte'
    import EditableText from '$lib/editable/EditableText.svelte'
    import Play from '$lib/svg/Play.svelte'
    import Pause from '$lib/svg/Pause.svelte'
    import Pin from '$lib/svg/Pin.svelte'
    import Close from '$lib/svg/Close.svelte'
    import {toStore} from '$lib/tournament'
    import {selectedMatch} from '$lib/matches'

    export let match: Match
    export let contestants: Contestants
    export let settings: Settings
    
    let hasHighlight = false
    let section: HTMLElement
    export const highlight = () => {
        hasHighlight = true
        section.scrollIntoView()
    }
    $: if (hasHighlight) {
        section.addEventListener('animationend', () => hasHighlight = false, {once: true})
    }
    onMount(() => {
        if ($navigating?.from)
            return
        highlight()
    })

    if (match.time === 0 && match.state === 'waiting') 
        match.time = settings.defaultTime
    
    const matchStore = toStore(match)
    const leftName = contestants[match.left].name
    const rightName = contestants[match.right].name

    $: ({state, time} = $matchStore)
    let leftScore = match.leftScore.toString()
    let rightScore = match.rightScore.toString()

    $: if (!editing) match.leftScore = parseInt(leftScore)
    $: if (!editing) match.rightScore = parseInt(rightScore)
    
    $: hours = Math.floor(time / 3600)
    $: minutes = Math.floor(time / 60) - hours * 60
    $: seconds = time - hours * 3600 - minutes * 60

    const saveHours = value => {
        const numeric = parseInt(value)
        const clamped = clamp(numeric, 0, 59)
        settings.defaultTime = match.time = clamped * 3600 + minutes * 60 + seconds
    }
    const saveMinutes = value => {
        const numeric = +value
        const clamped = clamp(numeric, 0, 59)
        settings.defaultTime = match.time = hours * 3600 + clamped * 60 + seconds
    }
    const saveSeconds = value => {
        const numeric = +value
        const clamped = clamp(numeric, 0, 59)
        settings.defaultTime = match.time = hours * 3600 + minutes * 60 + clamped
    }
    const clamp = (value, min, max) => {
        if (value < min) return min
        if (value > max) return max
        return value
    }
    const addZeros = number => {
        if (number >= 0 && number <= 9) return `0${number}`
        return '' + number
    }

    let editing = false
    let currentLeftScore: number
    let currentRightScore: number

    const startMatch = () => {
        match.state = 'running'
        $selectedMatch = ''
    }
    const pauseMatch = () => {
        match.state = 'paused'
    }
    const resumeMatch = () => {
        match.state = 'running'
    }
    const finishMatch = () => {
        match.state = 'finished'
    }
    const closeMatch = () => {
        if (!editing)
            return match.state = 'closed'
        editing = false
        if (currentLeftScore === match.leftScore && currentRightScore === match.rightScore)
            return
    }
    const pinMatch = () => {
        match.state = 'pinned'
        $selectedMatch = ''
    }
    const unpinMatch = () => {
        match.state = 'waiting'
    }
    const edit = () => {
        editing = true
    }
</script>

<section bind:this={section} class:hasHighlight class:timeout={state === 'finished' && time === 0} class="running-match">
    <div class="name" title={leftName}>{leftName}</div>
    <div class="timer">
        {#if state === 'waiting'}
            <EditableText load={() => addZeros(hours)} save={saveHours} width="2ch" /> :
            <EditableText load={() => addZeros(minutes)} save={saveMinutes} width="2ch" /> :
            <EditableText load={() => addZeros(seconds)} save={saveSeconds} width="2ch" />
        {:else}
            {addZeros(hours)} : {addZeros(minutes)} : {addZeros(seconds)}
        {/if}
    </div>
    <div class="name right" title={rightName}>{rightName}</div>
    {#if state === 'waiting' || state === 'pinned'}
        <span class="center running">
            {#if state === 'pinned'}
                <button on:click={unpinMatch} class="btn svg"><Close/></button>
            {:else}
                <button on:click={pinMatch} class="btn svg"><Pin/></button>
            {/if}
            <button on:click={startMatch} class="btn center">Start</button>
        </span>
    {:else if state === 'running' || state === 'paused'}
        <span class="center running">
            {#if state === 'running'}
                <button on:click={pauseMatch} class="btn svg"><Pause/></button>
            {:else}
                <button on:click={resumeMatch} class="btn svg"><Play/></button>
            {/if}
            <button on:click={finishMatch} class="btn">Beenden</button>
        </span>
    {:else if state === 'finished' || editing}
        <input bind:value={leftScore} type="text">
        <button class="btn center" on:click={closeMatch}>Speichern</button>
        <input bind:value={rightScore} class="right" type="text">
    {:else}
        <div>{leftScore}</div>
        <button class="btn center" on:click={edit}>Bearbeiten</button>
        <div class="right">{rightScore}</div>
    {/if}
</section>

<style>
    .running-match {
        display: grid;
        grid-template-columns: 8ch 8ch 8ch;
        align-items: center;
        font-size: 1.7rem;
        gap: .2rem;
    }
    button {
        font-size: 1.2rem;
    }
    .timer {
        font-size: 1.4rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .name {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .right {
        text-align: right;
    }
    input.right {
        justify-self: right;
    }
    .timeout {
        color: hsl(var(--red-clr));
    }
    .center {
        grid-column: 2 / 3;
        justify-self: center;
    }
    .svg {
        width: 1rem;
        height: 1rem;
        margin-right: .5rem;
    }
    .running {
        display: flex;
        align-items: center;
    }
    input {
        width: 3ch;
        font-size: 1.3rem;
    }
    .hasHighlight {
        animation-name: highlight;
        animation-duration: 1000ms;
        animation-timing-function: ease-in;
    }
    @keyframes highlight {
        0% {
            color: hsl(var(--yellow-clr));
        }
        100% {
            color: inherit;
        }
    }
</style>