import { writable } from 'svelte/store';
import { FetchStatsStatus } from '../enums/fetch-stats-progress-status.enum';
import type { Stats } from '../models/stats';

export const fetchStatsProgressStatus = writable<{
  status: FetchStatsStatus
  payload?: (string | Stats[])
}>({ status: FetchStatsStatus.Ready });