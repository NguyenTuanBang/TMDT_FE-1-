import { useState, useRef, useEffect } from "react";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

const LanguageDropDown = ({ options, defaultValue = "vi", onChange }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.key === selected);

  const handleSelect = (key) => {
    setSelected(key);
    setOpen(false);
    if (onChange) onChange(key);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="min-w-32 flex items-center justify-between px-3 py-2 
        rounded-lg border border-gray-300 bg-white 
        text-gray-800 font-medium hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2">
          <GlobeAltIcon className="w-5 h-5 text-gray-600" />
          {selectedOption?.icon && <span>{selectedOption.icon}</span>}
          <span>{selectedOption?.label}</span>
        </div>
      </button>

      <div
        className={`absolute left-0 mt-2 w-40 bg-white text-gray-800 
          rounded-lg shadow-md border border-gray-200 z-50
          transform origin-top-right transition-all duration-200
          ${
            open
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }
        `}
      >
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => handleSelect(opt.key)}
            className="w-full text-left px-4 py-2 flex items-center gap-2 
            text-sm hover:bg-gray-100 transition rounded-md"
          >
            {opt.icon && <span>{opt.icon}</span>}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageDropDown;
