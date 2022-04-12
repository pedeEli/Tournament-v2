<script lang="ts">
    import '../font.css'
    import '../app.css'
    import {setContext} from 'svelte'
    import {page} from '$app/stores'
    import {goto} from '$app/navigation'
    import {loadTournament, toStore} from '$lib/tournament'
    import PopupElement from '$lib/Popup.svelte'
  
    const tournament = loadTournament()
    goto(tournament.settings.state)
    setContext('tournament', tournament)
  
    $: tournament.settings.state = $page.url.pathname
  
    const tournamentStore = toStore(tournament)
    $: localStorage.setItem('tournament', JSON.stringify($tournamentStore))
  
    let popup: Popup
    setContext('popup', () => popup)
</script>
  
<PopupElement bind:popup/>
  
<slot/>