import { describe, expect, it } from "vitest";
import {
  measureFilePreviewMetrics,
  resolveFileRenderProfile,
  resolveStructuredPreviewKind,
  shouldUseLowCostPreview,
} from "./fileRenderProfile";

describe("fileRenderProfile", () => {
  it("resolves frozen in-scope render profiles consistently across path styles", () => {
    expect(resolveFileRenderProfile("src/App.vue")).toMatchObject({
      kind: "code",
      previewLanguage: "markup",
      editorLanguage: null,
      editCapability: "plain-text",
    });

    expect(resolveFileRenderProfile("C:\\Repo\\docker-compose.YML")).toMatchObject({
      kind: "code",
      normalizedLookupPath: "C:/Repo/docker-compose.YML",
      filenameMatchKey: "docker-compose.yml",
      previewLanguage: "yaml",
      editorLanguage: "yaml",
      structuredKind: null,
      editCapability: "full",
    });

    expect(resolveFileRenderProfile("C:\\Repo\\.ENV.LOCAL")).toMatchObject({
      kind: "code",
      filenameMatchKey: ".env.local",
      previewLanguage: "ini",
      editorLanguage: "properties",
      editCapability: "full",
    });

    expect(resolveFileRenderProfile("/Users/dev/project/Dockerfile")).toMatchObject({
      kind: "structured",
      structuredKind: "dockerfile",
      previewLanguage: "bash",
      editorLanguage: "shell",
      editCapability: "full",
    });
  });

  it("keeps binary, image, markdown, and unknown text fallback semantics stable", () => {
    expect(resolveFileRenderProfile("assets/logo.SVG")).toMatchObject({
      kind: "image",
      fallbackBehavior: "image-preview",
      editCapability: "read-only",
    });

    expect(resolveFileRenderProfile("artifacts/archive.zip")).toMatchObject({
      kind: "binary-unsupported",
      fallbackBehavior: "binary-unsupported",
      editCapability: "read-only",
    });

    expect(resolveFileRenderProfile("/Users/dev/project/README.md")).toMatchObject({
      kind: "markdown",
      previewLanguage: "markdown",
      editorLanguage: "markdown",
      editCapability: "full",
    });

    expect(resolveFileRenderProfile("notes/README")).toMatchObject({
      kind: "text",
      previewLanguage: null,
      editorLanguage: null,
      editCapability: "plain-text",
    });
  });

  it("resolves structured preview kinds with Windows and shell compatibility paths", () => {
    expect(resolveStructuredPreviewKind("C:\\Repo\\Dockerfile.dev")).toBe("dockerfile");
    expect(resolveStructuredPreviewKind("C:\\Repo\\.zshrc")).toBe("shell");
    expect(resolveStructuredPreviewKind("/Users/dev/project/scripts/release.command")).toBe("shell");
    expect(resolveStructuredPreviewKind("docker-compose.yml")).toBeNull();
  });

  it("uses deterministic bytes, line-count, and truncated budgets for low-cost preview fallback", () => {
    const codeProfile = resolveFileRenderProfile("src/main.ts");
    const markdownProfile = resolveFileRenderProfile("README.md");
    const structuredProfile = resolveFileRenderProfile("Dockerfile");

    expect(
      shouldUseLowCostPreview(
        codeProfile,
        measureFilePreviewMetrics("const value = 1;\n".repeat(10), false),
      ),
    ).toBe(false);

    expect(
      shouldUseLowCostPreview(
        codeProfile,
        measureFilePreviewMetrics("a".repeat(200_001), false),
      ),
    ).toBe(true);

    expect(
      shouldUseLowCostPreview(
        markdownProfile,
        measureFilePreviewMetrics("line\n".repeat(5_001), false),
      ),
    ).toBe(true);

    expect(
      shouldUseLowCostPreview(
        structuredProfile,
        measureFilePreviewMetrics("RUN echo hi\n".repeat(3_001), false),
      ),
    ).toBe(true);

    expect(
      shouldUseLowCostPreview(
        markdownProfile,
        measureFilePreviewMetrics("# truncated", true),
      ),
    ).toBe(true);
  });
});
