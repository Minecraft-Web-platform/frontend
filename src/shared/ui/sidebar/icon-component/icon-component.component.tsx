import classNames from "classnames";
import { FC, ReactNode } from "react";
import { Link } from "react-router-dom";
import "./icon-component.component.scss";

type Props = {
  path: string;
  label: string;
  children: ReactNode;
  iconType: "fill" | "stroke";
};

const IconComponent: FC<Props> = ({ path, label, children, iconType }) => {
  const currentPath = "/" + location.pathname.split("/")[1];

  return (
    <Link
      key={path}
      to={path}
      className={classNames(
        "navigation__link",
        path === currentPath && "navigation__link--active",
        `navigation__link--change-${iconType}`
      )}
    >
      {children} <span>{label}</span>
    </Link>
  );
};

export default IconComponent;
