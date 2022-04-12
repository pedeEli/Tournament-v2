<script lang="ts">
    import {getContext} from 'svelte'
    import {toStore} from '$lib/tournament'

    const tournament = getContext<Tournament>('tournament')
    const tournamentStore = toStore(tournament)
    

</script>

<h1>Tournament</h1>
<div class="buttons">
    <a class="btn" href="/contestants">Neu</a>
    <button class="btn">Laden</button>
</div>


<style>
    h1 {
        font-size: 5rem;
    }
    .btn {
        font-size: 3rem;
        width: 100%;
    }
    .btn + .btn {
        margin-top: 1rem;
    }
</style>