import { startTransition, type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  Sparkles,
} from "lucide-react";
import appIcon from "../../../../icon.png";
import {
  createHomeChatQuickActions,
  createHomeChatTemplateTabs,
  getHomeChatPlaceholderMessage,
  type HomeChatTranslate,
  type HomeChatTemplatePreview,
  type HomeChatTemplateTabId,
} from "./homeChatContent";

type LatestAgentRun = {
  message: string;
  timestamp: number;
  projectName: string;
  groupName?: string | null;
  workspaceId: string;
  threadId: string;
  isProcessing: boolean;
};

type HomeChatProps = {
  latestAgentRuns: LatestAgentRun[];
  isLoadingLatestAgents: boolean;
  onSelectThread: (workspaceId: string, threadId: string) => void;
  composerNode?: ReactNode;
};

function buildCardPreview(preview: HomeChatTemplatePreview) {
  return (
    <span className={`home-chat-template-art is-${preview}`} aria-hidden="true">
      <span className="home-chat-template-art-topline" />
      <span className="home-chat-template-art-body" />
      <span className="home-chat-template-art-footer" />
      <span className="home-chat-template-art-orb" />
      <span className="home-chat-template-art-grid" />
      <span className="home-chat-template-art-accent" />
    </span>
  );
}

export function HomeChat({
  latestAgentRuns: _latestAgentRuns,
  isLoadingLatestAgents: _isLoadingLatestAgents,
  onSelectThread: _onSelectThread,
  composerNode,
}: HomeChatProps) {
  const { t } = useTranslation();
  const [activeTabId, setActiveTabId] = useState<HomeChatTemplateTabId>("templates");
  const [activePlaceholderLabel, setActivePlaceholderLabel] = useState<string | null>(null);

  const translate: HomeChatTranslate = (key, value) => {
    if (typeof value === "string") {
      return t(key, value);
    }
    return t(key, value);
  };

  const quickActions = createHomeChatQuickActions(translate);
  const templateTabs = createHomeChatTemplateTabs(translate);

  const activeTab =
    templateTabs.find((tab) => tab.id === activeTabId) ?? templateTabs[0] ?? null;

  const placeholderMessage = getHomeChatPlaceholderMessage(translate, activePlaceholderLabel);

  const handlePlaceholderActivate = (label: string) => {
    setActivePlaceholderLabel(label);
  };

  const handleTabChange = (tabId: HomeChatTemplateTabId) => {
    startTransition(() => {
      setActiveTabId(tabId);
      setActivePlaceholderLabel(null);
    });
  };

  return (
    <div className="home-chat">
      <div className="home-chat-shell">
        <div className="home-chat-orb home-chat-orb-left" aria-hidden="true" />
        <div className="home-chat-orb home-chat-orb-right" aria-hidden="true" />

        <header className="home-chat-hero">
          <button
            type="button"
            className="home-chat-announcement"
            aria-disabled="true"
            onClick={() => {
              handlePlaceholderActivate(t("homeChat.announcementText"));
            }}
          >
            <span className="home-chat-announcement-tag">
              {t("homeChat.announcementTag", "New")}
            </span>
            <span className="home-chat-announcement-text">
              {t(
                "homeChat.announcementText",
                "Explore templates, workflows, and starter prompts",
              )}
            </span>
            <span className="home-chat-announcement-action">
              {t("homeChat.announcementAction", "Discover")}
              <ChevronRight size={14} aria-hidden="true" />
            </span>
          </button>

          <div className="home-chat-headline">
            <h1 className="home-chat-title">
              <span className="home-chat-title-line">
                {t("homeChat.titleLineOne", "Press Enter")}
              </span>
              <span className="home-chat-title-line is-accent">
                {t("homeChat.titleLineTwo", "Build Apps Faster")}
              </span>
            </h1>

            <p className="home-chat-subtitle">
              {t(
                "homeChat.subtitle",
                "Keep your current composer, add visual structure, and stage what comes next.",
              )}
            </p>
          </div>
        </header>

        <section className="home-chat-stage">
          <div className="home-chat-stage-frame">
            <div className="home-chat-stage-glow" aria-hidden="true" />
            <section
              className="home-chat-composer-panel"
              aria-label={t("home.newConversation", "New Conversation")}
            >
              <div className="home-chat-composer-host">{composerNode}</div>
            </section>
          </div>

          <div className="home-chat-quick-actions-block">
            <div className="home-chat-quick-actions-header">
              <span>{t("homeChat.quickActions", "Quick actions")}</span>
            </div>
            <div className="home-chat-quick-actions">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    className="home-chat-quick-action"
                    aria-disabled="true"
                    onClick={() => {
                      handlePlaceholderActivate(action.label);
                    }}
                  >
                    <span className="home-chat-quick-action-icon">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="home-chat-quick-action-label">{action.label}</span>
                    <span className="home-chat-quick-action-chip">
                      {t("homeChat.comingSoon", "Coming soon")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="home-chat-placeholder-note" role="status" aria-live="polite">
            {placeholderMessage}
          </p>
        </section>

        <section className="home-chat-gallery" aria-label={t("homeChat.quickActions", "Quick actions")}>
          <div className="home-chat-gallery-header">
            <div className="home-chat-gallery-tabs" role="tablist" aria-label="Home landing tabs">
              {templateTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className={`home-chat-gallery-tab${
                    tab.id === activeTabId ? " is-active" : ""
                  }`}
                  aria-selected={tab.id === activeTabId}
                  onClick={() => {
                    handleTabChange(tab.id);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="home-chat-gallery-viewport">
            <div className="home-chat-gallery-track">
              {activeTab?.cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={`home-chat-template-card is-${card.preview}`}
                  aria-disabled="true"
                  aria-label={`${card.title}: ${card.description}`}
                  onClick={() => {
                    handlePlaceholderActivate(card.title);
                  }}
                >
                  <span className="home-chat-template-card-preview">
                    {buildCardPreview(card.preview)}
                  </span>
                  <span className="home-chat-template-card-body">
                    <span className="home-chat-template-card-meta">
                      <span className="home-chat-template-card-meta-icon">
                        <Sparkles size={12} aria-hidden="true" />
                      </span>
                      <span className="home-chat-template-card-chip">
                        {t("homeChat.comingSoon", "Coming soon")}
                      </span>
                    </span>
                    <span className="home-chat-template-card-title">{card.title}</span>
                    <span className="home-chat-template-card-description">
                      {card.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <img className="home-chat-bg-icon" src={appIcon} alt="" aria-hidden="true" />
        <div className="home-chat-grid" aria-hidden="true" />
        <div className="home-chat-noise" aria-hidden="true" />
      </div>
    </div>
  );
}
