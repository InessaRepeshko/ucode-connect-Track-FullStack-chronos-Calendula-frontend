import {  Check } from "lucide-react";

const defaultColors = [
    "#D50000", "#F4511E", "#0B8043", "#3F51B5",
    "#795548", "#607D8B", "#373797", "#8A2BE2",
    "#813123", "#C71585", "#b58230", "#008B8B",
    "#6A5ACD", "#A52A2A", "#800080", "#000080",
    "#394a13", "#2F4F4F", "#63511e", "#235275"
];

export function ColorPicker({ selectedColor, onChange }: { selectedColor: string; onChange: (color: string) => void }) {
    return (
        <div className="grid grid-cols-5 gap-1">
            {defaultColors.map((color) => (
                <button
                    key={color}
                    className="w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition hover:scale-110"
                    style={{ backgroundColor: color }}
                    onClick={() => onChange(color)}
                >
                    {selectedColor === color && <Check className="text-white size-4 stroke-3" />}
                </button>
            ))}
        </div>
    );
}
