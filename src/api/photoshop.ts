import { action, core } from "photoshop";

// 映射工具 ID 到 PS 内部 Class Name
const TOOL_MAP: Record<string, string> = {
  brush: "paintbrushTool",
  eraser: "eraserTool",
  mixer: "wetBrushTool", // 混合画笔
  smudge: "smudgeTool",
  pencil: "pencilTool",
  clone: "cloneStampTool",
};

/**
 * 切换工具
 * @param toolId - "brush", "eraser", etc.
 */
export async function selectTool(toolId: string): Promise<void> {
  const targetClass = TOOL_MAP[toolId];
  if (!targetClass) return;

  try {
    await core.executeAsModal(
      async () => {
        await action.batchPlay(
          [
            {
              _obj: "select",
              _target: [{ _ref: targetClass }],
            },
          ],
          {}
        );
      },
      { commandName: `Select Tool: ${toolId}` }
    );
  } catch (e) {
    console.error("Select Tool Failed:", e);
  }
}

/**
 * 获取当前工具 Class ID
 */
export async function getCurrentTool(): Promise<string> {
  try {
    const result = await action.batchPlay(
      [
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "tool" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" },
          ],
        },
      ],
      { synchronousExecution: true }
    );

    if (result && result[0] && result[0].tool) {
       return result[0].tool._enum || result[0].tool._obj || "unknown";
    }
  } catch (e) {
    console.error("Get Current Tool Failed:", e);
  }
  return "unknown";
}

/**
 * Internal Helper: Applies the "Golden Combination" (Tool Class + UnitValue)
 */
async function setDynamicToolOption(key: string, value: any) {
  try {
    const toolClass = await getCurrentTool();
    if (!toolClass || toolClass === "unknown") return;

    await core.executeAsModal(
      async () => {
        const descriptor = {
          _obj: "set",
          _target: [
            { _ref: toolClass } 
          ],
          to: {
            _obj: "currentToolOptions",
            [key]: typeof value === "object" ? value : value // Support passing UnitValue or raw
          },
        };
        
        await action.batchPlay([descriptor], {});
      },
      { commandName: `Set ${key}` }
    );
  } catch (e) {
    console.error(`[BrushToolbar] Set ${key} Failed:`, e);
  }
}

export async function setBrushSize(size: number): Promise<void> {
  try {
    await core.executeAsModal(
      async () => {
        await action.batchPlay(
          [
            {
              _obj: "set",
              _target: [
                { _ref: "brush", _enum: "ordinal", _value: "targetEnum" },
              ],
              to: {
                _obj: "currentToolOptions",
                diameter: { _unit: "pixelsUnit", _value: size },
              },
            },
          ],
          {}
        );
      },
      { commandName: "Set Brush Size" }
    );
  } catch (e) {
    console.error(e);
  }
}

export async function setBrushOpacity(opacity: number): Promise<void> {
  const val = Math.round(opacity);
  await setDynamicToolOption("opacity", { _unit: "percentUnit", _value: val });
}

export async function setBrushFlow(flow: number): Promise<void> {
  const val = Math.round(flow);
  await setDynamicToolOption("flow", { _unit: "percentUnit", _value: val });
}

/**
 * 设置画笔硬度 (Hardness)
 * @param hardness - 硬度数值 (0-100)
 */
export async function setBrushHardness(hardness: number): Promise<void> {
  const val = Math.max(0, Math.min(100, Math.round(hardness)));
  try {
    await core.executeAsModal(async () => {
      await action.batchPlay([
        {
          _obj: "set",
          _target: [{ _ref: "brush", _enum: "ordinal", _value: "targetEnum" }],
          to: {
            _obj: "brush",
            hardness: { _unit: "percentUnit", _value: val },
          },
        },
      ], {});
    }, { commandName: "Set Brush Hardness" });
  } catch (e) {
    console.error("[BrushToolbar] Set Hardness Failed:", e);
  }
}

/**
 * 设置画笔间距 (Spacing)
 * @param spacing - 间距数值 (1-1000, 百分比)
 */
export async function setBrushSpacing(spacing: number): Promise<void> {
  const val = Math.max(1, Math.min(1000, Math.round(spacing)));
  try {
    await core.executeAsModal(async () => {
      await action.batchPlay([
        {
          _obj: "set",
          _target: [{ _ref: "brush", _enum: "ordinal", _value: "targetEnum" }],
          to: {
            _obj: "brush",
            spacing: { _unit: "percentUnit", _value: val },
          },
        },
      ], {});
    }, { commandName: "Set Brush Spacing" });
  } catch (e) {
    console.error("[BrushToolbar] Set Spacing Failed:", e);
  }
}

/**
 * 设置画笔角度 (Angle)
 * @param angle - 角度数值 (-180 到 180)
 */
export async function setBrushAngle(angle: number): Promise<void> {
  // Ensure value is within range, though PS handles wraparound
  const val = Math.round(angle);
  try {
    await core.executeAsModal(async () => {
      await action.batchPlay([
        {
          _obj: "set",
          _target: [{ _ref: "brush", _enum: "ordinal", _value: "targetEnum" }],
          to: {
            _obj: "brush",
            angle: { _unit: "angleUnit", _value: val },
          },
        },
      ], {});
    }, { commandName: "Set Brush Angle" });
  } catch (e) {
    console.error("[BrushToolbar] Set Angle Failed:", e);
  }
}

/**
 * 设置平滑 (Smoothing) - Target 'smooth' Property
 * smoothingValue 可能是只读的，smooth 才是可写的
 */
/**
 * 设置画笔平滑度 (Smoothing) - 最终修正版
 * 
 * 来源: User provided "The Correct Way in UXP"
 * Target: Application -> currentToolOptions (not tool class)
 * Payload: { smoothing: val }
 * 
 * @param smoothing - 平滑度数值 (0-100)
 */
/**
 * 设置画笔平滑度 (Smoothing)
 * 
 * 与 Opacity/Flow 完全一致的模式:
 * - 使用 setDynamicToolOption
 * - Key 使用 'smooth' (不是 'smoothing', Inspector 显示这是实际的数值键)
 * - Value 使用原始整数 (不是 percentUnit, 因为 Inspector 显示 smooth: 60 是 raw int)
 * 
 * @param smoothing - 平滑度数值 (0-100)
 */
/**
 * 设置画笔平滑度 (Smoothing)
 *
 * 使用 `property → currentToolOptions` 目标写入 `smooth`（整数 0‑100），
 * 并在执行前强制切换到画笔工具，防止 "Set not available" 错误。
 */
/**
 * 设置画笔平滑度 (Smoothing)
 *
 * 使用 `property → currentToolOptions` 目标写入 `smooth`（整数）以及 `smoothingValue`（percentUnit），
 * 以确保 Photoshop UI 的平滑滑块能够同步显示数值。
 */
export async function setBrushSmoothing(smoothing: number): Promise<void> {
  const val = Math.max(0, Math.min(100, Math.round(smoothing)));
  console.log(`[BrushToolbar] setBrushSmoothing called with: ${val}`);
  
  try {
    await core.executeAsModal(async () => {
      const toolClass = await getCurrentTool();
      console.log(`[BrushToolbar] Current tool: ${toolClass}`);
      
      // 尝试多种属性名和格式
      const descriptors = [
        // 方案1: smoothing 整数
        {
          _obj: "set",
          _target: [{ _ref: toolClass }],
          to: { _obj: "currentToolOptions", smoothing: val },
        },
        // 方案2: smooth 整数
        {
          _obj: "set",
          _target: [{ _ref: toolClass }],
          to: { _obj: "currentToolOptions", smooth: val },
        },
      ];
      
      for (let i = 0; i < descriptors.length; i++) {
        const result = await action.batchPlay([descriptors[i]], {});
        console.log(`[BrushToolbar] Attempt ${i + 1} result:`, JSON.stringify(result));
      }
    }, { commandName: "Set Brush Smoothing (multi)" });
  } catch (e) {
    console.error("[BrushToolbar] Set Smoothing Failed:", e);
  }
}

// =============================================================================
// Shape Dynamics API (形状动态)
// Based on Inspector capture:
// shapeDynamics: { _obj: "$brVr", jitter: {_unit: "percentUnit", _value}, minimum: {...} }
// =============================================================================

export interface ShapeDynamicsProps {
  sizeJitter: number;      // jitter
  minDiameter: number;     // minimum
  angleJitter: number;     // angle.jitter
  roundnessJitter: number; // roundness.jitter
  minRoundness: number;    // roundness.minimum
}

/**
 * 获取形状动态属性
 * 
 * 数据结构 (from Inspector):
 * - Size Jitter: currentToolOptions.$szVr.jitter
 * - Min Diameter: currentToolOptions.minimumDiameter (顶层属性!)
 * - Angle Jitter: currentToolOptions.angleDynamics.jitter
 * - Roundness Jitter: currentToolOptions.roundnessDynamics.jitter
 * - Min Roundness: currentToolOptions.minimumRoundness (顶层属性!)
 */
export async function getShapeDynamics(): Promise<ShapeDynamicsProps | null> {
  try {
    const result = await action.batchPlay(
      [
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "currentToolOptions" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" },
          ],
          _options: { dialogOptions: "dontDisplay" },
        },
      ],
      { synchronousExecution: true }
    );

    if (result && result[0] && result[0].currentToolOptions) {
      // 双层嵌套: currentToolOptions.currentToolOptions
      const opts = result[0].currentToolOptions.currentToolOptions || result[0].currentToolOptions;
      
      const getVal = (v: any) => {
        if (typeof v === "number") return v;
        if (v && typeof v._value === "number") return v._value;
        return 0;
      };

      // 解析正确的路径 (Priority: Nested > Top Level)
      const sizeJitter = getVal(opts["$szVr"]?.jitter);
      
      // Min Diameter: Check $szVr.minimum first, then fallback to top-level
      let minDiameter = getVal(opts["$szVr"]?.minimum);
      if (minDiameter === undefined || minDiameter === 0) {
          minDiameter = getVal(opts.minimumDiameter) || 0;
      }

      const angleJitter = getVal(opts.angleDynamics?.jitter);
      const roundnessJitter = getVal(opts.roundnessDynamics?.jitter);
      
      // Min Roundness: Check roundnessDynamics.minimum first
      let minRoundness = getVal(opts.roundnessDynamics?.minimum);
      if (minRoundness === undefined || minRoundness === 0) {
           minRoundness = getVal(opts.minimumRoundness) || 0;
      }
      
      console.log("[BrushToolbar] Shape Dynamics parsed:", { sizeJitter, minDiameter, angleJitter, roundnessJitter, minRoundness });
      
      return {
        sizeJitter: sizeJitter || 0,
        minDiameter: minDiameter || 0,
        angleJitter: angleJitter || 0,
        roundnessJitter: roundnessJitter || 0,
        minRoundness: minRoundness || 0,
      };
    }
  } catch (e) {
    // console.error("[BrushToolbar] Get Shape Dynamics Failed:", e);
  }
  return null;
}

/**
 * 设置形状动态属性
 * 
 * 属性映射:
 * - sizeJitter: $szVr.jitter
 * - minDiameter: minimumDiameter (顶层属性)
 * - angleJitter: angleDynamics.jitter
 * - roundnessJitter: roundnessDynamics.jitter
 * - minRoundness: minimumRoundness (顶层属性)
 */
/**
 * 设置形状动态属性
 * 采用 Read-Modify-Write 模式，确保不丢失复杂对象的 hidden properties
 */
export async function setShapeDynamics(key: string, value: number): Promise<void> {
  const val = Math.max(0, Math.min(100, Math.round(value)));
  
  try {
    await core.executeAsModal(async () => {
      const toolClass = await getCurrentTool();
      if (!toolClass || toolClass === "unknown") return;

      // 1. 读取当前 Tool Options
      const result = await action.batchPlay(
        [
          {
            _obj: "get",
            _target: [
              { _ref: "property", _property: "currentToolOptions" },
              { _ref: "application", _enum: "ordinal", _value: "targetEnum" },
            ],
          }
        ],
        { synchronousExecution: true }
      );

      if (!result || !result[0] || !result[0].currentToolOptions) {
        return;
      }

      // 处理嵌套结构
      const fullOptions = result[0].currentToolOptions;
      const opts = fullOptions.currentToolOptions || fullOptions;

      // 2. 修改对应值 (保留原对象结构 - 关键：使用 opts 的完整副本，防止覆盖其他属性)
      let patch = { ...opts };
      
      // Helper to update or create the dynamics object
      // keyName: "$szVr" (Size), "angleDynamics" (Angle), "roundnessDynamics" (Roundness)
      // subKey: "jitter" or "minimum"
      const updateDynamicsStruct = (keyName: string, subKey: "jitter" | "minimum", newVal: number) => {
        const original = opts[keyName];
        
        const newObj = original ? { ...original } : {}; 
        
        // Ensure _obj is set if creating from scratch
        if (!newObj._obj) {
             if (keyName === "$szVr") newObj._obj = "$brVr";
        }

        // Set the value
        newObj[subKey] = { _unit: "percentUnit", _value: newVal };
        
        // Ensure "jitter" is present if we are setting minimum
        if (!newObj.jitter) newObj.jitter = { _unit: "percentUnit", _value: 0 };
        // Ensure "minimum" is present if we are setting jitter
        if (!newObj.minimum) newObj.minimum = { _unit: "percentUnit", _value: 0 };
        
        // Preserve Control Type ($bVTy)
        if (original && original["$bVTy"] !== undefined) {
             newObj["$bVTy"] = original["$bVTy"];
        }
        
        return newObj;
      };

      switch (key) {
        case "sizeJitter":
          patch["$szVr"] = updateDynamicsStruct("$szVr", "jitter", val);
          break;
        case "minDiameter":
          // Update nested value
          patch["$szVr"] = updateDynamicsStruct("$szVr", "minimum", val);
          // Update top-level value (Critical for sync)
          patch["minimumDiameter"] = { _unit: "percentUnit", _value: val };
          break;
        case "angleJitter":
          patch["angleDynamics"] = updateDynamicsStruct("angleDynamics", "jitter", val);
          break;
        case "roundnessJitter":
          patch["roundnessDynamics"] = updateDynamicsStruct("roundnessDynamics", "jitter", val);
          break;
        case "minRoundness":
          // Update nested value
          patch["roundnessDynamics"] = updateDynamicsStruct("roundnessDynamics", "minimum", val);
           // Update top-level value (Critical for sync)
          patch["minimumRoundness"] = { _unit: "percentUnit", _value: val };
          break;
      }

      // 3. 写回修改
      // 重要: set 命令的 to 必须包含 _obj: "currentToolOptions"
      patch._obj = "currentToolOptions";

      await action.batchPlay(
        [
          {
            _obj: "set",
            _target: [{ _ref: toolClass }],
            to: patch
          }
        ],
        {}
      );
      
    }, { commandName: `Set Shape Dynamics: ${key}` });
  } catch (e) {
    console.error("[BrushToolbar] Set Shape Dynamics Failed:", e);
  }
}

export interface BrushProps {
  size: number;
  opacity: number;
  flow: number;
  angle: number;
  hardness?: number;
  spacing?: number;
}

export async function getBrushProperties(): Promise<BrushProps | null> {
  try {
    const result = await action.batchPlay(
      [
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "currentToolOptions" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum"  },
          ],
        },
      ],
      { synchronousExecution: true }
    );

    if (result && result[0] && result[0].currentToolOptions) {
      const opts = result[0].currentToolOptions;

      const getVal = (v: any) => (v && v._value !== undefined ? v._value : v);

      // 1. Resolve Size & Angle
      let size = 0;
      let angle = 0;
      if (opts.brush) {
        if (opts.brush.diameter) size = getVal(opts.brush.diameter) || 0;
        if (opts.brush.angle) angle = getVal(opts.brush.angle) || 0;
      } else {
        if (opts.diameter) size = getVal(opts.diameter) || 0;
        // Top level angle might not exist, but let's check
        if (opts.angle) angle = getVal(opts.angle) || 0;
      }

      // 2. Resolve Opacity, Flow
      const opacity = getVal(opts.opacity) ?? 100;
      const flow = getVal(opts.flow) ?? 100;

      // 3. Resolve Hardness, Spacing
      let hardness = 0;
      let spacing = 0;
      if (opts.brush) {
        hardness = getVal(opts.brush.hardness) ?? 0;
        spacing = getVal(opts.brush.spacing) ?? 0;
      }
      
      return { size, opacity, flow, angle: Math.round(angle), hardness, spacing };
    }
  } catch (e) {
    console.error("[BrushToolbar] Get Properties Failed:", e);
  }
  return null;
}

// =============================================================================
// 笔刷预设系统 (Brush Preset System)
// =============================================================================

export interface BrushPreset {
  name: string;
  index: number;
}

/**
 * 获取笔刷预设列表
 * 注意: 这是"工具预设" (Tool Presets)，不是笔刷尖端 (Brush Tips)
 */
export async function getBrushPresets(): Promise<BrushPreset[]> {
  try {
    const result = await action.batchPlay(
      [
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "presetManager" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" },
          ],
        },
      ],
      { synchronousExecution: true }
    );

    const presets: BrushPreset[] = [];

    if (result && result[0] && result[0].presetManager) {
      const manager = result[0].presetManager;
      
      // 查找 Tool Presets (工具预设)
      if (manager.presetManager) {
        for (const category of manager.presetManager) {
          // 筛选工具预设 (Class: toolPreset)
          if (category._obj === "presetManager" && category.name === "toolPreset") {
            const items = category.name;
            // 遍历预设
            if (category.preset) {
              category.preset.forEach((p: any, idx: number) => {
                if (p.title || p.name) {
                  presets.push({
                    name: p.title || p.name || `Preset ${idx + 1}`,
                    index: idx,
                  });
                }
              });
            }
          }
        }
      }
    }

    // 如果没找到，尝试直接获取当前工具预设
    if (presets.length === 0) {
      console.log("[BrushToolbar] No presets found, trying alternative method");
      // 替代方案: 使用预设选择器查询
    }

    return presets;
  } catch (e) {
    console.error("[BrushToolbar] Get Brush Presets Failed:", e);
    return [];
  }
}

/**
 * 选择笔刷预设
 * @param presetIndex - 预设索引 (从0开始)
 */
export async function selectBrushPreset(presetIndex: number): Promise<void> {
  try {
    await core.executeAsModal(
      async () => {
        await action.batchPlay(
          [
            {
              _obj: "select",
              _target: [
                {
                  _ref: "toolPreset",
                  _index: presetIndex + 1, // PS 索引从1开始
                },
              ],
            },
          ],
          {}
        );
      },
      { commandName: "Select Brush Preset" }
    );
  } catch (e) {
    console.error("[BrushToolbar] Select Brush Preset Failed:", e);
  }
}

/**
 * 通过名称选择笔刷/工具预设
 * @param name - 名称
 * @param type - 类型 ('brush' | 'toolPreset')
 */
export async function selectBrushByName(name: string, type: 'brush' | 'toolPreset' = 'brush'): Promise<void> {
  try {
    const refType = type === 'toolPreset' ? 'toolPreset' : 'brush';
    await core.executeAsModal(
      async () => {
        await action.batchPlay(
          [
            {
              _obj: "select",
              _target: [
                {
                  _ref: refType,
                  _name: name,
                },
              ],
            },
          ],
          {}
        );
      },
      { commandName: `Select ${type}: ${name}` }
    );
  } catch (e) {
    console.error(`[BrushToolbar] Select ${type} Failed:`, e);
  }
}

let cachedBrushInfo: { name: string; type: 'brush' | 'toolPreset' } | null = null;

const REVERSE_TOOL_MAP: Record<string, string> = Object.entries(TOOL_MAP).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as Record<string, string>);

export function startBrushTracking(onToolChange?: (toolId: string) => void) {
  action.addNotificationListener(["select"], (event: string, descriptor: any) => {
    if (event === "select") {
      const target = descriptor._target;
      if (Array.isArray(target) && target.length > 0) {
        const ref = target[0];
        
        // 1. 捕获笔刷/预设选择 (现有逻辑)
        if (ref._ref === "brush" && ref._name) {
          cachedBrushInfo = { name: ref._name, type: "brush" };
          console.log("[BrushToolbar] Tracked Brush:", cachedBrushInfo);
        }
        else if (ref._ref === "toolPreset" && ref._name) {
          cachedBrushInfo = { name: ref._name, type: "toolPreset" };
          console.log("[BrushToolbar] Tracked ToolPreset:", cachedBrushInfo);
        }
        
        // 2. 捕获工具切换 (New)
        // 目标通常是 {_ref: "paintbrushTool"} 或类似的
        if (onToolChange && ref._ref) {
          if (REVERSE_TOOL_MAP[ref._ref]) {
            // 已知工具
            const newToolId = REVERSE_TOOL_MAP[ref._ref];
            console.log("[BrushToolbar] Tracked Known Tool:", newToolId);
            onToolChange(newToolId);
          } else if (typeof ref._ref === "string" && ref._ref.toLowerCase().includes("tool")) {
             // 未知工具 (e.g., moveTool, marqueeTool)
             // 只要包含 'tool'，我们就认为切换了工具，通知 UI 更新以隐藏画笔收藏
             console.log("[BrushToolbar] Tracked Unknown Tool:", ref._ref);
             onToolChange(ref._ref); 
          }
        }
      }
    }
  });
}

/**
 * 获取当前笔刷信息 (名称和类型)
 */
export async function getCurrentBrushInfo(): Promise<{ name: string; type: 'brush' | 'toolPreset' } | null> {
  // 1. 优先返回监听到的最后一次选择 (最准确)
  if (cachedBrushInfo) {
    return cachedBrushInfo;
  }

  // 如果没有监听数据，尝试简单的 currentToolOptions 查询 (最安全的 Fallback)
  try {
    const result = await action.batchPlay(
      [
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "currentToolOptions" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" },
          ],
          _options: { dialogOptions: "dontDisplay" }
        },
      ],
      { synchronousExecution: true }
    );

    if (result && result[0] && result[0].currentToolOptions) {
      const toolOpts = result[0].currentToolOptions;
      // 工具预设
      if (toolOpts.$TpNm) {
        return { name: toolOpts.$TpNm, type: 'toolPreset' };
      }
      // 笔刷名 (有可能是不准确的笔尖名，但总比报错好)
    // 笔刷名 (有可能是不准确的笔尖名，但总比报错好)
      if (toolOpts.brush) {
        // [FIX] 尝试通过 sampledData 反查真实的预设名称 (例如 "☻真实手绘...")
        if (toolOpts.brush.sampledData) {
           const realName = await findBrushPresetNameBySampledData(toolOpts.brush.sampledData);
           if (realName) {
             console.log("[BrushToolbar] Resolved Preset Name via SampledData:", realName);
             return { name: realName, type: 'brush' };
           }
        }
        
        if (toolOpts.brush.name) {
           return { name: toolOpts.brush.name, type: 'brush' };
        }
      }
    }
  } catch (e) {
    console.warn("[BrushToolbar] Active Get Failed, ignoring:", e);
  }

  return null;
}

/**
 * 通过 SampledData ID 反查笔刷预设名称
 * 这是一个递归查找过程，用于解决 currentToolOptions 只返回 Tip Name 的问题
 */
async function findBrushPresetNameBySampledData(targetId: string): Promise<string | null> {
  try {
    const result = await action.batchPlay(
      [
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "presetManager" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" },
          ],
        },
      ],
      { synchronousExecution: true }
    );

    if (result && result[0] && result[0].presetManager) {
      const managers = result[0].presetManager;
      // 查找 Brush Presets (Class: brush) - 注意这里是 brush 不是 toolPreset
      const brushManager = managers.find((m: any) => m.name === "brush" || m._obj === "brush");
      
      if (brushManager && brushManager.preset) {
         // 递归查找函数
         const findInArray = (list: any[]): string | null => {
            for (const item of list) {
               // 检查当前项
               if (item.sampledData === targetId && item.name) {
                  return item.name;
               }
               // 递归检查子项 (组)
               if (item.children && Array.isArray(item.children)) {
                  const found = findInArray(item.children);
                  if (found) return found;
               }
               // 有些结构可能是 generic object, but typical Preset structure has children for groups
            }
            return null;
         };

         return findInArray(brushManager.preset);
      }
    }
  } catch (e) {
    console.error("[BrushToolbar] Find Brush By ID Failed:", e);
  }
  return null;
}
