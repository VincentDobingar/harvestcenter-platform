-- 0003 : provenance des actualités importées (ex. publications Facebook).
-- source_url permet de ne jamais importer deux fois la même publication.
ALTER TABLE `news`
  ADD COLUMN `source_url` VARCHAR(500) NULL DEFAULT NULL AFTER `video_url`,
  ADD UNIQUE KEY `uniq_news_source_url` (`source_url`);
