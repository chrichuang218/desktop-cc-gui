## MODIFIED Requirements

### Requirement: Desktop Settings MUST NOT Backfill Private Flags Into External Config

桌面端更新 app-local settings 时 MUST NOT 再把私有或遗留开关写入 `~/.codex/config.toml`；只有显式 official config action lane 才 MAY 写入或删除 `unified_exec`。

#### Scenario: generic settings save still does not backfill unified_exec

- **WHEN** 用户执行普通 settings save、settings restore 或 selector 切换
- **THEN** 系统 MUST NOT 向 `~/.codex/config.toml` 写入或覆盖 `unified_exec`

#### Scenario: explicit official config action may set unified_exec true or false

- **WHEN** 用户点击官方配置动作按钮并选择写入 enabled 或 disabled
- **THEN** 系统 MAY 向 `~/.codex/config.toml` 写入显式 `unified_exec`
- **AND** 该 mutation MUST 与普通 settings save 路径分离

#### Scenario: inherit mode reloads after explicit official config action

- **GIVEN** 当前 unified_exec policy 为 `inherit`
- **WHEN** 用户成功执行 official config action
- **THEN** 桌面端 SHOULD 刷新当前 Codex runtime config
- **AND** 界面 MUST 反馈该变更已应用到 inherit runtime 路径
