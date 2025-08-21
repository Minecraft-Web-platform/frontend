import { Dispatch, FC, SetStateAction } from "react";
import "./input.component.scss";

type Props = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  placeholder: string;
  label?: string;
};

const Input: FC<Props> = ({ value, setValue, placeholder, label }) => {
  return (
    <div className="input-field">
      {label ? <label>{label}</label> : <></>}

      <input
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default Input;
