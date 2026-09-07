import { Dispatch, SetStateAction, useState } from "react";
import i18n from "../../../i18n/i18n";
import './lang-changer.component.scss';

function changeLanguage(language: string, setter: Dispatch<SetStateAction<string>>) {
  i18n.changeLanguage(language);
  setter(language);
}

export const LangChanger = () => {
  const [lang, setLang] = useState(i18n.language);
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const activeLang = (lang === 'uk' || lang === 'ua') ? 'ua' : (lang === 'kk' || lang === 'kz') ? 'kz' : lang;

  return (
    <div className="lang-changer">
     {isOpened ? (
      <div className="btns">
        <button
          type="button"
          className={`btn lang-changer__btn${activeLang === 'ru' ? ' btn--chosen' : ''}`}
          onClick={() => changeLanguage('ru', setLang)}
        >
          RU
        </button>

        <button
          type="button"
          className={`btn lang-changer__btn${activeLang === 'ua' ? ' btn--chosen' : ''}`}
          onClick={() => changeLanguage('ua', setLang)}
        >
          UA
        </button>

        <button
          type="button"
          className={`btn lang-changer__btn${activeLang === 'pl' ? ' btn--chosen' : ''}`}
          onClick={() => changeLanguage('pl', setLang)}
        >
          PL
        </button>

        <button
          type="button"
          className={`btn lang-changer__btn${activeLang === 'en' ? ' btn--chosen' : ''}`}
          onClick={() => changeLanguage('en', setLang)}
        >
          EN
        </button>

        <button
          type="button"
          className={`btn lang-changer__btn${activeLang === 'kz' ? ' btn--chosen' : ''}`}
          onClick={() => changeLanguage('kz', setLang)}
        >
          KZ
        </button>

        <button
          type="button"
          className={`btn lang-changer__btn${activeLang === 'uz' ? ' btn--chosen' : ''}`}
        >
          UZ
        </button>
      </div>
    ) : (
      <button
        type="button"
        className="btn lang-changer__btn btn--chosen"
        onClick={() => setIsOpened(v => !v)}
      >
        {(activeLang || 'ru').toLocaleUpperCase()}
      </button>
      )
    }
      
      <button
        type="button"
        className="btn lang-changer__btn"
        onClick={() => setIsOpened(v => !v)}
      >
        {isOpened ? '-' : '+'}
      </button>
    </div>
  )
}

export default LangChanger;