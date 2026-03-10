const axios = require('axios');
const db = require('../config/db');

const WP_API = process.env.WP_API_URL; 
const WP_TOKEN = process.env.WP_API_TOKEN;

exports.fetchAll = async () => {
  const response = await axios.get(`${WP_API}/wp-json/wp/v2/formation`, {
    headers: {
      Authorization: `Bearer ${WP_TOKEN}`
    }
  });

  return response.data.map(f => ({
    id: f.id,
    title: f.title.rendered,
    description: f.excerpt.rendered,
    status: f.status,
    meta: f.meta || {}
  }));
};

exports.fetchById = async (id) => {
  const response = await axios.get(`${WP_API}/wp-json/wp/v2/formation/${id}`, {
    headers: {
      Authorization: `Bearer ${WP_TOKEN}`
    }
  });

  return response.data;
};

exports.enroll = async (userId, formationId) => {
  // éviter double inscription
  const exists = await db('enrollments')
    .where({ user_id: userId, formation_id: formationId })
    .first();

  if (exists) {
    throw new Error('Utilisateur déjà inscrit');
  }

  await db('enrollments').insert({
    user_id: userId,
    formation_id: formationId,
    enrolled_at: new Date()
  });
};

exports.getStats = async (formationId) => {
  const total = await db('enrollments')
    .where({ formation_id: formationId })
    .count('id as total')
    .first();

  return {
    formationId,
    total_enrollments: total.total
  };
};
