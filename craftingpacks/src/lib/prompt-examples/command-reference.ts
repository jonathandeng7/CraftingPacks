export const COMMON_COMMAND_REFERENCE = `Core flow control
function <ns>:path - run reusable logic blocks (subroutines).
execute ... run <command> - conditional + contextual logic wrapper.
execute as <targets> ... - run logic as each target (changes @s).
execute at <targets> ... - run logic at each target's location.
execute positioned <x y z|~ ~ ~> ... - run logic at a specific position.
execute facing entity <target> <eyes|feet> ... - orient for ray-style checks.
execute rotated ... / rotated as ... - match rotation for direction-sensitive logic.
execute if ... / execute unless ... - branching conditions.
execute if entity <selector> - check if any entity matches.
execute if block <pos> <block> - check for a block at a position.
execute if blocks <start> <end> <dest> all|masked - compare regions.
execute if score <a> <obj> <matches|<|>|=|<=|>=|..> <b> - numeric branching.
execute if predicate <ns>:pred - reusable boolean checks.
execute store result score ... run ... - capture output into a scoreboard.
execute store success score ... run ... - store 1/0 based on success.

Player / entity targeting
Selectors: @p @a @r @e @s.
Selector args: distance=..10, tag=foo, type=minecraft:zombie, scores={...}, nbt={...}.

Scoreboards
scoreboard objectives add <obj> dummy - create custom variable.
scoreboard objectives add <obj> minecraft.used:minecraft.stick - stats-based events.
scoreboard objectives remove <obj> - cleanup.
scoreboard players set <target> <obj> <n> - assign value.
scoreboard players add <target> <obj> <n> - increment.
scoreboard players remove <target> <obj> <n> - decrement.
scoreboard players operation <a> <obj> <op> <b> <obj> - math ops.
scoreboard players reset <target> <obj> - clear a value.
scoreboard objectives setdisplay ... - show scores.

Persistent data storage (NBT)
data modify storage <ns>:<id> <path> set value ... - write storage.
data modify storage ... append value ... - push into lists.
data remove storage ... <path> - delete config/state.
data get storage ... <path> [scale] - read values.
data merge storage ... { ... } - bulk update.
data modify entity <selector> <path> ... - set entity NBT (be careful with players).
data get entity <selector> <path> - read entity NBT.

Tags
tag <entity> add <tag> - mark entities/players.
tag <entity> remove <tag> - unmark.
tag <entity> list - debug.

Items, inventories, and loot
give <player> <item> [count]
clear <player> <item> [count]
item replace entity <entity> <slot> with <item>
item modify entity <entity> <slot> <modifier>
loot give <player> loot <loot_table>
loot spawn ~ ~ ~ loot <loot_table>
loot replace entity <entity> <slot> loot <loot_table>

World edits
setblock <pos> <block> [destroy|keep|replace]
fill <start> <end> <block> [replace <filter>]
clone <start> <end> <dest> [replace|masked] [normal|force|move]
fillbiome <start> <end> <biome>
place structure <id>
place feature <id>
schedule function <ns>:path <time> [append|replace]

Entities, motion, effects
summon <entity> <pos> [nbt]
kill <targets>
tp <targets> <pos|target>
teleport ...
spreadplayers <x> <z> <spreadDist> <maxRange> <respectTeams> <targets>
ride <targets> mount <entity> / ride ... dismount
attribute <entity> <attr> base set <value>
effect give <targets> <effect> <seconds> <amp> [hideParticles]
damage <target> <amount> <type> [by <entity>] [from <entity>]
team add/join/leave/modify
gamerule <rule> <value>

Particles, sound, feedback
playsound <sound> <source> <targets> [pos] [volume] [pitch] [minVolume]
stopsound <targets> [source] [sound]
particle <particle> <pos> <delta> <speed> <count> [force|normal] [viewers]
title <targets> title|subtitle|actionbar ...
bossbar add/set/remove

Chat UI
Tellraw is a primary UI tool:
- tellraw <targets> <json>
- use hover_event and click_event for menus
say ... / me ... for simple output

Advancements & triggers
advancement grant|revoke <targets> only|from|through|everything <adv>
trigger <objective> [set|add] <value>

Datapack structure support
- data/minecraft/tags/functions/load.json
- data/minecraft/tags/functions/tick.json

Debug & inspection
- tellraw / title actionbar
- data get ...
- scoreboard players get ...
- execute if/unless ... run say/tellraw ...
`;

export const VERSION_119_REFERENCE = `SECTION 1 - Minecraft 1.19 to 1.19.4
Engine level
- No return
- No function macros ($var, $(...))
- No function ... with storage
- No item components system
- Classic NBT item format
- Scoreboards, storage, execute store, predicates, schedule available

Item syntax (critical)
Items use NBT only:
give @p minecraft:diamond_sword{Enchantments:[{id:"minecraft:sharpness",lvl:5s}]}
No component syntax.

Control flow style
Use execute if/unless + scoreboard branching. No return.

pack_format
1.19 -> 10
1.19.1 -> 10
1.19.2 -> 10
1.19.3 -> 12
1.19.4 -> 13
`;

export const VERSION_120_REFERENCE = `SECTION 2 - Minecraft 1.20 to 1.20.6
1.20.0 to 1.20.4
- No return, no macros, no function-with-storage
- NBT item format
- Scoreboards, storage, execute store

pack_format
1.20.1 -> 15
1.20.2 -> 18
1.20.3 -> 26
1.20.4 -> 26

1.20.5 to 1.20.6 (item components change)
- Item components replace raw NBT in most contexts
- Old NBT item syntax is not valid

Old (invalid in 1.20.5+):
give @p minecraft:diamond_sword{Enchantments:[...]}
New:
give @p minecraft:diamond_sword[enchantments={levels:{sharpness:5}}]

Control flow still legacy (no return/macros)

pack_format
1.20.5 -> 41
1.20.6 -> 41
`;

export const VERSION_121_REFERENCE = `SECTION 3 - Minecraft 1.21+
Engine changes
- return / return run available
- function macros ($var, $(path)) available
- function <ns>:path with storage <ns>:ctx available
- Item components system (NBT in commands deprecated)

Control flow example
Legacy:
execute unless entity @s[tag=valid] run scoreboard players set @s fail 1
execute if score @s fail matches 1 run function ns:error
Modern:
execute unless entity @s[tag=valid] run return

Dynamic objective creation with macros:
scoreboard objectives add veinminer.$(id) dummy

Item format
Component syntax only:
give @p minecraft:diamond_sword[enchantments={levels:{sharpness:5}},custom_name='"Epic Blade"']

pack_format
1.21.0 -> 48
1.21.1 -> 48
1.21.2 -> 57
1.21.3 -> 57
1.21.4 -> 71
1.21.5 -> 71
1.21.6+ -> 71+
`;
