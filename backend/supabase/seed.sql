-- =============================================
-- FARMA+ Seed Data
-- =============================================

-- =============================================
-- CATEGORIES
-- =============================================

INSERT INTO categories (name, slug, description, image_url, sort_order, active) VALUES
('Medicamentos', 'medicamentos', 'Medicamentos genéricos e de marca', '/images/categories/medicamentos.jpg', 1, true),
('Dermocosméticos', 'dermocosmeticos', 'Produtos de skincare e beleza', '/images/categories/dermocosmeticos.jpg', 2, true),
('Suplementos', 'suplementos', 'Vitaminas e minerais', '/images/categories/suplementos.jpg', 3, true),
('Higiene', 'higiene', 'Produtos de higiene pessoal', '/images/categories/higiene.jpg', 4, true),
('Baby', 'baby', 'Produtos para bebês', '/images/categories/baby.jpg', 5, true),
('Vitaminas', 'vitaminas', 'Vitaminas e antioxidantes', '/images/categories/vitaminas.jpg', 6, true);

-- =============================================
-- PRODUCTS - Medicamentos
-- =============================================

INSERT INTO products (name, slug, description, price, category_id, image_url, laboratory, anvisa_code, controlled, requires_prescription, active) VALUES
('Dipirona 500mg', 'dipirona-500mg', 'Analgésico e antipirético. Alívio rápido de dores de cabeça e febre.', 8.99, (SELECT id FROM categories WHERE slug = 'medicamentos'), '/images/products/dipirona-500mg.jpg', 'Medley', '12345678901', false, false, true),
('Ibuprofeno 400mg', 'ibuprofeno-400mg', 'Anti-inflamatório não esteroide. Para dores e inflamações.', 12.99, (SELECT id FROM categories WHERE slug = 'medicamentos'), '/images/products/ibuprofeno-400mg.jpg', 'Genérico', '12345678902', false, false, true),
('Amoxicilina 500mg', 'amoxicilina-500mg', 'Antibiótico. Uso sob prescrição médica.', 18.99, (SELECT id FROM categories WHERE slug = 'medicamentos'), '/images/products/amoxicilina-500mg.jpg', 'Eurofarma', '12345678903', false, true, true),
('Omeprazol 20mg', 'omeprazol-20mg', 'Inibidor da bomba de prótons. Para gastrite e refluxo.', 15.99, (SELECT id FROM categories WHERE slug = 'medicamentos'), '/images/products/omeprazol-20mg.jpg', 'Medley', '12345678904', false, false, true),
('Losartana 50mg', 'losartana-50mg', 'Anti-hipertensivo. Controle da pressão arterial.', 11.99, (SELECT id FROM categories WHERE slug = 'medicamentos'), '/images/products/losartana-50mg.jpg', 'Genérico', '12345678905', false, true, true),
('Metformina 850mg', 'metformina-850mg', 'Antidiabético. Controle da glicemia.', 14.99, (SELECT id FROM categories WHERE slug = 'medicamentos'), '/images/products/metformina-850mg.jpg', 'Merck', '12345678906', false, true, true),
('Rivotril 2mg', 'rivotril-2mg', 'Ansiolítico. Uso controlado - requer receita especial.', 22.99, (SELECT id FROM categories WHERE slug = 'medicamentos'), '/images/products/rivotril-2mg.jpg', 'Roche', '12345678907', true, true, true),
('Dorflex', 'dorflex', 'Relaxante muscular. Para dores musculares e espasmos.', 9.99, (SELECT id FROM categories WHERE slug = 'medicamentos'), '/images/products/dorflex.jpg', 'Sanofi', '12345678908', false, false, true),
('Buscopan Composto', 'buscopan-composto', 'Antiespasmódico + analgésico. Cólicas e dores abdominais.', 16.99, (SELECT id FROM categories WHERE slug = 'medicamentos'), '/images/products/buscopan-composto.jpg', 'Boehringer', '12345678909', false, false, true),
('Neosaldina', 'neosaldina', 'Analgésico + anti-inflamatório. Dores de cabeça e dentárias.', 13.99, (SELECT id FROM categories WHERE slug = 'medicamentos'), '/images/products/neosaldina.jpg', 'GSK', '12345678910', false, false, true);

-- =============================================
-- PRODUCTS - Dermocosméticos
-- =============================================

INSERT INTO products (name, slug, description, price, category_id, image_url, laboratory, anvisa_code, controlled, requires_prescription, active) VALUES
('Protetor Solar FPS 50', 'protetor-solar-fps50', 'Proteção UVA/UVB. Para todos os tipos de pele.', 45.99, (SELECT id FROM categories WHERE slug = 'dermocosmeticos'), '/images/products/protetor-solar.jpg', 'La Roche-Posay', '22345678901', false, false, true),
('Sérum Vitamina C', 'serum-vitamina-c', 'Antioxidante. Clareador e antissinais.', 89.99, (SELECT id FROM categories WHERE slug = 'dermocosmeticos'), '/images/products/serum-vitamina-c.jpg', 'Vichy', '22345678902', false, false, true),
('Hidratante Corporal', 'hidratante-corporal', 'Hidratação intensa. Para pele seca.', 34.99, (SELECT id FROM categories WHERE slug = 'dermocosmeticos'), '/images/products/hidratante-corporal.jpg', 'CeraVe', '22345678903', false, false, true),
('Shampoo Anticaspa', 'shampoo-anticaspa', 'Tratamento para caspa. Uso frequente.', 28.99, (SELECT id FROM categories WHERE slug = 'dermocosmeticos'), '/images/products/shampoo-anticaspa.jpg', 'Head & Shoulders', '22345678904', false, false, true),
('Creme Anti-idade', 'creme-anti-idade', 'Redução de rugas e linhas de expressão.', 119.99, (SELECT id FROM categories WHERE slug = 'dermocosmeticos'), '/images/products/creme-anti-idade.jpg', 'Neutrogena', '22345678905', false, false, true);

-- =============================================
-- PRODUCTS - Suplementos
-- =============================================

INSERT INTO products (name, slug, description, price, category_id, image_url, laboratory, anvisa_code, controlled, requires_prescription, active) VALUES
('Whey Protein 1kg', 'whey-protein-1kg', 'Proteína concentrada. Sabor chocolate.', 129.99, (SELECT id FROM categories WHERE slug = 'suplementos'), '/images/products/whey-protein.jpg', 'Max Titanium', '32345678901', false, false, true),
('Creatina 300g', 'creatina-300g', 'Monoidratada. Performance e força.', 79.99, (SELECT id FROM categories WHERE slug = 'suplementos'), '/images/products/creatina.jpg', 'Growth', '32345678902', false, false, true),
('Colágeno Hidrolisado', 'colageno-hidrolisado', 'Forma líquida. Articulações e pele.', 69.99, (SELECT id FROM categories WHERE slug = 'suplementos'), '/images/products/colageno.jpg', 'Neolid', '32345678903', false, false, true),
('Ômega 3', 'omega-3', 'Ácidos graxos essenciais. Saúde cardiovascular.', 54.99, (SELECT id FROM categories WHERE slug = 'suplementos'), '/images/products/omega3.jpg', 'Nutri Bay', '32345678904', false, false, true),
('BCAA 240g', 'bcaa-240g', 'Aminoácidos ramificados. Recuperação muscular.', 89.99, (SELECT id FROM categories WHERE slug = 'suplementos'), '/images/products/bcaa.jpg', 'Integralmédica', '32345678905', false, false, true);

-- =============================================
-- PRODUCTS - Higiene
-- =============================================

INSERT INTO products (name, slug, description, price, category_id, image_url, laboratory, anvisa_code, controlled, requires_prescription, active) VALUES
('Sabonete Líquido Antibacteriano', 'sabonete-antibacteriano', 'Higienização das mãos. 70% álcool.', 12.99, (SELECT id FROM categories WHERE slug = 'higiene'), '/images/products/sabonete.jpg', 'Dettol', '42345678901', false, false, true),
('Creme Dental Whitening', 'creme-dental-whitening', 'Clareador. Flúor 1450ppm.', 9.99, (SELECT id FROM categories WHERE slug = 'higiene'), '/images/products/creme-dental.jpg', 'Colgate', '42345678902', false, false, true),
('Desodorante Aerosol', 'desodorante-aerosol', 'Proteção 48h. Sem alumínio.', 18.99, (SELECT id FROM categories WHERE slug = 'higiene'), '/images/products/desodorante.jpg', 'Rexona', '42345678903', false, false, true);

-- =============================================
-- PRODUCTS - Baby
-- =============================================

INSERT INTO products (name, slug, description, price, category_id, image_url, laboratory, anvisa_code, controlled, requires_prescription, active) VALUES
('Fralda Pampers Premium', 'fralda-pampers-premium', 'Tamanho M (8-14kg). 44 unidades.', 59.99, (SELECT id FROM categories WHERE slug = 'baby'), '/images/products/fralda.jpg', 'P&G', '52345678901', false, false, true),
('Shampoo Bebê Johnson', 'shampoo-bebe-johnson', 'Sem lágrimas. 200ml.', 14.99, (SELECT id FROM categories WHERE slug = 'baby'), '/images/products/shampoo-bebe.jpg', 'Johnson & Johnson', '52345678902', false, false, true),
('Pomada Assadura', 'pomada-assadura', 'Proteção e cicatrização. 100g.', 22.99, (SELECT id FROM categories WHERE slug = 'baby'), '/images/products/pomada-assadura.jpg', 'Mustela', '52345678903', false, false, true);

-- =============================================
-- PRODUCTS - Vitaminas
-- =============================================

INSERT INTO products (name, slug, description, price, category_id, image_url, laboratory, anvisa_code, controlled, requires_prescription, active) VALUES
('Vitamina C 1g', 'vitamina-c-1g', 'Efervescente. Imunidade.', 19.99, (SELECT id FROM categories WHERE slug = 'vitaminas'), '/images/products/vitamina-c.jpg', 'Cimed', '62345678901', false, false, true),
('Vitamina D3 5000UI', 'vitamina-d3-5000ui', 'Cápsulas. Saúde óssea.', 39.99, (SELECT id FROM categories WHERE slug = 'vitaminas'), '/images/products/vitamina-d3.jpg', 'Therologica', '62345678902', false, false, true),
('Multivitamínico', 'multivitaminico', 'Complexo completo. 30 cápsulas.', 44.99, (SELECT id FROM categories WHERE slug = 'vitaminas'), '/images/products/multivitaminico.jpg', 'Centrum', '62345678903', false, false, true),
('Vitamina B12', 'vitamina-b12', '1000mcg. Energia e vitalidade.', 29.99, (SELECT id FROM categories WHERE slug = 'vitaminas'), '/images/products/vitamina-b12.jpg', 'GNC', '62345678904', false, false, true),
('Ferro + Ácido Fólico', 'ferro-acido-folico', 'Para gestantes e anemia.', 24.99, (SELECT id FROM categories WHERE slug = 'vitaminas'), '/images/products/ferro-folico.jpg', 'Fragma', '62345678905', false, false, true);

-- =============================================
-- PRODUCT VARIATIONS (exemplos)
-- =============================================

-- Dipirona
INSERT INTO product_variations (product_id, name, sku, price_override, stock_quantity, attributes, active) VALUES
((SELECT id FROM products WHERE slug = 'dipirona-500mg'), 'Caixa c/ 10 comprimidos', 'DIP-500-10', NULL, 150, '{"comprimidos": "10", "apresentacao": "comprimidos"}', true),
((SELECT id FROM products WHERE slug = 'dipirona-500mg'), 'Caixa c/ 20 comprimidos', 'DIP-500-20', 15.99, 80, '{"comprimidos": "20", "apresentacao": "comprimidos"}', true),
((SELECT id FROM products WHERE slug = 'dipirona-500mg'), 'Gotas 20ml', 'DIP-500-GOT', 12.99, 60, '{"volume": "20ml", "apresentacao": "gotas"}', true);

-- Omeprazol
INSERT INTO product_variations (product_id, name, sku, price_override, stock_quantity, attributes, active) VALUES
((SELECT id FROM products WHERE slug = 'omeprazol-20mg'), 'Caixa c/ 14 cápsulas', 'OMEP-20-14', NULL, 120, '{"capsulas": "14", "apresentacao": "cápsulas"}', true),
((SELECT id FROM products WHERE slug = 'omeprazol-20mg'), 'Caixa c/ 28 cápsulas', 'OMEP-20-28', 24.99, 60, '{"capsulas": "28", "apresentacao": "cápsulas"}', true);

-- Protetor Solar
INSERT INTO product_variations (product_id, name, sku, price_override, stock_quantity, attributes, active) VALUES
((SELECT id FROM products WHERE slug = 'protetor-solar-fps50'), 'Tubos 40g', 'PROT-50-40', NULL, 45, '{"peso": "40g", "fps": "50"}', true),
((SELECT id FROM products WHERE slug = 'protetor-solar-fps50'), 'Tubos 100g', 'PROT-50-100', 79.99, 25, '{"peso": "100g", "fps": "50"}', true);

-- Whey Protein
INSERT INTO product_variations (product_id, name, sku, price_override, stock_quantity, attributes, active) VALUES
((SELECT id FROM products WHERE slug = 'whey-protein-1kg'), 'Sabor Chocolate', 'WP-1K-CHO', NULL, 30, '{"sabor": "Chocolate", "peso": "1kg"}', true),
((SELECT id FROM products WHERE slug = 'whey-protein-1kg'), 'Sabor Baunilha', 'WP-1K-BAU', NULL, 25, '{"sabor": "Baunilha", "peso": "1kg"}', true),
((SELECT id FROM products WHERE slug = 'whey-protein-1kg'), 'Sabor Morango', 'WP-1K-MOR', NULL, 20, '{"sabor": "Morango", "peso": "1kg"}', true);

-- Fralda
INSERT INTO product_variations (product_id, name, sku, price_override, stock_quantity, attributes, active) VALUES
((SELECT id FROM products WHERE slug = 'fralda-pampers-premium'), 'Tamanho M (8-14kg) c/ 44', 'FRA-PAM-M-44', NULL, 40, '{"tamanho": "M", "quantidade": "44"}', true),
((SELECT id FROM products WHERE slug = 'fralda-pampers-premium'), 'Tamanho G (12-17kg) c/ 36', 'FRA-PAM-G-36', 54.99, 35, '{"tamanho": "G", "quantidade": "36"}', true),
((SELECT id FROM products WHERE slug = 'fralda-pampers-premium'), 'Tamanho GG (15-25kg) c/ 28', 'FRA-PAM-GG-28', 49.99, 30, '{"tamanho": "GG", "quantidade": "28"}', true);

-- =============================================
-- DELIVERY ZONES (Centro de São Paulo como referência)
-- =============================================

INSERT INTO delivery_zones (name, radius_km, center_lat, center_lng, shipping_fee, estimated_delivery_minutes, active) VALUES
('Zona Centro', 3.0, -23.5505, -46.6333, 5.99, 30, true),
('Zona Próxima', 8.0, -23.5505, -46.6333, 9.99, 45, true),
('Zona Intermediária', 15.0, -23.5505, -46.6333, 14.99, 60, true),
('Zona Distante', 25.0, -23.5505, -46.6333, 19.99, 90, true);
