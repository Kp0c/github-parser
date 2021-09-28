<script lang="ts">
import StatsTable from './components/stats-table.svelte';
import type { Stats } from './models/stats';

import { GitHubRepository } from './repositories/github.repository';

import { accessToken } from './stores/access-token.store';

let ghRequestLink = '';
let isLoading = false;
let loadingStep = '';
$: isParseButtonEnabled = ghRequestLink.length !== 0 && $accessToken.length !== 0;

let stats: Stats[] = [];

async function parseLink() {
  const repo = new GitHubRepository($accessToken);

  // TODO: add error handling
  isLoading = true;
  stats = await repo.fetchStats(ghRequestLink, updateProgress.bind(this));
  isLoading = false;
}

function updateProgress(progress: string): void {
  loadingStep = progress;
}
</script>

<div class="uk-container uk-padding">
  <h1 class="uk-heading-divider uk-text-center">GitHub Parser</h1>
  <div class="uk-card uk-card-body uk-card-default">
    <div class="uk-card-title">Enter your GitHub access token</div>
    <input class="uk-input" bind:value={$accessToken}> 
    <a href="https://github.com/settings/tokens" target="_blank">Navigate to Personal access tokens on GitHub</a>
  </div>

  <div class="uk-card uk-card-body uk-card-default uk-margin">
    <div class="uk-card-title">Enter GitHub Pull Request or Commit link</div>
    <input class="uk-input" bind:value={ghRequestLink}>
    <button class="uk-button uk-button-primary uk-margin-small uk-align-right" on:click="{parseLink}" disabled="{!isParseButtonEnabled}">Parse</button>
  </div>

  {#if isLoading}
    <div class="center" uk-spinner="ratio: 3"></div>
    <div class="center uk-text-default">{loadingStep}</div>
  {/if}

  {#if stats.length > 0}
    <StatsTable stats={stats}/>
  {/if}
</div>

<style>
  .center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
