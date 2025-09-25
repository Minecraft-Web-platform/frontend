import {
  ChangeEvent,
  Dispatch,
  FC,
  HTMLInputTypeAttribute,
  SetStateAction,
} from "react";
import "./input.component.scss";

type Props = {
  value: string;
  setValue?: Dispatch<SetStateAction<string>>;
  placeholder: string;
  element: "input" | "textarea";
  type?: HTMLInputTypeAttribute;
  label?: string;
  disabled?: boolean;
};

const Input: FC<Props> = ({
  value,
  setValue,
  placeholder,
  label,
  element,
  type = "text",
  disabled = false,
}) => {
  const handlerOnChange = setValue
    ? (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValue(e.target.value)
    : () => {};

  return (
    <div className="input-field">
      {label ? <label>{label}</label> : <></>}

      {element === "input" && (
        <input
          className="input"
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={handlerOnChange}
          disabled={disabled}
        />
      )}

      {element === "textarea" && (
        <textarea
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={handlerOnChange}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default Input;
