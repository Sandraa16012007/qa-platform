"use client";

import { useState, useEffect } from "react";
import { Edit3, X } from "lucide-react";

interface EditableTagsProps {
  title: string;
  tags: string[];
  onSave: (newTags: string[]) => void;
}

export default function EditableTags({ title, tags, onSave }: EditableTagsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [currentTags, setCurrentTags] = useState(tags);

  useEffect(() => {
    setCurrentTags(tags);
  }, [tags]);

  const handleAdd = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      const next = [...currentTags, tagInput.trim()];
      setCurrentTags(next);
      setTagInput("");
    }
  };

  const handleRemove = (tag: string) => {
    const next = currentTags.filter((t) => t !== tag);
    setCurrentTags(next);
  };

  const handleSave = () => {
    onSave(currentTags);
    setIsEditing(false);
  };

  return (
    <div className="neo-border bg-surface p-4 rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
            {title}
          </h4>
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="p-1 text-on-surface-variant hover:text-primary transition-all cursor-pointer"
          >
            {isEditing ? (
              <span className="text-[10px] font-bold text-primary uppercase">Save</span>
            ) : (
              <Edit3 size={12} />
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {currentTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-surface-container-low border border-outline text-[11px] text-on-surface px-2 py-0.5 rounded font-medium"
            >
              {tag}
              {isEditing && (
                <button
                  onClick={() => handleRemove(tag)}
                  className="text-magenta hover:text-on-surface transition-colors cursor-pointer"
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-1.5 mt-3 pt-2 border-t border-outline-variant">
          <input
            type="text"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="flex-1 bg-surface-container-low border border-outline rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="bg-primary text-on-primary-container px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded cursor-pointer"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
