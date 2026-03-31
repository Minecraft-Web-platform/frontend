import { Dispatch, SetStateAction, useState } from "react";
import i18n from "../../../i18n/i18n";
import './lang-changer.component.scss';

function changeLanguage(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, language: string, setter: Dispatch<SetStateAction<string>>) {
  event.preventDefault();

  i18n.changeLanguage(language);
  setter(language);
  
}

export const LangChanger = () => {
  const [lang, setLang] = useState(i18n.language);

  return (
    <div className="lang-changer">
      <button className={`btn lang-changer__btn${lang == 'ru' ? ' btn--chosen' : 'ru'}`} onClick={e => changeLanguage(e, 'ru', setLang)}>RU</button>
      <button className={`btn lang-changer__btn${lang == 'ua' ? ' btn--chosen' : 'ua'}`} onClick={e => changeLanguage(e, 'ua', setLang)}>UA</button>
      <button className={`btn lang-changer__btn${lang == 'pl' ? ' btn--chosen' : 'pl'}`} onClick={e => changeLanguage(e, 'pl', setLang)}>PL</button>
      <button className={`btn lang-changer__btn${lang == 'en' ? ' btn--chosen' : 'en'}`} onClick={e => changeLanguage(e, 'en', setLang)}>EN</button>
    </div>
  )
}

export default LangChanger;