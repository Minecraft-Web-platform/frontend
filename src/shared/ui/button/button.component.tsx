import { FC, ReactNode } from "react";
import "./button.component.scss";

type Props = {
  children: ReactNode;
  callback?: () => void;
  disabled?: boolean;
  secondary?: boolean;
};

const Button: FC<Props> = ({
  children,
  callback = () => {},
  disabled = false,
  secondary = false,
}) => {
  const classNames = "button" + (secondary ? " button--secondary" : "");

  return (
    <button className={classNames} onClick={callback} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
