import { FC, useEffect, useState } from "react";
import "./news.page.scss";

import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import useAuthStore from "../../../store/auth.store";
import CreateNewsCategoryComponent from "../components/create-news-category.component";
import { NewsCategory } from "../types/news-category.type";
import { newsCategoryService } from "../services/news-category.service";
import { useNavigate } from "react-router";
import CreateNewsModal from "../components/create-news.component";

const NewsPage: FC = () => {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  useEffect(() => {
    newsCategoryService.getAll().then((res) => setCategories(res));
  }, []);

  const openModal = (
    categoryId: string,
    publish_permission: "all" | "admins"
  ) => {
    if (!isAdmin && publish_permission === "admins") {
      alert("Отказано в доступе. Вы не администратор.");

      return;
    }

    setSelectedCategoryId(categoryId);
  };
  const closeModal = () => setSelectedCategoryId(null);

  return (
    <div className="news-page">
      <Sidebar />

      <main className="content">
        <h1>Новости</h1>

        {isAdmin && (
          <CreateNewsCategoryComponent setCategories={setCategories} />
        )}

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
                    openModal(category.id, category.publish_permission)
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

      {selectedCategoryId !== null && (
        <CreateNewsModal
          closeModal={closeModal}
          categoryId={selectedCategoryId}
        />
      )}
    </div>
  );
};

export default NewsPage;
