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
    const parseRegex = /github.com\/([\w-]+)\/([\w-]+)\/(\w+)\/(\w+)/;

    const parseResults = parseRegex.exec(link);

    const isCommit = parseResults[3] === 'commit';

    const parsedLink = new ParsedLink({
      owner: parseResults[1],
      repo: parseResults[2],
      id: parseResults[4],
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