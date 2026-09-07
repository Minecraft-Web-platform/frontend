import {  } from 'axios';
import { FC, useEffect, useState } from "react";
import "./create-news.category.scss";
import Input from "../../../shared/ui/input/input.component";
import { newsCategoryService } from "../services/news-category.service";
import { newsService } from "../services/news.service";
import { NewsBlock } from "../types/news-block.type";
import Button from "../../../shared/ui/button/button.component";
import { ImageUploader } from "../../../shared/ui/image-uploader/ImageUploader";
import { useTranslation } from "react-i18next";

type Props = {
  closeModal: () => void;
  categoryId: string;
};

const CreateNewsModal: FC<Props> = ({ closeModal, categoryId }) => {
  const { t } = useTranslation("news");
  const [newsTitle, setNewsTitle] = useState("");
  const [categoryName, setCategoryName] = useState(t("news.loading"));
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
      alert(t("news.createNews.noContentAlert"));
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(t("news.createNews.errorAlert"));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="create-news-modal-wrap">
        <div className="create-news-modal">
          <h2>{t("news.createNews.successTitle")}</h2>
          <button onClick={closeModal}>{t("news.createNews.closeBtn")}</button>
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

        <h1>{t("news.createNews.title")}</h1>
        <p>{t("news.createNews.inCategory", { name: categoryName })}</p>

        <Input
          value={newsTitle}
          setValue={setNewsTitle}
          element="input"
          placeholder={t("news.createNews.titlePlaceholder")}
        />

        <div className="blocks">
          {blocks.map((block) => (
            <div className="block" key={block.id}>
              <div className="block-header">
                <strong>
                  {block.type === "text" ? t("news.createNews.textBlock") : t("news.createNews.imageBlock")}
                </strong>

                <button onClick={() => removeBlock(block.id)}>✕</button>
              </div>

              {block.type === "text" ? (
                <textarea
                  placeholder={t("news.createNews.textPlaceholder")}
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                />
              ) : (
                <ImageUploader
                  label={block.content ? "" : t("news.createNews.imageLabel")}
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
            {t("news.createNews.addTextBtn")}
          </Button>
          <Button callback={() => addBlock("image")} secondary>
            {t("news.createNews.addImageBtn")}
          </Button>
        </div>

        <Button disabled={isSubmitting} callback={handleSubmit}>
          {isSubmitting ? t("news.createNews.submittingBtn") : t("news.createNews.submitBtn")}
        </Button>
      </div>
    </div>
  );
};

export default CreateNewsModal;
