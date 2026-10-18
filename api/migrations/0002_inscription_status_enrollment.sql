-- 0002 : statuts des demandes d'inscription alignés sur l'interface admin.
-- L'API et l'interface utilisent pending / validated / enrolled / rejected,
-- alors que la colonne n'acceptait que pending / approved / rejected : toute
-- validation échouait. Les anciennes lignes "approved" deviennent "validated".
ALTER TABLE `inscription_requests`
  MODIFY `status` ENUM('pending','approved','validated','enrolled','rejected') NOT NULL DEFAULT 'pending';

UPDATE `inscription_requests` SET `status` = 'validated' WHERE `status` = 'approved';

ALTER TABLE `inscription_requests`
  MODIFY `status` ENUM('pending','validated','enrolled','rejected') NOT NULL DEFAULT 'pending';

-- Lien vers la classe choisie par l'admin au moment de l'inscription définitive.
ALTER TABLE `inscription_requests`
  ADD COLUMN `class_id` INT(10) UNSIGNED NULL DEFAULT NULL AFTER `status`;
