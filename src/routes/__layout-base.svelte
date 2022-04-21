<script lang="ts">
    import '../font.css'
    import '../app.css'
    import {setContext, onMount} from 'svelte'
    import {page} from '$app/stores'
    import {goto} from '$app/navigation'
    import {loadTournament, toStore} from '$lib/tournament'
    import PopupElement from '$lib/Popup.svelte'
  
    const tournament = loadTournament()
    goto(tournament.state.page)
    setContext('tournament', tournament)
  
    $: tournament.state.page = $page.url.pathname
  
    const tournamentStore = toStore(tournament)
    $: localStorage.setItem('tournament', JSON.stringify($tournamentStore))
  
    let popup: Popup
    setContext('popup', () => popup)

    let render = false
    onMount(() => render = true)
</script>
  
<PopupElement bind:popup/>

{#if render}
    <slot/>
{/if}