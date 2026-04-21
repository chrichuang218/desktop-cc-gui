## Context

当前 unified_exec 已有两条边界清晰的语义：

1. `codexUnifiedExecPolicy`
   - app-local
   - 控制桌面端自己拉起的 Codex runtime
2. official `~/.codex/config.toml`
   - user-owned
   - 会影响 Codex CLI 及 follow-official-default 场景

问题不在于这两条边界本身，而在于第二条缺少显式产品入口。repair flow 只能删，不能写；这让“恢复默认”有入口，“明确写 true/false”却没有入口，用户只能绕回手改文件。

## Decision 1: 保留 selector 与 official config actions 的双车道模型

**Decision**

- selector 继续表示 desktop-local runtime policy。
- 新增 official config actions 作为第二车道，只在用户点击按钮时修改 `~/.codex/config.toml`。

**Why**

- 这样不会重新引入“普通设置保存静默改全局文件”的 ownership 回退。
- 用户也终于可以在 UI 内完成“我要把官方配置设成 true/false”的需求。

## Decision 2: official config actions 必须显式、可见、可诊断

**Decision**

- 卡片内显示当前 official config 状态：
  - explicit enabled
  - explicit disabled
  - no explicit key / follow default
- 暴露三个动作：
  - write enabled
  - write disabled
  - restore official default

**Why**

- 用户需要同时理解“当前 global config 是什么”与“当前桌面端 policy 是什么”。
- 只给按钮不给状态，会继续制造混淆。

## Decision 3: 在 inherit 模式下自动刷新 runtime，在 explicit desktop override 模式下给出优先级提示

**Decision**

- 如果当前 `codexUnifiedExecPolicy === inherit`，official config action 成功后自动触发 runtime reload。
- 如果当前 policy 为 `forceEnabled / forceDisabled`，不必依赖 reload 改行为；只提示“当前桌面端仍由本地 override 控制”。

**Why**

- 这能避免新的“按钮改了文件，但眼前运行态没变化”困惑。
- 同时保持 explicit desktop override 优先级不变。

## Risks

- 用户可能把 selector 和 official config buttons 理解成重复功能
  - Mitigation: 文案明确区分“当前桌面端覆盖”与“官方配置写入”
- 写 official config 后 reload 失败
  - Mitigation: 反馈必须说明“文件已写入，但 runtime refresh 失败”

## Validation

- Rust:
  - official config write helper 单测
  - settings_core explicit write command 单测
- Frontend:
  - 官方配置动作按钮可见
  - 点击按钮会调用新 command
  - `inherit` 模式下会触发 reload 和状态刷新
- Quality gates:
  - `pnpm vitest run src/features/vendors/components/VendorSettingsPanel.test.tsx src/features/settings/components/SettingsView.test.tsx`
  - `pnpm tsc --noEmit`
  - `cargo test --manifest-path src-tauri/Cargo.toml settings_core -- --nocapture`
