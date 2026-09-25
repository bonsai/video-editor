import type {
  Engine,
  Project,
  Skill,
  SkillCategory,
  SkillRegistry,
  SkillResult,
} from "./types.js";

export class InMemorySkillRegistry implements SkillRegistry {
  private skills = new Map<string, Skill>();

  register(skill: Skill): void {
    this.skills.set(skill.name, skill);
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  list(category?: SkillCategory): Skill[] {
    const all = Array.from(this.skills.values());
    if (!category) return all;
    return all.filter((s) => s.category === category);
  }

  resolve(input: string): Skill | undefined {
    const normalized = input.trim().toLowerCase();
    for (const skill of this.skills.values()) {
      if (skill.name.toLowerCase() === normalized) return skill;
      if (skill.intent.toLowerCase().includes(normalized)) return skill;
      if (skill.examples.some((ex) => ex.toLowerCase().includes(normalized))) {
        return skill;
      }
    }
    return undefined;
  }

  execute(
    name: string,
    project: Project,
    params: Record<string, unknown> = {}
  ): SkillResult {
    const skill = this.get(name);
    if (!skill) {
      throw new Error(`Skill not found: ${name}`);
    }

    const merged = { ...skill.defaults, ...params };
    const nextProject = skill.apply(project, merged);
    const resolvedEngines = collectEngines(skill, nextProject);

    return {
      skill: skill.name,
      params: merged,
      project: nextProject,
      resolvedEngines,
    };
  }
}

function collectEngines(skill: Skill, project: Project): Engine[] {
  const engines = new Set<Engine>([skill.preferredEngine]);
  for (const layer of project.layers.textEffects) {
    if (layer.type === "effect" && layer.engine) {
      engines.add(layer.engine);
    }
  }
  if (project.effects) {
    for (const effect of project.effects) {
      if (effect.engine) engines.add(effect.engine);
    }
  }
  if (skill.fallback) {
    for (const engine of skill.fallback) engines.add(engine);
  }
  return Array.from(engines);
}
