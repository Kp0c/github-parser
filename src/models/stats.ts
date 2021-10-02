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
}
