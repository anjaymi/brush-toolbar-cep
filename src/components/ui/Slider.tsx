/**
 * Slider.tsx
 * UXP 兼容滑块组件 - 使用 Spectrum sp-slider
 */
import React, { useRef, useEffect, useCallback } from "react";

export interface SliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

/**
 * UXP Spectrum Slider 封装
 * 使用原生 <sp-slider> 组件，确保 thumb 正常渲染
 */
export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
}) => {
  const sliderRef = useRef<HTMLElement>(null);
  const isInternalChange = useRef(false);

  // 处理 Spectrum slider 的 input 事件
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const newValue = Number(target.value);
      if (!isInternalChange.current) {
        onChange(newValue);
      }
    };

    slider.addEventListener("input", handleInput);
    return () => slider.removeEventListener("input", handleInput);
  }, [onChange]);

  // 同步外部 value 到 slider
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      isInternalChange.current = true;
      (slider as any).value = value;
      isInternalChange.current = false;
    }
  }, [value]);

  return (
    <div style={{ marginBottom: "12px" }}>
      {/* Header: Label + Value */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        marginBottom: "4px",
        fontSize: "12px"
      }}>
        <span style={{ color: "#a1a1aa" }}>{label}</span>
        <span style={{ color: "#3b82f6", fontWeight: 500 }}>{Math.round(value)}{unit}</span>
      </div>
      
      {/* Spectrum Slider */}
      <sp-slider
        ref={sliderRef}
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ width: "100%" }}
      />
    </div>
  );
};

// 声明 Spectrum Web Component 类型
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "sp-slider": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          min?: number;
          max?: number;
          step?: number;
          value?: number;
          variant?: string;
          disabled?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export default Slider;
