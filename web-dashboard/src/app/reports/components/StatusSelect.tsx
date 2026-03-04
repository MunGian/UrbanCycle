import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusSelectProps {
  currentStatus: string;
  onStatusUpdate: (newStatus: "Pending" | "In Progress" | "Resolved") => void;
}

export function StatusSelect({
  currentStatus,
  onStatusUpdate,
}: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const options = [
    {
      label: "Mark as Pending",
      value: "Pending",
      color: "text-yellow-600",
    },
    {
      label: "Mark as In Progress",
      value: "In Progress",
      color: "text-blue-600",
    },
    {
      label: "Mark as Resolved",
      value: "Resolved",
      color: "text-green-600",
    },
  ] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 active:bg-gray-950 transition-all shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-none hover:cursor-pointer min-w-[140px]"
      >
        Update Status
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 opacity-70 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute md:right-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 p-1 z-[9999] animate-in fade-in zoom-in-95 duration-100 origin-bottom-right">
          {options.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                onStatusUpdate(item.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left flex items-center gap-2 cursor-pointer font-medium py-2.5 px-3 rounded-md transition-colors hover:bg-gray-50",
                item.color,
                currentStatus === item.value &&
                  "bg-gray-200 ring-1 ring-gray-200",
              )}
            >
              {item.label}
              {currentStatus === item.value && (
                <span className="ml-auto text-xs font-bold bg-gray-300 px-1.5 py-0.5 rounded text-gray-700">
                  Current
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
