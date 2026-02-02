/**
 * Properties.tsx
 * 画笔属性面板 - 重构版
 * 使用模块化 UI 组件
 */
import React, { useState, useEffect, useCallback } from "react";
import { 
  setBrushSize, setBrushOpacity, setBrushFlow, 
  setBrushHardness, setBrushSpacing, getBrushProperties, 
  getShapeDynamics, setShapeDynamics, setBrushAngle 
} from "../api/photoshop";
import { action } from "photoshop";
import { t } from "../i18n";
import { Slider, CollapsibleSection } from "./ui";

// =====================================================
// Properties Panel
// =====================================================

export interface PropertiesRef {
  refresh: () => Promise<void>;
}

interface PropertiesProps {
  showAdvanced?: boolean;
}

export const Properties = React.forwardRef<PropertiesRef, PropertiesProps>(
  ({ showAdvanced = true }, ref) => {
    // Basic properties
    const [size, setSize] = useState(15);
    const [opacity, setOpacity] = useState(100);
    const [flow, setFlow] = useState(100);

    const [angle, setAngle] = useState(0);
    const [hardness, setHardness] = useState(0);
    const [spacing, setSpacing] = useState(25);

    // Shape Dynamics
    const [sizeJitter, setSizeJitter] = useState(0);
    const [minDiameter, setMinDiameter] = useState(0);
    const [angleJitter, setAngleJitter] = useState(0);
    const [roundnessJitter, setRoundnessJitter] = useState(0);
    const [minRoundness, setMinRoundness] = useState(0);

    // Sync function
    const sync = useCallback(async () => {
      const props = await getBrushProperties();
      if (props) {
        if (props.size) setSize(props.size);
        if (props.opacity !== undefined) setOpacity(props.opacity);

        if (props.flow !== undefined) setFlow(props.flow);
        if (props.angle !== undefined) setAngle(props.angle);
        if (props.hardness !== undefined) setHardness(props.hardness);
        if (props.spacing !== undefined) setSpacing(props.spacing);
      }

      const shapeDyn = await getShapeDynamics();
      if (shapeDyn) {
        setSizeJitter(shapeDyn.sizeJitter);
        setMinDiameter(shapeDyn.minDiameter);
        setAngleJitter(shapeDyn.angleJitter);
        setRoundnessJitter(shapeDyn.roundnessJitter);
        setMinRoundness(shapeDyn.minRoundness);
      }
    }, []);

    React.useImperativeHandle(ref, () => ({
      refresh: sync
    }));

    // Event listener for auto-sync
    useEffect(() => {
      sync();

      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      const debouncedSync = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(sync, 200);
      };

      const listener = (event: string, descriptor: any) => {
        if (event === "set") {
          const target = descriptor?._target;
          const to = descriptor?.to;
          
          let shouldSync = false;

          // 1. Check Target Ref
          if (Array.isArray(target)) {
            shouldSync = target.some(
              (t: any) =>
                t._ref === "brush" ||
                t._property === "currentToolOptions" ||
                t._ref?.includes?.("brush") ||
                t._ref?.includes?.("Tool")
            );
          }

          // 2. Check Changed Properties (Double Check)
          // If specific shape dynamics properties are being set, force sync
          if (!shouldSync && to) {
            if (
              to.hasOwnProperty("jitter") || 
              to.hasOwnProperty("minimumDiameter") ||
              to.hasOwnProperty("minimumRoundness") ||
              to.hasOwnProperty("angleDynamics") ||
              to.hasOwnProperty("roundnessDynamics") ||
              to.hasOwnProperty("$szVr") ||
              to.hasOwnProperty("$brVr")
            ) {
              shouldSync = true;
            }
          }

          if (shouldSync) {
            debouncedSync();
          }
        } else if (event === "select" || event === "reset") {
          debouncedSync();
        }
      };

      action.addNotificationListener(["select", "set", "reset"], listener);

      // Add polling fallback (every 1s) to ensure sync
      const pollTimer = setInterval(() => {
        // console.log("[BrushToolbar] Polling for updates...");
        sync();
      }, 1000);

      return () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        clearInterval(pollTimer);
        action.removeNotificationListener(["select", "set", "reset"], listener);
      };
    }, [sync]);

    // Handlers
    const handleSizeChange = useCallback(async (v: number) => {
      setSize(v);
      await setBrushSize(v);
    }, []);

    const handleOpacityChange = useCallback(async (v: number) => {
      setOpacity(v);
      await setBrushOpacity(v);
    }, []);

    const handleFlowChange = useCallback(async (v: number) => {
      setFlow(v);
      await setBrushFlow(v);
    }, []);

    const handleAngleChange = useCallback(async (v: number) => {
      setAngle(v);
      await setBrushAngle(v);
    }, []);

    const handleHardnessChange = useCallback(async (v: number) => {
      setHardness(v);
      await setBrushHardness(v);
    }, []);

    const handleSpacingChange = useCallback(async (v: number) => {
      setSpacing(v);
      await setBrushSpacing(v);
    }, []);

    const handleShapeDynamicsChange = useCallback(
      async (key: string, val: number) => {
        switch (key) {
          case "sizeJitter":
            setSizeJitter(val);
            break;
          case "minDiameter":
            setMinDiameter(val);
            break;
          case "angleJitter":
            setAngleJitter(val);
            break;
          case "roundnessJitter":
            setRoundnessJitter(val);
            break;
          case "minRoundness":
            setMinRoundness(val);
            break;
        }
        await setShapeDynamics(key, val);
      },
      []
    );

    return (
      <div className="property-panel">
        {/* Basic Properties */}
        <CollapsibleSection title={t("basic", "Basic")}>
          <Slider
            label={t("size", "大小")}
            value={size}
            onChange={handleSizeChange}
            min={1}
            max={500}
            unit="px"
          />
          <Slider
            label={t("angle", "角度")}
            value={angle}
            onChange={handleAngleChange}
            min={-180}
            max={180}
            unit="°"
          />
          <Slider
            label={t("opacity", "不透明度")}
            value={opacity}
            onChange={handleOpacityChange}
          />
          <Slider
            label={t("flow", "流量")}
            value={flow}
            onChange={handleFlowChange}
          />
        </CollapsibleSection>

        {/* Advanced Properties */}
        {showAdvanced && (
          <CollapsibleSection title={t("advanced", "Advanced")}>

            <Slider
              label={t("hardness", "硬度")}
              value={hardness}
              onChange={handleHardnessChange}
            />
            <Slider
              label={t("spacing", "间距")}
              value={spacing}
              onChange={handleSpacingChange}
              min={1}
              max={200}
            />
          </CollapsibleSection>
        )}

        {/* Shape Dynamics */}
        <CollapsibleSection
          title={t("shapeDynamics", "形状动态")}
          defaultOpen={false}
        >
          <Slider
            label={t("sizeJitter", "大小抖动")}
            value={sizeJitter}
            onChange={(v) => handleShapeDynamicsChange("sizeJitter", v)}
          />
          <Slider
            label={t("minDiameter", "最小直径")}
            value={minDiameter}
            onChange={(v) => handleShapeDynamicsChange("minDiameter", v)}
          />
          <Slider
            label={t("angleJitter", "角度抖动")}
            value={angleJitter}
            onChange={(v) => handleShapeDynamicsChange("angleJitter", v)}
          />
          <Slider
            label={t("roundnessJitter", "圆度抖动")}
            value={roundnessJitter}
            onChange={(v) => handleShapeDynamicsChange("roundnessJitter", v)}
          />
          <Slider
            label={t("minRoundness", "最小圆度")}
            value={minRoundness}
            onChange={(v) => handleShapeDynamicsChange("minRoundness", v)}
          />
        </CollapsibleSection>
      </div>
    );
  }
);
