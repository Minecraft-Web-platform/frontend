import { Dispatch, FC, SetStateAction, useState } from "react";

import { newsCategoryService } from "../services/news-category.service";
import { CreateCategoryDto } from "../types/create-category.dto";

import Button from "../../../shared/ui/button/button.component";
import Input from "../../../shared/ui/input/input.component";
import Checkbox from "../../../shared/ui/checkbox/checkbox.component";
import "./create-news-category.scss";

import { NewsCategory } from "../types/news-category.type";

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
        {!categoryIsCreating ? "Новая категория" : "Отменить"}
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
            placeholder="Имя категории"
          />

          <Input
            element="textarea"
            value={newCategoryDescription}
            setValue={setNewCategoryDescription}
            placeholder="Описание категории"
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
              }>Только для администраторов</label>
          </div>

          <Button callback={createCategory}>Создать</Button>
        </form>
      )}
    </div>
  );
};

export default CreateNewsCategoryComponent;
