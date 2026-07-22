import { NESTJS_ROADMAP } from "./nestjs-roadmap-data";
import { TICKET_ROADMAP } from "./ticket-roadmap-data";
import type { RoadmapDefinition } from "./roadmap-core";

export const ROADMAP_DEFINITIONS: RoadmapDefinition[] = [
  TICKET_ROADMAP,
  NESTJS_ROADMAP,
];

export function getRoadmapDefinition(id: string): RoadmapDefinition | undefined {
  return ROADMAP_DEFINITIONS.find((r) => r.id === id);
}

export function requireRoadmapDefinition(id: string): RoadmapDefinition {
  const def = getRoadmapDefinition(id);
  if (!def) {
    throw new Error(`Unknown roadmap: ${id}`);
  }
  return def;
}

export const DEFAULT_ROADMAP_ID = TICKET_ROADMAP.id;
