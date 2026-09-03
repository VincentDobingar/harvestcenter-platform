CREATE TABLE opportunities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type ENUM('scholarship','fellowship','offer','other') DEFAULT 'other',
  sponsor VARCHAR(255) NULL,
  country VARCHAR(120) NULL,
  city VARCHAR(120) NULL,
  deadline DATE NULL,
  apply_url TEXT NULL,
  description TEXT NULL,
  status ENUM('open','closed') DEFAULT 'open',
  is_active TINYINT(1) DEFAULT 1,
  cover_image VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);