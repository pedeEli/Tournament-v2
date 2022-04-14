<script lang="ts">
    import {page} from '$app/stores'
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
    <div class="card matches">
        <slot/>
    </div>
</div>

<style>
    .wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
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
    .matches {
        flex: 1;
    }
</style>