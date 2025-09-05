import { FC, ReactNode } from "react";

type Positioning = "left-top" | "right-top" | "right-bottom" | "left-bottom";

type Props = {
  children: ReactNode;
  position: Positioning;
};

const ModalMessage: FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};

export default ModalMessage;
