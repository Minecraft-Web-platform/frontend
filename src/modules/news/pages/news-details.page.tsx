import { FC, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./news.page.scss";
import { newsService } from "../services/news.service";
import { News } from "../types/news.type";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import useAuthStore from "../../../store/auth.store";
import Button from "../../../shared/ui/button/button.component";
import { useTranslation } from "react-i18next";

const NewsDetailsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation("news");

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

      {loading && (
        <main className="content">
          <p style={{ textAlign: "center", fontSize: "20px", marginTop: "40px" }}>{t("news.details.loading")}</p>
        </main>
      )}

      {!loading && !news && (
        <main className="content">
          <p style={{ textAlign: "center", fontSize: "20px", marginTop: "40px" }}>{t("news.details.notFound")}</p>
        </main>
      )}

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
              <b>{t("news.details.category")}</b> {news.category.name}
            </p>
            <p>
              <b>{t("news.details.author")}</b>{" "}
              <Link
                style={{ textDecoration: "none", color: "black" }}
                to={`/players/${news.author}`}
              >
                {news.author}
              </Link>
            </p>
            <p>
              <b>{t("news.details.date")} </b>
              {new Date(news.created_at).toLocaleDateString("uk-UA")}
            </p>

            {isAdmin && (
              <>
                <p>
                  <b>{t("news.details.statusLabel")}</b> {news.isApproved ? t("news.status.approved") : t("news.status.notApproved")}
                </p>

                {!news.isApproved && (
                  <Button callback={() => newsService.approve(news.id)}>
                    {t("news.details.approveBtn")}
                  </Button>
                )}

                <Button
                  callback={() =>
                    newsService.remove(news.id).then(() => navigate("/news"))
                  }
                  secondary
                >
                  {t("news.details.deleteBtn")}
                </Button>
              </>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export default NewsDetailsPage;
