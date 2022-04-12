<script lang="ts">
    import {onDestroy} from 'svelte'
    import Minus from '$lib/svg/Minus.svelte'
    import {fly} from 'svelte/transition'


    export const popup = (t: string, duration = 2200) => {
        text = t
        show = true
        clearTimeout(timeout)
        timeout = setTimeout(() => show = false, duration)
    }

    let timeout
    let show = false
    let text = ''

    let close = () => {
        show = false
        clearTimeout(timeout)
    }

    onDestroy(() => clearTimeout(timeout))
</script>

{#if show}
    <div transition:fly={{y: 50, duration: 200}} class="card">
        {text}
        <button on:click={close} class="svg"><Minus/></button>
    </div>
{/if}

<style>
    div {
        position: fixed;
        bottom: 2rem;
        font-size: 1.5rem;
        left: auto;
        right: auto;
        background-color: hsl(var(--clr-bg));
        display: flex;
        align-items: center;
    }
    button {
        font-size: 1.3rem;
        margin-left: 1rem;
    }
</style>