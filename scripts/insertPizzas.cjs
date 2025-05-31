const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./pizza-service-account.json'); // Ajusta la ruta si es necesario
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

const pizzas = [
  {
    name: "MARGHERITA",
    price: 12,
    type: 'pizza',
    ingredients: ["Tomate", "Mozzarella", "Albahaca"],
    description: "Una clásica delicia italiana con los sabores esenciales de Italia.",
    tags: ["vegetariana"],
    spicy: false,
    currentSlices: 8,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?pizza,margherita",
    icon: "🍕",
    lastBaked: "15:00",
    lastSold: "19:00",
    color: "#4caf50",
    pizzasToday: 27
  },
  {
    name: "SEMPLICE",
    price: 13,
    type: 'pizza',
    ingredients: ["Tomate", "Mozzarella", "Jamón cocido", "Champiñón", "Rúcula"],
    description: "Una pizza sencilla pero sabrosa, perfecta para cualquier momento.",
    tags: [],
    spicy: false,
    currentSlices: 6,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?pizza,ham",
    icon: "🍕",
    lastBaked: "14:45",
    lastSold: "18:20",
    color: "#e58c2e",
    pizzasToday: 19
  },
  {
    name: "DIAVOLA",
    price: 13,
    type: 'pizza',
    ingredients: ["Tomate", "Mozzarella", "Salami picante", "Cebolla", "Aceituna negra"],
    description: "Para los amantes del picante, una combinación que enciende el paladar.",
    tags: [],
    spicy: true,
    currentSlices: 4,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?pizza,spicy",
    icon: "🍕",
    lastBaked: "13:30",
    lastSold: "17:15",
    color: "#d84315",
    pizzasToday: 31
  },
  {
    name: "VEGETARIANA",
    price: 13,
    type: 'pizza',
    ingredients: ["Tomate", "Mozzarella", "Champiñón", "Calabacín", "Berenjena", "Pimiento", "Cebolla"],
    description: "Repleta de verduras frescas, ideal para quienes buscan sabor y salud.",
    tags: ["vegetariana"],
    spicy: false,
    currentSlices: 5,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?vegetable,pizza",
    icon: "🍕",
    lastBaked: "12:50",
    lastSold: "18:10",
    color: "#81c784",
    pizzasToday: 22
  },
  {
    name: "CINQUE FORMAGGI",
    price: 13,
    type: 'pizza',
    ingredients: ["Mozzarella", "Pecorino romano", "Gorgonzola", "Parmigiano", "Taleggio", "Emmental"],
    description: "Una explosión de sabores lácteos con seis quesos diferentes.",
    tags: [],
    spicy: false,
    currentSlices: 7,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?cheese,pizza",
    icon: "🧀",
    lastBaked: "15:10",
    lastSold: "19:25",
    color: "#fdd835",
    pizzasToday: 18
  },
  {
    name: "GOLOSA",
    price: 13,
    type: 'pizza',
    ingredients: ["Tomate", "Mozzarella", "Champiñón", "Emmental", "Speck", "Perejil"],
    description: "Una opción golosa y equilibrada entre sabores ahumados y frescos.",
    tags: [],
    spicy: false,
    currentSlices: 8,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?pizza,gourmet",
    icon: "🍕",
    lastBaked: "16:00",
    lastSold: "20:00",
    color: "#a1887f",
    pizzasToday: 25
  },
  {
    name: "RIANATA SICILIANA",
    price: 13,
    type: 'pizza',
    ingredients: ["Tomate", "Anchoa", "Tomate cherry", "Cebolla", "Ajo", "Perejil", "Pecorino", "Aceituna", "Orégano"],
    description: "Una receta tradicional siciliana intensa y sabrosa.",
    tags: ["pescado"],
    spicy: false,
    currentSlices: 3,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?pizza,anchovy",
    icon: "🍕",
    lastBaked: "13:15",
    lastSold: "17:00",
    color: "#7986cb",
    pizzasToday: 17
  },
  {
    name: "GIULIA",
    price: 13,
    type: 'pizza',
    ingredients: ["Tomate", "Mozzarella", "Jamón cocido", "Alcachofa", "Champiñón", "Aceituna negra"],
    description: "Delicada y completa, para quienes disfrutan de sabores suaves y clásicos.",
    tags: [],
    spicy: false,
    currentSlices: 6,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?pizza,giulia",
    icon: "🍕",
    lastBaked: "14:30",
    lastSold: "18:45",
    color: "#ba68c8",
    pizzasToday: 23
  },
  {
    name: "PARMIGIANA",
    price: 14,
    type: 'pizza',
    ingredients: ["Tomate", "Mozzarella", "Jamón cocido", "Berenjena", "Parmigiano", "Albahaca"],
    description: "Inspirada en la famosa parmigiana, esta pizza combina lo mejor de Italia.",
    tags: [],
    spicy: false,
    currentSlices: 5,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?pizza,parmigiana",
    icon: "🍕",
    lastBaked: "15:45",
    lastSold: "19:50",
    color: "#d4ac0d",
    pizzasToday: 16
  },
  {
    name: "ITALIA",
    price: 14,
    type: 'pizza',
    ingredients: ["Tomate", "Mozzarella", "Jamón de Parma", "Rúcula", "Parmigiano", "Tomate cherry"],
    description: "Los ingredientes más representativos de Italia en cada porción.",
    tags: [],
    spicy: false,
    currentSlices: 2,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?pizza,italy",
    icon: "🇮🇹",
    lastBaked: "13:50",
    lastSold: "17:40",
    color: "#ef5350",
    pizzasToday: 20
  },
  {
    name: "VITO",
    price: 14,
    type: 'pizza',
    ingredients: ["Tomate", "Mozzarella", "Salami picante", "Berenjena", "Emmental"],
    description: "Una combinación atrevida con el toque justo de picante.",
    tags: [],
    spicy: true,
    currentSlices: 4,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?pizza,vito",
    icon: "🌶️",
    lastBaked: "12:40",
    lastSold: "16:30",
    color: "#e53935",
    pizzasToday: 29
  },
  {
    name: "BERTA",
    price: 14,
    type: 'pizza',
    ingredients: ["Tomate", "Mozzarella", "Longaniza napolitana", "Alcachofa", "Búfala", "Tomate seco"],
    description: "Una pizza intensa y jugosa con ingredientes del sur de Italia.",
    tags: [],
    spicy: false,
    currentSlices: 6,
    maxSlices: 8,
    imageUrl: "https://source.unsplash.com/featured/?pizza,napoli",
    icon: "🍕",
    lastBaked: "14:10",
    lastSold: "18:05",
    color: "#f06292",
    pizzasToday: 21
  }
];

async function insertPizzas() {
  const pizzasRef = db.collection("pizzas");

  for (const pizza of pizzas) {
    const existing = await pizzasRef.where("name", "==", pizza.name).get();
    if (existing.empty) {
      await pizzasRef.add(pizza);
    } else {
    }
  }

}

insertPizzas();
