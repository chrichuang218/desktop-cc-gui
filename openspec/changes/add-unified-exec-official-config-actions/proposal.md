## Why

当前 `Background terminal` 三态 selector 已经收口为 runtime-scoped override，这是对的；但用户仍然有一个真实缺口：如果他明确想把官方 `~/.codex/config.toml` 的 `unified_exec` 写成 `true` 或 `false`，当前只能手改文件，桌面端没有显式入口。

这导致产品体验出现新的断层：

- selector 能改当前桌面端 runtime 行为，但不能表达“我要把官方配置永久设回去”
- repair flow 只能删除显式 key，不能写入 `true/false`
- 用户需要在 UI 和手改文件之间来回跳，学习成本高

因此本轮 follow-up 的目标不是回退三态方案，而是在其旁边增加一个**显式 official config action lane**：只有用户点击专门按钮时，桌面端才允许写 `~/.codex/config.toml` 的 `unified_exec`。

## Goals

- 在 `供应商管理 > Codex > Background terminal` 卡片中增加显式 official config actions：
  - 写入 `unified_exec = true`
  - 写入 `unified_exec = false`
  - 恢复官方默认（删除显式 key）
- 保持现有三态 selector 语义不变：
  - `inherit / forceEnabled / forceDisabled` 继续只控制桌面端 runtime override
  - 普通 settings save 继续不得写 global config
- 动作后刷新 config 预览与 external status。
- 在 `inherit` 模式下，写入/恢复后自动刷新当前 Codex runtime；在 explicit desktop override 模式下，明确提示 global config 已更新但当前桌面端仍以本地策略优先。

## Non-Goals

- 不把 selector 改回“隐式写官方 config”。
- 不引入新的 persisted settings 字段。
- 不扩展到其他 official config key。

## What Changes

- backend 新增显式 command：写入 official `unified_exec` true/false。
- frontend 在现有卡片中新增官方配置状态与操作按钮。
- spec 将 global config mutation 路径从“只有 repair”扩展为“显式 official config actions + repair”。
