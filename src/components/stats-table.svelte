<script lang="ts">
import type { Stats } from '../models/stats';

export let stats: Stats[] = [];
</script>

<table class="uk-table uk-table-divider uk-table-striped">
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
