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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    modsService.getAllOptionalMods()
      .then((res) => {
        setMods(res.map((mod) => ({ ...mod, isChoosed: false })));
      })
      .catch((err) => {
        console.error("Error loading mods:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleMod = (file: string) => {
    setMods((prev) =>
      prev.map((mod) =>
        mod.file === file ? { ...mod, isChoosed: !mod.isChoosed } : mod
      )
    );
  };

  const selectAll = () => {
    setMods((prev) => prev.map((mod) => ({ ...mod, isChoosed: true })));
  };

  const deselectAll = () => {
    setMods((prev) => prev.map((mod) => ({ ...mod, isChoosed: false })));
  };

  const selectedCount = mods.filter((m) => m.isChoosed).length;

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
    } catch (err: unknown) {
      console.error("Error downloading modpack:", err);
      alert(t('errors.http.internal-error'));
    } finally {
      setLoadingModPack(false);
    }
  };

  return (
    <div className="mod-builder">
      <div className="mod-builder__badge">
        📦 {t('html-elements.step-mods')}
      </div>
      <h2 className="mod-builder__title">{t('html-elements.mods-heading')}</h2>

      <p className="mod-builder__desc">
        {t('html-elements.under-mods-heading-description')}
      </p>

      {loading ? (
        <div className="mod-builder__loader">
          <PropagateLoader color="#10b981" />
          <p className="mod-builder__loading-text">{t('html-elements.loading-mods')}</p>
        </div>
      ) : (
        <>
          <div className="mod-builder__toolbar">
            <div className="mod-builder__count">
              {t('html-elements.selected')}: <strong>{selectedCount}</strong> {t('html-elements.of')} {mods.length}
            </div>
            <div className="mod-builder__quick-actions">
              <button
                type="button"
                className="mod-builder__quick-btn"
                onClick={selectAll}
                disabled={mods.length === 0 || selectedCount === mods.length}
              >
                {t('html-elements.select-all')}
              </button>
              <button
                type="button"
                className="mod-builder__quick-btn"
                onClick={deselectAll}
                disabled={selectedCount === 0}
              >
                {t('html-elements.deselect-all')}
              </button>
            </div>
          </div>

          <div className="mod-builder__mods-grid">
            {mods.map((mod) => (
              <div
                key={mod.file}
                className={`mod-builder__item ${mod.isChoosed ? 'mod-builder__item--active' : ''}`}
                onClick={() => toggleMod(mod.file)}
              >
                <Checkbox
                  checked={mod.isChoosed}
                  onClickHandler={() => toggleMod(mod.file)}
                />
                <span className="mod-builder__item-name" title={mod.name}>
                  {mod.name}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mod-builder__action">
        <Button disabled={loadingModPack || loading} callback={handleDownload}>
          {loadingModPack ? (
            <MoonLoader size={18} color="#fff" />
          ) : (
            t('html-elements.download-button-text')
          )}
        </Button>

        {loadingModPack && (
          <p className="mod-builder__hint">
            {t('html-elements.under-button-text')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ModBuilder;
