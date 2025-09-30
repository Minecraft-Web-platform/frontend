import { FC } from "react";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";

const NewsPage: FC = () => {
  return (
    <div className="news-page">
      <Sidebar />

      <main className="content">
        <h1>Новости</h1>
        <p>В стадии разработки...</p>
      </main>
    </div>
  );
};

export default NewsPage;
