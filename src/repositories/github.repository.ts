import { Octokit } from '@octokit/core';
import { flatMap, groupBy, sumBy } from 'lodash';
import type { Stats } from '../models/stats';
import type { Comment } from '../models/comment';
import type { ParsedLink } from '../models/parsed-link';
import type { RawStats } from '../models/raw-stats';

export class GitHubRepository {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  async fetchStats(link: string, progressCallback: (progress: string) => void): Promise<Stats[]> {
    const parsedLink = this.parseLink(link);

    progressCallback('Loading comments');
    const comments = parsedLink.type === 'commit' ? await this.getCommitComments(parsedLink) : await this.getPrComments(parsedLink);

    const rawStats = this.buildRawStats(comments);

    progressCallback('Building result');
    return this.buildStats(rawStats);
  }

  private parseLink(link: string): ParsedLink {
    const linkSplitted = link.split('/');

    const gitHubIdx = linkSplitted.findIndex((part) => part.includes('github'));

    const isCommit = link.includes('commit');

    return {
      owner: linkSplitted[gitHubIdx + 1],
      repo: linkSplitted[gitHubIdx + 2],
      id: linkSplitted[gitHubIdx + 4],
      type : isCommit ? 'commit' : 'pullRequest'
    };
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

    const comments = response.data;

    return comments.filter(comment => comment.commit_id === parsedLink.id);
  }

  private buildStats(rawStats: RawStats[]): Stats[] {
    const usersComments = groupBy(rawStats, 'username');

    return Object.keys(usersComments).map(user => {
      const data = usersComments[user];

      const likes = sumBy(data, 'likes');
      const dislikes = sumBy(data, 'dislikes');

      return {
        user,
        comments: data.length,
        likes,
        dislikes
      };
    });
  }

  private buildRawStats(comments: Comment[]): RawStats[] {
    return comments.map((comment) => ({
      username: comment.user.login,
      likes: comment.reactions?.['+1'] ?? 0,
      dislikes: comment.reactions?.['-1'] ?? 0
    }));
  }
}


