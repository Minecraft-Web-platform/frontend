import { Dispatch, FC, SetStateAction } from "react";
import "./checkbox.component.scss";

type Props = {
  checked: boolean;
  setChecked: Dispatch<SetStateAction<boolean>>;
};

const Checkbox: FC<Props> = ({ checked, setChecked }) => {
  return (
    <div className="checkbox" onClick={() => setChecked((prev) => !prev)}>
      {checked && (
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 4 L3 6 L7 2"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
    </div>
  );
};

export default Checkbox;
