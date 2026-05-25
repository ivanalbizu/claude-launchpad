import { describe, expect, it } from 'vitest';
import { AGENT_TEMPLATES } from './agent-templates.ts';
import { AGENT_BODIES } from './agent-bodies.ts';
import { SKILL_TEMPLATES } from './skill-templates.ts';
import { SKILL_BODIES } from './skill-bodies.ts';

describe('agent metadata ↔ bodies coverage', () => {
  it('every agent id in the catalog has a matching body entry', () => {
    for (const agent of AGENT_TEMPLATES) {
      expect(AGENT_BODIES[agent.id], `missing body for "${agent.id}"`).toBeDefined();
    }
  });

  it('every body entry corresponds to an agent in the catalog', () => {
    const ids = new Set(AGENT_TEMPLATES.map((a) => a.id));
    for (const bodyId of Object.keys(AGENT_BODIES)) {
      expect(ids.has(bodyId as never), `orphan body "${bodyId}"`).toBe(true);
    }
  });

  it('each agent body has non-empty body + frontmatterDescription', () => {
    for (const [id, value] of Object.entries(AGENT_BODIES)) {
      expect(value.body.trim().length, `empty body for "${id}"`).toBeGreaterThan(0);
      expect(
        value.frontmatterDescription.trim().length,
        `empty frontmatterDescription for "${id}"`,
      ).toBeGreaterThan(0);
    }
  });
});

describe('skill metadata ↔ bodies coverage', () => {
  it('every skill id in the catalog has a matching body entry', () => {
    for (const skill of SKILL_TEMPLATES) {
      expect(SKILL_BODIES[skill.id], `missing body for "${skill.id}"`).toBeDefined();
    }
  });

  it('every body entry corresponds to a skill in the catalog', () => {
    const ids = new Set(SKILL_TEMPLATES.map((s) => s.id));
    for (const bodyId of Object.keys(SKILL_BODIES)) {
      expect(ids.has(bodyId as never), `orphan body "${bodyId}"`).toBe(true);
    }
  });

  it('each skill body has non-empty body + frontmatterDescription', () => {
    for (const [id, value] of Object.entries(SKILL_BODIES)) {
      expect(value.body.trim().length, `empty body for "${id}"`).toBeGreaterThan(0);
      expect(
        value.frontmatterDescription.trim().length,
        `empty frontmatterDescription for "${id}"`,
      ).toBeGreaterThan(0);
    }
  });
});
