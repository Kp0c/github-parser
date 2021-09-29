<script lang="ts">
import UIkit from 'uikit';
import GhAccessToken from './components/gh-access-token.svelte';
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
  stats = [];

  const repo = new GitHubRepository($accessToken);

  isLoading = true;
  try {
    stats = await repo.fetchStats(ghRequestLink, updateProgress.bind(this));
  } catch (error) {
    UIkit.notification({
      message: error,
      status: 'danger',
      timeout: 2000,
      pos: 'top-right'
    });
  }
  isLoading = false;
}

function updateProgress(progress: string): void {
  loadingStep = progress;
}
</script>

<div class="uk-container uk-padding">
  <div class="uk-text-small uk-text-right">
    <span class="uk-text-meta">Created by</span>
    <a href="https://github.com/Kp0c" target="_blank">Kp0c</a>
  </div>

  <h1 class="uk-heading-divider uk-text-center uk-margin-remove-top">GitHub Parser</h1>

  <GhAccessToken/>

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
