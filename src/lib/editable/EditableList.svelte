<script lang="ts">
    import Add from '$lib/svg/Add.svelte'
    import {clickOutside} from '$lib/actions'
    import EditableText from '$lib/editable/EditableText.svelte'
    import Minus from '$lib/svg/Minus.svelte'
    import {toStore, capitalizeWords} from '$lib/tournament'
    import {getContext, createEventDispatcher} from 'svelte';

    export let heading = 'Liste'
    export let loadHeading: () => string = () => ''
    export let saveHeading: (value: string) => void = () => {}
    export let deleteButton = false
    export let addButton = true
    export let disabled = false

    export let list: string[]
    export let mapper: ((item: string) => string) | false = false
    const listStore = toStore(list)

    let isAdding = false
    let itemToAdd = ''
    let inputElement: HTMLInputElement
    
    const dispatch = createEventDispatcher()

    const startAdding = () => {
        isAdding = true
        setTimeout(() => inputElement && inputElement.select())
    }

    const handleKeyDown = ({key}: KeyboardEvent) => {
        if (key === 'Enter') return addItem()
        if (key === 'Escape') return cancelAdding()
    }

    const addItem = () => {
        if (!itemToAdd) return
        itemToAdd = capitalizeWords(itemToAdd)
        if ($listStore.find(item => item === itemToAdd))
            return popup(`${itemToAdd} ist schon im Team`)
        list.push(itemToAdd)
        inputElement.select()
    }

    const cancelAdding = () => {
        isAdding = false
    }

    const removeItem = (index: number, item: string) => {
        return () => {
            dispatch('removeitem', {index, item})
            list.splice(index, 1)
        }
    }

    const renameItem = (index: number, item: string) => {
        return (value: string) => {
            if (!value) return removeItem(index, item)
            value = capitalizeWords(value)
            if (value === $listStore[index]) return
            if ($listStore.find(item => item === value))
                return popup(`${value} ist schon im Team`)
            list[index] = value
        }
    }

    const handleDelete = () => {
        dispatch('delete')
    }

    const popup = getContext<() => Popup>('popup')()
</script>

<section class="list card" on:mouseup>
    <header>
        <h3>
            {#if loadHeading() !== ''}
                <EditableText load={loadHeading} save={saveHeading} width="15ch"/>
            {:else}
                {heading}
            {/if}
        </h3>
        {#if addButton}
            <button {disabled} class="btn svg" on:click={startAdding}><Add/></button>
        {/if}
        {#if deleteButton}
            <button {disabled} class="delete btn svg" on:click={handleDelete}><Minus/></button>
        {/if}
    </header>
    {#if isAdding}
        <input use:clickOutside on:clickoutside={cancelAdding} bind:this={inputElement} type="text" on:keydown={handleKeyDown} bind:value={itemToAdd}>
    {/if}
    {#each $listStore as item, index (item)}
        <div class="item">
            <button class="btn svg remove" {disabled} on:click={removeItem(index, item)}><Minus/></button>
            {#if !mapper}
                <EditableText load={() => list[index]} save={renameItem(index, item)} width="15ch"/>
            {:else}
                {mapper(list[index])}
            {/if}
        </div>
    {/each}
</section>

<style>
    .list {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    header {
        display: flex;
        align-items: center;
    }
    h3 {
        margin: 0 .5em 0 0;
    }
    input {
        font-size: 1em;
        margin-bottom: .5em;
    }
    .item {
        font-size: 1em;
        display: flex;
        align-items: center;
        align-self: flex-start;
    }
    .item + .item {
        margin-top: .5em;
    }
    .remove {
        margin-right: .4em;
    }
    header {
        position: relative;
        padding-bottom: .5em;
        margin-bottom: .5em;
    }
    header::after {
        content: '';
        position: absolute;
        left: -1em;
        right: -1em;
        bottom: 0;
        height: .2em;
        background-color: hsl(var(--light-gray-clr));
        border-radius: 1000000vw;
    }
    .delete {
        margin-left: .5rem;
    }
</style>