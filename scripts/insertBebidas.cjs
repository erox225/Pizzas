const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./pizza-service-account.json'); // Ajusta la ruta si es necesario
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = getFirestore();

const drinks = [
  {
    name: "Coca-Cola",
    price: 1.5,
    description: "Refresco clásico con gas",
    tags: ["sin alcohol", "fría"],
    icon: "🥤",
    type: 'drink'
  },
  {
    name: "Fanta Naranja",
    price: 1.5,
    description: "Refresco sabor naranja, burbujeante",
    tags: ["sin alcohol", "fría"],
    icon: "🍊",
    type: 'drink'
  },
  {
    name: "Sprite",
    price: 1.5,
    description: "Refresco sabor limón sin cafeína",
    tags: ["sin alcohol", "fría"],
    icon: "🍋",
    type: 'drink'
  },
  {
    name: "Nestea",
    price: 1.6,
    description: "Té frío con sabor a limón",
    tags: ["té", "fría"],
    icon: "🍹",
    type: 'drink'
  },
  {
    name: "Agua Mineral",
    price: 1.0,
    description: "Botella de agua natural sin gas",
    tags: ["sin gas", "natural"],
    icon: "💧",
    type: 'drink'
  }
];

drinks.forEach(drink => {
  db.collection("drinks").add(drink);
});
