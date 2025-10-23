import { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { newsService } from "../services/news.service";
import { News } from "../types/news.type";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import useAuthStore from "../../../store/auth.store";
import Button from "../../../shared/ui/button/button.component";

const NewsDetailsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuthStore();

  useEffect(() => {
    if (!id) return;
    newsService
      .getOne(id)
      .then((res) => setNews(res))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="news-details-page">
      <Sidebar />

      {loading && <p>Загрузка новости...</p>}

      {!loading && !news && <p>Новость не найдена 😢</p>}

      {!loading && news && (
        <main className="content">
          <div className="news-details">
            <h1 className="news-details__title">{news.title}</h1>

            <section className="news-details__blocks">
              {news.blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => {
                  if (block.type === "text") {
                    return (
                      <p key={block.id} className="news-block news-block--text">
                        {block.content}
                      </p>
                    );
                  }

                  if (block.type === "image") {
                    return (
                      <img
                        key={block.id}
                        src={block.content}
                        alt="news-block"
                        className="news-block news-block--image"
                      />
                    );
                  }

                  return null;
                })}
            </section>
          </div>

          <div className="news-meta">
            <p>
              <b>Категория:</b> {news.category.name}
            </p>
            <p>
              <b>Автор:</b>{" "}
              <Link
                style={{ textDecoration: "none", color: "black" }}
                to={`/players/${news.author}`}
              >
                {news.author}
              </Link>
            </p>
            <p>
              <b>Дата публикации: </b>
              {new Date(news.created_at).toLocaleDateString("uk-UA")}
            </p>

            {isAdmin && (
              <>
                <p>
                  <b>Статус:</b> {news.isApproved ? "Одобрена" : "Не одобрена"}
                </p>

                {!news.isApproved && (
                  <Button callback={() => newsService.approve(news.id)}>
                    Одобрить
                  </Button>
                )}
              </>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export default NewsDetailsPage;
