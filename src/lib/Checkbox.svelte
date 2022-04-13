<script>
    import Check from "$lib/svg/Check.svelte";
    export let value = false
</script>

<button class="btn svg" on:click={() => value = !value}>
    {#if value}
        <Check/>
    {/if}
</button>