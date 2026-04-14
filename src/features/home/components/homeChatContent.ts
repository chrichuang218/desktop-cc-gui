import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  FileText,
  Search,
  Workflow,
} from "lucide-react";

export type HomeChatTranslate = (
  key: string,
  value?: string | Record<string, string>,
) => string;

export type HomeChatQuickAction = {
  id: string;
  icon: LucideIcon;
  label: string;
};

export type HomeChatTemplatePreview =
  | "website"
  | "creator"
  | "audio"
  | "editorial"
  | "release"
  | "research"
  | "debug"
  | "content";

export type HomeChatTemplateCard = {
  id: string;
  title: string;
  description: string;
  preview: HomeChatTemplatePreview;
};

export type HomeChatTemplateTabId = "templates" | "workflows";

export type HomeChatTemplateTab = {
  id: HomeChatTemplateTabId;
  label: string;
  cards: HomeChatTemplateCard[];
};

export const HOME_CHAT_SCROLL_STEP = 336;

export function createHomeChatQuickActions(t: HomeChatTranslate): HomeChatQuickAction[] {
  return [
    {
      id: "plan",
      icon: ClipboardList,
      label: t("homeChat.quick.plan", "Plan from brief"),
    },
    {
      id: "review",
      icon: Search,
      label: t("homeChat.quick.review", "Review repository"),
    },
    {
      id: "spec",
      icon: Workflow,
      label: t("homeChat.quick.spec", "Draft spec"),
    },
    {
      id: "release",
      icon: FileText,
      label: t("homeChat.quick.release", "Ship notes"),
    },
  ];
}

export function createHomeChatTemplateTabs(t: HomeChatTranslate): HomeChatTemplateTab[] {
  return [
    {
      id: "templates",
      label: t("homeChat.tabs.templates", "Templates"),
      cards: [
        {
          id: "website-launch-kit",
          title: t("homeChat.cards.website.title", "Website Launch Kit"),
          description: t(
            "homeChat.cards.website.description",
            "Hero layout, structure, and starter copy for a polished launch page.",
          ),
          preview: "website",
        },
        {
          id: "creator-dashboard",
          title: t("homeChat.cards.creator.title", "Creator Dashboard"),
          description: t(
            "homeChat.cards.creator.description",
            "An analytics-first control room for content, traffic, and prompts.",
          ),
          preview: "creator",
        },
        {
          id: "audio-landing",
          title: t("homeChat.cards.audio.title", "Audio Landing"),
          description: t(
            "homeChat.cards.audio.description",
            "Soft gradients and bold metrics for music, podcasts, or media launches.",
          ),
          preview: "audio",
        },
        {
          id: "editorial-manifesto",
          title: t("homeChat.cards.editorial.title", "Editorial Manifesto"),
          description: t(
            "homeChat.cards.editorial.description",
            "Poster-like typography for campaigns, statements, and branded showcases.",
          ),
          preview: "editorial",
        },
      ],
    },
    {
      id: "workflows",
      label: t("homeChat.tabs.workflows", "Workflows"),
      cards: [
        {
          id: "release-checklist",
          title: t("homeChat.cards.release.title", "Release Checklist"),
          description: t(
            "homeChat.cards.release.description",
            "A staged handoff for changes, verification, notes, and rollout follow-up.",
          ),
          preview: "release",
        },
        {
          id: "research-sprint",
          title: t("homeChat.cards.research.title", "Research Sprint"),
          description: t(
            "homeChat.cards.research.description",
            "Collect questions, source findings, and synthesize them into next actions.",
          ),
          preview: "research",
        },
        {
          id: "debug-desk",
          title: t("homeChat.cards.debug.title", "Debug Desk"),
          description: t(
            "homeChat.cards.debug.description",
            "Triaging logs, narrowing regressions, and documenting verified fixes.",
          ),
          preview: "debug",
        },
        {
          id: "content-pipeline",
          title: t("homeChat.cards.content.title", "Content Pipeline"),
          description: t(
            "homeChat.cards.content.description",
            "Brief, draft, review, and publish with consistent checkpoints.",
          ),
          preview: "content",
        },
      ],
    },
  ];
}

export function getHomeChatPlaceholderMessage(
  t: HomeChatTranslate,
  activePlaceholderLabel: string | null,
): string {
  if (activePlaceholderLabel) {
    return t("homeChat.placeholderSelected", {
      label: activePlaceholderLabel,
    });
  }

  return t(
    "homeChat.placeholderHint",
    "These entry points are visual placeholders for now.",
  );
}
