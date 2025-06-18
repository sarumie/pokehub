import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.$transaction([
    prisma.rating.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.purchaseHistory.deleteMany(),
    prisma.expedition.deleteMany(),
    prisma.listing.deleteMany(),
    prisma.user.deleteMany(),
    prisma.addressDetails.deleteMany(),
  ]);

  // Create address details for 10 users
  const addresses = [];
  const cities = [
    "Jakarta",
    "Surabaya",
    "Bandung",
    "Medan",
    "Semarang",
    "Makassar",
    "Palembang",
    "Tangerang",
    "Depok",
    "Bekasi",
  ];
  const provinces = [
    "DKI Jakarta",
    "Jawa Timur",
    "Jawa Barat",
    "Sumatera Utara",
    "Jawa Tengah",
    "Sulawesi Selatan",
    "Sumatera Selatan",
    "Banten",
    "Jawa Barat",
    "Jawa Barat",
  ];

  for (let i = 0; i < 10; i++) {
    const address = await prisma.addressDetails.create({
      data: {
        name: `Home ${i + 1}`,
        receiver: `User ${i + 1}`,
        province: provinces[i],
        city: cities[i],
        postalCode: `${10000 + i * 111}`,
        address: `${123 + i} Main Street`,
      },
    });
    addresses.push(address);
  }

  // Create 10 users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: `user${i + 1}`,
        password: `hashedpassword${i + 1}`, // In real app, this should be properly hashed
        email: `user${i + 1}@example.com`,
        fullName: `User ${i + 1}`,
        profilePicture: "https://i.vgy.me/PEwKi8.jpg",
        idAddressDetails: addresses[i].id,
      },
    });
    users.push(user);
  }

  // Create 16-20 listings per user
  const listings = [];
  const pokemonNames = [
    "Charizard",
    "Pikachu",
    "Mewtwo",
    "Blastoise",
    "Venusaur",
    "Dragonite",
    "Gyarados",
    "Gengar",
    "Snorlax",
    "Mew",
    "Lugia",
    "Ho-Oh",
    "Rayquaza",
    "Garchomp",
    "Lucario",
    "Greninja",
    "Mimikyu",
    "Zacian",
    "Eternatus",
    "Calyrex",
  ];

  for (const user of users) {
    const numListings = Math.floor(Math.random() * 5) + 16; // Random number between 16-20
    for (let i = 0; i < numListings; i++) {
      const listing = await prisma.listing.create({
        data: {
          idSeller: user.id,
          pictUrl: "https://i.vgy.me/DE21i1.png",
          name: `${pokemonNames[i % pokemonNames.length]} Card ${i + 1}`,
          price: Math.floor(Math.random() * 900000) + 100000, // Random price between 100k-1M
          description: `Rare ${
            pokemonNames[i % pokemonNames.length]
          } card in excellent condition`,
          stock: Math.floor(Math.random() * 5) + 1, // Random stock between 1-5
          seenCount: Math.floor(Math.random() * 1000), // Random views up to 1000
        },
      });
      listings.push(listing);
    }
  }

  // Create 5 major Indonesian expeditions
  const expeditions = [];
  const expeditionData = [
    {
      name: "JNE",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/92/New_Logo_JNE.png",
      paymentTimestamp: 48,
    },
    {
      name: "J&T Express",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/01/J%26T_Express_logo.svg",
      paymentTimestamp: 48,
    },
    {
      name: "SiCepat",
      logo: "https://i.vgy.me/mk2vnJ.png",
      paymentTimestamp: 24,
    },
    {
      name: "Anteraja",
      logo: "https://i.vgy.me/Cl8eqo.png",
      paymentTimestamp: 48,
    },
    {
      name: "ID Express",
      logo: "https://i.vgy.me/cGS5d6.png",
      paymentTimestamp: 72,
    },
  ];

  for (const expData of expeditionData) {
    const expedition = await prisma.expedition.create({
      data: expData,
    });
    expeditions.push(expedition);
  }

  // Create purchase history (1-3 purchases per user)
  const purchases = [];
  for (const user of users) {
    const numPurchases = Math.floor(Math.random() * 3) + 1; // 1-3 purchases per user
    for (let i = 0; i < numPurchases; i++) {
      const randomListing =
        listings[Math.floor(Math.random() * listings.length)];
      const randomExpedition =
        expeditions[Math.floor(Math.random() * expeditions.length)];
      const purchase = await prisma.purchaseHistory.create({
        data: {
          idBuyer: user.id,
          paymentTimestamp: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ), // Random date within last 30 days
          totalPrice: randomListing.price,
          idExpedition: randomExpedition.id,
          stock: 1,
        },
      });
      purchases.push(purchase);
    }
  }

  // Create 2 ratings per user to different users
  for (const user of users) {
    const otherUsers = users.filter((u) => u.id !== user.id);
    const randomSellers = otherUsers
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    for (const seller of randomSellers) {
      const sellerListing = listings.find((l) => l.idSeller === seller.id);
      // Find purchases by this user that haven't been rated yet
      const unratedPurchases = purchases.filter(
        (p) => p.idBuyer === user.id && !p._ratingCreated // We'll use this to track which purchases have been rated
      );

      if (sellerListing && unratedPurchases.length > 0) {
        const purchase = unratedPurchases[0];
        purchase._ratingCreated = true; // Mark this purchase as rated

        const reviews = [
          "nih ya buat kalian kalian yang hate iphone, iphone tuh udah best experience smartphone you esti had, apapun gher ini itu kayak pake android yang pake gcam lah segala apa lah, semua terintegrasi dengan baik di ekosistem apple, main game nggak bakal ngedrop, video smooth anti kempa kempa klub, kualitas audio terbaik yang pernah ada, walau gaada headphone jack nya tuh tinggal belin airpods pro 2 aja udah nambang banget dari dengerin musik dengan kualitas terbaik dengan fitur yang melimpah, jadi buat lu yang ngehate iphone, pikir pikir lagi kalau mau ngehate kalau hp mu aja gabisa sebagus iphone",
          "Barang sesuai deskripsi, packing rapih, pengiriman cepat. Recommended seller!",
          "Produk bagus, hanya saja agak lama pengirimannya. Overall satisfied.",
          "Kualitas kartu sangat bagus, kondisi mint! Terima kasih!",
          "Seller responsif dan fast respon. Barang original dan sesuai foto.",
          "Pengiriman super cepat, packing aman. Highly recommended!",
          "Card condition perfect, exactly as described. Will buy again!",
          "Harga worth it untuk kualitas yang didapat. Thanks seller!",
          "Transaksi lancar, seller ramah dan profesional.",
          "Item received in excellent condition. Great communication!",
        ];

        await prisma.rating.create({
          data: {
            orderId: purchase.id,
            userId: user.id,
            listingId: sellerListing.id,
            sellerId: seller.id,
            score: Math.floor(Math.random() * 3) + 3, // Random score between 3-5
            review: reviews[Math.floor(Math.random() * reviews.length)],
          },
        });
      }
    }
  }

  // Create cart items (1-3 items per user)
  for (const user of users) {
    const numCartItems = Math.floor(Math.random() * 3) + 1; // 1-3 cart items per user
    const userListings = new Set(); // To avoid duplicate listings in cart

    for (let i = 0; i < numCartItems; i++) {
      let randomListing;
      let attempts = 0;

      // Find a listing not already in this user's cart
      do {
        randomListing = listings[Math.floor(Math.random() * listings.length)];
        attempts++;
      } while (userListings.has(randomListing.id) && attempts < 10);

      if (!userListings.has(randomListing.id)) {
        userListings.add(randomListing.id);
        const quantity = Math.floor(Math.random() * 3) + 1; // Random quantity 1-3

        await prisma.cart.create({
          data: {
            idUser: user.id,
            idListings: randomListing.id,
            quantity: quantity,
            totalPrice: randomListing.price * quantity,
          },
        });
      }
    }
  }

  // Update one user with specific credentials
  await prisma.user.update({
    where: { id: users[0].id },
    data: {
      username: "sarue",
      password: "saruesarue",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
