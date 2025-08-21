import { FC, ReactNode } from "react";
import "./button.component.scss";

type Props = {
  children: ReactNode;
  callback: () => void;
  disabled?: boolean;
};

const Button: FC<Props> = ({ children, callback, disabled = false }) => {
  return (
    <button className="button" onClick={callback} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
