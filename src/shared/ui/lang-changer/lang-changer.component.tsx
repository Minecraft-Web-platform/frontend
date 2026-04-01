import { Dispatch, SetStateAction, useState } from "react";
import i18n from "../../../i18n/i18n";
import './lang-changer.component.scss';

function changeLanguage(language: string, setter: Dispatch<SetStateAction<string>>) {
  i18n.changeLanguage(language);
  setter(language);
  
}

export const LangChanger = () => {
  const [lang, setLang] = useState(i18n.language);

  return (
    <div className="lang-changer">
      <button type="button" className={`btn lang-changer__btn${lang == 'ru' ? ' btn--chosen' : 'ru'}`} onClick={() => changeLanguage('ru', setLang)}>RU</button>
      <button type="button" className={`btn lang-changer__btn${lang == 'ua' ? ' btn--chosen' : 'ua'}`} onClick={() => changeLanguage('ua', setLang)}>UA</button>
      <button type="button" className={`btn lang-changer__btn${lang == 'pl' ? ' btn--chosen' : 'pl'}`} onClick={() => changeLanguage('pl', setLang)}>PL</button>
      <button type="button" className={`btn lang-changer__btn${lang == 'en' ? ' btn--chosen' : 'en'}`} onClick={() => changeLanguage('en', setLang)}>EN</button>
    </div>
  )
}

export default LangChanger;