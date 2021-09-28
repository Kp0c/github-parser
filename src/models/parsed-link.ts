import type { LinkType } from './link-type';

export interface ParsedLink {
  owner: string;
  repo: string;
  id: string;
  type: LinkType;
}