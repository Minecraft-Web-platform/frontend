import { FC, useEffect, useState } from "react";
import Checkbox from "../../../shared/ui/checkbox/checkbox.component";

const MODS_MOCK = ["journeymap", "jei", "xaerosmap", "mineguides", "appleskin"];
type Mod = {
  name: string;
  isChoosed: boolean;
};

const ModBuilder: FC = () => {
  const [availableMods, setAvailableMods] = useState<string[]>([]);
  const [choosedMods, setChoosedMods] = useState<Mod[]>([]);

  useEffect(() => {
    setAvailableMods(MODS_MOCK);
  }, []);

  useEffect(() => {
    if (availableMods.length === 0) {
      return;
    }

    setChoosedMods(
      availableMods.map((mod) => ({ name: mod, isChoosed: false }))
    );
  }, [availableMods]);

  const onChangeHandler = (modName: Mod["name"]) => {
    setChoosedMods((prev) =>
      prev.map((mod) =>
        mod.name === modName ? { ...mod, isChoosed: !mod.isChoosed } : mod
      )
    );
  };

  return (
    <div className="mod-builder">
      <h1>Добавить моды</h1>

      <p>
        Выбери моды, которые хочешь добавить в сборку перед скачиванием - мы
        упакуем в архив :)
      </p>

      <div className="mod-builder__mods-toggler">
        {choosedMods.map((mod) => (
          <div>
            <span>{mod.name}</span>

            <Checkbox
              checked={mod.isChoosed}
              onClickHandler={() => onChangeHandler(mod.name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModBuilder;
