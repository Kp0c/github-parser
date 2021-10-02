<script lang="ts">
import { onDestroy } from 'svelte';

import UIkit from 'uikit';
import GhAccessToken from './components/gh-access-token.svelte';
import StatsTable from './components/stats-table.svelte';
import type { Stats } from './models/stats';

import { StatsService } from './services/stats.service';
import { FetchStatsStatus as FetchStatsProgressStatus } from './enums/fetch-stats-progress-status.enum';

import { accessToken } from './stores/access-token.store';
import { fetchStatsProgressStatus } from './stores/fetch-stats-progress-status.store';

let ghRequestLink = '';
let isLoading = false;
let loadingStep = '';
$: isParseButtonEnabled = ghRequestLink.length !== 0 && $accessToken.length !== 0;

let stats: Stats[] = [];

const statusUnsubscribe = fetchStatsProgressStatus.subscribe((status) => {
  switch (status.status) {
    case FetchStatsProgressStatus.Started:
      isLoading = true;
      break;
    case FetchStatsProgressStatus.Success:
      isLoading = false;

      if (typeof status?.payload === 'object') {
        stats = status.payload;
      }
      break;
    case FetchStatsProgressStatus.Error:
      let error = 'Error happened while fetching stats';
      if (typeof status?.payload === 'string') {
        error = status.payload;
      }

      showError(error);
      isLoading = false;
      break;
    case FetchStatsProgressStatus.LoadingComments:
      setProgress('Loading comments');
      break;
    case FetchStatsProgressStatus.BuildingResults:
      setProgress('Building result');
      break;
  }
});

onDestroy(statusUnsubscribe);

function getStats() {
  stats = [];

  const repo = StatsService.getInstance();
  repo.setAccessToken($accessToken);

  repo.fetchStatsAsync(ghRequestLink);
}

function showError(error: string): void {
  UIkit.notification({
      message: error,
      status: 'danger',
      timeout: 2000,
      pos: 'top-right'
    });
}

function setProgress(progress: string): void {
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
    <button class="uk-button uk-button-primary uk-margin-small uk-align-right" on:click="{getStats}" disabled="{!isParseButtonEnabled}">Parse</button>
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
