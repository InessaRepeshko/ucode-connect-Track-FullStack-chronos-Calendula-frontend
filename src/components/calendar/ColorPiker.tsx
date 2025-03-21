import { Check } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const defaultColors = [
    '#AD1457', '#E4C441', '#0B8043', '#3F51B5', '#8E24AA',
    '#D81B60', '#C0CA33', '#009688', '#7986CB', '#795548',
    '#D50000', '#7CB342', '#039BE5', '#B39DDB', '#616161',
    '#E67C73', '#33B679', '#4285F4', '#9E69AF', '#A79B8E',
];

const colorNames = [
    "Beetroot", "Citron", "Basil", "Blueberry", "Grape",
    "Cherry blossom", "Avocado", "Eucalyptus", "Lavender", "Cocoa",
    "Tomato", "Pistachio", "Peacock", "Wisteria", "Graphite",
    "Flamingo", "Sage", "Cobalt", "Amethyst", "Birch",
];

export function ColorPicker({ selectedColor, onChange }: { selectedColor: string; onChange: (color: string) => void }) {
    return (
        <div className="grid grid-cols-5 gap-1">
            {defaultColors.map((color, index) => (
                <Tooltip key={color}>
                    <TooltipTrigger asChild>
                        <button
                            className="w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition hover:scale-110"
                            style={{ backgroundColor: color }}
                            onClick={() => onChange(color)}
                        >
                            {selectedColor === color && <Check className="text-white size-4 stroke-3" />}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {colorNames[index]}
                    </TooltipContent>
                </Tooltip>
            ))}
        </div>
    );
}