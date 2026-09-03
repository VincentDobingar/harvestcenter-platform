import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/utils/api";

export default function MediaGallery() {
  const { t } = useTranslation();
  const [media, setMedia] = useState([]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await api.get("/media?limit=8");
        setMedia(Array.isArray(res.data?.media) ? res.data.media : []);
      } catch (err) {
        console.error("Erreur API media:", err);
      }
    };

    fetchMedia();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("mediaGallery.title")}</h2>

      {media.length === 0 ? (
        <p className="text-gray-500">{t("mediaGallery.empty")}</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((m) => (
            <li key={m.id || m.filename} className="bg-white rounded shadow p-2">
              <img
                src={m.url}
                alt={m.filename || t("mediaGallery.imageAlt")}
                className="w-full h-28 object-cover rounded"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}