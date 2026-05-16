-- Seed data for CardVault
-- Password for all accounts: password123

-- Clean existing data (order matters for FK constraints)
DELETE FROM "OrderStatusHistory";
DELETE FROM "Review";
DELETE FROM "DisputeEvidence";
DELETE FROM "Dispute";
DELETE FROM "Watchlist";
DELETE FROM "Notification";
DELETE FROM "Report";
DELETE FROM "Order";
DELETE FROM "ListingImage";
DELETE FROM "ShippingOption";
DELETE FROM "Listing";
DELETE FROM "PriceHistory";
DELETE FROM "CardCatalog";
DELETE FROM "PostLike";
DELETE FROM "PostComment";
DELETE FROM "CommunityPost";
DELETE FROM "ForumReply";
DELETE FROM "ForumThread";
DELETE FROM "ScammerReport";
DELETE FROM "PriceAlert";
DELETE FROM "BankAccount";
DELETE FROM "SellerSubscription";
DELETE FROM "SellerProfile";
DELETE FROM "AuditLog";
DELETE FROM "SystemSetting";
DELETE FROM "Account";
DELETE FROM "Session";
DELETE FROM "VerificationToken";
DELETE FROM "User";

-- Create users (password: password123)
INSERT INTO "User" (id, email, name, username, "passwordHash", role, "createdAt", "updatedAt") VALUES
('usr_admin01', 'admin@cardvault.co.th', 'Admin CardVault', 'admin', '$2a$12$A.eH2u4XTcJVVNqyhxtgNu1xQVP9f4H.ct1uA0I9NN6OzqM/ke4TO', 'ADMIN', NOW(), NOW()),
('usr_seller1', 'seller1@example.com', 'สมชาย การ์ดมาเนีย', 'somchai_cards', '$2a$12$A.eH2u4XTcJVVNqyhxtgNu1xQVP9f4H.ct1uA0I9NN6OzqM/ke4TO', 'SELLER', NOW(), NOW()),
('usr_seller2', 'seller2@example.com', 'สมหญ้า TCG Shop', 'somya_tcg', '$2a$12$A.eH2u4XTcJVVNqyhxtgNu1xQVP9f4H.ct1uA0I9NN6OzqM/ke4TO', 'SELLER', NOW(), NOW()),
('usr_seller3', 'seller3@example.com', 'PokemonMasterTH', 'pokemon_master_th', '$2a$12$A.eH2u4XTcJVVNqyhxtgNu1xQVP9f4H.ct1uA0I9NN6OzqM/ke4TO', 'SELLER', NOW(), NOW()),
('usr_buyer01', 'buyer1@example.com', 'วิชัย นักสะสม', 'wichai_collector', '$2a$12$A.eH2u4XTcJVVNqyhxtgNu1xQVP9f4H.ct1uA0I9NN6OzqM/ke4TO', 'USER', NOW(), NOW()),
('usr_buyer02', 'buyer2@example.com', 'นภา การ์ดเลิฟเวอร์', 'napha_cards', '$2a$12$A.eH2u4XTcJVVNqyhxtgNu1xQVP9f4H.ct1uA0I9NN6OzqM/ke4TO', 'USER', NOW(), NOW());

-- Create seller profiles
INSERT INTO "SellerProfile" (id, "userId", "displayName", bio, tier, "isKycVerified", "kycStatus", "totalSales", "totalRevenue", "completedOrders", rating, "ratingCount", "createdAt", "updatedAt") VALUES
('sp_01', 'usr_seller1', 'ร้านสมชาย TCG', 'ขายการ์ด TCG ทุกชนิด ของแท้ 100% ส่งไว ราคาเป็นกันเอง', 'GOLD', true, 'APPROVED', 156, 24500000, 150, 4.8, 89, NOW(), NOW()),
('sp_02', 'usr_seller2', 'Somya TCG Shop', 'Specializing in Yu-Gi-Oh! and MTG cards. Competitive prices.', 'SILVER', true, 'APPROVED', 67, 8900000, 65, 4.6, 42, NOW(), NOW()),
('sp_03', 'usr_seller3', 'PokemonMasterTH', 'Pokemon card specialist. All grades, all sets. Guaranteed authentic.', 'VERIFIED_PRO', true, 'APPROVED', 312, 56700000, 305, 4.9, 201, NOW(), NOW());

-- Create card catalog (12 Pokemon cards)
INSERT INTO "CardCatalog" (id, "tcgApiId", series, name, "nameTh", "setName", "setCode", "cardNumber", rarity, artist, "imageUrl", types, hp, supertype, "createdAt", "updatedAt") VALUES
('card_01', 'swsh4-25', 'POKEMON', 'Charizard VMAX', 'ชาร์ลิซาร์ด VMAX', 'Shining Fates', 'SHF', '073', 'Shiny Rare VMAX', '5ban Graphics', 'https://images.pokemontcg.io/swsh45/73_hires.png', ARRAY['Fire'], 330, 'Pokémon', NOW(), NOW()),
('card_02', 'swsh1-20', 'POKEMON', 'Pikachu VMAX', 'พิคาจู VMAX', 'Sword & Shield', 'SSH', '044', 'VMAX', '5ban Graphics', 'https://images.pokemontcg.io/swsh1/44_hires.png', ARRAY['Lightning'], 310, 'Pokémon', NOW(), NOW()),
('card_03', 'sv3-198', 'POKEMON', 'Mew ex', 'มิว ex', '151', 'MEW', '198', 'Special Art Rare', 'AKIRA EGAWA', 'https://images.pokemontcg.io/sv3pt5/198_hires.png', ARRAY['Psychic'], 200, 'Pokémon', NOW(), NOW()),
('card_04', 'swsh12-186', 'POKEMON', 'Giratina VSTAR', 'กิราติน่า VSTAR', 'Lost Origin', 'LOR', '186', 'Special Art Rare', 'Shibuzoh.', 'https://images.pokemontcg.io/swsh12/186_hires.png', ARRAY['Dragon'], 280, 'Pokémon', NOW(), NOW()),
('card_05', 'sv4-223', 'POKEMON', 'Moonbreon', 'มูนเบรอน (Umbreon ex)', 'Evolving Skies', 'EVS', '215', 'Special Art Rare', 'Mitsuhiro Arita', 'https://images.pokemontcg.io/swsh7/215_hires.png', ARRAY['Darkness'], 310, 'Pokémon', NOW(), NOW()),
('card_06', 'xy12-108', 'POKEMON', 'M Charizard-EX', 'เมก้า ชาร์ลิซาร์ด-EX', 'Evolutions', 'EVO', '108', 'Secret Rare', '5ban Graphics', 'https://images.pokemontcg.io/xy12/108_hires.png', ARRAY['Fire'], 230, 'Pokémon', NOW(), NOW()),
('card_07', 'swsh9-172', 'POKEMON', 'Lugia V (Alt Art)', 'ลูเกีย V (Alt Art)', 'Silver Tempest', 'SIT', '186', 'Special Art Rare', 'Shibuzoh.', 'https://images.pokemontcg.io/swsh12/186_hires.png', ARRAY['Colorless'], 220, 'Pokémon', NOW(), NOW()),
('card_08', 'sv2-228', 'POKEMON', 'Eevee', 'อีวุย', 'Paldea Evolved', 'PAL', '167', 'Illustration Rare', 'Atsushi Furusawa', 'https://images.pokemontcg.io/sv2/167_hires.png', ARRAY['Colorless'], 70, 'Pokémon', NOW(), NOW()),
('card_09', 'swsh3-189', 'POKEMON', 'Rayquaza VMAX', 'เรย์ควาซ่า VMAX', 'Evolving Skies', 'EVS', '218', 'Special Art Rare', 'Shin Nagasawa', 'https://images.pokemontcg.io/swsh7/218_hires.png', ARRAY['Dragon'], 320, 'Pokémon', NOW(), NOW()),
('card_10', 'sv1-248', 'POKEMON', 'Palkia V (Alt Art)', 'พัลเกีย V (Alt Art)', 'Brilliant Stars', 'BRS', '167', 'Special Art Rare', 'Shibuzoh.', 'https://images.pokemontcg.io/swsh9/167_hires.png', ARRAY['Water'], 230, 'Pokémon', NOW(), NOW()),
('card_11', 'sm12-248', 'POKEMON', 'Mewtwo & Mew-GX', 'มิวทู & มิว-GX', 'Unified Minds', 'UNM', '242', 'Secret Rare', 'Mitsuhiro Arita', 'https://images.pokemontcg.io/sm12/242_hires.png', ARRAY['Psychic'], 270, 'Pokémon', NOW(), NOW()),
('card_12', 'swsh5-142', 'POKEMON', 'Umbreon VMAX', 'อัมเบรอน VMAX', 'Evolving Skies', 'EVS', '095', 'VMAX', '5ban Graphics', 'https://images.pokemontcg.io/swsh7/95_hires.png', ARRAY['Darkness'], 310, 'Pokémon', NOW(), NOW());

-- Create 12 listings (ACTIVE status)
INSERT INTO "Listing" (id, "sellerId", "cardId", "customName", "customSet", series, condition, language, "isGraded", "gradingCompany", "gradeScore", price, quantity, status, views, "watchCount", "isFeatured", description, "createdAt", "updatedAt") VALUES
('lst_01', 'sp_01', 'card_01', 'Charizard VMAX', 'Shining Fates', 'POKEMON', 'MINT', 'ENGLISH', true, 'PSA', '10', 1590000, 1, 'ACTIVE', 342, 18, true, 'Charizard VMAX - Shiny Rare VMAX | Shining Fates #073 | PSA 10 | ของแท้ 100%', NOW(), NOW()),
('lst_02', 'sp_03', 'card_02', 'Pikachu VMAX', 'Sword & Shield', 'POKEMON', 'NEAR_MINT', 'JAPANESE', true, 'PSA', '9', 890000, 2, 'ACTIVE', 256, 12, true, 'Pikachu VMAX - VMAX | Sword & Shield #044 | PSA 9 | ของแท้ 100%', NOW(), NOW()),
('lst_03', 'sp_03', 'card_03', 'Mew ex', '151', 'POKEMON', 'MINT', 'JAPANESE', true, 'PSA', '10', 2450000, 1, 'ACTIVE', 489, 28, true, 'Mew ex - Special Art Rare | 151 #198 | PSA 10 | ของแท้ 100%', NOW(), NOW()),
('lst_04', 'sp_01', 'card_04', 'Giratina VSTAR', 'Lost Origin', 'POKEMON', 'NEAR_MINT', 'ENGLISH', false, NULL, NULL, 750000, 1, 'ACTIVE', 178, 8, false, 'Giratina VSTAR - Special Art Rare | Lost Origin #186 | NEAR_MINT | ของแท้ 100%', NOW(), NOW()),
('lst_05', 'sp_03', 'card_05', 'Moonbreon', 'Evolving Skies', 'POKEMON', 'MINT', 'ENGLISH', true, 'PSA', '10', 4500000, 1, 'ACTIVE', 612, 32, true, 'Moonbreon (Umbreon ex) - Special Art Rare | Evolving Skies #215 | PSA 10 | ของแท้ 100%', NOW(), NOW()),
('lst_06', 'sp_01', 'card_06', 'M Charizard-EX', 'Evolutions', 'POKEMON', 'EXCELLENT', 'ENGLISH', true, 'BGS', '9.5', 1200000, 1, 'ACTIVE', 298, 15, true, 'M Charizard-EX - Secret Rare | Evolutions #108 | BGS 9.5 | ของแท้ 100%', NOW(), NOW()),
('lst_07', 'sp_02', 'card_07', 'Lugia V (Alt Art)', 'Silver Tempest', 'POKEMON', 'NEAR_MINT', 'ENGLISH', false, NULL, NULL, 680000, 3, 'ACTIVE', 145, 6, false, 'Lugia V (Alt Art) - Special Art Rare | Silver Tempest #186 | NEAR_MINT | ของแท้ 100%', NOW(), NOW()),
('lst_08', 'sp_03', 'card_08', 'Eevee', 'Paldea Evolved', 'POKEMON', 'MINT', 'JAPANESE', false, NULL, NULL, 320000, 5, 'ACTIVE', 534, 22, false, 'Eevee - Illustration Rare | Paldea Evolved #167 | MINT | ของแท้ 100%', NOW(), NOW()),
('lst_09', 'sp_01', 'card_09', 'Rayquaza VMAX', 'Evolving Skies', 'POKEMON', 'NEAR_MINT', 'ENGLISH', true, 'PSA', '10', 1850000, 1, 'ACTIVE', 367, 19, true, 'Rayquaza VMAX - Special Art Rare | Evolving Skies #218 | PSA 10 | ของแท้ 100%', NOW(), NOW()),
('lst_10', 'sp_02', 'card_10', 'Palkia V (Alt Art)', 'Brilliant Stars', 'POKEMON', 'EXCELLENT', 'ENGLISH', false, NULL, NULL, 550000, 2, 'ACTIVE', 123, 4, false, 'Palkia V (Alt Art) - Special Art Rare | Brilliant Stars #167 | EXCELLENT | ของแท้ 100%', NOW(), NOW()),
('lst_11', 'sp_03', 'card_11', 'Mewtwo & Mew-GX', 'Unified Minds', 'POKEMON', 'MINT', 'JAPANESE', true, 'PSA', '10', 980000, 1, 'ACTIVE', 201, 11, false, 'Mewtwo & Mew-GX - Secret Rare | Unified Minds #242 | PSA 10 | ของแท้ 100%', NOW(), NOW()),
('lst_12', 'sp_01', 'card_12', 'Umbreon VMAX', 'Evolving Skies', 'POKEMON', 'NEAR_MINT', 'ENGLISH', true, 'PSA', '10', 2100000, 1, 'ACTIVE', 445, 25, true, 'Umbreon VMAX - VMAX | Evolving Skies #095 | PSA 10 | ของแท้ 100%', NOW(), NOW());

-- Listing images
INSERT INTO "ListingImage" (id, "listingId", url, type, "order") VALUES
('img_01', 'lst_01', 'https://images.pokemontcg.io/swsh45/73_hires.png', 'photo', 0),
('img_02', 'lst_02', 'https://images.pokemontcg.io/swsh1/44_hires.png', 'photo', 0),
('img_03', 'lst_03', 'https://images.pokemontcg.io/sv3pt5/198_hires.png', 'photo', 0),
('img_04', 'lst_04', 'https://images.pokemontcg.io/swsh12/186_hires.png', 'photo', 0),
('img_05', 'lst_05', 'https://images.pokemontcg.io/swsh7/215_hires.png', 'photo', 0),
('img_06', 'lst_06', 'https://images.pokemontcg.io/xy12/108_hires.png', 'photo', 0),
('img_07', 'lst_07', 'https://images.pokemontcg.io/swsh12/186_hires.png', 'photo', 0),
('img_08', 'lst_08', 'https://images.pokemontcg.io/sv2/167_hires.png', 'photo', 0),
('img_09', 'lst_09', 'https://images.pokemontcg.io/swsh7/218_hires.png', 'photo', 0),
('img_10', 'lst_10', 'https://images.pokemontcg.io/swsh9/167_hires.png', 'photo', 0),
('img_11', 'lst_11', 'https://images.pokemontcg.io/sm12/242_hires.png', 'photo', 0),
('img_12', 'lst_12', 'https://images.pokemontcg.io/swsh7/95_hires.png', 'photo', 0);

-- Shipping options
INSERT INTO "ShippingOption" (id, "listingId", provider, name, price, "estimatedDays") VALUES
('shp_01', 'lst_01', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_02', 'lst_01', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน'),
('shp_03', 'lst_02', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_04', 'lst_02', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน'),
('shp_05', 'lst_03', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_06', 'lst_03', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน'),
('shp_07', 'lst_04', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_08', 'lst_04', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน'),
('shp_09', 'lst_05', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_10', 'lst_05', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน'),
('shp_11', 'lst_06', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_12', 'lst_06', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน'),
('shp_13', 'lst_07', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_14', 'lst_07', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน'),
('shp_15', 'lst_08', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_16', 'lst_08', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน'),
('shp_17', 'lst_09', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_18', 'lst_09', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน'),
('shp_19', 'lst_10', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_20', 'lst_10', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน'),
('shp_21', 'lst_11', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_22', 'lst_11', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน'),
('shp_23', 'lst_12', 'KERRY', 'Kerry Express', 4000, '2-3 วัน'), ('shp_24', 'lst_12', 'THAILAND_POST', 'EMS Thailand Post', 5000, '1-2 วัน');

-- Sample orders
INSERT INTO "Order" (id, "orderNumber", "listingId", "buyerId", "sellerId", "cardName", "cardImage", condition, quantity, "unitPrice", subtotal, "shippingFee", "platformFee", "totalAmount", "sellerReceives", "shippingName", "shippingPhone", "shippingAddress", "shippingDistrict", "shippingProvince", "shippingPostcode", "shippingProvider", "trackingNumber", "shippedAt", "paidAt", status, "escrowStatus", "paymentMethod", "createdAt", "updatedAt") VALUES
('ord_01', 'CV-20260001', 'lst_08', 'usr_buyer01', 'usr_seller3', 'Eevee (Illustration Rare)', 'https://images.pokemontcg.io/sv2/167_hires.png', 'MINT', 1, 320000, 320000, 4000, 16000, 324000, 308000, 'วิชัย นักสะสม', '0812345678', '123/45 ซอยสุขุมวิท 39', 'วัฒนา', 'กรุงเทพมหานคร', '10110', 'KERRY', 'TH1234567890', NOW() - INTERVAL '5 days', NOW() - INTERVAL '7 days', 'DELIVERED', 'HOLDING', 'card', NOW() - INTERVAL '7 days', NOW()),
('ord_02', 'CV-20260002', 'lst_07', 'usr_buyer02', 'usr_seller2', 'Lugia V (Alt Art)', 'https://images.pokemontcg.io/swsh12/186_hires.png', 'NEAR_MINT', 1, 680000, 680000, 4000, 34000, 684000, 650000, 'นภา การ์ดเลิฟเวอร์', '0898765432', '456 อาคาร ABC ชั้น 10', 'สาทร', 'กรุงเทพมหานคร', '10120', 'THAILAND_POST', 'TH9876543210', NOW() - INTERVAL '10 days', NOW() - INTERVAL '12 days', 'COMPLETED', 'RELEASED', 'card', NOW() - INTERVAL '12 days', NOW());

-- Reviews
INSERT INTO "Review" (id, "orderId", "reviewerId", "revieweeId", rating, comment, type, "createdAt") VALUES
('rev_01', 'ord_02', 'usr_buyer02', 'usr_seller2', 5, 'การ์ดสภาพดีมาก ตรงตามที่โฆษณา ส่งไว แพ็คอย่างดี แนะนำเลยครับ!', 'buyer_to_seller', NOW() - INTERVAL '3 days');

-- Watchlist
INSERT INTO "Watchlist" (id, "userId", "listingId", "createdAt") VALUES
('wl_01', 'usr_buyer01', 'lst_05', NOW()), ('wl_02', 'usr_buyer01', 'lst_09', NOW()), ('wl_03', 'usr_buyer02', 'lst_01', NOW());

-- Notifications
INSERT INTO "Notification" (id, "userId", type, title, body, link, "createdAt") VALUES
('notif_01', 'usr_buyer01', 'ORDER_SHIPPED', 'ออเดอร์ถูกจัดส่งแล้ว', 'ออเดอร์ #CV-20260001 ถูกจัดส่งผ่าน Kerry Express เลข Tracking: TH1234567890', '/orders', NOW() - INTERVAL '5 days'),
('notif_02', 'usr_seller3', 'NEW_ORDER', 'มีออเดอร์ใหม่!', 'คุณมีออเดอร์ใหม่จาก วิชัย นักสะสม — Eevee (Illustration Rare)', '/sell/orders', NOW() - INTERVAL '7 days');

-- System settings
INSERT INTO "SystemSetting" (key, value, "updatedAt") VALUES
('platform_fee_percent', '6', NOW()), ('escrow_auto_release_days', '7', NOW()),
('site_name', 'CardVault', NOW()), ('site_description', 'ตลาดซื้อ-ขายการ์ด TCG อันดับ 1 ของไทย', NOW());
