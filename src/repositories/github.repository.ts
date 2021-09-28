import { Octokit } from '@octokit/core';
import { flatMap, groupBy } from 'lodash';
import type { RawCommentsStats } from '../models/raw-comments-stats';
import type { Stats } from '../models/stats';
import type { Comment } from '../models/comment';
import type { LinkType } from '../models/link-type';

export class GitHubRepository {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  async fetchStats(link: string, progressCallback: (progress: string) => void): Promise<Stats[]> {
    const { owner, repo, id, type } = this.parseLink(link);

    progressCallback('Loading comments');
    const comments = type === 'commit' ? await this.getCommitComments(owner, repo, id) : await this.getPrComments(owner, repo, id);

    const rawStats: RawCommentsStats[] = [];
    for (let commentIdx = 0; commentIdx < comments.length; commentIdx++) {
      const comment = comments[commentIdx];

      progressCallback(`Loading reactions: ${commentIdx + 1}/${comments.length}`);
      const reactions = await this.getReactions(owner, repo, comment.id, type);

      rawStats.push({
        user: comment.user.login,
        reactions
      });
    }

    progressCallback('Building result');
    return this.buildStats(rawStats);
  }

  private parseLink(link: string): {
    owner: string,
    repo: string,
    id: string,
    type: LinkType
  } {
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

  private async getPrComments(owner: string, repo: string, prId: string): Promise<Comment[]> {
    const response = await this.octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/comments', {
      owner,
      repo,
      pull_number: Number(prId)
    });

    return response.data;
  }

  private async getCommitComments(owner: string, repo: string, commitId: string): Promise<Comment[]> {
    const response = await this.octokit.request('GET /repos/{owner}/{repo}/comments', {
      owner,
      repo,
    });

    const comments = response.data;

    return comments.filter(comment => comment.commit_id === commitId);
  }

  private async getReactions(owner: string, repo: string, commentId: number, type: LinkType): Promise<string[]> {
    const url = type === 'commit' ? '/repos/{owner}/{repo}/comments/{comment_id}/reactions' : '/repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions';
    const response = await this.octokit.request(`GET ${url}`, {
      owner,
      repo,
      comment_id: commentId,
      mediaType: {
        previews: [
          'squirrel-girl'
        ]
      }
    });

    return response.data.map((reaction) => reaction.content);
  }

  private buildStats(rawStats: RawCommentsStats[]): Stats[] {
    const usersComments = groupBy(rawStats, 'user');

    return Object.keys(usersComments).map(user => {
      const data = usersComments[user];

      const allReactions = flatMap(data, 'reactions');

      const likes = allReactions.filter(reaction => reaction === '+1').length;
      const dislikes = allReactions.filter(reaction => reaction === '-1').length;

      return {
        user,
        comments: data.length,
        likes,
        dislikes
      };
    });
  }
}


