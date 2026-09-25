/**
 * Canonical types for video-editor Skills and project state.
 *
 * Design notes:
 * - A Skill is a semantic editing recipe, not an engine implementation.
 * - Project state is split into layers: audio, image/video, text & effects.
 * - Effects and text are resolved to concrete engines at execution time.
 */

export type SkillCategory =
  | "text"
  | "effects"
  | "transition"
  | "audio"
  | "analysis"
  | "preset";

export type Engine =
  | "tsx"
  | "remotion"
  | "python"
  | "rust"
  | "js"
  | "wasm"
  | "ffmpeg"
  | string;

export type SkillInputType =
  | "string"
  | "number"
  | "boolean"
  | "time"
  | "duration"
  | "asset"
  | "enum";

export interface SkillInput {
  name: string;
  type: SkillInputType;
  description?: string;
  required?: boolean;
  default?: unknown;
  enum?: string[];
}

export interface SkillOutput {
  type: "project-mutation" | "analysis" | "render";
  description: string;
}

export interface SkillContract {
  name: string;
  category: SkillCategory;
  intent: string;
  inputs: SkillInput[];
  defaults: Record<string, unknown>;
  constraints?: Record<string, unknown>;
  output: SkillOutput;
  preferredEngine: Engine;
  fallback?: Engine[];
  examples: string[];
}

export interface Skill<TParams = Record<string, unknown>>
  extends SkillContract {
  /**
   * Apply the skill to a project and return a new project state.
   * The function must be pure: do not mutate the input project.
   */
  apply(project: Project, params: TParams): Project;
}

export interface Composition {
  duration: number;
  fps: number;
  width?: number;
  height?: number;
}

export interface Asset {
  id: string;
  type: "video" | "audio" | "image" | "font" | "svg";
  src: string;
  name?: string;
}

export interface TimeRange {
  start: number;
  duration: number;
}

export interface AudioLayer extends TimeRange {
  id: string;
  type: "audio";
  assetId: string;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  /** Marks segments that should be removed (jet-cut). */
  cuts?: Array<{ start: number; duration: number }>;
}

export interface ImageLayer extends TimeRange {
  id: string;
  type: "image" | "video";
  assetId: string;
  /** Optional chroma-key background removal. */
  chromaKey?: {
    color: string;
    threshold: number;
    backgroundAssetId?: string;
  };
  /** Cuts to remove silent or unwanted segments. */
  cuts?: Array<{ start: number; duration: number }>;
  transitions?: Transition[];
}

export interface TextLayer extends TimeRange {
  id: string;
  type: "text";
  text: string;
  style?: "telop" | "subtitle" | "title" | "kinetic" | "lower-third";
  emphasis?: "normal" | "strong" | "pop";
  animation?: "none" | "pop" | "bounce" | "tracking";
}

export interface EffectLayer extends TimeRange {
  id: string;
  type: "effect";
  name: string;
  params: Record<string, unknown>;
  engine?: Engine;
}

export type TextEffectsLayer = TextLayer | EffectLayer;

export interface Transition {
  name: string;
  at: number;
  duration: number;
  params?: Record<string, unknown>;
}

export interface ProjectLayers {
  audio: AudioLayer[];
  image: ImageLayer[];
  textEffects: TextEffectsLayer[];
}

export interface Project {
  version: string;
  composition: Composition;
  assets?: Asset[];
  layers: ProjectLayers;
  /** Top-level effects kept for backward compatibility; prefer layers.textEffects. */
  effects?: EffectLayer[];
  analysis?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/** Result returned after a skill is executed. */
export interface SkillResult {
  skill: string;
  params: Record<string, unknown>;
  project: Project;
  resolvedEngines: Engine[];
}

export interface SkillRegistry {
  register(skill: Skill): void;
  get(name: string): Skill | undefined;
  list(category?: SkillCategory): Skill[];
  resolve(input: string): Skill | undefined;
}
