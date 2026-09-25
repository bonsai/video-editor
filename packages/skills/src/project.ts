import type {
  AudioLayer,
  Composition,
  EffectLayer,
  ImageLayer,
  Project,
  ProjectLayers,
  TextEffectsLayer,
} from "./types.js";

export function createProject(
  composition: Composition,
  partial: Omit<Partial<Project>, "composition"> = {}
): Project {
  return {
    version: partial.version ?? "0.0.1",
    composition,
    assets: partial.assets ?? [],
    layers: partial.layers ?? {
      audio: [],
      image: [],
      textEffects: [],
    },
    effects: partial.effects,
    analysis: partial.analysis,
    metadata: partial.metadata,
  };
}

export function assertProject(project: unknown): asserts project is Project {
  if (typeof project !== "object" || project === null) {
    throw new TypeError("project must be an object");
  }

  const p = project as Record<string, unknown>;

  if (typeof p.composition !== "object" || p.composition === null) {
    throw new TypeError("project.composition is required");
  }

  const composition = p.composition as Record<string, unknown>;
  if (typeof composition.duration !== "number") {
    throw new TypeError("project.composition.duration must be a number");
  }
  if (typeof composition.fps !== "number" || composition.fps <= 0) {
    throw new TypeError("project.composition.fps must be a positive number");
  }

  if (typeof p.layers !== "object" || p.layers === null) {
    throw new TypeError("project.layers is required");
  }

  const layers = p.layers as Record<string, unknown>;
  if (!Array.isArray(layers.audio)) {
    throw new TypeError("project.layers.audio must be an array");
  }
  if (!Array.isArray(layers.image)) {
    throw new TypeError("project.layers.image must be an array");
  }
  if (!Array.isArray(layers.textEffects)) {
    throw new TypeError("project.layers.textEffects must be an array");
  }

  if (p.effects !== undefined && !Array.isArray(p.effects)) {
    throw new TypeError("project.effects must be an array if provided");
  }
}

export function mergeEffectsIntoTextLayer(
  layers: ProjectLayers,
  effects: EffectLayer[]
): ProjectLayers {
  return {
    ...layers,
    textEffects: [...layers.textEffects, ...effects],
  };
}

export function addTextLayer(
  project: Project,
  layer: TextEffectsLayer
): Project {
  return {
    ...project,
    layers: {
      ...project.layers,
      textEffects: [...project.layers.textEffects, layer],
    },
  };
}

export function addAudioLayer(project: Project, layer: AudioLayer): Project {
  return {
    ...project,
    layers: {
      ...project.layers,
      audio: [...project.layers.audio, layer],
    },
  };
}

export function addImageLayer(project: Project, layer: ImageLayer): Project {
  return {
    ...project,
    layers: {
      ...project.layers,
      image: [...project.layers.image, layer],
    },
  };
}
