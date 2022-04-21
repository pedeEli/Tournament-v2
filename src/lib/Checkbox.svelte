<script>
    import Check from "$lib/svg/Check.svelte";
    export let value = false
    export let disabled = false
</script>

<button class="btn svg" {disabled} on:click={() => value = !value}>
    {#if value}
        <Check/>
    {/if}
</button>