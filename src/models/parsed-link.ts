import type { LinkType } from './link-type';

export class ParsedLink {
  owner: string;
  repo: string;
  id: string;
  type: LinkType;

  constructor(fields: {
    owner: string,
    repo: string,
    id: string,
    type: LinkType,
  }) {
    this.owner = fields.owner;
    this.repo = fields.repo;
    this.id = fields.id;
    this.type = fields.type;
  }

  static fromRawLink(link: string): ParsedLink {
    const linkSplitted = link.split('/');

    const gitHubIdx = linkSplitted.findIndex((part) => part.includes('github'));

    const isCommit = link.includes('commit');

    const parsedLink = new ParsedLink({
      owner: linkSplitted[gitHubIdx + 1],
      repo: linkSplitted[gitHubIdx + 2],
      id: linkSplitted[gitHubIdx + 4],
      type: isCommit ? 'commit' : 'pullRequest'
    });

    if (!parsedLink.isValid()) {
      throw new Error('Link is invalid');
    }

    return parsedLink;
  }

  isValid(): boolean {
    return this.isFieldValid(this.owner) && this.isFieldValid(this.repo) && this.isFieldValid(this.id);
  }

  private isFieldValid(field: string): boolean {
    const normalizedField = field ?? '';
    return normalizedField.length > 0;
  }
}