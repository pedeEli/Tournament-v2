<script lang="ts">
    import New from '$lib/contestants/New.svelte'
    import {getContext} from 'svelte'
    import {toStore} from '$lib/tournament'

    const tournament = getContext<Tournament>('tournament')
    const tournamentStore = toStore(tournament)
</script>

<New/>
<pre>{JSON.stringify($tournamentStore, null, 3)}</pre>