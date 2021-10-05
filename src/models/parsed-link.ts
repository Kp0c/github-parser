import { IsNotEmpty, validateSync } from 'class-validator';
import type { LinkType } from './link-type';

export class ParsedLink {
  @IsNotEmpty()
  owner: string;

  @IsNotEmpty()
  repo: string;

  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
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

    if (parseResults === null) {
      throw new Error('Link is incorrect');
    }

    const isCommit = parseResults[3] === 'commit';

    const parsedLink = new ParsedLink({
      owner: parseResults[1],
      repo: parseResults[2],
      id: parseResults[4],
      type: isCommit ? 'commit' : 'pullRequest'
    });

    const error = parsedLink.getValidationError();
    if (error !== null) {
      throw new Error(error);
    }

    return parsedLink;
  }

  getValidationError(): string | null {
    const errors = validateSync(this)

    if (errors.length === 0) {
      return null;
    }

    const failedConstraints = errors.map((error) => error.constraints);

    return failedConstraints.map((constraints) => {
      return Object.values(constraints).join(', ');
    }).join(', ');
  }
}