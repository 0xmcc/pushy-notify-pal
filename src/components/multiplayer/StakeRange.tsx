'use client';

import { Slider } from "@/components/ui/slider";

interface StakeRangeProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const StakeRange = ({ value, onChange }: StakeRangeProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Stake Range Filter</h2>
      <div className="space-y-2">
        <Slider
          defaultValue={value}
          max={1000}
          min={0}
          step={10}
          onValueChange={(value) => onChange(value as [number, number])}
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{value[0]} credits</span>
          <span>{value[1]} credits</span>
        </div>
      </div>
    </div>
  );
};