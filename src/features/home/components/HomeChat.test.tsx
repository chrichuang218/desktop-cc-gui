import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HomeChat } from "./HomeChat";
import {
  createHomeChatQuickActions,
  createHomeChatTemplateTabs,
  getHomeChatPlaceholderMessage,
} from "./homeChatContent";

const translations: Record<string, string> = {
  "home.newConversation": "New Conversation",
  "homeChat.announcementTag": "New",
  "homeChat.announcementText": "Explore templates, workflows, and starter prompts",
  "homeChat.announcementAction": "Discover",
  "homeChat.titleLineOne": "Press Enter",
  "homeChat.titleLineTwo": "Build Apps Faster",
  "homeChat.subtitle":
    "Keep your current composer, add visual structure, and stage what comes next.",
  "homeChat.quickActions": "Quick actions",
  "homeChat.quick.plan": "Plan from brief",
  "homeChat.quick.review": "Review repository",
  "homeChat.quick.spec": "Draft spec",
  "homeChat.quick.release": "Ship notes",
  "homeChat.placeholderHint": "These entry points are visual placeholders for now.",
  "homeChat.placeholderSelected": "{{label}} is coming soon.",
  "homeChat.tabs.templates": "Templates",
  "homeChat.tabs.workflows": "Workflows",
  "homeChat.seeAll": "See all",
  "homeChat.navPrev": "Previous cards",
  "homeChat.navNext": "Next cards",
  "homeChat.cards.website.title": "Website Launch Kit",
  "homeChat.cards.website.description":
    "Hero layout, structure, and starter copy for a polished launch page.",
  "homeChat.cards.creator.title": "Creator Dashboard",
  "homeChat.cards.creator.description":
    "An analytics-first control room for content, traffic, and prompts.",
  "homeChat.cards.audio.title": "Audio Landing",
  "homeChat.cards.audio.description":
    "Soft gradients and bold metrics for music, podcasts, or media launches.",
  "homeChat.cards.editorial.title": "Editorial Manifesto",
  "homeChat.cards.editorial.description":
    "Poster-like typography for campaigns, statements, and branded showcases.",
  "homeChat.cards.release.title": "Release Checklist",
  "homeChat.cards.release.description":
    "A staged handoff for changes, verification, notes, and rollout follow-up.",
  "homeChat.cards.research.title": "Research Sprint",
  "homeChat.cards.research.description":
    "Collect questions, source findings, and synthesize them into next actions.",
  "homeChat.cards.debug.title": "Debug Desk",
  "homeChat.cards.debug.description":
    "Triaging logs, narrowing regressions, and documenting verified fixes.",
  "homeChat.cards.content.title": "Content Pipeline",
  "homeChat.cards.content.description":
    "Brief, draft, review, and publish with consistent checkpoints.",
  "homeChat.comingSoon": "Coming soon",
};

function translate(key: string, params?: string | Record<string, string>) {
  const template = translations[key] ?? key;
  if (!params || typeof params === "string") {
    return template;
  }

  return Object.entries(params).reduce(
    (acc, [paramKey, value]) => acc.replace(new RegExp(`{{${paramKey}}}`, "g"), value),
    template,
  );
}

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => {} },
  useTranslation: () => ({
    t: translate,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const baseProps = {
  latestAgentRuns: [],
  isLoadingLatestAgents: false,
  onSelectThread: vi.fn(),
  composerNode: <div>Composer node</div>,
};

describe("HomeChat", () => {
  it("renders the landing hero, composer host, quick actions, and template cards", () => {
    const markup = renderToStaticMarkup(<HomeChat {...baseProps} />);

    expect(markup).toContain("Explore templates, workflows, and starter prompts");
    expect(markup).toContain("Press Enter");
    expect(markup).toContain("Build Apps Faster");
    expect(markup).toContain("Composer node");
    expect(markup).toContain("Plan from brief");
    expect(markup).toContain("Website Launch Kit");
    expect(markup).toContain("aria-disabled=\"true\"");
  });

  it("builds distinct card groups for template tabs", () => {
    const tabs = createHomeChatTemplateTabs(translate);
    const templateTitles = tabs.find((tab) => tab.id === "templates")?.cards.map((card) => card.title);
    const workflowTitles = tabs.find((tab) => tab.id === "workflows")?.cards.map((card) => card.title);

    expect(templateTitles).toContain("Website Launch Kit");
    expect(templateTitles).not.toContain("Release Checklist");
    expect(workflowTitles).toContain("Release Checklist");
    expect(workflowTitles).not.toContain("Website Launch Kit");
  });

  it("keeps placeholder actions focusable and resolves the coming-soon copy", () => {
    const quickActions = createHomeChatQuickActions(translate);
    const quickActionLabel = quickActions[0]?.label ?? "";
    const placeholderMessage = getHomeChatPlaceholderMessage(translate, quickActionLabel);

    expect(quickActionLabel).toBe("Plan from brief");
    expect(placeholderMessage).toBe("Plan from brief is coming soon.");
  });

  it("keeps the composer mounted inside the dedicated host container", () => {
    const markup = renderToStaticMarkup(<HomeChat {...baseProps} />);

    expect(markup).toContain("home-chat-composer-host");
    expect(markup).toContain("Composer node");
  });
});
