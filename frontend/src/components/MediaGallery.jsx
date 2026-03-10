import { useEffect, useState } from "react";
import api from "../api.js"; // ton fichier api.js

export default function MediaGallery() {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await api.get("/media?limit=8");
        setMedia(res.data.media); // on stocke les fichiers dans le state
        console.log(res.data.media);
      } catch (err) {
        console.error("Erreur API media:", err);
      }
    };

    fetchMedia();
  }, []);

  return (
    <div>
      <h2>Derniers médias</h2>
      <ul>
        {media.map((m) => (
          <li key={m.filename}>
            <img src={m.url} alt={m.filename} width={100} />
          </li>
        ))}
      </ul>
    </div>
  );
}