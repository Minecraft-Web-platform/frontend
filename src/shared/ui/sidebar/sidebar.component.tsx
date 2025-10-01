import { FC } from "react";
import "./sidebar.component.scss";
import IconComponent from "./icon-component/icon-component.component";

// import NewsIcon from "../../../assets/svg/news.svg?react";
// import StateIcon from "../../../assets/svg/state.svg?react";
// import CompanyIcon from "../../../assets/svg/company.svg?react";
import PlayersIcon from "../../../assets/svg/people.svg?react";
import MapIcon from "../../../assets/svg/map.svg?react";
import CreeperIcon from "../../../assets/svg/creeper.svg?react";
import ProfileIcon from "../../../assets/svg/profile.svg?react";
import TechSupportIcon from "../../../assets/svg/contact.svg?react";
import DocsIcon from "../../../assets/svg/docs.svg?react";
import { Link } from "react-router";

const Sidebar: FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo-block">
        <Link to="/" style={{ textDecoration: "none" }}>
          <p>Хроники Края</p>
        </Link>
      </div>

      <div className="sidebar__middle">
        {/* <IconComponent path="/news" label="Новости" iconType="stroke">
          <NewsIcon />
        </IconComponent> */}

        {/* <IconComponent path="/states" label="Государства" iconType="fill">
          <StateIcon />
        </IconComponent>

        <IconComponent path="/companies" label="Фирмы" iconType="fill">
          <CompanyIcon />
        </IconComponent> */}

        <IconComponent path="/players" label="Список игроков" iconType="fill">
          <PlayersIcon />
        </IconComponent>

        <IconComponent
          path="http://146.19.48.158:25900"
          label="Карта мира"
          iconType="fill"
        >
          <MapIcon />
        </IconComponent>

        <IconComponent
          path="/download"
          label="Скачать сборку и лаунчер"
          iconType="fill"
        >
          <CreeperIcon />
        </IconComponent>
      </div>

      <div className="sidebar__bottom">
        <IconComponent path="/profile" label="Профиль" iconType="fill">
          <ProfileIcon />
        </IconComponent>

        <IconComponent
          path="/tech-support"
          label="Техподдержка"
          iconType="fill"
        >
          <TechSupportIcon />
        </IconComponent>

        <IconComponent path="/agreement" label="Регламенты" iconType="stroke">
          <DocsIcon />
        </IconComponent>
      </div>
    </aside>
  );
};

export default Sidebar;
