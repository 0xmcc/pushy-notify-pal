'use client';

import { Slider } from "@/components/ui/slider";

interface StakeRangeProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const StakeRange = ({ value, onChange }: StakeRangeProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gaming-text-primary">Stake Range Filter</h2>
      <div className="space-y-2">
        <Slider
          defaultValue={value}
          max={100}
          min={0}
          step={1}
          onValueChange={(value) => onChange(value as [number, number])}
          className="py-4"
        />
        <div className="flex justify-between text-sm text-gaming-text-secondary">
          <span>{value[0]} credits</span>
          <span>{value[1]} credits</span>
        </div>
      </div>
    </div>
  );
};