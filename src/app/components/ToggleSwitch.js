import React from "react";

const ToggleSwitch = ({ isToggled, onToggle, label }) => {
  return (
    <label className="flex items-center justify-center cursor-pointer gap-3">
      {/* Toggle Switch */}

      <div className="relative">
        {/* Hidden Checkbox */}
        <input
          type="checkbox"
          checked={isToggled}
          onChange={onToggle}
          className="sr-only"
        />
        {/* Background */}
        <div
          className={
            "block w-8 h-3 rounded-full shadow-md" +
            (isToggled ? " bg-blue-100" : " bg-gray-500")
          }
        ></div>
        {/* Dot */}
        <div
          className={`dot absolute shadow-md -top-1 -left-1 w-5 h-5 rounded-full transition border ${
            isToggled
              ? " transform translate-x-5 bg-blue-500 border-blue-100 "
              : " bg-gray-600 border-gray-300"
          }`}
        ></div>
      </div>
      <div
        className={
          "text-sm font-semibold opacity-70 " +
          (isToggled ? " text-blue-500" : " text-gray-500")
        }
      >
        {label}
      </div>
    </label>
  );
};

export default ToggleSwitch;
