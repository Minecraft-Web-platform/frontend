import { FC, ReactNode } from "react";
import "./button.component.scss";

type Props = {
  children: ReactNode;
  callback?: () => void;
  disabled?: boolean;
  secondary?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
};

const Button: FC<Props> = ({
  children,
  callback = () => {},
  disabled = false,
  secondary = false,
  type = "submit",
  style,
}) => {
  const classNames = "button" + (secondary ? " button--secondary" : "");

  return (
    <button
      className={classNames}
      onClick={callback}
      disabled={disabled}
      type={type}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
