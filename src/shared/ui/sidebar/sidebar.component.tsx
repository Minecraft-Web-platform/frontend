import { FC } from "react";
import "./sidebar.component.scss";
import IconComponent from "./icon-component/icon-component.component";

import NewsIcon from "../../../assets/svg/news.svg?react";
import StateIcon from "../../../assets/svg/state.svg?react";
import CompanyIcon from "../../../assets/svg/company.svg?react";
import PlayersIcon from "../../../assets/svg/people.svg?react";
import MapIcon from "../../../assets/svg/map.svg?react";
import ProfileIcon from "../../../assets/svg/profile.svg?react";
import TechSupportIcon from "../../../assets/svg/contact.svg?react";
import DocsIcon from "../../../assets/svg/docs.svg?react";

const Sidebar: FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo-block">
        <p>Хроники Края</p>
      </div>

      <div className="sidebar__middle">
        <IconComponent path="/news" label="Новости" iconType="stroke">
          <NewsIcon />
        </IconComponent>

        <IconComponent path="/news" label="Государства" iconType="fill">
          <StateIcon />
        </IconComponent>

        <IconComponent path="/news" label="Фирмы" iconType="fill">
          <CompanyIcon />
        </IconComponent>

        <IconComponent path="/news" label="Список игроков" iconType="fill">
          <PlayersIcon />
        </IconComponent>

        <IconComponent path="/news" label="Карта мира" iconType="fill">
          <MapIcon />
        </IconComponent>
      </div>

      <div className="sidebar__bottom">
        <IconComponent path="/profile" label="Профиль" iconType="fill">
          <ProfileIcon />
        </IconComponent>

        <IconComponent path="/news" label="Техподдержка" iconType="fill">
          <TechSupportIcon />
        </IconComponent>

        <IconComponent path="/news" label="Регламенты" iconType="stroke">
          <DocsIcon />
        </IconComponent>
      </div>
    </aside>
  );
};

export default Sidebar;
