import cx from "classnames";

interface ButtonProps {
  icon?: any;
  bgColor?: string;
  textColor?: string;
  size?: "xs" | "sm" | "md" | "lg";
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  hasText?: boolean;
  alternativePadding?: string;
  gap?: string;
  position?: "start" | "end";
}

export const Button: React.FC<ButtonProps> = ({
  icon,
  bgColor = "bg-darkGrey",
  textColor = "text-white",
  size = "md",
  disabled = false,
  hasText = true,
  alternativePadding = "",
  gap = "gap-3",
  onClick,
  children,
  position = "start",
}) => {
  return (
    <button
      onClick={onClick}
      className={cx(
        `flex items-center
        ${size} text-${size} ${bgColor} ${alternativePadding}
        ${textColor} ${gap} rounded-lg`,
        {
          disabled: disabled,
          "flex-row-reverse": position === "end",
        }
      )}
    >
      <span>{icon}</span>
      {children}
    </button>
  );
};
