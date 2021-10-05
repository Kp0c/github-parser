<script lang="ts">
import { accessToken } from '../stores/access-token.store';  
</script>

<div class="uk-card uk-card-body uk-card-default">
  <div class="uk-card-title">Enter your GitHub access token</div>
  <input class="uk-input" bind:value={$accessToken}> 
  <a class="uk-text-small" href="https://github.com/settings/tokens" target="_blank">Navigate to Personal access tokens on GitHub</a>
</div>