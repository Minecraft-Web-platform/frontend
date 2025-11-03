import { FC } from "react";
import "./landing.page.scss";
import { Link } from "react-router";

const LandingPage: FC = () => {
  return (
    <>
      <header className="header">
        <h1>Хроники края</h1>
        <p>Погрузись в мир приключений</p>

        <Link className="header__link-to-auth" to="/registration">
          Играть
        </Link>

        <a
          className="header__link-to-online-map"
          href="http://5.83.140.252:25900"
        >
          Онлайн-карта
        </a>
      </header>

      <main className="main">
        <h1>Что мы за парни такие?</h1>

        <section className="main__section">
          <img src="/png/creeper.png" className="img-small-left" />

          <p className="left">
            Мы те самые, которые стараются строить красиво, практично и с
            историей. Сегодня делаем так, чтобы было приятно играть завтра.
            Возведя строения в одном стиле, мы добиваемся гармонирующего вида.
          </p>

          <img
            src="/png/city.png"
            alt="Merida city"
            className="img-large-right"
          />
        </section>

        <section className="main__section">
          <img
            src="/png/factory.png"
            alt="factory SteelFactories"
            className="img-large-left"
          />

          <p className="right">
            Фокусируемся также на производстве и фермах всех видов, а именно:
            <br />
            <br />- Металлы
            <br />
            <br />- Камни и строительны вещи
            <br />
            <br />- Еда и другие полезности
          </p>

          <img src="/png/island_1.png" className="img-small-right" />
        </section>

        <section className="main__section">
          <img src="/png/island_2.png" className="img-small-left" />

          <p className="left">Также не забываем о удобной логистике</p>

          <img
            src="/png/train.png"
            alt="train station"
            className="img-large-right"
          />
        </section>

        <section className="main__section">
          <img src="/png/party.png" alt="party" className="img-large-left" />

          <p className="right">
            А самое главное, что мы проводим приятное время и очень трепетно
            относимся к жабам &lt;3
          </p>

          <img src="/png/island_3.png" className="img-small-right" />
        </section>
      </main>

      <footer className="footer">
        <img src="/png/skeleton.png" alt="Skeleton" height={64} />

        <div className="footer__links">
          <span>
            Discord:{" "}
            <a href="https://discord.gg/4FZzbqXvZf">
              https://discord.gg/4FZzbqXvZf
            </a>
          </span>

          <span>
            Онлайн карта:{" "}
            <a href="http://146.19.48.158:25900?worldname=world&mapname=surface&zoom=4">
              146.19.48.158:25900
            </a>
          </span>

          <span>Айпи сервера: mc.khroniki-kraya.com</span>
        </div>

        <img src="/png/steve.png" alt="Steve" height={64} />
      </footer>
    </>
  );
};

export default LandingPage;
