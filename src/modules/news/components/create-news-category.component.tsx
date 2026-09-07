import { Dispatch, FC, SetStateAction, useState } from "react";

import { newsCategoryService } from "../services/news-category.service";
import { CreateCategoryDto } from "../types/create-category.dto";

import Button from "../../../shared/ui/button/button.component";
import Input from "../../../shared/ui/input/input.component";
import Checkbox from "../../../shared/ui/checkbox/checkbox.component";
import "./create-news-category.scss";

import { NewsCategory } from "../types/news-category.type";
import { useTranslation } from "react-i18next";

type Props = {
  setCategories: Dispatch<SetStateAction<NewsCategory[]>>;
};

const CreateNewsCategoryComponent: FC<Props> = ({ setCategories }) => {
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [newCategoryDescription, setNewCategoryDescription] =
    useState<string>("");
  const [publishPermission, setPublishPermission] = useState<"all" | "admins">(
    "all"
  );
  const [categoryIsCreating, setCategoryIsCreating] = useState<boolean>(false);
  const { t } = useTranslation("news");

  const createCategory = async () => {
    const newCategoryData: CreateCategoryDto = {
      name: newCategoryName,
      description: newCategoryDescription,
      publish_permission: publishPermission,
    };

    const newCategory = await newsCategoryService.create(newCategoryData);

    setCategories((prev) => [...prev, newCategory]);
  };

  return (
    <div className="create-category-container">
      <Button
        callback={
          categoryIsCreating
            ? () => setCategoryIsCreating(false)
            : () => setCategoryIsCreating(true)
        }
      >
        {!categoryIsCreating ? t("news.createCategoryBtn") : t("news.cancelCategoryBtn")}
      </Button>

      {categoryIsCreating && (
        <form
          className="create-category-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input
            element="input"
            value={newCategoryName}
            setValue={setNewCategoryName}
            placeholder={t("news.categoryNamePlaceholder")}
          />

          <Input
            element="textarea"
            value={newCategoryDescription}
            setValue={setNewCategoryDescription}
            placeholder={t("news.categoryDescPlaceholder")}
          />

          <div className="checkbox-wrap">
            <Checkbox
              checked={publishPermission === "admins"}
              onClickHandler={() =>
                publishPermission === "all"
                  ? setPublishPermission("admins")
                  : setPublishPermission("all")
              }
            />
            <label onClick={() =>
                publishPermission === "all"
                  ? setPublishPermission("admins")
                  : setPublishPermission("all")
              }>{t("news.adminOnlyLabel")}</label>
          </div>

          <Button callback={createCategory}>{t("news.createBtn")}</Button>
        </form>
      )}
    </div>
  );
};

export default CreateNewsCategoryComponent;
