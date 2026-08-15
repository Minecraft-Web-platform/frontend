import { FC, useEffect, useState } from "react";
import "./create-news.category.scss";
import Input from "../../../shared/ui/input/input.component";
import { newsCategoryService } from "../services/news-category.service";
import { newsService } from "../services/news.service";
import { NewsBlock } from "../types/news-block.type";
import Button from "../../../shared/ui/button/button.component";
import { ImageUploader } from "../../../shared/ui/image-uploader/ImageUploader";

type Props = {
  closeModal: () => void;
  categoryId: string;
};

const CreateNewsModal: FC<Props> = ({ closeModal, categoryId }) => {
  const [newsTitle, setNewsTitle] = useState("");
  const [categoryName, setCategoryName] = useState("Загрузка...");
  const [blocks, setBlocks] = useState<NewsBlock[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    newsCategoryService
      .getOne(categoryId)
      .then((cat) => setCategoryName(cat.name));
    return () => {
      document.body.style.overflow = "";
    };
  }, [categoryId]);

  const addBlock = (type: "text" | "image") => {
    const newBlock: NewsBlock = {
      id: crypto.randomUUID(),
      type,
      content: "",
      order: blocks.length,
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) =>
      prev.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i }))
    );
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  // customUploadFn is inline
  const handleSubmit = async () => {
    if (!newsTitle.trim() || blocks.length === 0) {
      alert("Введите заголовок и добавьте хотя бы один блок");
      return;
    }

    setIsSubmitting(true);

    try {
      await newsService.create({
        title: newsTitle,
        categoryId,
        blocks: blocks.map((b, i) => ({
          type: b.type,
          content: b.content,
          order: i,
        })),
      });
      setShowSuccess(true);
    } catch (err: any) {
      alert("Ошибка при создании новости");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="create-news-modal-wrap">
        <div className="create-news-modal">
          <h2>✅ Новость отправлена на модерацию!</h2>
          <button onClick={closeModal}>Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-news-modal-wrap">
      <div className="create-news-modal">
        <button className="close-btn" onClick={closeModal}>
          ✕
        </button>

        <h1>Новая новость</h1>
        <p>В категории: {categoryName}</p>

        <Input
          value={newsTitle}
          setValue={setNewsTitle}
          element="input"
          placeholder="Заголовок новости"
        />

        <div className="blocks">
          {blocks.map((block) => (
            <div className="block" key={block.id}>
              <div className="block-header">
                <strong>
                  {block.type === "text" ? "Текстовый блок" : "Изображение"}
                </strong>

                <button onClick={() => removeBlock(block.id)}>✕</button>
              </div>

              {block.type === "text" ? (
                <textarea
                  placeholder="Введите текст..."
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                />
              ) : (
                <ImageUploader
                  label={block.content ? "" : "Загрузить изображение"}
                  value={block.content}
                  onChange={(url) => updateBlockContent(block.id, url as string)}
                  customUploadFn={async (file) => {
                    const { url } = await newsService.uploadImage(file);
                    return url;
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="add-buttons">
          <Button callback={() => addBlock("text")} secondary>
            + Текст
          </Button>
          <Button callback={() => addBlock("image")} secondary>
            🖼 Картинка
          </Button>
        </div>

        <Button disabled={isSubmitting} callback={handleSubmit}>
          {isSubmitting ? "Публикуем..." : "Опубликовать"}
        </Button>
      </div>
    </div>
  );
};

export default CreateNewsModal;
