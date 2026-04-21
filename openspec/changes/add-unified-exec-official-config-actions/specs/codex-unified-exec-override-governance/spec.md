## MODIFIED Requirements

### Requirement: Legacy global unified_exec overrides MUST be repairable with confirmation

如果 global config 中存在显式 `unified_exec` key，桌面端 MUST 提供可诊断且需要用户显式触发的 official config action 路径。

#### Scenario: explicit global key surfaces official config actions

- **WHEN** 桌面端检测到 global config 中存在显式 `unified_exec` key
- **THEN** 设置界面 MUST 展示当前 official config 状态
- **AND** MUST 提供写入 enabled、写入 disabled、恢复官方默认三个显式动作

#### Scenario: restore official default still requires explicit user intent

- **WHEN** 用户选择 “restore official default”
- **THEN** 桌面端 MUST 仅在显式用户动作后才修改 global config
- **AND** 修改结果 MUST 让后续 inherit 模式重新跟随官方默认或 external config 剩余内容

### Requirement: Desktop MAY expose explicit official unified_exec config actions without changing selector semantics

桌面端 MAY 提供独立于三态 selector 的 official config action lane，用于显式写入 `~/.codex/config.toml` 的 `unified_exec`；该能力 MUST 不改变 selector 仍然属于 desktop-local runtime policy 的语义。

#### Scenario: writing official enabled keeps selector semantics unchanged

- **WHEN** 用户点击写入 official `unified_exec = true`
- **THEN** 系统 MUST 更新 `~/.codex/config.toml`
- **AND** MUST NOT 因此把 `codexUnifiedExecPolicy` 改写为 `force_enabled`

#### Scenario: writing official disabled keeps selector semantics unchanged

- **WHEN** 用户点击写入 official `unified_exec = false`
- **THEN** 系统 MUST 更新 `~/.codex/config.toml`
- **AND** MUST NOT 因此把 `codexUnifiedExecPolicy` 改写为 `force_disabled`
