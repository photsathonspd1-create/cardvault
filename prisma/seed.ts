import { PrismaClient, CardSeries, Condition, CardLanguage, ListingStatus, OrderStatus, EscrowStatus, Role, SellerTier } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Clean existing data
  await prisma.orderStatusHistory.deleteMany()
  await prisma.review.deleteMany()
  await prisma.disputeEvidence.deleteMany()
  await prisma.dispute.deleteMany()
  await prisma.order.deleteMany()
  await prisma.watchlist.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.report.deleteMany()
  await prisma.listingImage.deleteMany()
  await prisma.shippingOption.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.priceHistory.deleteMany()
  await prisma.cardCatalog.deleteMany()
  await prisma.bankAccount.deleteMany()
  await prisma.sellerProfile.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.systemSetting.deleteMany()
  await prisma.user.deleteMany()

  console.log("✅ Cleaned existing data")

  // Create users
  const passwordHash = await bcrypt.hash("password123", 12)

  const admin = await prisma.user.create({
    data: {
      email: "admin@cardvault.co.th",
      name: "Admin CardVault",
      username: "admin",
      passwordHash,
      role: "ADMIN",
    },
  })

  const seller1User = await prisma.user.create({
    data: {
      email: "seller1@example.com",
      name: "สมชาย การ์ดมาเนีย",
      username: "somchai_cards",
      passwordHash,
      role: "SELLER",
    },
  })

  const seller2User = await prisma.user.create({
    data: {
      email: "seller2@example.com",
      name: "สมหญ้า TCG Shop",
      username: "somya_tcg",
      passwordHash,
      role: "SELLER",
    },
  })

  const seller3User = await prisma.user.create({
    data: {
      email: "seller3@example.com",
      name: "PokemonMasterTH",
      username: "pokemon_master_th",
      passwordHash,
      role: "SELLER",
    },
  })

  const buyer1 = await prisma.user.create({
    data: {
      email: "buyer1@example.com",
      name: "วิชัย นักสะสม",
      username: "wichai_collector",
      passwordHash,
    },
  })

  const buyer2 = await prisma.user.create({
    data: {
      email: "buyer2@example.com",
      name: "นภา การ์ดเลิฟเวอร์",
      username: "napha_cards",
      passwordHash,
    },
  })

  console.log("✅ Created users")

  // Create seller profiles
  const seller1 = await prisma.sellerProfile.create({
    data: {
      userId: seller1User.id,
      displayName: "ร้านสมชาย TCG",
      bio: "ขายการ์ด TCG ทุกชนิด ของแท้ 100% ส่งไว ราคาเป็นกันเอง",
      tier: "GOLD",
      isKycVerified: true,
      kycStatus: "APPROVED",
      totalSales: 156,
      totalRevenue: 24500000,
      completedOrders: 150,
      rating: 4.8,
      ratingCount: 89,
    },
  })

  const seller2 = await prisma.sellerProfile.create({
    data: {
      userId: seller2User.id,
      displayName: "Somya TCG Shop",
      bio: "Specializing in Yu-Gi-Oh! and MTG cards. Competitive prices.",
      tier: "SILVER",
      isKycVerified: true,
      kycStatus: "APPROVED",
      totalSales: 67,
      totalRevenue: 8900000,
      completedOrders: 65,
      rating: 4.6,
      ratingCount: 42,
    },
  })

  const seller3 = await prisma.sellerProfile.create({
    data: {
      userId: seller3User.id,
      displayName: "PokemonMasterTH",
      bio: "Pokemon card specialist. All grades, all sets. Guaranteed authentic.",
      tier: "VERIFIED_PRO",
      isKycVerified: true,
      kycStatus: "APPROVED",
      totalSales: 312,
      totalRevenue: 56700000,
      completedOrders: 305,
      rating: 4.9,
      ratingCount: 201,
    },
  })

  console.log("✅ Created seller profiles")

  // Create Pokemon cards in catalog
  const pokemonCards = [
    {
      tcgApiId: "swsh4-25",
      series: "POKEMON" as CardSeries,
      name: "Charizard VMAX",
      nameTh: "ชาร์ลิซาร์ด VMAX",
      setName: "Shining Fates",
      setCode: "SHF",
      cardNumber: "073",
      rarity: "Shiny Rare VMAX",
      artist: "5ban Graphics",
      imageUrl: "https://images.pokemontcg.io/swsh45/73_hires.png",
      types: ["Fire"],
      hp: 330,
      supertype: "Pokémon",
    },
    {
      tcgApiId: "swsh1-20",
      series: "POKEMON" as CardSeries,
      name: "Pikachu VMAX",
      nameTh: "พิคาจู VMAX",
      setName: "Sword & Shield",
      setCode: "SSH",
      cardNumber: "044",
      rarity: "VMAX",
      artist: "5ban Graphics",
      imageUrl: "https://images.pokemontcg.io/swsh1/44_hires.png",
      types: ["Lightning"],
      hp: 310,
      supertype: "Pokémon",
    },
    {
      tcgApiId: "sv3-198",
      series: "POKEMON" as CardSeries,
      name: "Mew ex",
      nameTh: "มิว ex",
      setName: "151",
      setCode: "MEW",
      cardNumber: "198",
      rarity: "Special Art Rare",
      artist: "AKIRA EGAWA",
      imageUrl: "https://images.pokemontcg.io/sv3pt5/198_hires.png",
      types: ["Psychic"],
      hp: 200,
      supertype: "Pokémon",
    },
    {
      tcgApiId: "swsh12-186",
      series: "POKEMON" as CardSeries,
      name: "Giratina VSTAR",
      nameTh: "กิราติน่า VSTAR",
      setName: "Lost Origin",
      setCode: "LOR",
      cardNumber: "186",
      rarity: "Special Art Rare",
      artist: "Shibuzoh.",
      imageUrl: "https://images.pokemontcg.io/swsh12/186_hires.png",
      types: ["Dragon"],
      hp: 280,
      supertype: "Pokémon",
    },
    {
      tcgApiId: "sv4-223",
      series: "POKEMON" as CardSeries,
      name: "Moonbreon",
      nameTh: "มูนเบรอน (Umbreon ex)",
      setName: "Evolving Skies",
      setCode: "EVS",
      cardNumber: "215",
      rarity: "Special Art Rare",
      artist: "Mitsuhiro Arita",
      imageUrl: "https://images.pokemontcg.io/swsh7/215_hires.png",
      types: ["Darkness"],
      hp: 310,
      supertype: "Pokémon",
    },
    {
      tcgApiId: "xy12-108",
      series: "POKEMON" as CardSeries,
      name: "M Charizard-EX",
      nameTh: "เมก้า ชาร์ลิซาร์ด-EX",
      setName: "Evolutions",
      setCode: "EVO",
      cardNumber: "108",
      rarity: "Secret Rare",
      artist: "5ban Graphics",
      imageUrl: "https://images.pokemontcg.io/xy12/108_hires.png",
      types: ["Fire"],
      hp: 230,
      supertype: "Pokémon",
    },
    {
      tcgApiId: "swsh9-172",
      series: "POKEMON" as CardSeries,
      name: "Lugia V (Alt Art)",
      nameTh: "ลูเกีย V (Alt Art)",
      setName: "Silver Tempest",
      setCode: "SIT",
      cardNumber: "186",
      rarity: "Special Art Rare",
      artist: "Shibuzoh.",
      imageUrl: "https://images.pokemontcg.io/swsh12/186_hires.png",
      types: ["Colorless"],
      hp: 220,
      supertype: "Pokémon",
    },
    {
      tcgApiId: "sv2-228",
      series: "POKEMON" as CardSeries,
      name: "Eevee",
      nameTh: "อีวุย",
      setName: "Paldea Evolved",
      setCode: "PAL",
      cardNumber: "167",
      rarity: "Illustration Rare",
      artist: "Atsushi Furusawa",
      imageUrl: "https://images.pokemontcg.io/sv2/167_hires.png",
      types: ["Colorless"],
      hp: 70,
      supertype: "Pokémon",
    },
    {
      tcgApiId: "swsh3-189",
      series: "POKEMON" as CardSeries,
      name: "Rayquaza VMAX",
      nameTh: "เรย์ควาซ่า VMAX",
      setName: "Evolving Skies",
      setCode: "EVS",
      cardNumber: "218",
      rarity: "Special Art Rare",
      artist: "Shin Nagasawa",
      imageUrl: "https://images.pokemontcg.io/swsh7/218_hires.png",
      types: ["Dragon"],
      hp: 320,
      supertype: "Pokémon",
    },
    {
      tcgApiId: "sv1-248",
      series: "POKEMON" as CardSeries,
      name: "Palkia V (Alt Art)",
      nameTh: "พัลเกีย V (Alt Art)",
      setName: "Brilliant Stars",
      setCode: "BRS",
      cardNumber: "167",
      rarity: "Special Art Rare",
      artist: "Shibuzoh.",
      imageUrl: "https://images.pokemontcg.io/swsh9/167_hires.png",
      types: ["Water"],
      hp: 230,
      supertype: "Pokémon",
    },
    {
      tcgApiId: "sm12-248",
      series: "POKEMON" as CardSeries,
      name: "Mewtwo & Mew-GX",
      nameTh: "มิวทู & มิว-GX",
      setName: "Unified Minds",
      setCode: "UNM",
      cardNumber: "242",
      rarity: "Secret Rare",
      artist: "Mitsuhiro Arita",
      imageUrl: "https://images.pokemontcg.io/sm12/242_hires.png",
      types: ["Psychic"],
      hp: 270,
      supertype: "Pokémon",
    },
    {
      tcgApiId: "swsh5-142",
      series: "POKEMON" as CardSeries,
      name: "Umbreon VMAX",
      nameTh: "อัมเบรอน VMAX",
      setName: "Evolving Skies",
      setCode: "EVS",
      cardNumber: "095",
      rarity: "VMAX",
      artist: "5ban Graphics",
      imageUrl: "https://images.pokemontcg.io/swsh7/95_hires.png",
      types: ["Darkness"],
      hp: 310,
      supertype: "Pokémon",
    },
  ]

  const createdCards = []
  for (const card of pokemonCards) {
    const created = await prisma.cardCatalog.create({ data: card })
    createdCards.push(created)
  }

  console.log("✅ Created card catalog entries")

  // Create listings
  const listingsData = [
    { cardIndex: 0, seller: seller1, condition: "MINT" as Condition, price: 1590000, isGraded: true, gradingCompany: "PSA", gradeScore: "10", language: "ENGLISH" as CardLanguage, quantity: 1 },
    { cardIndex: 1, seller: seller3, condition: "NEAR_MINT" as Condition, price: 890000, isGraded: true, gradingCompany: "PSA", gradeScore: "9", language: "JAPANESE" as CardLanguage, quantity: 2 },
    { cardIndex: 2, seller: seller3, condition: "MINT" as Condition, price: 2450000, isGraded: true, gradingCompany: "PSA", gradeScore: "10", language: "JAPANESE" as CardLanguage, quantity: 1 },
    { cardIndex: 3, seller: seller1, condition: "NEAR_MINT" as Condition, price: 750000, isGraded: false, language: "ENGLISH" as CardLanguage, quantity: 1 },
    { cardIndex: 4, seller: seller3, condition: "MINT" as Condition, price: 4500000, isGraded: true, gradingCompany: "PSA", gradeScore: "10", language: "ENGLISH" as CardLanguage, quantity: 1 },
    { cardIndex: 5, seller: seller1, condition: "EXCELLENT" as Condition, price: 1200000, isGraded: true, gradingCompany: "BGS", gradeScore: "9.5", language: "ENGLISH" as CardLanguage, quantity: 1 },
    { cardIndex: 6, seller: seller2, condition: "NEAR_MINT" as Condition, price: 680000, isGraded: false, language: "ENGLISH" as CardLanguage, quantity: 3 },
    { cardIndex: 7, seller: seller3, condition: "MINT" as Condition, price: 320000, isGraded: false, language: "JAPANESE" as CardLanguage, quantity: 5 },
    { cardIndex: 8, seller: seller1, condition: "NEAR_MINT" as Condition, price: 1850000, isGraded: true, gradingCompany: "PSA", gradeScore: "10", language: "ENGLISH" as CardLanguage, quantity: 1 },
    { cardIndex: 9, seller: seller2, condition: "EXCELLENT" as Condition, price: 550000, isGraded: false, language: "ENGLISH" as CardLanguage, quantity: 2 },
    { cardIndex: 10, seller: seller3, condition: "MINT" as Condition, price: 980000, isGraded: true, gradingCompany: "PSA", gradeScore: "10", language: "JAPANESE" as CardLanguage, quantity: 1 },
    { cardIndex: 11, seller: seller1, condition: "NEAR_MINT" as Condition, price: 2100000, isGraded: true, gradingCompany: "PSA", gradeScore: "10", language: "ENGLISH" as CardLanguage, quantity: 1 },
  ]

  const createdListings = []
  for (const data of listingsData) {
    const card = createdCards[data.cardIndex]
    const listing = await prisma.listing.create({
      data: {
        sellerId: data.seller.id,
        cardId: card.id,
        customName: card.name,
        customSet: card.setName,
        series: card.series,
        condition: data.condition,
        language: data.language,
        isGraded: data.isGraded,
        gradingCompany: data.gradingCompany,
        gradeScore: data.gradeScore,
        price: data.price,
        quantity: data.quantity,
        status: ListingStatus.ACTIVE,
        views: Math.floor(Math.random() * 500) + 50,
        watchCount: Math.floor(Math.random() * 30),
        isFeatured: data.price > 1000000,
        description: `${card.name} - ${card.rarity}\n${card.setName} #${card.cardNumber}\n${data.isGraded ? `${data.gradingCompany} ${data.gradeScore}` : data.condition}\n\nของแท้ 100% ส่ง EMS พร้อม packaging อย่างดี`,
      },
    })

    // Add images
    await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        url: card.imageUrl,
        type: "photo",
        order: 0,
      },
    })

    // Add shipping options
    await prisma.shippingOption.create({
      data: {
        listingId: listing.id,
        provider: "KERRY",
        name: "Kerry Express",
        price: 4000,
        estimatedDays: "2-3 วัน",
      },
    })
    await prisma.shippingOption.create({
      data: {
        listingId: listing.id,
        provider: "THAILAND_POST",
        name: "EMS Thailand Post",
        price: 5000,
        estimatedDays: "1-2 วัน",
      },
    })

    createdListings.push(listing)
  }

  console.log("✅ Created listings")

  // Create some completed orders
  const order1 = await prisma.order.create({
    data: {
      listingId: createdListings[7].id, // Eevee
      buyerId: buyer1.id,
      sellerId: seller3User.id,
      cardName: "Eevee (Illustration Rare)",
      cardImage: createdCards[7].imageUrl,
      condition: "MINT",
      quantity: 1,
      unitPrice: 320000,
      subtotal: 320000,
      shippingFee: 4000,
      platformFee: 16000,
      totalAmount: 324000,
      sellerReceives: 308000,
      shippingName: "วิชัย นักสะสม",
      shippingPhone: "0812345678",
      shippingAddress: "123/45 ซอยสุขุมวิท 39",
      shippingDistrict: "วัฒนา",
      shippingProvince: "กรุงเทพมหานคร",
      shippingPostcode: "10110",
      shippingProvider: "KERRY",
      trackingNumber: "TH1234567890",
      shippedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: OrderStatus.DELIVERED,
      escrowStatus: EscrowStatus.HOLDING,
      paymentMethod: "card",
    },
  })

  const order2 = await prisma.order.create({
    data: {
      listingId: createdListings[6].id, // Lugia
      buyerId: buyer2.id,
      sellerId: seller2User.id,
      cardName: "Lugia V (Alt Art)",
      cardImage: createdCards[6].imageUrl,
      condition: "NEAR_MINT",
      quantity: 1,
      unitPrice: 680000,
      subtotal: 680000,
      shippingFee: 4000,
      platformFee: 34000,
      totalAmount: 684000,
      sellerReceives: 650000,
      shippingName: "นภา การ์ดเลิฟเวอร์",
      shippingPhone: "0898765432",
      shippingAddress: "456 อาคาร ABC ชั้น 10",
      shippingDistrict: "สาทร",
      shippingProvince: "กรุงเทพมหานคร",
      shippingPostcode: "10120",
      shippingProvider: "THAILAND_POST",
      trackingNumber: "TH9876543210",
      shippedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      paidAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      status: OrderStatus.COMPLETED,
      escrowStatus: EscrowStatus.RELEASED,
      releasedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      confirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      paymentMethod: "card",
    },
  })

  console.log("✅ Created orders")

  // Create reviews
  await prisma.review.create({
    data: {
      orderId: order2.id,
      reviewerId: buyer2.id,
      revieweeId: seller2User.id,
      rating: 5,
      comment: "การ์ดสภาพดีมาก ตรงตามที่โฆษณา ส่งไว แพ็คอย่างดี แนะนำเลยครับ!",
      type: "buyer_to_seller",
    },
  })

  console.log("✅ Created reviews")

  // Create watchlist entries
  await prisma.watchlist.create({
    data: { userId: buyer1.id, listingId: createdListings[4].id },
  })
  await prisma.watchlist.create({
    data: { userId: buyer1.id, listingId: createdListings[8].id },
  })
  await prisma.watchlist.create({
    data: { userId: buyer2.id, listingId: createdListings[0].id },
  })

  console.log("✅ Created watchlist entries")

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: buyer1.id,
      type: "ORDER_SHIPPED",
      title: "ออเดอร์ถูกจัดส่งแล้ว",
      body: `ออเดอร์ #${order1.orderNumber} ถูกจัดส่งผ่าน Kerry Express เลข Tracking: TH1234567890`,
      link: `/orders`,
    },
  })
  await prisma.notification.create({
    data: {
      userId: seller3User.id,
      type: "NEW_ORDER",
      title: "มีออเดอร์ใหม่!",
      body: `คุณมีออเดอร์ใหม่จาก วิชัย นักสะสม — Eevee (Illustration Rare)`,
      link: `/sell/orders`,
    },
  })

  console.log("✅ Created notifications")

  console.log("\n🎉 Seed completed!")
  console.log("\n📋 Test Accounts:")
  console.log("  Admin:  admin@cardvault.co.th / password123")
  console.log("  Seller: seller1@example.com / password123")
  console.log("  Seller: seller3@example.com / password123")
  console.log("  Buyer:  buyer1@example.com / password123")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
