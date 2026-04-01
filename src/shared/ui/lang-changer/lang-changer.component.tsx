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

  return (
    <div className="lang-changer">
     {isOpened ? (
      <div className="btns">
        <button
          type="button"
          className={`btn lang-changer__btn${lang == 'ru' ? ' btn--chosen' : 'ru'}`}
          onClick={() => changeLanguage('ru', setLang)}
        >
          RU
        </button>

        <button
          type="button"
          className={`btn lang-changer__btn${lang == 'ua' ? ' btn--chosen' : 'ua'}`}
          onClick={() => changeLanguage('ua', setLang)}
        >
          UA
        </button>

        <button
          type="button"
          className={`btn lang-changer__btn${lang == 'pl' ? ' btn--chosen' : 'pl'}`}
          onClick={() => changeLanguage('pl', setLang)}
        >
          PL
        </button>

        <button
          type="button"
          className={`btn lang-changer__btn${lang == 'en' ? ' btn--chosen' : 'en'}`}
          onClick={() => changeLanguage('en', setLang)}
        >
          EN
        </button>

        <button
          type="button"
          className={`btn lang-changer__btn${lang == 'kz' ? ' btn--chosen' : 'kz'}`}
        >
          KZ
        </button>

        <button
          type="button"
          className={`btn lang-changer__btn${lang == 'uz' ? ' btn--chosen' : 'uz'}`}
        >
          UZ
        </button>
      </div>
    ) : (
      <button
        type="button"
        className="btn lang-changer__btn btn--chosen"
      >
        {lang.toLocaleUpperCase()}
      </button>
      )
    }
      
      <button type="button" className={`btn lang-changer__btn${lang == 'en' ? ' btn--chosen' : 'en'}`} onClick={() => setIsOpened(v => !v)}>{isOpened ? '-' : '+'}</button>
    </div>
  )
}

export default LangChanger;