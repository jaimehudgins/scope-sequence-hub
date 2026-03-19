"use client";

import { useCalendarContext } from "@/hooks/useCalendarContext";

export default function Header() {
  const {
    currentRole,
    setCurrentRole,
    addToast,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useCalendarContext();

  const handleRoleChange = (role: "admin" | "teacher") => {
    setCurrentRole(role);
    if (role === "admin") {
      addToast("🔓 Admin mode — drag & drop enabled");
    } else {
      addToast("🔒 Teacher mode — view only");
    }
  };

  return (
    <div className="bg-surface border-b border-border px-8 py-[14px] flex items-center justify-between sticky top-0 z-[100]">
      <div className="flex items-center gap-4">
        <div className="font-serif text-[22px] font-bold text-text tracking-[-0.5px]">
          <span className="text-[#16a34a]">W</span> Willow
        </div>
        <div className="text-[14px] text-text-muted pl-4 border-l border-border">
          Scope & Sequence
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Undo/Redo buttons - only visible for admin when there's something to undo/redo */}
        {currentRole === "admin" && (canUndo || canRedo) && (
          <div className="flex items-center gap-1 mr-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[14px] transition-all
                ${
                  canUndo
                    ? "border-border bg-surface text-text-muted cursor-pointer hover:bg-bg hover:text-text"
                    : "border-transparent bg-transparent text-[#ddd] cursor-not-allowed"
                }`}
              title="Undo (Ctrl+Z)"
            >
              ↩
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[14px] transition-all
                ${
                  canRedo
                    ? "border-border bg-surface text-text-muted cursor-pointer hover:bg-bg hover:text-text"
                    : "border-transparent bg-transparent text-[#ddd] cursor-not-allowed"
                }`}
              title="Redo (Ctrl+Y)"
            >
              ↪
            </button>
          </div>
        )}

        <div className="flex bg-bg rounded-lg p-[3px] border border-border">
          <button
            onClick={() => handleRoleChange("admin")}
            className={`px-[14px] py-[6px] rounded-md border-none text-[13px] font-medium transition-all ${
              currentRole === "admin"
                ? "bg-surface text-text shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "bg-transparent text-text-muted"
            }`}
          >
            Admin View
          </button>
          <button
            onClick={() => handleRoleChange("teacher")}
            className={`px-[14px] py-[6px] rounded-md border-none text-[13px] font-medium transition-all ${
              currentRole === "teacher"
                ? "bg-surface text-text shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "bg-transparent text-text-muted"
            }`}
          >
            Teacher View
          </button>
        </div>
      </div>
    </div>
  );
}
