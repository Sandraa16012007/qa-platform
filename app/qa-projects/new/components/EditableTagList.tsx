"use client";

import { useState } from "react";
import { Edit3, X, Plus } from "lucide-react";

interface EditableTagListProps {
  items: string[];
  onChange: (items: string[]) => void;
  color?: "primary" | "magenta" | "yellow";
}

export default function EditableTagList({
  items,
  onChange,
  color = "primary",
}: EditableTagListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");

  const colorStyles = {
    primary: "bg-cyan-dim border-cyan/20 text-primary",
    magenta: "bg-magenta-dim border-magenta/20 text-magenta",
    yellow: "bg-yellow-dim border-yellow/20 text-yellow",
  };

  const handleAdd = () => {
    if (newTag.trim() && !items.includes(newTag.trim())) {
      onChange([...items, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemove = (tag: string) => {
    onChange(items.filter((i) => i !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-2 py-0.5 rounded ${colorStyles[color]}`}
          >
            {item}
            {isEditing && (
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="hover:text-on-surface transition-colors cursor-pointer"
              >
                <X size={10} />
              </button>
            )}
          </span>
        ))}
      </div>

      {isEditing && (
        <div className="flex gap-1 pt-1">
          <input
            type="text"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
            className="bg-surface-container-low border border-outline rounded text-[10px] text-on-surface px-2 py-1 focus:outline-none focus:border-primary flex-1"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="bg-primary text-on-primary-container px-2 py-1 text-[9px] font-bold uppercase rounded cursor-pointer"
          >
            <Plus size={10} />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsEditing(!isEditing)}
        className="text-[10px] text-text-muted hover:text-primary mt-1 flex items-center gap-1 cursor-pointer transition-colors uppercase font-semibold tracking-wider"
      >
        <Edit3 size={10} />
        {isEditing ? "Done" : "Edit Tags"}
      </button>
    </div>
  );
}
