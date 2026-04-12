import {
  resolveFileLanguageFromPath,
  type EditorLanguageId,
} from "../../../utils/fileLanguageRegistry";

export type StructuredPreviewKind = "shell" | "dockerfile";

export type FileRenderKind =
  | "image"
  | "markdown"
  | "structured"
  | "code"
  | "text"
  | "binary-unsupported";

export type EditCapability = "full" | "plain-text" | "read-only";

export type FallbackBehavior =
  | "plain-text-preview"
  | "plain-text-editor"
  | "binary-unsupported"
  | "image-preview";

export type FileRenderProfile = {
  kind: FileRenderKind;
  normalizedLookupPath: string;
  filenameMatchKey: string;
  previewLanguage: string | null;
  editorLanguage: EditorLanguageId | null;
  structuredKind: StructuredPreviewKind | null;
  editCapability: EditCapability;
  fallbackBehavior: FallbackBehavior;
};

export type FilePreviewMetrics = {
  byteLength: number;
  lineCount: number;
  truncated: boolean;
};

type PreviewBudget = {
  maxBytes: number;
  maxLines: number;
};

const MARKDOWN_EXTENSIONS = new Set(["md", "mdx"]);

const IMAGE_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "svg", "webp",
  "avif", "bmp", "heic", "heif", "tif", "tiff", "ico",
]);

const BINARY_EXTENSIONS = new Set([
  ...IMAGE_EXTENSIONS,
  "mp3", "wav", "ogg", "flac", "aac", "m4a", "wma",
  "mp4", "mov", "avi", "mkv", "wmv", "flv", "webm",
  "zip", "tar", "gz", "rar", "7z", "bz2",
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "exe", "dll", "so", "dylib", "bin", "dmg", "iso",
  "ttf", "otf", "woff", "woff2", "eot",
  "class", "o", "a", "lib", "pyc", "wasm",
]);

const SHELL_SCRIPT_EXTENSIONS = new Set([
  "sh",
  "bash",
  "zsh",
  "ksh",
  "dash",
  "command",
]);

const SHELL_SCRIPT_FILENAMES = new Set([
  ".envrc",
  "envrc",
  ".bashrc",
  "bashrc",
  ".zshrc",
  "zshrc",
  ".kshrc",
  "kshrc",
  ".profile",
  "profile",
]);

const PREVIEW_BUDGETS: Record<Extract<FileRenderKind, "code" | "markdown" | "structured">, PreviewBudget> = {
  code: {
    maxBytes: 200_000,
    maxLines: 8_000,
  },
  markdown: {
    maxBytes: 150_000,
    maxLines: 5_000,
  },
  structured: {
    maxBytes: 120_000,
    maxLines: 3_000,
  },
};

export function normalizeRenderLookupPath(path?: string | null) {
  return (path ?? "").replace(/\\/g, "/");
}

function fileNameFromPath(path?: string | null) {
  const normalized = normalizeRenderLookupPath(path);
  return normalized.split("/").pop() ?? normalized;
}

export function fileNameMatchKeyFromPath(path?: string | null) {
  return fileNameFromPath(path).toLowerCase();
}

function extensionFromPath(path?: string | null) {
  const fileName = fileNameMatchKeyFromPath(path);
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === fileName.length - 1) {
    return null;
  }
  return fileName.slice(dotIndex + 1);
}

export function isMarkdownPath(path?: string | null) {
  const ext = extensionFromPath(path);
  return ext ? MARKDOWN_EXTENSIONS.has(ext) : false;
}

export function isImagePath(path?: string | null) {
  const ext = extensionFromPath(path);
  return ext ? IMAGE_EXTENSIONS.has(ext) : false;
}

export function isBinaryPath(path?: string | null) {
  const ext = extensionFromPath(path);
  return ext ? BINARY_EXTENSIONS.has(ext) : false;
}

export function resolveStructuredPreviewKind(path: string): StructuredPreviewKind | null {
  const fileName = fileNameMatchKeyFromPath(path);
  if (!fileName) {
    return null;
  }
  if (/^dockerfile(?:\.[^/]+)?$/i.test(fileName)) {
    return "dockerfile";
  }
  if (SHELL_SCRIPT_FILENAMES.has(fileName)) {
    return "shell";
  }
  const extension = extensionFromPath(fileName);
  if (extension && SHELL_SCRIPT_EXTENSIONS.has(extension)) {
    return "shell";
  }
  return null;
}

export function resolveFileRenderProfile(path?: string | null): FileRenderProfile {
  const normalizedLookupPath = normalizeRenderLookupPath(path);
  const filenameMatchKey = fileNameMatchKeyFromPath(path);
  const languageResolution = resolveFileLanguageFromPath(normalizedLookupPath);
  const structuredKind = normalizedLookupPath
    ? resolveStructuredPreviewKind(normalizedLookupPath)
    : null;

  if (isImagePath(normalizedLookupPath)) {
    return {
      kind: "image",
      normalizedLookupPath,
      filenameMatchKey,
      previewLanguage: null,
      editorLanguage: null,
      structuredKind: null,
      editCapability: "read-only",
      fallbackBehavior: "image-preview",
    };
  }

  if (isBinaryPath(normalizedLookupPath)) {
    return {
      kind: "binary-unsupported",
      normalizedLookupPath,
      filenameMatchKey,
      previewLanguage: null,
      editorLanguage: null,
      structuredKind: null,
      editCapability: "read-only",
      fallbackBehavior: "binary-unsupported",
    };
  }

  if (isMarkdownPath(normalizedLookupPath)) {
    return {
      kind: "markdown",
      normalizedLookupPath,
      filenameMatchKey,
      previewLanguage: languageResolution.previewLanguage,
      editorLanguage: languageResolution.editorLanguage,
      structuredKind: null,
      editCapability: languageResolution.editorLanguage ? "full" : "plain-text",
      fallbackBehavior: "plain-text-preview",
    };
  }

  if (structuredKind) {
    return {
      kind: "structured",
      normalizedLookupPath,
      filenameMatchKey,
      previewLanguage: languageResolution.previewLanguage,
      editorLanguage: languageResolution.editorLanguage,
      structuredKind,
      editCapability: languageResolution.editorLanguage ? "full" : "plain-text",
      fallbackBehavior: "plain-text-preview",
    };
  }

  return {
    kind: languageResolution.previewLanguage ? "code" : "text",
    normalizedLookupPath,
    filenameMatchKey,
    previewLanguage: languageResolution.previewLanguage,
    editorLanguage: languageResolution.editorLanguage,
    structuredKind: null,
    editCapability: languageResolution.editorLanguage ? "full" : "plain-text",
    fallbackBehavior: "plain-text-preview",
  };
}

export function measureFilePreviewMetrics(
  value: string,
  truncated: boolean,
): FilePreviewMetrics {
  return {
    byteLength: new TextEncoder().encode(value).length,
    lineCount: value.length === 0 ? 0 : value.split(/\r?\n/).length,
    truncated,
  };
}

function resolvePreviewBudget(profile: FileRenderProfile): PreviewBudget | null {
  if (profile.kind === "code" || profile.kind === "markdown" || profile.kind === "structured") {
    return PREVIEW_BUDGETS[profile.kind];
  }
  return null;
}

export function shouldUseLowCostPreview(
  profile: FileRenderProfile,
  metrics: FilePreviewMetrics,
) {
  if (metrics.truncated) {
    return true;
  }
  const budget = resolvePreviewBudget(profile);
  if (!budget) {
    return false;
  }
  return metrics.byteLength > budget.maxBytes || metrics.lineCount > budget.maxLines;
}
