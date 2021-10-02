import { Octokit } from '@octokit/core';
import { Stats } from '../models/stats';
import type { Comment } from '../models/comment';
import { ParsedLink } from '../models/parsed-link';
import { flatMap, groupBy, sumBy } from 'lodash';
import { FetchStatsStatus } from '../enums/fetch-stats-progress-status.enum';
import { fetchStatsProgressStatus } from '../stores/fetch-stats-progress-status.store';
import { get } from 'svelte/store';

export class StatsService {
  private static instance: StatsService = null;

  private octokit: Octokit = null;
  private currentAccessToken: string;

  private constructor() { }

  static getInstance(): StatsService {
    if (this.instance === null) {
      this.instance = new StatsService();
    }

    return this.instance;
  }

  setAccessToken(accessToken: string): void {
    if (this.octokit === null || this.currentAccessToken !== accessToken) {
      this.octokit = new Octokit({ auth: accessToken });
    }
  }

  async fetchStatsAsync(link: string): Promise<void> {
    if (get(fetchStatsProgressStatus).status !== FetchStatsStatus.Ready) {
      return;
    }

    try {
      fetchStatsProgressStatus.set({ status: FetchStatsStatus.Started });

      const parsedLink = ParsedLink.fromRawLink(link);

      fetchStatsProgressStatus.set({ status: FetchStatsStatus.LoadingComments });
      const comments = parsedLink.type === 'commit' ? await this.getCommitCommentsAsync(parsedLink) : await this.getPrCommentsAsync(parsedLink);
  
      fetchStatsProgressStatus.set({ status: FetchStatsStatus.BuildingResults });
      const result = this.getStatsFromComments(comments);

      fetchStatsProgressStatus.set({
        status: FetchStatsStatus.Success,
        payload: result
      })
    } catch (error) {
      fetchStatsProgressStatus.set({ 
        status: FetchStatsStatus.Error,
        payload: error,
      });
    } finally {
      fetchStatsProgressStatus.set({ status: FetchStatsStatus.Ready });
    }
  }

  private async getPrCommentsAsync(parsedLink: ParsedLink): Promise<Comment[]> {
    const response = await this.octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/comments', {
      owner: parsedLink.owner,
      repo: parsedLink.repo,
      pull_number: Number(parsedLink.id),
      mediaType: {
        previews: [
          'squirrel-girl'
        ]
      }
    });

    return response.data;
  }

  private async getCommitCommentsAsync(parsedLink: ParsedLink): Promise<Comment[]> {
    const response = await this.octokit.request('GET /repos/{owner}/{repo}/commits/{commit_sha}/comments', {
      owner: parsedLink.owner,
      repo: parsedLink.repo,
      commit_sha: parsedLink.id,
      mediaType: {
        previews: [
          'squirrel-girl'
        ]
      }
    });

    return response.data;
  }

  private getStatsFromComments(comments: Comment[]): Stats[] {
    const usersComments = groupBy(comments, (comment) => comment.user.login);

    return Object.keys(usersComments).map(user => {
      const data = usersComments[user];

      const reactions = flatMap(data, (user) => user.reactions);

      const likes = sumBy(reactions, (reaction) => reaction['+1']);
      const dislikes = sumBy(reactions, (reaction) => reaction['-1']);

      return new Stats({
        user,
        comments: data.length,
        likes,
        dislikes
      });
    });
  }
}


