<script lang="ts">
  import '../app.css'
  import {setContext} from 'svelte'
  import Navbar from '$lib/Navbar.svelte'
  import {page} from '$app/stores'
  import {loadTournament, toStore} from '$lib/tournament'

  const tournament = loadTournament()
  setContext('tournament', tournament)

  $: tournament.settings.state = $page.url.pathname
  $: isIndex = $page.url.pathname.match(/^\/(index)?$/i)

  const tournamentStore = toStore(tournament)
  $: localStorage.setItem('tournament', JSON.stringify($tournamentStore))
</script>

<div class="wrapper">
  {#if !isIndex}
    <Navbar/>
  {/if}
  <main>
    <slot/>
  </main>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>