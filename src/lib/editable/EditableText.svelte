<script lang="ts">
    import {clickOutside, doubleClick} from '$lib/actions'

    export let save: (value: string) => void
    export let load: () => string
    export let width = 'auto'
    export let editing = false
    export let disabled = false

    let text = load()

    let inputElement: HTMLInputElement
    const handleDoubleClick = () => {
        if (disabled)
            return
        editing = true
    }

    const handleKeyDown = ({key}) => {
        if (key === 'Enter') return saveAndExitEditing()
        if (key !== 'Escape') return

        editing = false
        text = load()
    }

    const saveAndExitEditing = () => {
        editing = false
        save(text)
        setTimeout(() => text = load())
    }

    $: if (editing) {
        inputElement?.select()
    }
</script>

{#if editing}
    <input
            bind:value={text}
            bind:this={inputElement}
            use:clickOutside
            on:clickoutside={saveAndExitEditing}
            on:keydown={handleKeyDown}
            type="text"
            style="width: {width}"
            lang="de"
    />
{:else}
    <span use:doubleClick on:doubleclick={handleDoubleClick}>{text}</span>
{/if}

<style>
    span {
        cursor: pointer;
    }
</style>