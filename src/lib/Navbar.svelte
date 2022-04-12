<nav>
    <ul>
        <li class="name">Bier Pong Tournier</li>
        <li class="underline"><a href="/contestants">Teams</a></li>
        <li class="underline"><a href="/groups">Gruppen</a></li>
        <li class="underline"><a href="/tournament">Tournier</a></li>
    </ul>
</nav>

<style>
    nav {
        display: flex;
        align-items: center;
        height: var(--nav-height);
        font-size: calc(var(--nav-height) * 0.3);
        background-color: hsl(var(--primary-clr));
    }
    ul {
        display: contents;
        list-style: none;
    }
    li {
        margin-inline: 1em;
    }
    .name {
        font-size: calc(var(--nav-height) * 0.5);
        margin-right: auto;
    }
</style>