import { FC, useState, useEffect, useRef } from "react";
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
import CalendarIcon from "../../../assets/svg/calendar.svg?react";
import { Link, useLocation } from "react-router";

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const Sidebar: FC = () => {
  const { t } = useTranslation('navigation');
  const isBanned = useAuthStore((state) => state.isBanned);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className={`sidebar ${isBanned ? 'sidebar--banned' : ''}`} ref={menuRef}>
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
            
            <div className="sidebar__desktop-only">
              <IconComponent path="/states" label={t('buttons.states')} iconType="fill">
                <StateIcon />
              </IconComponent>
              <IconComponent path="/calendar" label={t('buttons.calendar')} iconType="stroke">
                <CalendarIcon />
              </IconComponent>
            </div>

            <IconComponent path="/economy" label={t('buttons.economy')} iconType="fill">
              <CompanyIcon />
            </IconComponent>

            <IconComponent path="/players" label={t('buttons.players-list')} iconType="fill">
              <PlayersIcon />
            </IconComponent>

            <IconComponent path="/map" label={t('buttons.world-map')} iconType="fill">
              <MapIcon />
            </IconComponent>
          </>
        )}
      </div>

      <div className="sidebar__bottom sidebar__desktop-only">
        <IconComponent path="/profile" label={t('buttons.profile')} iconType="fill">
          <ProfileIcon />
        </IconComponent>
        <IconComponent path="/tech-support" label={t('buttons.tech-support')} iconType="fill">
          <TechSupportIcon />
        </IconComponent>
        <IconComponent path="/agreement" label={t('buttons.regulations')} iconType="stroke">
          <DocsIcon />
        </IconComponent>
      </div>

      {!isBanned && (
        <>
          <button 
            className={`sidebar__more-btn ${isMoreMenuOpen ? 'sidebar__more-btn--active' : ''}`} 
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          >
            <MenuIcon />
            <span>Еще</span>
          </button>

          {isMoreMenuOpen && (
            <div className="sidebar__mobile-menu">
              <IconComponent path="/profile" label={t('buttons.profile')} iconType="fill">
                <ProfileIcon />
              </IconComponent>
              <IconComponent path="/states" label={t('buttons.states')} iconType="fill">
                <StateIcon />
              </IconComponent>
              <IconComponent path="/calendar" label={t('buttons.calendar')} iconType="stroke">
                <CalendarIcon />
              </IconComponent>
              <IconComponent path="/tech-support" label={t('buttons.tech-support')} iconType="fill">
                <TechSupportIcon />
              </IconComponent>
              <IconComponent path="/agreement" label={t('buttons.regulations')} iconType="stroke">
                <DocsIcon />
              </IconComponent>
            </div>
          )}
        </>
      )}
    </aside>
  );
};

export default Sidebar;
