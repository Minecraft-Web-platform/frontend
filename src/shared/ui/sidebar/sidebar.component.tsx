import { FC } from "react";
import "./sidebar.component.scss";
import IconComponent from "./icon-component/icon-component.component";
import { useTranslation } from 'react-i18next';

import NewsIcon from "../../../assets/svg/news.svg?react";
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
  const { t } = useTranslation('navigation');

  return (
    <aside className="sidebar">
      <div className="sidebar__logo-block">
        <Link to="/" style={{ textDecoration: "none" }}>
          <p>{t('heading')}</p>
        </Link>
      </div>

      <div className="sidebar__middle">
        <IconComponent path="/news" label={t('buttons.news')} iconType="stroke">
          <NewsIcon />
        </IconComponent>

        {/* <IconComponent path="/states" label="Государства" iconType="fill">
          <StateIcon />
        </IconComponent>

        <IconComponent path="/companies" label="Фирмы" iconType="fill">
          <CompanyIcon />
        </IconComponent> */}

        <IconComponent path="/players" label={t('buttons.players-list')} iconType="fill">
          <PlayersIcon />
        </IconComponent>

        <IconComponent
          path="http://5.83.140.252:25900/#world:1949:85:1568:0:-0.8:1.07:0:0:free"
          label={t('buttons.world-map')}
          iconType="fill"
        >
          <MapIcon />
        </IconComponent>

        <IconComponent
          path="/download"
          label={t('buttons.download-page')}
          iconType="fill"
        >
          <CreeperIcon />
        </IconComponent>
      </div>

      <div className="sidebar__bottom">
        <IconComponent path="/profile" label={t('buttons.profile')} iconType="fill">
          <ProfileIcon />
        </IconComponent>

        <IconComponent
          path="/tech-support"
          label={t('buttons.tech-support')}
          iconType="fill"
        >
          <TechSupportIcon />
        </IconComponent>

        <IconComponent path="/agreement" label={t('buttons.regulations')} iconType="stroke">
          <DocsIcon />
        </IconComponent>
      </div>
    </aside>
  );
};

export default Sidebar;
