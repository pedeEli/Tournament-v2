<script lang="ts">
    import {getContext} from 'svelte'
    import {goto} from '$app/navigation'

    const {settings, state} = getContext<Tournament>('tournament')
    
    if (settings.haveGroups && state.phase !== 'finale')
        goto('/tournament/groups')
    else
        goto('/tournament/finale')
</script>