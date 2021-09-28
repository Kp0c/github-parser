export interface Comment {
  id: number;
  user: {
    login: string;
  },
  commit_id: string;
  reactions?: {
    '+1': number;
    '-1': number;
  }
}
