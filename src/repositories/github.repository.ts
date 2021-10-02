import { Octokit } from '@octokit/core';
import { Stats } from '../models/stats';
import type { Comment } from '../models/comment';
import { ParsedLink } from '../models/parsed-link';

export class GitHubRepository {
  private static instance: GitHubRepository = null;

  private octokit: Octokit = null;
  private currentAccessToken: string;

  private constructor() { }

  static getInstance(): GitHubRepository {
    if (this.instance === null) {
      this.instance = new GitHubRepository();
    }

    return this.instance;
  }

  setAccessToken(accessToken: string): void {
    if (this.octokit === null || this.currentAccessToken !== accessToken) {
      this.octokit = new Octokit({ auth: accessToken });
    }
  }

  async fetchStats(link: string, progressCallback: (progress: string) => void): Promise<Stats[]> {
    const parsedLink = ParsedLink.fromRawLink(link);

    progressCallback('Loading comments');
    const comments = parsedLink.type === 'commit' ? await this.getCommitComments(parsedLink) : await this.getPrComments(parsedLink);

    progressCallback('Building result');
    return Stats.fromComments(comments);
  }

  private async getPrComments(parsedLink: ParsedLink): Promise<Comment[]> {
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

  private async getCommitComments(parsedLink: ParsedLink): Promise<Comment[]> {
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
}


