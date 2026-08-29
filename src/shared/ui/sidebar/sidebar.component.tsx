import { FC } from "react";
import "./sidebar.component.scss";
import IconComponent from "./icon-component/icon-component.component";
import { useTranslation } from 'react-i18next';
import useAuthStore from "../../../store/auth.store";

import NewsIcon from "../../../assets/svg/news.svg?react";
import StateIcon from "../../../assets/svg/state.svg?react";
import CompanyIcon from "../../../assets/svg/company.svg?react";
import PlayersIcon from "../../../assets/svg/people.svg?react";
import MapIcon from "../../../assets/svg/map.svg?react";
import ProfileIcon from "../../../assets/svg/profile.svg?react";
import TechSupportIcon from "../../../assets/svg/contact.svg?react";
import DocsIcon from "../../../assets/svg/docs.svg?react";
import { Link } from "react-router";

const Sidebar: FC = () => {
  const { t } = useTranslation('navigation');
  const isBanned = useAuthStore((state) => state.isBanned);

  return (
    <aside className={`sidebar ${isBanned ? 'sidebar--banned' : ''}`}>
      <div className="sidebar__logo-block">
        <Link to="/" style={{ textDecoration: "none" }}>
          <p>{t('heading')}</p>
        </Link>
      </div>

      <div className="sidebar__middle">
        {!isBanned && (
          <>
            <IconComponent path="/news" label={t('buttons.news')} iconType="stroke">
              <NewsIcon />
            </IconComponent>

            <IconComponent path="/states" label="Государства" iconType="fill">
              <StateIcon />
            </IconComponent>

            <IconComponent path="/calendar" label="Календарь" iconType="fill">
              <span style={{ fontSize: '20px' }}>📅</span>
            </IconComponent>

            <IconComponent path="/economy" label="Экономика" iconType="fill">
              <CompanyIcon />
            </IconComponent>

            <IconComponent path="/players" label={t('buttons.players-list')} iconType="fill">
              <PlayersIcon />
            </IconComponent>

            <IconComponent
              path="/map"
              label={t('buttons.world-map')}
              iconType="fill"
            >
              <MapIcon />
            </IconComponent>
          </>
        )}
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
