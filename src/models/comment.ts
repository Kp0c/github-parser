export interface Comment {
  id: number;
  user: {
    login: string;
  },
  commit_id: string;
}
