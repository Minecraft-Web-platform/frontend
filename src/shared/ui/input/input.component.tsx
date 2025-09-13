import { Dispatch, FC, HTMLInputTypeAttribute, SetStateAction } from "react";
import "./input.component.scss";

type Props = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  label?: string;
};

const Input: FC<Props> = ({
  value,
  setValue,
  placeholder,
  label,
  type = "text",
}) => {
  return (
    <div className="input-field">
      {label ? <label>{label}</label> : <></>}

      <input
        className="input"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default Input;
