import { flatMap, groupBy, sumBy } from 'lodash';
import type { Comment } from '../models/comment';

export class Stats {
  user: string;
  comments: number;
  likes: number;
  dislikes: number;

  constructor(fields: {
    user: string,
    comments: number,
    likes: number,
    dislikes: number,
  }) {
    this.user = fields.user;
    this.comments = fields.comments;
    this.likes = fields.likes;
    this.dislikes = fields.dislikes;
  }

  static fromComments(comments: Comment[]): Stats[] {
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
