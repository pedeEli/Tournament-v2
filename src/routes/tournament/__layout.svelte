<script lang="ts">
    import {page} from '$app/stores'
    import Matches from '$lib/tournament/Matches.svelte'

    const routes = [
        {href: '/tournament', name: 'Gruppen'},
        {href: '/tournament/finale', name: 'Finale'},
        {href: '/tournament/contestants', name: 'Teilnehmer'},
    ]
    $: route = $page.url.pathname
</script>

<h1>Tournier</h1>
<div class="wrapper">
    <div class="links">
        <ul>
            {#each routes as {href, name}}
                <li on:click={() => route = href} class="btn" class:active={route === href}><a {href}>{name}</a></li>
            {/each}
        </ul>
    </div>
    <div class="info">
        <div class="card content">
            <slot/>
        </div>
        <Matches/>
    </div>
</div>

<style>
    .wrapper {
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: 100%;
        grid-template-rows: 4rem calc(100% - 4rem);
        align-items: center;
    }
    ul {
        display: contents;
        list-style: none;
    }
    .links {
        display: flex;
        font-size: 1.2rem;
        gap: 1rem;
    }
    .info {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-rows: 100%;
        gap: 1rem;
        height: 100%;
        width: 100%;
    }
    .content {
        display: grid;
        grid-template-columns: 100%;
        grid-template-rows: 100%;
    }
</style>