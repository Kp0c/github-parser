<script lang="ts">
import { fly } from 'svelte/transition';

import type { Stats } from '../models/stats';

export let stats: Stats[] = [];
</script>

<table transition:fly="{{ y: 200, duration: 1000 }}" class="uk-table uk-table-divider uk-table-striped">
  <thead>
    <tr>
      <th>Username</th>
      <th>Comments</th>
      <th>Likes</th>
      <th>Dislikes</th>
    </tr>
  </thead>

  <tbody>
    {#each stats as stat}
      <tr>
        <td>{stat.user}</td>
        <td>{stat.comments}</td>
        <td>{stat.likes}</td>
        <td>{stat.dislikes}</td>
      </tr>
    {/each}
  </tbody>
</table>
