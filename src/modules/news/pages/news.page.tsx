import { FC, useEffect, useState } from "react";
import "./news.page.scss";

import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import useAuthStore from "../../../store/auth.store";
import CreateNewsComponent from "../components/create-news.component";
import { NewsCategory } from "../types/news-category.type";
import { newsCategoryService } from "../services/news-category.service";
import { useNavigate } from "react-router";

const NewsPage: FC = () => {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  useEffect(() => {
    newsCategoryService.getAll().then((res) => setCategories(res));
  }, []);

  return (
    <div className="news-page">
      <Sidebar />

      <main className="content">
        <h1>Новости</h1>

        {isAdmin && <CreateNewsComponent setCategories={setCategories} />}

        {categories.map((category) => {
          return (
            <section className="category" key={category.id}>
              <h2 className="category__title">{category.name}</h2>
              <p className="category__description">{category.description}</p>

              <div className="category__news-list news-list">
                {category.news.map((news) => {
                  if (isAdmin) {
                    return (
                      <article
                        className="news"
                        key={news.id}
                        onClick={() => navigate(`/news/${news.id}`)}
                      >
                        <h3>{news.title}</h3>
                        <p>Автор: {news.author}</p>
                      </article>
                    );
                  }

                  if (news.isApproved) {
                    return (
                      <article
                        className="news"
                        key={news.id}
                        onClick={() => navigate(`/news/${news.id}`)}
                      >
                        <h3>{news.title}</h3>
                        <p>Автор: {news.author}</p>
                      </article>
                    );
                  }
                })}
                <article
                  onClick={() =>
                    alert(
                      "Функционал пока что в разработке, дедлайн: 27.10.2025"
                    )
                  }
                  className="news news--create-btn"
                >
                  <p>Принести весточку</p>
                </article>
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default NewsPage;
