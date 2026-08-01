import { FC, ReactNode } from "react";
import "./button.component.scss";

type Props = {
  children: ReactNode;
  callback?: () => void;
  disabled?: boolean;
  secondary?: boolean;
  type?: "button" | "submit" | "reset";
};

const Button: FC<Props> = ({
  children,
  callback = () => {},
  disabled = false,
  secondary = false,
  type = "submit",
}) => {
  const classNames = "button" + (secondary ? " button--secondary" : "");

  return (
    <button
      className={classNames}
      onClick={callback}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
