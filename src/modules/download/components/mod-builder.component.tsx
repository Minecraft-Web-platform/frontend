import { FC, useEffect, useState } from "react";
import Checkbox from "../../../shared/ui/checkbox/checkbox.component";
import { modsService } from "../services/mods.service";
import { ModType } from "../types/ mod.type";
import Button from "../../../shared/ui/button/button.component";

type ModWithState = ModType & { isChoosed: boolean };

const ModBuilder: FC = () => {
  const [mods, setMods] = useState<ModWithState[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    modsService.getAllOptionalMods().then((res) => {
      setMods(res.map((mod) => ({ ...mod, isChoosed: false })));
    });
  }, []);

  const toggleMod = (file: string) => {
    setMods((prev) =>
      prev.map((mod) =>
        mod.file === file ? { ...mod, isChoosed: !mod.isChoosed } : mod
      )
    );
  };

  const handleDownload = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="mod-builder space-y-4">
      <h1 className="text-xl font-bold">Добавить моды</h1>

      <p>
        Выбери моды, которые хочешь добавить в сборку — мы упакуем их в архив
        вместе с обязательными модами :)
      </p>

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

      <Button disabled={loading} callback={handleDownload}>
        {loading ? "Формируем архив..." : "Скачать модпак"}
      </Button>
    </div>
  );
};

export default ModBuilder;
