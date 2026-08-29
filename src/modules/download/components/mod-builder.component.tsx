import {  } from 'axios';
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Checkbox from "../../../shared/ui/checkbox/checkbox.component";
import Button from "../../../shared/ui/button/button.component";
import { modsService } from "../services/mods.service";
import { ModType } from "../types/mod.type";
import { MoonLoader, PropagateLoader } from "react-spinners";

type ModWithState = ModType & { isChoosed: boolean };

const ModBuilder: FC = () => {
  const { t } = useTranslation('download-page');

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Ошибка при скачивании модпака:", err);
      alert(t('errors.http.internal-error'));
    } finally {
      setLoadingModPack(false);
    }
  };

  return (
    <div className="mod-builder">
      <h1 className="">{t('html-elements.mods-heading')}</h1>

      {loading ? (
        <p>Загружаем список опциональных модов...</p>
      ) : (
        <p>
          {t('html-elements.under-mods-heading-description')}
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
          t('html-elements.download-button-text')
        )}
      </Button>

      {loadingModPack && (
        <p>
          {t('html-elements.under-button-text')}
        </p>
      )}
    </div>
  );
};

export default ModBuilder;
