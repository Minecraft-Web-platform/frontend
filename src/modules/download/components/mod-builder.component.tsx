import { FC, useEffect, useState } from "react";
import Checkbox from "../../../shared/ui/checkbox/checkbox.component";
import { modsService } from "../services/mods.service";
import { ModType } from "../types/ mod.type";
import Button from "../../../shared/ui/button/button.component";
import { MoonLoader, PropagateLoader } from "react-spinners";

type ModWithState = ModType & { isChoosed: boolean };

const ModBuilder: FC = () => {
  const [mods, setMods] = useState<ModWithState[]>([]);
  const [loadingModPack, setLoadingModPack] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    modsService.getAllOptionalMods().then((res) => {
      setMods(res.map((mod) => ({ ...mod, isChoosed: false })));
    });

    setLoading(false);
  }, []);

  const toggleMod = (file: string) => {
    setMods((prev) =>
      prev.map((mod) =>
        mod.file === file ? { ...mod, isChoosed: !mod.isChoosed } : mod
      )
    );
  };

  const handleDownload = async () => {
    setLoadingModPack(true);
    try {
      const selectedFiles = mods.filter((m) => m.isChoosed).map((m) => m.file);
      const blob = await modsService.getModpack(selectedFiles);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "modpack.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Ошибка при скачивании модпака:", err);
      alert("Не удалось собрать модпак");
    } finally {
      setLoadingModPack(false);
    }
  };

  return (
    <div className="mod-builder">
      <h1 className="">Добавить моды</h1>

      {loading ? (
        <p>Загружаем список опциональных модов...</p>
      ) : (
        <p>
          Выбери моды, которые хочешь добавить в сборку — мы упакуем их в архив
          вместе с обязательными модами :)
        </p>
      )}

      {loading ? (
        <PropagateLoader color="#000" />
      ) : (
        <div className="mod-builder__mods-toggler">
          {mods.map((mod) => (
            <div key={mod.file}>
              <Checkbox
                checked={mod.isChoosed}
                onClickHandler={() => toggleMod(mod.file)}
              />
              <span>{mod.name}</span>
            </div>
          ))}
        </div>
      )}

      <Button disabled={loadingModPack} callback={handleDownload}>
        {loadingModPack ? (
          <MoonLoader size={16} color="#fff" />
        ) : (
          "Скачать модпак"
        )}
      </Button>

      {loadingModPack && (
        <p>
          Твой модпак скачивается, это займёт 2-4 минуты, завари пока что чай :)
        </p>
      )}
    </div>
  );
};

export default ModBuilder;
